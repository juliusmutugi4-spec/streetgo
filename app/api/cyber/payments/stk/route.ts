import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import axios from "axios"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

async function getAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa API credentials are missing.")
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
    throw new Error("Safaricom did not return an access token.")
  }

  return data.access_token as string
}

function formatPhone(phone: string) {
  const clean = phone.replace(/\D/g, "")

  if (clean.startsWith("0")) return `254${clean.slice(1)}`
  if (clean.startsWith("7")) return `254${clean}`
  return clean
}

export async function POST(req: Request) {
  let paymentId: string | null = null

  try {
    const body = await req.json()
    const token = String(body.token || "").trim()
    const packageId = String(body.package_id || "").trim()
    const phone = formatPhone(String(body.phone || ""))

    if (!/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { error: "Invalid customer access token." },
        { status: 401 }
      )
    }

    if (!packageId) {
      return NextResponse.json(
        { error: "Please select a time package." },
        { status: 400 }
      )
    }

    if (!/^2547\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "Enter a valid Kenyan M-Pesa phone number." },
        { status: 400 }
      )
    }

    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const callbackUrl =
      process.env.CYBER_MPESA_CALLBACK_URL ||
      `${(process.env.NEXT_PUBLIC_SITE_URL || "https://streetgo.app").replace(/\/$/, "")}/api/cyber/payments/callback`

    if (!shortcode || !passkey) {
      throw new Error("M-Pesa shortcode or passkey is missing.")
    }

    if (!callbackUrl.startsWith("https://")) {
      throw new Error("Cyber M-Pesa callback must use HTTPS.")
    }

    const admin = createAdminSupabase()
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex")

    const { data: computer, error: computerError } = await admin
      .from("cyber_computers")
      .select("id, merchant_id, branch_id, computer_name")
      .eq("kiosk_token_hash", tokenHash)
      .gt("kiosk_token_expires_at", new Date().toISOString())
      .maybeSingle()

    if (computerError || !computer) {
      return NextResponse.json(
        { error: "Customer access has expired or is invalid." },
        { status: 401 }
      )
    }

    const { data: merchant, error: merchantError } = await admin
      .from("cyber_merchants")
      .select("status")
      .eq("id", computer.merchant_id)
      .maybeSingle()

    if (merchantError || !merchant || merchant.status !== "active") {
      return NextResponse.json(
        { error: "This business is not active." },
        { status: 403 }
      )
    }

    const { data: timePackage, error: packageError } = await admin
      .from("cyber_time_packages")
      .select("id, package_name, duration_minutes, price_kes")
      .eq("id", packageId)
      .eq("merchant_id", computer.merchant_id)
      .eq("branch_id", computer.branch_id)
      .eq("is_active", true)
      .or(`computer_id.is.null,computer_id.eq.${computer.id}`)
      .maybeSingle()

    if (packageError || !timePackage) {
      return NextResponse.json(
        { error: "Selected package is unavailable for this computer." },
        { status: 404 }
      )
    }

    const amount = Math.floor(Number(timePackage.price_kes))

    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json(
        { error: "This package has an invalid payment amount." },
        { status: 400 }
      )
    }

    const { data: activeSession, error: sessionError } = await admin
      .from("cyber_sessions")
      .select("id")
      .eq("computer_id", computer.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()

    if (sessionError) {
      throw new Error("Unable to check the computer session.")
    }

    if (activeSession) {
      return NextResponse.json(
        { error: "This computer already has an active paid session." },
        { status: 409 }
      )
    }

    const { data: payment, error: insertError } = await admin
      .from("cyber_payments")
      .insert({
        merchant_id: computer.merchant_id,
        branch_id: computer.branch_id,
        computer_id: computer.id,
        package_id: timePackage.id,
        customer_phone: phone,
        package_name: timePackage.package_name,
        duration_minutes: timePackage.duration_minutes,
        amount_kes: amount,
        status: "pending",
      })
      .select("id")
      .single()

    if (insertError || !payment) {
      console.error("CYBER PAYMENT RECORD ERROR:", insertError)
      throw new Error("Unable to create the payment record.")
    }

    paymentId = payment.id

    const date = new Date()
    const timestamp =
      date.getFullYear().toString() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0") +
      String(date.getHours()).padStart(2, "0") +
      String(date.getMinutes()).padStart(2, "0") +
      String(date.getSeconds()).padStart(2, "0")

    const password = Buffer.from(
      `${shortcode}${passkey}${timestamp}`
    ).toString("base64")

    const accessToken = await getAccessToken()

    const { data } = await axios.post(
      "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: "StreetGOCyber",
        TransactionDesc: "Cyber Computer Time",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    )

    if (data?.ResponseCode !== "0" || !data?.CheckoutRequestID) {
      await admin
        .from("cyber_payments")
        .update({
          status: "failed",
          result_description: data?.ResponseDescription || "STK request was not accepted.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id)

      return NextResponse.json(
        {
          success: false,
          error: data?.ResponseDescription || "Safaricom did not accept the STK request.",
        },
        { status: 400 }
      )
    }

    const { error: updateError } = await admin
      .from("cyber_payments")
      .update({
        merchant_request_id: data.MerchantRequestID || null,
        checkout_request_id: data.CheckoutRequestID,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id)

    if (updateError) {
      console.error("CYBER CHECKOUT ID SAVE ERROR:", updateError)
      return NextResponse.json(
        { error: "Payment was requested, but its reference could not be saved. Contact support before retrying." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "M-Pesa payment prompt sent. Check your phone.",
      payment_id: payment.id,
      checkout_request_id: data.CheckoutRequestID,
    })
  } catch (error: unknown) {
    const details = axios.isAxiosError(error)
      ? error.response?.data || error.message
      : error instanceof Error
        ? error.message
        : "Unknown Cyber payment error."

    console.error("CYBER STK PUSH ERROR:", details)

    if (paymentId) {
      try {
        const admin = createAdminSupabase()
        await admin
          .from("cyber_payments")
          .update({
            status: "failed",
            result_description: "STK request could not be completed.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId)
          .eq("status", "pending")
          .is("checkout_request_id", null)
      } catch (updateError) {
        console.error("CYBER PAYMENT FAILURE UPDATE ERROR:", updateError)
      }
    }

    return NextResponse.json(
      { success: false, error: "Unable to initiate M-Pesa payment." },
      { status: 400 }
    )
  }
}

