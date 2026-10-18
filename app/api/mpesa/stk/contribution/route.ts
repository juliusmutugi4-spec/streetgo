import { NextResponse } from "next/server"
import axios from "axios"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error(
      "Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET"
    )
  }

  const auth = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64")

  const { data } = await axios.get(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  )

  if (!data?.access_token) {
    throw new Error(
      "Safaricom did not return an access token"
    )
  }

  return data.access_token
}

function formatPhone(phone: string) {
  const clean = String(phone).replace(/\D/g, "")

  if (clean.startsWith("0")) {
    return `254${clean.slice(1)}`
  }

  if (clean.startsWith("7")) {
    return `254${clean}`
  }

  if (clean.startsWith("254")) {
    return clean
  }

  return clean
}

export async function POST(req: Request) {
  let transactionId = ""

  try {
    const body = await req.json()

    const groupId = String(body.groupId || "")
    const phone = String(body.phone || "")

    if (!groupId) {
      return NextResponse.json(
        {
          success: false,
          error: "Group ID is required.",
        },
        { status: 400 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Safaricom phone number is required.",
        },
        { status: 400 }
      )
    }

    /*
     * --------------------------------------------------
     * Authenticate the StreetGO user
     * --------------------------------------------------
     */

    const authHeader = req.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      )
    }

    const userToken = authHeader.replace(
      "Bearer ",
      ""
    )

    const userSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await userSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Your StreetGO session is invalid.",
        },
        { status: 401 }
      )
    }

    /*
     * --------------------------------------------------
     * Create secure pending contribution
     * --------------------------------------------------
     *
     * The database decides:
     * - member
     * - member code
     * - contribution amount
     */

    const { data: paymentData, error: paymentError } =
      await userSupabase.rpc(
        "create_merry_go_round_payment",
        {
          p_group_id: groupId,
        }
      )

    if (paymentError) {
      throw new Error(paymentError.message)
    }

    if (!paymentData || paymentData.length === 0) {
      throw new Error(
        "Unable to create contribution payment."
      )
    }

    const payment = paymentData[0]

    transactionId = payment.transaction_id

    const amount = Number(payment.amount)
    const memberCode = String(
      payment.member_code || ""
    )

    if (!transactionId) {
      throw new Error(
        "Contribution transaction was not created."
      )
    }

    if (!amount || amount < 1) {
      throw new Error(
        "Invalid contribution amount."
      )
    }

    if (!memberCode) {
      throw new Error(
        "Member code is missing."
      )
    }

    /*
     * --------------------------------------------------
     * Format Safaricom number
     * --------------------------------------------------
     */

    const formattedPhone = formatPhone(phone)

    if (!/^2547\d{8}$/.test(formattedPhone)) {
      throw new Error(
        "Invalid Kenyan Safaricom phone number."
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
      process.env.MPESA_CALLBACK_URL

    if (!shortcode) {
      throw new Error(
        "Missing MPESA_SHORTCODE."
      )
    }

    if (!passkey) {
      throw new Error(
        "Missing MPESA_PASSKEY."
      )
    }

    if (!callbackUrl) {
      throw new Error(
        "Missing MPESA_CALLBACK_URL."
      )
    }

    /*
     * --------------------------------------------------
     * Timestamp
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
     * STK Push password
     * --------------------------------------------------
     */

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString("base64")

    /*
     * --------------------------------------------------
     * Get production OAuth token
     * --------------------------------------------------
     */

    const token = await getAccessToken()

    /*
     * --------------------------------------------------
     * Send STK Push
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

        Amount: Math.floor(amount),

        PartyA: formattedPhone,
        PartyB: shortcode,

        PhoneNumber: formattedPhone,

        CallBackURL: callbackUrl,

        /*
         * IMPORTANT:
         * The member code identifies the
         * contribution member.
         */
        AccountReference: memberCode,

        TransactionDesc:
          "StreetGO Contribution",
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
      "STREETGO CONTRIBUTION STK RESPONSE"
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
          .from(
            "contribution_transactions"
          )
          .update({
            checkout_request_id:
              data.CheckoutRequestID,
            merchant_request_id:
              data.MerchantRequestID || null,
            phone_number:
              formattedPhone,
            status:
              "processing",
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", transactionId)

      if (updateError) {
        console.error(
          "FAILED TO SAVE STK REQUEST:",
          updateError
        )
      }
    }

    return NextResponse.json({
      success: true,
      transactionId,
      memberCode,
      amount,
      ...data,
    })
  } catch (error: any) {
    const details =
      error.response?.data ||
      error.message ||
      "Unknown contribution STK error"

    console.error(
      "================================="
    )
    console.error(
      "STREETGO CONTRIBUTION STK ERROR"
    )
    console.error(details)
    console.error(
      "================================="
    )

    /*
     * Mark the pending transaction failed
     * if something went wrong.
     */

    if (transactionId) {
      await supabase
        .from(
          "contribution_transactions"
        )
        .update({
          status: "failed",
          failure_reason:
            typeof details === "string"
              ? details
              : JSON.stringify(details),
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", transactionId)
    }

    return NextResponse.json(
      {
        success: false,
        error: details,
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "StreetGO contribution STK endpoint is operational",
  })
}