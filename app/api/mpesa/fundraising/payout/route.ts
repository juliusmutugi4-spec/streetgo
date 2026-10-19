import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import axios from "axios"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatPhone(phone: string) {
  const value = String(phone || "").replace(/\D/g, "")

  if (value.startsWith("254")) return value
  if (value.startsWith("0")) return `254${value.slice(1)}`

  return value
}

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY!
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!

  const credentials = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64")

  const response = await axios.get(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  )

  return response.data.access_token
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const contributionId = String(body.contributionId || "")

    if (!contributionId) {
      return NextResponse.json(
        {
          success: false,
          error: "contributionId is required",
        },
        { status: 400 }
      )
    }

    // Load exactly one payout.
    const { data: payout, error: payoutError } =
      await supabase
        .from("fundraising_payouts")
        .select("*")
        .eq("contribution_id", contributionId)
        .single()

    if (payoutError || !payout) {
      return NextResponse.json(
        {
          success: false,
          error: "Fundraising payout not found",
        },
        { status: 404 }
      )
    }

    // Never send a payout that is not pending.
    if (payout.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: `Payout is already ${payout.status}`,
          payoutId: payout.id,
        },
        { status: 409 }
      )
    }

    // Verify the original contribution is actually paid.
    const { data: contribution, error: contributionError } =
      await supabase
        .from("fundraising_contributions")
        .select("id, amount, payment_status, mpesa_receipt")
        .eq("id", contributionId)
        .single()

    if (contributionError || !contribution) {
      return NextResponse.json(
        {
          success: false,
          error: "Contribution not found",
        },
        { status: 404 }
      )
    }

    if (contribution.payment_status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          error: "Contribution has not been paid",
        },
        { status: 400 }
      )
    }

    // Make sure payout amount matches the paid contribution.
    if (Number(payout.amount) !== Number(contribution.amount)) {
      return NextResponse.json(
        {
          success: false,
          error: "Payout amount does not match contribution amount",
        },
        { status: 400 }
      )
    }

    // ==================================================
    // PHONE → B2C
    // ==================================================

    if (payout.destination_type === "phone") {
      const phone = formatPhone(payout.destination_phone)

      if (!/^2547\d{8}$/.test(phone)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid fundraiser phone number",
          },
          { status: 400 }
        )
      }

      const shortcode = process.env.MPESA_SHORTCODE!
      const initiatorName = process.env.MPESA_B2C_INITIATOR!
      const securityCredential =
        process.env.MPESA_B2C_SECURITY_CREDENTIAL!

      const resultUrl =
        process.env.MPESA_FUNDRAISING_B2C_RESULT_URL ||
        process.env.MPESA_CONTRIBUTION_B2C_RESULT_URL

      const timeoutUrl =
        process.env.MPESA_FUNDRAISING_B2C_TIMEOUT_URL ||
        process.env.MPESA_CONTRIBUTION_B2C_TIMEOUT_URL

      if (!resultUrl || !timeoutUrl) {
        return NextResponse.json(
          {
            success: false,
            error: "Fundraising B2C callback URLs are not configured",
          },
          { status: 500 }
        )
      }

      const accessToken = await getAccessToken()

      const originatorConversationId =
        `FUND-${payout.id.slice(0, 8)}-${Date.now()}`

      const payload = {
        OriginatorConversationID: originatorConversationId,
        InitiatorName: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: "BusinessPayment",
        Amount: Number(payout.amount),
        PartyA: shortcode,
        PartyB: phone,
        Remarks: "StreetGO fundraising payout",
        QueueTimeOutURL: timeoutUrl,
        ResultURL: resultUrl,
        Occasion: `Fundraising ${payout.campaign_id}`,
      }

      console.log(
        "FUNDRAISING B2C PAYOUT REQUEST:",
        JSON.stringify(
          {
            contributionId,
            payoutId: payout.id,
            amount: Number(payout.amount),
            destinationType: payout.destination_type,
            phone,
            originatorConversationId,
          },
          null,
          2
        )
      )

      // Mark processing BEFORE calling Safaricom.
      const { error: processingError } =
        await supabase
          .from("fundraising_payouts")
          .update({
            status: "processing",
            provider_originator_conversation_id:
              originatorConversationId,
            payout_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", payout.id)
          .eq("status", "pending")

      if (processingError) {
        console.error(
          "FUNDRAISING PAYOUT STATUS ERROR:",
          processingError
        )

        return NextResponse.json(
          {
            success: false,
            error: "Could not reserve payout",
          },
          { status: 500 }
        )
      }

      try {
        const response = await axios.post(
          "https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
          payload,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        )

        console.log(
          "FUNDRAISING B2C PAYOUT RESPONSE:",
          JSON.stringify(response.data, null, 2)
        )

        await supabase
          .from("fundraising_payouts")
          .update({
            provider_conversation_id:
              response.data.ConversationID || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payout.id)

        return NextResponse.json({
          success: true,
          payoutId: payout.id,
          contributionId,
          destinationType: "phone",
          amount: Number(payout.amount),
          response: response.data,
        })
      } catch (error: any) {
        console.error(
          "FUNDRAISING B2C PAYOUT REQUEST FAILED:",
          error?.response?.data || error?.message || error
        )

        await supabase
          .from("fundraising_payouts")
          .update({
            status: "failed",
            failure_reason:
              error?.response?.data?.errorMessage ||
              error?.message ||
              "Safaricom payout request failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payout.id)

        return NextResponse.json(
          {
            success: false,
            error:
              error?.response?.data?.errorMessage ||
              error?.message ||
              "Safaricom payout request failed",
          },
          { status: 500 }
        )
      }
    }

    // ==================================================
    // PAYBILL
    // ==================================================

    if (payout.destination_type === "paybill") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fundraising PayBill payout is not enabled yet.",
        },
        { status: 501 }
      )
    }

    // ==================================================
    // TILL
    // ==================================================

    if (payout.destination_type === "till") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fundraising Till payout is not enabled yet.",
        },
        { status: 501 }
      )
    }

    // ==================================================
    // BANK
    // ==================================================

    if (payout.destination_type === "bank") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fundraising bank payout is not enabled yet.",
        },
        { status: 501 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error:
          `Unsupported destination type: ${payout.destination_type}`,
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error(
      "FUNDRAISING PAYOUT ERROR:",
      error?.response?.data || error?.message || error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error?.response?.data?.errorMessage ||
          error?.response?.data?.error ||
          error?.message ||
          "Fundraising payout failed",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "StreetGO Fundraising Payout",
    status: "online",
  })
}