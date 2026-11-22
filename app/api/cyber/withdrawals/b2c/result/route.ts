import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = body?.Result

    if (!result || typeof result !== "object") {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    const resultCode = Number(result.ResultCode)
    const resultDesc = String(result.ResultDesc ?? "Unknown result")
    const originatorConversationId = String(
      result.OriginatorConversationID ?? ""
    )

    // Validate the withdrawal correlation ID
    const match = originatorConversationId.match(
      /^SGCY([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    )

    if (!match || !Number.isInteger(resultCode)) {
      console.error("Invalid Cyber B2C callback")
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    const withdrawalId = match[1]

    const parameters =
      result.ResultParameters?.ResultParameter ?? []

    const getParameter = (name: string) => {
      const item = parameters.find(
        (parameter: any) => parameter?.Key === name
      )
      return item?.Value ?? null
    }

    const transactionReceipt = getParameter("TransactionReceipt")

    const { data: withdrawal, error: lookupError } = await supabase
      .from("cyber_withdrawals")
      .select("id, status")
      .eq("id", withdrawalId)
      .maybeSingle()

    if (lookupError) {
      console.error("Cyber withdrawal lookup error:", lookupError)
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Database error" },
        { status: 500 }
      )
    }

    if (!withdrawal) {
      console.error("Cyber withdrawal not found:", withdrawalId)
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    if (withdrawal.status !== "processing") {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed or not processing",
      })
    }

    // SUCCESS: Require an M-Pesa receipt before completing
    if (resultCode === 0) {
      if (!transactionReceipt) {
        console.error(
          "Successful B2C callback missing receipt:",
          withdrawalId
        )

        return NextResponse.json(
          {
            ResultCode: 1,
            ResultDesc: "Transaction receipt missing",
          },
          { status: 500 }
        )
      }

      const { error } = await supabase
        .from("cyber_withdrawals")
        .update({
          status: "completed",
          mpesa_receipt: String(transactionReceipt),
          completed_at: new Date().toISOString(),
          failure_reason: null,
        })
        .eq("id", withdrawalId)
        .eq("status", "processing")

      if (error) {
        console.error("Cyber payout completion error:", error)
        return NextResponse.json(
          { ResultCode: 1, ResultDesc: "Database update failed" },
          { status: 500 }
        )
      }

      console.log("CYBER WITHDRAWAL COMPLETED:", {
        withdrawalId,
        receipt: transactionReceipt,
      })

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    // FAILURE
    const { error } = await supabase
      .from("cyber_withdrawals")
      .update({
        status: "failed",
        failure_reason: `${resultCode}: ${resultDesc}`,
      })
      .eq("id", withdrawalId)
      .eq("status", "processing")

    if (error) {
      console.error("Cyber payout failure update error:", error)
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: "Database update failed" },
        { status: 500 }
      )
    }

    console.log("CYBER WITHDRAWAL FAILED:", {
      withdrawalId,
      resultCode,
      resultDesc,
    })

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  } catch (error) {
    console.error("CYBER B2C RESULT ERROR:", error)

    return NextResponse.json(
      { ResultCode: 1, ResultDesc: "Callback processing failed" },
      { status: 500 }
    )
  }
}
