import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getB2CAccessToken } from "@/app/lib/mpesa"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { withdrawalId } = body

    if (!withdrawalId) {
      return NextResponse.json(
        {
          error: "withdrawalId is required",
        },
        { status: 400 }
      )
    }

    // =====================================================
    // GET WITHDRAWAL FROM DATABASE
    // =====================================================

    const { data: withdrawal, error: withdrawalError } =
      await supabase
        .from("withdrawal_requests")
        .select(
          `
          id,
          user_id,
          amount,
          phone_number,
          status,
          withdrawal_reference,
          b2c_conversation_id,
          b2c_originator_conversation_id
        `
        )
        .eq("id", withdrawalId)
        .single()

    if (withdrawalError || !withdrawal) {
      console.error(
        "WITHDRAWAL FETCH ERROR:",
        withdrawalError
      )

      return NextResponse.json(
        {
          error: "Withdrawal request not found",
        },
        { status: 404 }
      )
    }

    // =====================================================
    // BASIC VALIDATION
    // =====================================================

    if (!withdrawal.amount || Number(withdrawal.amount) <= 0) {
      return NextResponse.json(
        {
          error: "Invalid withdrawal amount",
        },
        { status: 400 }
      )
    }

    if (!withdrawal.phone_number) {
      return NextResponse.json(
        {
          error: "Withdrawal has no M-Pesa phone number",
        },
        { status: 400 }
      )
    }

    // Prevent accidentally paying an already completed request
    if (
      withdrawal.status === "paid" ||
      withdrawal.status === "completed"
    ) {
      return NextResponse.json(
        {
          error: "This withdrawal has already been paid",
        },
        { status: 409 }
      )
    }

    // Prevent duplicate B2C submissions
    if (withdrawal.b2c_conversation_id) {
      return NextResponse.json(
        {
          error: "B2C payment has already been submitted",
          conversationId:
            withdrawal.b2c_conversation_id,
        },
        { status: 409 }
      )
    }

    // =====================================================
    // NORMALIZE PHONE NUMBER
    // =====================================================

    let phone = String(withdrawal.phone_number).trim()

    if (phone.startsWith("0")) {
      phone = `254${phone.substring(1)}`
    }

    if (phone.startsWith("+")) {
      phone = phone.substring(1)
    }

    if (!/^254\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          error: "Invalid M-Pesa phone number",
        },
        { status: 400 }
      )
    }

    // =====================================================
    // GET SAFARICOM ACCESS TOKEN
    // =====================================================

    const token = await getB2CAccessToken()

    // =====================================================
    // CREATE UNIQUE STREETGO REFERENCE
    // =====================================================

    const originatorConversationID =
      `SGWD${Date.now()}${Math.floor(
        Math.random() * 1000
      )}`

    // =====================================================
    // SEND B2C REQUEST
    // =====================================================

    const response = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          OriginatorConversationID:
            originatorConversationID,

          InitiatorName:
            process.env.MPESA_B2C_INITIATOR_NAME,

          SecurityCredential:
            process.env.MPESA_B2C_SECURITY_CREDENTIAL,

          CommandID: "BusinessPayment",

          Amount: Number(withdrawal.amount),

          PartyA:
            process.env.MPESA_B2C_SHORTCODE,

          PartyB: phone,

          Remarks:
            withdrawal.withdrawal_reference ||
            "StreetGO Withdrawal",

          QueueTimeOutURL:
            process.env.MPESA_B2C_TIMEOUT_URL,

          ResultURL:
            process.env.MPESA_B2C_RESULT_URL,

          Occasion:
            withdrawal.withdrawal_reference ||
            "StreetGO",
        }),
      }
    )

    const data = await response.json()

    console.log(
      "===== SAFARICOM B2C RESPONSE ====="
    )

    console.log(
      JSON.stringify(data, null, 2)
    )

    console.log(
      "=================================="
    )

    // =====================================================
    // SAFARICOM REJECTED REQUEST
    // =====================================================

    if (!response.ok) {
      console.error(
        "SAFARICOM B2C ERROR:",
        data
      )

      return NextResponse.json(
        {
          error: data,
        },
        {
          status: response.status,
        }
      )
    }

    // =====================================================
    // SAVE SAFARICOM IDs
    // =====================================================

    const conversationId =
      data?.ConversationID ?? null

    const returnedOriginatorId =
      data?.OriginatorConversationID ||
      originatorConversationID

    const { error: updateError } =
      await supabase
        .from("withdrawal_requests")
        .update({
          b2c_conversation_id:
            conversationId,

          b2c_originator_conversation_id:
            returnedOriginatorId,

          status: "processing",
        })
        .eq("id", withdrawal.id)

    if (updateError) {
      console.error(
        "WITHDRAWAL UPDATE ERROR:",
        updateError
      )

      return NextResponse.json(
        {
          success: true,
          warning:
            "B2C request accepted, but withdrawal tracking could not be updated.",
          data,
        }
      )
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    return NextResponse.json({
      success: true,

      withdrawalId:
        withdrawal.id,

      withdrawalReference:
        withdrawal.withdrawal_reference,

      conversationId,

      originatorConversationId:
        returnedOriginatorId,

      data,
    })
  } catch (error) {
    console.error(
      "===== B2C ERROR ====="
    )

    console.error(error)

    console.error(
      "====================="
    )

    return NextResponse.json(
      {
        error: "B2C request failed",
      },
      {
        status: 500,
      }
    )
  }
}