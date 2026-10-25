import { NextResponse } from "next/server"
import axios from "axios"
import { createClient } from "@supabase/supabase-js"
import { getMpesaAccessToken } from "@/app/lib/mpesa"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function formatPhone(phone: string) {
  const clean = String(phone).replace(/\D/g, "")

  if (clean.startsWith("07") || clean.startsWith("01")) {
    return `254${clean.slice(1)}`
  }

  if (clean.startsWith("7") || clean.startsWith("1")) {
    return `254${clean}`
  }

  if (clean.startsWith("254")) {
    return clean
  }

  return clean
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const campaignId = String(body.campaignId || "")
    const amount = Number(body.amount || 0)
    const phone = String(body.phone || "")
    const contributorName = String(body.contributorName || "").trim()
    const message = String(body.message || "").trim()

    if (!campaignId) {
      return NextResponse.json(
        {
          success: false,
          error: "Campaign ID is required.",
        },
        { status: 400 }
      )
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid contribution amount.",
        },
        { status: 400 }
      )
    }

    const formattedPhone = formatPhone(phone)

    if (!/^2547\d{8}$/.test(formattedPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid Kenyan Safaricom number.",
        },
        { status: 400 }
      )
    }

    /*
     * --------------------------------------------------
     * Verify campaign
     * --------------------------------------------------
     */

const { data: campaign, error: campaignError } =
  await supabase
    .from("fundraising_campaigns")
    .select("id, status")
    .eq("id", campaignId)
    .single()

console.log("FUNDRAISER VERIFY:", {
  campaignId,
  campaign,
  campaignError,
})

    if (campaignError) {
      console.error(
        "CAMPAIGN LOOKUP ERROR:",
        campaignError
      )

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify fundraiser.",
        },
        { status: 500 }
      )
    }

    if (!campaign) {
      return NextResponse.json(
        {
          success: false,
          error: "Fundraiser not found.",
        },
        { status: 404 }
      )
    }

    if (campaign.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "This fundraiser is no longer accepting contributions.",
        },
        { status: 400 }
      )
    }
/*
 * --------------------------------------------------
 * Load current Fundraiser platform fee
 * --------------------------------------------------
 */

const { data: feeSetting, error: feeError } =
  await supabase
    .from("platform_fee_settings")
    .select("percentage")
    .eq("fee_type", "fundraiser")
    .eq("active", true)
    .single()

if (feeError || !feeSetting) {
  console.error(
    "FUNDRAISER FEE LOOKUP ERROR:",
    feeError
  )

  return NextResponse.json(
    {
      success: false,
      error: "Unable to determine fundraiser payment fee.",
    },
    { status: 500 }
  )
}

const beneficiaryAmount = Math.floor(amount)

const feePercentage =
  Number(feeSetting.percentage || 0)

const calculatedFee =
  beneficiaryAmount * (feePercentage / 100)

/*
 * M-PESA STK accepts whole KES amounts.
 * Round the customer charge upward so the
 * fundraiser still receives the full requested amount.
 */
const grossAmount =
  Math.ceil(
    beneficiaryAmount + calculatedFee
  )

const feeAmount =
  grossAmount - beneficiaryAmount

console.log(
  "FUNDRAISER PAYMENT FEE:",
  {
    beneficiaryAmount,
    feePercentage,
    calculatedFee,
    grossAmount,
    feeAmount,
  }
)
    /*
     * --------------------------------------------------
     * Create pending fundraising contribution
     * --------------------------------------------------
     */

    const { data: contribution, error: contributionError } =
      await supabase
        .from("fundraising_contributions")
