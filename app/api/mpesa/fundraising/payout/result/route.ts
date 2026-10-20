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
      "FUNDRAISING B2C RESULT:",
      JSON.stringify(body, null, 2)
    )

    const result = body?.Result

    // Safaricom expects a successful acknowledgement.
    // We acknowledge even when the payload is unexpected so
    // Safaricom does not repeatedly retry the callback.
    if (!result) {
      console.warn(
        "FUNDRAISING B2C RESULT: Missing Result object"
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    // --------------------------------------------------
    // SAFARICOM IDENTIFIERS
    // --------------------------------------------------

    const originatorConversationId =
      result.OriginatorConversationID || null

    const conversationId =
      result.ConversationID || null

    const resultCode = Number(result.ResultCode)

    console.log("FUNDRAISING B2C CALLBACK IDENTIFIERS:", {
      originatorConversationId,
      conversationId,
      resultCode,
    })

    // --------------------------------------------------
    // RESULT PARAMETERS
    // --------------------------------------------------

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

    console.log("FUNDRAISING B2C CALLBACK DETAILS:", {
      transactionId,
      failureReason,
    })

    // --------------------------------------------------
    // FIND PAYOUT
    // --------------------------------------------------

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
      console.error(
        "FUNDRAISING PAYOUT CALLBACK: No conversation identifiers"
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    const {
      data: payout,
      error: payoutError,
    } = await query.maybeSingle()

    if (payoutError) {
      console.error(
        "FUNDRAISING PAYOUT LOOKUP ERROR:",
        payoutError
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    if (!payout) {
      console.error(
        "FUNDRAISING PAYOUT NOT FOUND:",
        {
          originatorConversationId,
          conversationId,
        }
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    console.log(
      "FUNDRAISING PAYOUT FOUND:",
      {
        payoutId: payout.id,
        status: payout.status,
      }
    )

    // --------------------------------------------------
    // ALREADY PAID
    // --------------------------------------------------

    if (payout.status === "paid") {
      console.log(
        "FUNDRAISING PAYOUT ALREADY PAID:",
        payout.id
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Already processed",
      })
    }

    // --------------------------------------------------
    // SUCCESS
    // --------------------------------------------------

    if (resultCode === 0) {
      const { data: updatedPayout, error } =
        await supabase
          .from("fundraising_payouts")
          .update({
            status: "paid",
            provider_conversation_id:
              conversationId,
            provider_transaction_id:
              transactionId,
            payout_paid_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
            failure_reason: null,
          })
          .eq("id", payout.id)
          .eq("status", "processing")
          .select("id,status")
          .maybeSingle()

      if (error) {
        console.error(
          "FUNDRAISING PAYOUT SUCCESS UPDATE ERROR:",
          error
        )

        return NextResponse.json({
          ResultCode: 0,
          ResultDesc: "Accepted",
        })
      }

      // If no row was updated, another callback/request
      // already changed the payout state.
      if (!updatedPayout) {
        console.warn(
          "FUNDRAISING PAYOUT SUCCESS UPDATE SKIPPED:",
          {
            payoutId: payout.id,
            currentStatus: payout.status,
          }
        )

        return NextResponse.json({
          ResultCode: 0,
          ResultDesc: "Accepted",
        })
      }

      console.log(
        "FUNDRAISING PAYOUT COMPLETED:",
        {
          payoutId: payout.id,
          conversationId,
          transactionId,
        }
      )
    }

    // --------------------------------------------------
    // FAILURE
    // --------------------------------------------------

    else {
      const { data: updatedPayout, error } =
        await supabase
          .from("fundraising_payouts")
          .update({
            status: "failed",
            provider_conversation_id:
              conversationId,
            failure_reason:
              failureReason,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", payout.id)
          .eq("status", "processing")
          .select("id,status")
          .maybeSingle()

      if (error) {
        console.error(
          "FUNDRAISING PAYOUT FAILURE UPDATE ERROR:",
          error
        )

        return NextResponse.json({
          ResultCode: 0,
          ResultDesc: "Accepted",
        })
      }

      if (!updatedPayout) {
        console.warn(
          "FUNDRAISING PAYOUT FAILURE UPDATE SKIPPED:",
          {
            payoutId: payout.id,
            currentStatus: payout.status,
          }
        )

        return NextResponse.json({
          ResultCode: 0,
          ResultDesc: "Accepted",
        })
      }

      console.log(
        "FUNDRAISING PAYOUT FAILED:",
        {
          payoutId: payout.id,
          resultCode,
          failureReason,
        }
      )
    }

    // --------------------------------------------------
    // ACKNOWLEDGE SAFARICOM
    // --------------------------------------------------

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  } catch (error) {
    console.error(
      "FUNDRAISING B2C RESULT ERROR:",
      error
    )

    // Always acknowledge Safaricom.
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "fundraising payout result",
  })
}