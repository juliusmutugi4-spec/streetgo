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

    const { campaignId, amount } = body

    if (!campaignId || !amount || Number(amount) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "campaignId and a valid amount are required",
        },
        { status: 400 }
      )
    }

    /*
     * Load campaign
     */
    const { data: campaign, error: campaignError } = await supabase
      .from("fundraising_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Fundraising campaign not found",
        },
        { status: 404 }
      )
    }

    /*
     * Only completed payments should ever reach payout.
     */
    if (campaign.status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: "This campaign has been cancelled",
        },
        { status: 400 }
      )
    }

    const destinationType = campaign.destination_type

    /*
     * PHONE DESTINATION
     *
     * This is the first payout rail we will implement.
     */
    if (destinationType === "phone") {
      const phone = formatPhone(campaign.destination_phone)

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
        `FUND-${campaign.id.slice(0, 8)}-${Date.now()}`

      const payload = {
        OriginatorConversationID: originatorConversationId,
        InitiatorName: initiatorName,
        SecurityCredential: securityCredential,
        CommandID: "BusinessPayment",
        Amount: Number(amount),
        PartyA: shortcode,
        PartyB: phone,
        Remarks: `StreetGO fundraising payout`,
        QueueTimeOutURL: timeoutUrl,
        ResultURL: resultUrl,
        Occasion: `Fund ${campaign.slug}`,
      }

      console.log(
        "FUNDRAISING B2C PAYOUT REQUEST:",
        JSON.stringify(
          {
            campaignId,
            amount: Number(amount),
            destinationType,
            phone,
            originatorConversationId,
          },
          null,
          2
        )
      )

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

      return NextResponse.json({
        success: true,
        destinationType: "phone",
        amount: Number(amount),
        phone,
        originatorConversationId,
        response: response.data,
      })
    }

    /*
     * PAYBILL
     *
     * We deliberately do NOT send anything yet.
     * Business Pay Bill requires its own Safaricom API
     * permission and request structure.
     */
    if (destinationType === "paybill") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fundraising PayBill payout is not enabled yet. Business Pay Bill API must be configured first.",
        },
        { status: 501 }
      )
    }

    /*
     * TILL
     *
     * We deliberately do NOT send anything yet.
     * Business Buy Goods requires its own Safaricom API
     * permission and request structure.
     */
    if (destinationType === "till") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Fundraising Till payout is not enabled yet. Business Buy Goods API must be configured first.",
        },
        { status: 501 }
      )
    }

    /*
     * BANK
     *
     * Bank payout will be added separately.
     */
    if (destinationType === "bank") {
      return NextResponse.json(
        {
          success: false,
          error: "Fundraising bank payout is not enabled yet.",
        },
        { status: 501 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: `Unsupported fundraising destination: ${destinationType}`,
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