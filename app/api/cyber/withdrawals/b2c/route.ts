import { NextResponse } from "next/server"
import { createServerSupabase } from "@/app/lib/serverSupabase"
import { createAdminSupabase } from "@/app/lib/adminSupabase"
import { getB2CAccessToken } from "@/app/lib/mpesa"

export async function POST(req: Request) {
  try {
    // 1. Authenticate the requesting user
    const supabase = await createServerSupabase()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { withdrawalId } = body

    if (!withdrawalId) {
      return NextResponse.json(
        { error: "withdrawalId is required" },
        { status: 400 }
      )
    }

    // 2. Verify merchant ownership using authenticated user
    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle()

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: "Cyber merchant account not found." },
        { status: 403 }
      )
    }

    // Admin client is used only after authentication
    const admin = createAdminSupabase()

    // 3. Load withdrawal belonging to this merchant
    const { data: withdrawal, error } = await admin
      .from("cyber_withdrawals")
      .select("id, merchant_id, amount_kes, payout_phone, status")
      .eq("id", withdrawalId)
      .eq("merchant_id", merchant.id)
      .single()

    if (error || !withdrawal) {
      return NextResponse.json(
        { error: "Cyber withdrawal not found or unauthorized." },
        { status: 404 }
      )
    }

    // 4. Validate withdrawal
    if (!withdrawal.amount_kes || Number(withdrawal.amount_kes) <= 0) {
      return NextResponse.json(
        { error: "Invalid withdrawal amount" },
        { status: 400 }
      )
    }

    if (!withdrawal.payout_phone) {
      return NextResponse.json(
        { error: "Withdrawal has no M-Pesa phone number" },
        { status: 400 }
      )
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        {
          error: "Withdrawal is no longer pending",
          status: withdrawal.status,
        },
        { status: 409 }
      )
    }

    // 5. Normalize phone number
    let phone = String(withdrawal.payout_phone).trim()

    if (phone.startsWith("0")) {
      phone = `254${phone.substring(1)}`
    }

    if (phone.startsWith("+")) {
      phone = phone.substring(1)
    }

    if (!/^254[17]\d{8}$/.test(phone)) {
      return NextResponse.json(
        { error: "Invalid M-Pesa phone number" },
        { status: 400 }
      )
    }

    // 6. Atomically reserve withdrawal to prevent duplicate payouts
    const { data: reservedWithdrawal, error: reserveError } =
      await admin
        .from("cyber_withdrawals")
        .update({ status: "processing" })
        .eq("id", withdrawal.id)
        .eq("merchant_id", merchant.id)
        .eq("status", "pending")
        .select()
        .maybeSingle()

    console.error("CYBER WITHDRAWAL RESERVE DEBUG:", {
      reserveError: reserveError ? { message: reserveError.message, code: reserveError.code, details: reserveError.details, hint: reserveError.hint } : null,
      withdrawalId: withdrawal.id,
      merchantId: merchant.id,
      currentStatus: withdrawal.status,
      reservedWithdrawal,
    })
    if (reserveError || !reservedWithdrawal) {
      return NextResponse.json(
        { error: "Withdrawal is already processing or unavailable" },
        { status: 409 }
      )
    }

    // 7. Obtain B2C access token
    let token: string

    try {
      token = await getB2CAccessToken()
    } catch (error) {
      console.error("CYBER B2C TOKEN ERROR:", error)

      await admin
        .from("cyber_withdrawals")
        .update({ status: "pending" })
        .eq("id", withdrawal.id)
        .eq("status", "processing")

      return NextResponse.json(
        { error: "Unable to obtain M-Pesa B2C access token" },
        { status: 500 }
      )
    }

    // 8. Send Safaricom B2C request
    let response: Response
    let data: any

    try {
      response = await fetch(
        "https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            OriginatorConversationID: `SGCY${withdrawal.id}`,
            InitiatorName: process.env.MPESA_B2C_INITIATOR_NAME,
            SecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL,
            CommandID: "BusinessPayment",
            Amount: Number(reservedWithdrawal.amount_kes),
            PartyA: process.env.MPESA_B2C_SHORTCODE,
            PartyB: phone,
            Remarks: "StreetGO Cyber Withdrawal",
            QueueTimeOutURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/cyber/withdrawals/b2c/timeout`,
            ResultURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/cyber/withdrawals/b2c/result`,
            Occasion: "Cyber Merchant Withdrawal",
          }),
        }
      )

      data = await response.json()
    } catch (error) {
      console.error("CYBER B2C NETWORK ERROR:", error)

      // Response uncertain. Keep processing to prevent duplicate payout.
      return NextResponse.json(
        {
          error: "M-Pesa response uncertain. Withdrawal remains processing.",
          withdrawalId: withdrawal.id,
        },
        { status: 502 }
      )
    }

    // 9. Safaricom rejected request
    if (!response.ok) {
      console.error("CYBER B2C REJECTED:", data)

      await admin
        .from("cyber_withdrawals")
        .update({
          status: "pending",
          failure_reason: JSON.stringify(data),
        })
        .eq("id", withdrawal.id)
        .eq("status", "processing")

      return NextResponse.json(
        { error: data },
        { status: response.status }
      )
    }

    // 10. Safaricom accepted the request
    console.log("CYBER B2C ACCEPTED:", data)

    return NextResponse.json({
      success: true,
      withdrawalId: withdrawal.id,
      status: "processing",
      conversationId: data?.ConversationID ?? null,
      originatorConversationId:
        data?.OriginatorConversationID ?? null,
      data,
    })
  } catch (error) {
    console.error("CYBER B2C ERROR:", error)

    return NextResponse.json(
      { error: "Cyber B2C request failed" },
      { status: 500 }
    )
  }
}


