import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get("x-admin-id")

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      )
    }

    // Verify the caller is an active finance/super admin.
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id, role, status")
      .eq("user_id", adminId)
      .eq("status", "active")
      .in("role", ["super_admin", "finance_admin"])
      .maybeSingle()

    if (adminError) {
      console.error(
        "MERRY-GO-ROUND ADMIN CHECK ERROR:",
        adminError
      )

      return NextResponse.json(
        { error: "Unable to verify administrator" },
        { status: 500 }
      )
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    /*
     * Load rounds that are either:
     *
     * 1. READY with no payout created yet
     * 2. PROCESSING with a payout already created
     *
     * This is important because once create_merry_go_round_disbursement()
     * creates a disbursement, the round may move from READY -> PROCESSING.
     */
    const { data: rounds, error: roundsError } = await supabase
      .from("contribution_rounds")
      .select(`
        id,
        group_id,
        recipient_member_id,
        target_amount,
        collected_amount,
        status,
        updated_at,
        contribution_groups (
          id,
          name
        ),
        contribution_members (
          id,
          member_code,
          phone_number,
          phone_verified,
          status
        )
      `)
      .in("status", ["ready", "processing"])
      .order("updated_at", { ascending: false })

    if (roundsError) {
      console.error(
        "MERRY-GO-ROUND PAYOUT LOAD ERROR:",
        roundsError
      )

      return NextResponse.json(
        { error: roundsError.message },
        { status: 500 }
      )
    }

    const eligibleRounds = []

    for (const round of rounds || []) {
      const targetAmount = Number(round.target_amount || 0)
      const collectedAmount = Number(round.collected_amount || 0)

      // Only fully collected rounds can enter the payout queue.
      if (collectedAmount < targetAmount) {
        continue
      }

      const {
        data: existingDisbursement,
        error: disbursementError,
      } = await supabase
        .from("contribution_disbursements")
        .select(`
          id,
          amount,
          deduction_amount,
          net_amount,
          phone_number,
          status,
          originator_conversation_id,
          conversation_id,
          mpesa_transaction_id,
          failure_reason,
          requested_at,
          paid_at,
          created_at,
          updated_at
        `)
        .eq("round_id", round.id)
        .maybeSingle()

      if (disbursementError) {
        console.error(
          "MERRY-GO-ROUND DISBURSEMENT CHECK ERROR:",
          disbursementError
        )

        continue
      }

      /*
       * READY + no disbursement:
       * This is a brand-new payout awaiting admin approval.
       */
      if (round.status === "ready" && !existingDisbursement) {
        eligibleRounds.push({
          id: round.id,
          groupId: round.group_id,
          recipientMemberId: round.recipient_member_id,

          targetAmount,
          collectedAmount,

          status: round.status,
          payoutQueueStatus: "awaiting_approval",

          updatedAt: round.updated_at,

          group: round.contribution_groups,
          member: round.contribution_members,

          disbursement: null,
        })

        continue
      }

      /*
       * PROCESSING + existing disbursement:
       * The payout has already been created and must remain visible
       * to finance/admin so it can be monitored or continued.
       */
      if (
        round.status === "processing" &&
        existingDisbursement
      ) {
        eligibleRounds.push({
          id: round.id,
          groupId: round.group_id,
          recipientMemberId: round.recipient_member_id,

          targetAmount,
          collectedAmount,

          status: round.status,
          payoutQueueStatus:
            existingDisbursement.status === "pending"
              ? "awaiting_b2c"
              : existingDisbursement.status === "processing"
                ? "processing"
                : existingDisbursement.status === "failed"
                  ? "failed"
                  : existingDisbursement.status,

          updatedAt: round.updated_at,

          group: round.contribution_groups,
          member: round.contribution_members,

          disbursement: {
            id: existingDisbursement.id,
            grossAmount: Number(
              existingDisbursement.amount || 0
            ),
            deductionAmount: Number(
              existingDisbursement.deduction_amount || 0
            ),
            netAmount:
              existingDisbursement.net_amount === null
                ? null
                : Number(existingDisbursement.net_amount),

            phoneNumber:
              existingDisbursement.phone_number,

            status: existingDisbursement.status,

            originatorConversationId:
              existingDisbursement.originator_conversation_id,

            conversationId:
              existingDisbursement.conversation_id,

            mpesaTransactionId:
              existingDisbursement.mpesa_transaction_id,

            failureReason:
              existingDisbursement.failure_reason,

            requestedAt:
              existingDisbursement.requested_at,

            paidAt:
              existingDisbursement.paid_at,

            createdAt:
              existingDisbursement.created_at,

            updatedAt:
              existingDisbursement.updated_at,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      count: eligibleRounds.length,
      rounds: eligibleRounds,
    })
  } catch (error) {
    console.error(
      "MERRY-GO-ROUND PAYOUT API ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load Merry-Go-Round payouts",
      },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get("x-admin-id")

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      )
    }

    // Verify the caller is an active finance/super admin.
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id, role, status")
      .eq("user_id", adminId)
      .eq("status", "active")
      .in("role", ["super_admin", "finance_admin"])
      .maybeSingle()

    if (adminError) {
      console.error(
        "MERRY-GO-ROUND POST ADMIN CHECK ERROR:",
        adminError
      )

      return NextResponse.json(
        { error: "Unable to verify administrator" },
        { status: 500 }
      )
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const roundId = body?.roundId

    if (!roundId) {
      return NextResponse.json(
        { error: "roundId is required" },
        { status: 400 }
      )
    }

    // Verify the round is still ready.
    const { data: round, error: roundError } = await supabase
      .from("contribution_rounds")
      .select(
        "id, group_id, recipient_member_id, target_amount, collected_amount, status"
      )
      .eq("id", roundId)
      .maybeSingle()

    if (roundError) {
      console.error(
        "MERRY-GO-ROUND ROUND CHECK ERROR:",
        roundError
      )

      return NextResponse.json(
        { error: roundError.message },
        { status: 500 }
      )
    }

    if (!round) {
      return NextResponse.json(
        { error: "Contribution round not found" },
        { status: 404 }
      )
    }

    if (round.status !== "ready") {
      return NextResponse.json(
        {
          error: `Round is not ready for payout. Current status: ${round.status}`,
        },
        { status: 409 }
      )
    }

    if (
      Number(round.collected_amount || 0) <
      Number(round.target_amount || 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Round has not collected the full target amount",
        },
        { status: 409 }
      )
    }

    // Create the official payout disbursement.
    const {
      data: disbursementData,
      error: createError,
    } = await supabase.rpc(
      "create_merry_go_round_disbursement",
      {
        p_round_id: roundId,
      }
    )

    if (createError) {
      console.error(
        "MERRY-GO-ROUND DISBURSEMENT CREATE ERROR:",
        createError
      )

      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      )
    }

    const disbursementId =
      typeof disbursementData === "string"
        ? disbursementData
        : Array.isArray(disbursementData)
          ? disbursementData[0]?.id
          : disbursementData?.id

    if (!disbursementId) {
      console.error(
        "MERRY-GO-ROUND DISBURSEMENT CREATE RETURNED:",
        disbursementData
      )

      return NextResponse.json(
        {
          error:
            "Disbursement was created but its ID could not be determined",
        },
        { status: 500 }
      )
    }

    // Apply the configured payout deduction.
    const {
      data: prepared,
      error: prepareError,
    } = await supabase.rpc(
      "prepare_contribution_b2c",
      {
        p_disbursement_id: disbursementId,
      }
    )

    if (prepareError) {
      console.error(
        "MERRY-GO-ROUND B2C PREPARATION ERROR:",
        prepareError
      )

      return NextResponse.json(
        { error: prepareError.message },
        { status: 500 }
      )
    }

    console.log(
      "MERRY-GO-ROUND PAYOUT PREPARED:",
      prepared
    )

    const {
      data: disbursement,
      error: fetchError,
    } = await supabase
      .from("contribution_disbursements")
      .select(
        "id, round_id, amount, deduction_amount, net_amount, phone_number, status"
      )
      .eq("id", disbursementId)
      .single()

    if (fetchError) {
      console.error(
        "MERRY-GO-ROUND DISBURSEMENT FETCH ERROR:",
        fetchError
      )

      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      approved: true,
      safaricomInitiated: false,

      disbursement: {
        id: disbursement.id,
        roundId: disbursement.round_id,
        grossAmount: Number(
          disbursement.amount || 0
        ),
        deductionAmount: Number(
          disbursement.deduction_amount || 0
        ),
        netAmount: Number(
          disbursement.net_amount || 0
        ),
        phoneNumber: disbursement.phone_number,
        status: disbursement.status,
      },

      message:
        "Payout approved and prepared. Safaricom B2C has NOT been initiated.",
    })
  } catch (error) {
    console.error(
      "MERRY-GO-ROUND PAYOUT APPROVAL ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to approve Merry-Go-Round payout",
      },
      { status: 500 }
    )
  }
}