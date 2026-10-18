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
      "CONTRIBUTION B2C TIMEOUT:",
      JSON.stringify(body)
    )

    const result = body?.Result

    const originatorConversationId =
      result?.OriginatorConversationID

    if (originatorConversationId) {
      await supabase
        .from("contribution_disbursements")
        .update({
          status: "failed",
          failure_reason: "Safaricom B2C request timed out",
          updated_at: new Date().toISOString(),
        })
        .eq(
          "originator_conversation_id",
          originatorConversationId
        )
        .neq("status", "paid")
    }

    return NextResponse.json({
      success: true,
      received: true,
    })
  } catch (error) {
    console.error(
      "Contribution B2C TimeoutURL error:",
      error
    )

    // Safaricom should still receive a valid HTTP response.
    return NextResponse.json({
      success: false,
      received: true,
    })
  }
}