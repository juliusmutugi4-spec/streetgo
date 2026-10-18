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

    const { data: disbursement, error: lookupError } =
      await supabase
        .from("contribution_disbursements")
        .select(
          "id, round_id, amount, status"
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

    // Safaricom success
    if (resultCode === 0) {
      const { error: updateError } = await supabase
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

      const { error: roundError } = await supabase
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
          { error: "Payout succeeded but round update failed" },
          { status: 500 }
        )
      }

      console.log(
        "CONTRIBUTION PAYOUT PAID:",
        {
          disbursementId: disbursement.id,
          roundId: disbursement.round_id,
          amount: transactionAmount ?? disbursement.amount,
          receipt: transactionReceipt,
          transactionId,
        }
      )

      return NextResponse.json({
        success: true,
        status: "paid",
      })
    }

    // Safaricom failure
    const failureReason =
      result.ResultDesc ||
      `Safaricom B2C failed with ResultCode ${resultCode}`

    const { error: failedError } = await supabase
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
        { error: "Failed to record payout failure" },
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
      { error: "Result callback processing failed" },
      { status: 500 }
    )
  }
}