.insert({
  campaign_id: campaignId,

  // Amount intended for the fundraiser
  amount: beneficiaryAmount,

  // Fee snapshot for this payment
  fee_percentage: feePercentage,
  fee_amount: feeAmount,
  gross_amount: grossAmount,
  beneficiary_amount: beneficiaryAmount,

  contributor_name:
    contributorName || null,

  contributor_phone:
    formattedPhone,

  message:
    message || null,

  payment_method: "mpesa",
  payment_status: "pending",
})
        .select("id")
        .single()

    if (contributionError || !contribution) {
      console.error(
        "CONTRIBUTION INSERT ERROR:",
        contributionError
      )

      return NextResponse.json(
        {
          success: false,
          error: "Unable to create contribution.",
        },
        { status: 500 }
      )
    }

    /*
     * --------------------------------------------------
     * Production M-PESA configuration
     * --------------------------------------------------
     */

    const shortcode =
      process.env.MPESA_SHORTCODE

    const passkey =
      process.env.MPESA_PASSKEY

    const callbackUrl =
      process.env.MPESA_FUNDRAISING_CALLBACK_URL ||
      process.env.MPESA_CALLBACK_URL

    if (!shortcode || !passkey || !callbackUrl) {
      console.error(
        "Missing M-PESA fundraising configuration."
      )

      await supabase
        .from("fundraising_contributions")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contribution.id)

      return NextResponse.json(
        {
          success: false,
          error: "M-PESA payment configuration is incomplete.",
        },
        { status: 500 }
      )
    }

    /*
     * --------------------------------------------------
     * Safaricom timestamp
     * --------------------------------------------------
     */

    const date = new Date()

    const timestamp =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0") +
      String(date.getHours()).padStart(2, "0") +
      String(date.getMinutes()).padStart(2, "0") +
      String(date.getSeconds()).padStart(2, "0")

    /*
     * --------------------------------------------------
     * STK password
     * --------------------------------------------------
     */

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString("base64")

    /*
     * --------------------------------------------------
     * Production OAuth
     * --------------------------------------------------
     */

    const token = await getMpesaAccessToken()

    /*
     * --------------------------------------------------
     * Send production STK Push
     * --------------------------------------------------
     */

    const { data } = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,

        TransactionType:
          "CustomerPayBillOnline",

        Amount: grossAmount,

        PartyA: formattedPhone,
        PartyB: shortcode,

        PhoneNumber: formattedPhone,

        CallBackURL: callbackUrl,

        AccountReference:
          `FUND-${contribution.id.slice(0, 8)}`,

        TransactionDesc:
          "StreetGO Fundraiser",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    console.log(
      "================================="
    )

    console.log(
      "STREETGO FUNDRAISING STK RESPONSE"
    )

    console.log(data)

    console.log(
      "================================="
    )

    /*
     * --------------------------------------------------
     * Save Safaricom request IDs
     * --------------------------------------------------
     */

    if (data?.CheckoutRequestID) {
      const { error: updateError } =
        await supabase
          .from("fundraising_contributions")
          .update({
            checkout_request_id:
              data.CheckoutRequestID,

            merchant_request_id:
              data.MerchantRequestID || null,

            payment_status:
              "processing",

            updated_at:
              new Date().toISOString(),
          })
          .eq("id", contribution.id)

      if (updateError) {
        console.error(
          "FAILED TO SAVE FUNDRAISING STK REQUEST:",
          updateError
        )
      }
    }

    /*
     * --------------------------------------------------
     * Return to browser
     * --------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      contributionId:
        contribution.id,

      amount: beneficiaryAmount,

chargedAmount: grossAmount,

feeAmount,

feePercentage,

      phone:
        formattedPhone,

      checkoutRequestId:
        data?.CheckoutRequestID || null,

      merchantRequestId:
        data?.MerchantRequestID || null,

      responseCode:
        data?.ResponseCode || null,

      responseDescription:
        data?.ResponseDescription ||
        "STK Push sent.",
    })
  } catch (error: any) {
    const details =
      error?.response?.data ||
      error?.message ||
      "Unknown fundraising STK error"

    console.error(
      "================================="
    )

    console.error(
      "STREETGO FUNDRAISING STK ERROR"
    )

    console.error(details)

    console.error(
      "================================="
    )

    return NextResponse.json(
      {
        success: false,
        error:
          typeof details === "string"
            ? details
            : "M-PESA STK Push failed.",
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "StreetGO fundraising STK endpoint is operational",
  })
}