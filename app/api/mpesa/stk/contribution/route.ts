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
    const requestedTransactionId = String(
      body.transactionId || ""
    )

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

    if (!requestedTransactionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment transaction ID is required.",
        },
        { status: 400 }
      )
    }

    /*
     * --------------------------------------------------
     * Authenticate StreetGO user
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
     * IMPORTANT
     *
     * The frontend has ALREADY created the pending
     * transaction.
     *
     * We must NOT call create_merry_go_round_payment
     * again here.
     *
     * We use the transaction ID supplied by the frontend.
     * --------------------------------------------------
     */

    transactionId = requestedTransactionId

    /*
     * --------------------------------------------------
     * Load the existing transaction
     * --------------------------------------------------
     */

    const {
      data: transaction,
      error: transactionError,
    } = await supabase
      .from("contribution_transactions")
      .select(`
        id,
        group_id,
        member_id,
        member_code,
        amount,
        status,
        checkout_request_id,
        merchant_request_id,
        phone_number
      `)
      .eq("id", transactionId)
      .eq("group_id", groupId)
      .maybeSingle()

    if (transactionError) {
      throw new Error(
        transactionError.message
      )
    }

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The payment transaction could not be found.",
        },
        { status: 404 }
      )
    }

    /*
     * --------------------------------------------------
     * Security check
     *
     * Make sure this transaction belongs to the
     * currently logged-in StreetGO user.
     * --------------------------------------------------
     */

    const {
      data: member,
      error: memberError,
    } = await supabase
      .from("contribution_members")
      .select(`
        id,
        user_id,
        group_id
      `)
      .eq("id", transaction.member_id)
      .eq("group_id", groupId)
      .maybeSingle()

    if (memberError) {
      throw new Error(
        memberError.message
      )
    }

    if (!member) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment member could not be verified.",
        },
        { status: 403 }
      )
    }

    if (member.user_id !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You are not authorized to use this payment transaction.",
        },
        { status: 403 }
      )
    }

    /*
     * --------------------------------------------------
     * Idempotency protection
     *
     * If an STK request was already sent successfully,
     * do NOT send another one.
     * --------------------------------------------------
     */

    if (
      transaction.status === "processing" &&
      transaction.checkout_request_id
    ) {
      return NextResponse.json({
        success: true,
        transactionId: transaction.id,
        memberCode: transaction.member_code,
        amount: Number(transaction.amount),
        CheckoutRequestID:
          transaction.checkout_request_id,
        MerchantRequestID:
          transaction.merchant_request_id,
        message:
          "M-PESA payment request is already in progress.",
      })
    }

    /*
     * Do not allow a transaction that has already
     * completed.
     */

    if (transaction.status === "paid") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This contribution has already been paid.",
        },
        { status: 400 }
      )
    }

    if (
      transaction.status === "cancelled"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This payment transaction has been cancelled.",
        },
        { status: 400 }
      )
    }

    /*
     * A failed transaction should not normally be
     * reused.
     */

    if (transaction.status === "failed") {
      return NextResponse.json(
        {
          success: false,
          error:
            "This payment attempt has failed. Please start a new payment.",
        },
        { status: 400 }
      )
    }

    /*
     * --------------------------------------------------
     * Payment values
     * --------------------------------------------------
     */

    const amount = Number(transaction.amount)

    const memberCode = String(
      transaction.member_code || ""
    )

    if (!transaction.id) {
      throw new Error(
        "Contribution transaction ID is missing."
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

    const formattedPhone =
      formatPhone(phone)

    if (
      !/^2547\d{8}$/.test(
        formattedPhone
      )
    ) {
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
      String(
        date.getMonth() + 1
      ).padStart(2, "0") +
      String(
        date.getDate()
      ).padStart(2, "0") +
      String(
        date.getHours()
      ).padStart(2, "0") +
      String(
        date.getMinutes()
      ).padStart(2, "0") +
      String(
        date.getSeconds()
      ).padStart(2, "0")

    /*
     * --------------------------------------------------
     * STK Push password
     * --------------------------------------------------
     */

    const password =
      Buffer.from(
        `${shortcode}${passkey}${timestamp}`
      ).toString("base64")

    /*
     * --------------------------------------------------
     * Get production OAuth token
     * --------------------------------------------------
     */

    const token =
      await getMpesaAccessToken()

    /*
     * --------------------------------------------------
     * Send STK Push
     * --------------------------------------------------
     */

    const { data } =
      await axios.post(
        "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          BusinessShortCode:
            shortcode,

          Password:
            password,

          Timestamp:
            timestamp,

          TransactionType:
            "CustomerPayBillOnline",

          Amount:
            Math.floor(amount),

          PartyA:
            formattedPhone,

          PartyB:
            shortcode,

          PhoneNumber:
            formattedPhone,

          CallBackURL:
            callbackUrl,

          AccountReference:
            memberCode,

          TransactionDesc:
            "StreetGO Contribution",
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
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
     * Safaricom accepted the STK request
     * --------------------------------------------------
     */

    if (data?.CheckoutRequestID) {
      const {
        error: updateError,
      } = await supabase
        .from(
          "contribution_transactions"
        )
        .update({
          checkout_request_id:
            data.CheckoutRequestID,

          merchant_request_id:
            data.MerchantRequestID ||
            null,

          phone_number:
            formattedPhone,

          status:
            "processing",

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          transactionId
        )

      if (updateError) {
        console.error(
          "FAILED TO SAVE STK REQUEST:",
          updateError
        )
      }
    }

    /*
     * --------------------------------------------------
     * Return successful STK response
     * --------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      transactionId,

      memberCode,

      amount,

      ...data,
    })
  } catch (error: any) {
    const details =
      error?.response?.data ||
      error?.message ||
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
     * Mark ONLY the transaction we were
     * given as failed.
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
        .eq(
          "id",
          transactionId
        )
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