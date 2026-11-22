import { NextResponse } from "next/server"
import { createServerSupabase } from "../../../lib/serverSupabase"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to request a withdrawal." },
        { status: 401 }
      )
    }

    const body = await request.json()

    const merchantId = body?.merchant_id
    const amount = Number(body?.amount_kes)

    if (
      typeof merchantId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        merchantId
      )
    ) {
      return NextResponse.json(
        { error: "Invalid merchant ID." },
        { status: 400 }
      )
    }

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < 10) {
      return NextResponse.json(
        { error: "Minimum withdrawal is KES 10. Enter a whole amount." },
        { status: 400 }
      )
    }

    const { data: withdrawalId, error } = await supabase.rpc(
      "request_cyber_withdrawal",
      {
        p_merchant_id: merchantId,
        p_amount_kes: amount,
      }
    )

    if (error) {
      console.error("CYBER WITHDRAWAL REQUEST ERROR:", error.message)

      const message = error.message || ""

      if (message.includes("Insufficient balance")) {
        return NextResponse.json(
          { error: message },
          { status: 400 }
        )
      }

      if (message.includes("Authentication required")) {
        return NextResponse.json(
          { error: "Authentication required." },
          { status: 401 }
        )
      }

      if (
        message.includes("Merchant not found") ||
        message.includes("unauthorized")
      ) {
        return NextResponse.json(
          { error: "Merchant not found or unauthorized." },
          { status: 404 }
        )
      }

      if (message.includes("not active")) {
        return NextResponse.json(
          { error: "Your Cyber merchant account is not active." },
          { status: 403 }
        )
      }

      if (message.includes("payout phone")) {
        return NextResponse.json(
          { error: "Set your M-Pesa withdrawal phone number first." },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: "Unable to process your withdrawal request." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        withdrawal_id: withdrawalId,
        status: "pending",
        message: "Withdrawal request submitted successfully.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("CYBER WITHDRAWAL API ERROR:", error)

    return NextResponse.json(
      { error: "An unexpected error occurred while requesting withdrawal." },
      { status: 500 }
    )
  }
}

