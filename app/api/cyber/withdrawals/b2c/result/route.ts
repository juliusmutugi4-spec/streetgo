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

    console.log("===== CYBER B2C RESULT =====")
    console.log(JSON.stringify(body, null, 2))

    if (!result) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    const resultCode = Number(result.ResultCode ?? -1)
    const resultDesc = result.ResultDesc ?? "Unknown result"

    const originatorConversationId =
      result.OriginatorConversationID ?? null

    const parameters =
      result.ResultParameters?.ResultParameter ?? []

    const getParameter = (name: string) => {
      const item = parameters.find(
        (parameter: any) => parameter.Key === name
      )
      return item?.Value ?? null
    }

    const transactionReceipt =
      getParameter("TransactionReceipt")

    // Recover the Cyber withdrawal UUID from the originator ID.
    const withdrawalId = originatorConversationId
      ?.replace(/^SGCY/, "")

    let withdrawal = null

    if (withdrawalId) {
      const { data } = await supabase
        .from("cyber_withdrawals")
        .select("id, status")
        .eq("id", withdrawalId)
        .maybeSingle()

      withdrawal = data
    }

    if (!withdrawal) {
      console.error("CYBER B2C: Withdrawal not found", {
        originatorConversationId,
      })

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    if (withdrawal.status === "completed") {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed",
      })
    }

    // SUCCESS
    if (resultCode === 0) {
      const { error } = await supabase
        .from("cyber_withdrawals")
        .update({
          status: "completed",
          mpesa_receipt: transactionReceipt,
          completed_at: new Date().toISOString(),
          failure_reason: null,
        })
        .eq("id", withdrawal.id)
        .eq("status", "processing")

      if (error) {
        console.error("CYBER B2C SUCCESS UPDATE ERROR:", error)

        return NextResponse.json(
          {
            ResultCode: 1,
            ResultDesc: "Failed to update Cyber withdrawal",
          },
          { status: 500 }
        )
      }

      console.log("CYBER WITHDRAWAL COMPLETED", {
        withdrawalId: withdrawal.id,
        transactionReceipt,
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
      .eq("id", withdrawal.id)
      .eq("status", "processing")

    if (error) {
      console.error("CYBER B2C FAILURE UPDATE ERROR:", error)

      return NextResponse.json(
        {
          ResultCode: 1,
          ResultDesc: "Failed to update Cyber withdrawal",
        },
        { status: 500 }
      )
    }

    console.log("CYBER WITHDRAWAL FAILED", {
      withdrawalId: withdrawal.id,
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
      {
        ResultCode: 1,
        ResultDesc: "Failed to process Cyber result",
      },
      { status: 500 }
    )
  }
}

