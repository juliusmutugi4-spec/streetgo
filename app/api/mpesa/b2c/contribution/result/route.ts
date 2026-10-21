import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log(
      "CONTRIBUTION B2C RESULT:",
      JSON.stringify(body)
    )

    const result = body?.Result

    if (!result) {
      return NextResponse.json(
        { error: "Invalid Safaricom result payload" },
        { status: 400 }
      )
    }

    const originatorConversationId =
      result.OriginatorConversationID

    if (!originatorConversationId) {
      return NextResponse.json(
        { error: "Missing OriginatorConversationID" },
        { status: 400 }
      )
    }

    const resultCode = Number(result.ResultCode)

    const transactionId =
      result.TransactionID ?? null

    let transactionReceipt: string | null = null
    let transactionAmount: number | null = null

    const resultParameters =
      result.ResultParameters?.ResultParameter || []

    for (const parameter of resultParameters) {
      if (parameter.Key === "TransactionReceipt") {
        transactionReceipt = parameter.Value
      }

      if (parameter.Key === "TransactionAmount") {
        transactionAmount = Number(parameter.Value)
      }
    }

    /*
      ------------------------------------------------------------
      FIND DISBURSEMENT
      ------------------------------------------------------------
    */

    const { data: disbursement, error: lookupError } =
      await supabase
        .from("contribution_disbursements")
        .select(
          "id, group_id, round_id, amount, status"
        )
        .eq(
          "originator_conversation_id",
          originatorConversationId
        )
        .maybeSingle()

    if (lookupError) {
      console.error(
        "Contribution disbursement lookup failed:",
        lookupError
      )

      return NextResponse.json(
        { error: "Database lookup failed" },
        { status: 500 }
      )
    }

    if (!disbursement) {
      console.error(
        "Unknown contribution disbursement:",
        originatorConversationId
      )

      return NextResponse.json(
        { error: "Disbursement not found" },
        { status: 404 }
      )
    }


    /*
      ============================================================
      SUCCESS
      ============================================================
    */

    if (resultCode === 0) {

      /*
        ----------------------------------------------------------
        1. MARK DISBURSEMENT PAID

        The .neq("status", "paid") makes this idempotent.
        Safaricom can send the same callback again safely.
        ----------------------------------------------------------
      */

      const { error: updateError } =
        await supabase
          .from("contribution_disbursements")
          .update({
            status: "paid",
            mpesa_transaction_id: transactionId,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", disbursement.id)
          .neq("status", "paid")

      if (updateError) {
        console.error(
          "Failed to mark contribution payout paid:",
          updateError
        )

        return NextResponse.json(
          { error: "Failed to update payout" },
          { status: 500 }
        )
      }


      /*
        ----------------------------------------------------------
        2. MARK THIS ROUND PAID

        Only the exact round belonging to this disbursement
        is changed.
        ----------------------------------------------------------
      */

      const { data: currentRound, error: roundLookupError } =
        await supabase
          .from("contribution_rounds")
          .select(
            "id, group_id, round_number, status"
          )
          .eq("id", disbursement.round_id)
          .maybeSingle()

      if (roundLookupError) {
        console.error(
          "Failed to load contribution round:",
          roundLookupError
        )

        return NextResponse.json(
          {
            error:
              "Payout succeeded but round lookup failed",
          },
          { status: 500 }
        )
      }

      if (!currentRound) {
        console.error(
          "Contribution round not found:",
          disbursement.round_id
        )

        return NextResponse.json(
          {
            error:
              "Payout succeeded but round was not found",
          },
          { status: 500 }
        )
      }


      /*
        ----------------------------------------------------------
        3. ONLY CHANGE ROUND IF IT IS NOT ALREADY PAID
        ----------------------------------------------------------
      */

      if (currentRound.status !== "paid") {

        const { error: roundError } =
          await supabase
            .from("contribution_rounds")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", disbursement.round_id)

        if (roundError) {
          console.error(
            "Failed to mark contribution round paid:",
            roundError
          )

          return NextResponse.json(
            {
              error:
                "Payout succeeded but round update failed",
            },
            { status: 500 }
          )
        }
      }


      /*
        ----------------------------------------------------------
        4. PREPARE NEXT ROUND
       
        Our corrected SQL function will:
       
        - ignore paid round
        - ignore ready round
        - ignore processing round
        - find collecting round if one exists
        - otherwise create the next round
        ----------------------------------------------------------
      */

      const {
        data: nextRound,
        error: nextRoundError,
      } = await supabase.rpc(
        "prepare_merry_go_round_round",
        {
          p_group_id: disbursement.group_id,
        }
      )

      if (nextRoundError) {
        console.error(
          "Failed to prepare next contribution round:",
          nextRoundError
        )

        /*
          The money has already been paid successfully.
          Do NOT report the B2C payout as failed.
        */

        return NextResponse.json({
          success: true,
          status: "paid",
          nextRoundCreated: false,
          warning:
            "Payout succeeded but next round preparation failed",
        })
      }


      /*
        ----------------------------------------------------------
        5. VERIFY THE NEXT ROUND
        ----------------------------------------------------------
      */

      const { data: preparedRound, error: preparedLookupError } =
        await supabase
          .from("contribution_rounds")
          .select(
            "id, group_id, round_number, recipient_member_id, target_amount, collected_amount, status"
          )
          .eq("id", nextRound)
          .maybeSingle()

      if (preparedLookupError) {
        console.error(
          "Failed to verify prepared contribution round:",
          preparedLookupError
        )

        return NextResponse.json({
          success: true,
          status: "paid",
          nextRoundCreated: false,
          warning:
            "Payout succeeded but next round verification failed",
        })
      }


      /*
        ----------------------------------------------------------
        6. LOG COMPLETE LIFECYCLE
        ----------------------------------------------------------
      */

      console.log(
        "CONTRIBUTION PAYOUT PAID:",
        {
          disbursementId: disbursement.id,
          roundId: disbursement.round_id,
          amount:
            transactionAmount ?? disbursement.amount,
          receipt: transactionReceipt,
          transactionId,
        }
      )

      console.log(
        "NEXT CONTRIBUTION ROUND PREPARED:",
        preparedRound
      )


      /*
        ----------------------------------------------------------
        7. SUCCESS RESPONSE
        ----------------------------------------------------------
      */

      return NextResponse.json({
        success: true,
        status: "paid",
        nextRoundCreated: true,
        nextRound: preparedRound,
      })
    }


    /*
      ============================================================
      SAFARICOM FAILURE
      ============================================================
    */

    const failureReason =
      result.ResultDesc ||
      `Safaricom B2C failed with ResultCode ${resultCode}`

    const { error: failedError } =
      await supabase
        .from("contribution_disbursements")
        .update({
          status: "failed",
          failure_reason: failureReason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", disbursement.id)
        .neq("status", "paid")

    if (failedError) {
      console.error(
        "Failed to record contribution payout failure:",
        failedError
      )

      return NextResponse.json(
        {
          error:
            "Failed to record payout failure",
        },
        { status: 500 }
      )
    }


    console.log(
      "CONTRIBUTION PAYOUT FAILED:",
      {
        disbursementId: disbursement.id,
        roundId: disbursement.round_id,
        resultCode,
        failureReason,
      }
    )

    return NextResponse.json({
      success: true,
      status: "failed",
      resultCode,
    })

  } catch (error) {

    console.error(
      "Contribution B2C ResultURL error:",
      error
    )

    return NextResponse.json(
      {
        error:
          "Result callback processing failed",
      },
      { status: 500 }
    )
  }
}