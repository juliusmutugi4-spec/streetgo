import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log(
      "FUNDRAISING B2C TIMEOUT:",
      JSON.stringify(body)
    )

    const result = body?.Result

    const originatorConversationId =
      result?.OriginatorConversationID || null

    const conversationId =
      result?.ConversationID || null

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

    const { data: payout, error } =
      await query.maybeSingle()

    if (error) {
      console.error(
        "FUNDRAISING TIMEOUT LOOKUP ERROR:",
        error
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    if (!payout) {
      console.error(
        "FUNDRAISING TIMEOUT PAYOUT NOT FOUND:",
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
        ResultDesc: "Already paid"
      })
    }

    const { error: updateError } = await supabase
      .from("fundraising_payouts")
      .update({
        status: "failed",
        provider_conversation_id: conversationId,
        failure_reason: "Safaricom B2C payout timed out",
        updated_at: new Date().toISOString()
      })
      .eq("id", payout.id)
      .neq("status", "paid")

    if (updateError) {
      console.error(
        "FUNDRAISING TIMEOUT UPDATE ERROR:",
        updateError
      )
    }

    console.log(
      "FUNDRAISING PAYOUT TIMED OUT:",
      payout.id
    )

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    })
  } catch (error) {
    console.error(
      "FUNDRAISING B2C TIMEOUT ERROR:",
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
    route: "fundraising payout timeout"
  })
}