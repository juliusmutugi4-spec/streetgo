import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("FUNDRAISING B2C RESULT:", JSON.stringify(body))

    const result = body?.Result

    if (!result) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    const originatorConversationId =
      result.OriginatorConversationID || null

    const conversationId =
      result.ConversationID || null

    const resultCode = Number(result.ResultCode)

    const resultParameters =
      result.ResultParameters?.ResultParameter || []

    const getParameter = (name: string) =>
      resultParameters.find(
        (item: any) => item.Key === name
      )?.Value

    const transactionId =
      getParameter("TransactionReceipt") || null

    const failureReason =
      result.ResultDesc || "Fundraising payout failed"

    let query = supabase
      .from("fundraising_payouts")
      .select("id,status")
      .limit(1)

    if (originatorConversationId) {
      query = query.eq(
        "provider_originator_conversation_id",
        originatorConversationId
      )
    } else if (conversationId) {
      query = query.eq(
        "provider_conversation_id",
        conversationId
      )
    } else {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    const { data: payout, error: payoutError } =
      await query.maybeSingle()

    if (payoutError) {
      console.error(
        "FUNDRAISING PAYOUT LOOKUP ERROR:",
        payoutError
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    if (!payout) {
      console.error(
        "FUNDRAISING PAYOUT NOT FOUND:",
        {
          originatorConversationId,
          conversationId
        }
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    if (payout.status === "paid") {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed"
      })
    }

    if (resultCode === 0) {
      const { error } = await supabase
        .from("fundraising_payouts")
        .update({
          status: "paid",
          provider_conversation_id: conversationId,
          provider_transaction_id: transactionId,
          payout_paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          failure_reason: null
        })
        .eq("id", payout.id)

      if (error) {
        console.error(
          "FUNDRAISING PAYOUT SUCCESS UPDATE ERROR:",
          error
        )
      }

      console.log(
        "FUNDRAISING PAYOUT COMPLETED:",
        payout.id
      )
    } else {
      const { error } = await supabase
        .from("fundraising_payouts")
        .update({
          status: "failed",
          provider_conversation_id: conversationId,
          failure_reason: failureReason,
          updated_at: new Date().toISOString()
        })
        .eq("id", payout.id)

      if (error) {
        console.error(
          "FUNDRAISING PAYOUT FAILURE UPDATE ERROR:",
          error
        )
      }

      console.log(
        "FUNDRAISING PAYOUT FAILED:",
        payout.id,
        failureReason
      )
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    })
  } catch (error) {
    console.error(
      "FUNDRAISING B2C RESULT ERROR:",
      error
    )

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "fundraising payout result"
  })
}