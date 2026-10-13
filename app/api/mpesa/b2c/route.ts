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

    // ---------------------------------------------------------
    // 1. LOAD WITHDRAWAL
    // ---------------------------------------------------------

    const { data: withdrawal, error: withdrawalError } =
      await supabase
        .from("withdrawal_requests")
        .select(`
          id,
          user_id,
          amount,
          phone_number,
          status,
          assigned_to,
          withdrawal_reference,
          b2c_conversation_id,
          b2c_originator_conversation_id
        `)
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

    // ---------------------------------------------------------
    // 2. BASIC VALIDATION
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // 3. WITHDRAWAL MUST STILL BE PENDING
    // ---------------------------------------------------------

    if (withdrawal.status !== "pending") {
      return NextResponse.json(
        {
          error:
            "This withdrawal is no longer pending",
          status: withdrawal.status,
        },
        { status: 409 }
      )
    }

    // ---------------------------------------------------------
    // 4. FINANCE CLAIM PROTECTION
    // ---------------------------------------------------------

    if (withdrawal.assigned_to) {
      return NextResponse.json(
        {
          error:
            "This withdrawal has already been assigned to Finance",
        },
        { status: 409 }
      )
    }

    // ---------------------------------------------------------
    // 5. PREVENT DUPLICATE B2C REQUESTS
    // ---------------------------------------------------------

    if (
      withdrawal.b2c_conversation_id ||
      withdrawal.b2c_originator_conversation_id
    ) {
      return NextResponse.json(
        {
          error:
            "B2C payment has already been submitted",
          conversationId:
            withdrawal.b2c_conversation_id,
          originatorConversationId:
            withdrawal.b2c_originator_conversation_id,
        },
        { status: 409 }
      )
    }

    // ---------------------------------------------------------
    // 6. NORMALIZE PHONE NUMBER
    // ---------------------------------------------------------

    let phone = String(
      withdrawal.phone_number
    ).trim()

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

    // ---------------------------------------------------------
    // 7. CREATE UNIQUE STREETGO ORIGINATOR ID
    // ---------------------------------------------------------

    const originatorConversationID =
      `SGWD${Date.now()}${Math.floor(
        Math.random() * 1000
      )}`

    // ---------------------------------------------------------
    // 8. ATOMICALLY RESERVE THE WITHDRAWAL
    //
    // Only one request can successfully change:
    //
    // pending → processing
    //
    // while it is still unassigned and has no B2C IDs.
    // ---------------------------------------------------------

    const { data: reservedWithdrawal, error: reserveError } =
      await supabase
        .from("withdrawal_requests")
        .update({
          status: "processing",
          b2c_originator_conversation_id:
            originatorConversationID,
        })
        .eq("id", withdrawal.id)
        .eq("status", "pending")
        .is("assigned_to", null)
        .is("b2c_conversation_id", null)
        .is(
          "b2c_originator_conversation_id",
          null
        )
        .select(`
          id,
          user_id,
          amount,
          phone_number,
          status,
          withdrawal_reference,
          b2c_conversation_id,
          b2c_originator_conversation_id
        `)
        .maybeSingle()

    if (reserveError) {
      console.error(
        "WITHDRAWAL RESERVATION ERROR:",
        reserveError
      )

      return NextResponse.json(
        {
          error:
            "Unable to reserve withdrawal",
        },
        { status: 500 }
      )
    }

    // Another request/Finance may have won the race.
    if (!reservedWithdrawal) {
      return NextResponse.json(
        {
          error:
            "Withdrawal is already being processed, assigned, or submitted",
        },
        { status: 409 }
      )
    }

    console.log(
      "===== WITHDRAWAL RESERVED ====="
    )

    console.log({
      withdrawalId:
        reservedWithdrawal.id,

      withdrawalReference:
        reservedWithdrawal.withdrawal_reference,

      originatorConversationID,
    })

    console.log(
      "================================"
    )

    // ---------------------------------------------------------
    // 9. GET SAFARICOM ACCESS TOKEN
    // ---------------------------------------------------------

    let token: string

    try {
      token = await getB2CAccessToken()
    } catch (error) {
      console.error(
        "B2C ACCESS TOKEN ERROR:",
        error
      )

      // Safely release reservation because
      // the request was never sent to Safaricom.
      await supabase
        .from("withdrawal_requests")
        .update({
          status: "pending",
          b2c_originator_conversation_id:
            null,
        })
        .eq("id", withdrawal.id)
        .eq("status", "processing")
        .eq(
          "b2c_originator_conversation_id",
          originatorConversationID
        )

      return NextResponse.json(
        {
          error:
            "Unable to obtain Safaricom access token",
        },
        { status: 500 }
      )
    }

    // ---------------------------------------------------------
    // 10. SEND B2C REQUEST TO SAFARICOM
    // ---------------------------------------------------------

    let response: Response
    let data: any

    try {
      response = await fetch(
        "https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            OriginatorConversationID:
              originatorConversationID,

            InitiatorName:
              process.env
                .MPESA_B2C_INITIATOR_NAME,

            SecurityCredential:
              process.env
                .MPESA_B2C_SECURITY_CREDENTIAL,

            CommandID:
              "BusinessPayment",

            Amount:
              Number(reservedWithdrawal.amount),

            PartyA:
              process.env
                .MPESA_B2C_SHORTCODE,

            PartyB: phone,

            Remarks:
              reservedWithdrawal.withdrawal_reference ||
              "StreetGO Withdrawal",

            QueueTimeOutURL:
              process.env
                .MPESA_B2C_TIMEOUT_URL,

            ResultURL:
              process.env
                .MPESA_B2C_RESULT_URL,

            Occasion:
              reservedWithdrawal.withdrawal_reference ||
              "StreetGO",
          }),
        }
      )

      data = await response.json()
    } catch (error) {
      // IMPORTANT:
      //
      // Do NOT automatically change the withdrawal
      // back to pending here.
      //
      // The request may have reached Safaricom even
      // though our server did not receive the response.
      //
      // Leave it as PROCESSING so we don't risk
      // sending the customer a second payment.

      console.error(
        "===== B2C NETWORK ERROR ====="
      )
      console.error(error)
      console.error(
        "Withdrawal remains PROCESSING for reconciliation."
      )
      console.error(
        "================================"
      )

      return NextResponse.json(
        {
          success: false,
          error:
            "Safaricom request status is uncertain. Withdrawal remains processing.",
          withdrawalId:
            reservedWithdrawal.id,
          originatorConversationId:
            originatorConversationID,
        },
        { status: 502 }
      )
    }

    console.log(
      "===== SAFARICOM B2C RESPONSE ====="
    )

    console.log(
      JSON.stringify(data, null, 2)
    )

    console.log(
      "=================================="
    )

    // ---------------------------------------------------------
    // 11. SAFARICOM DEFINITELY REJECTED REQUEST
    // ---------------------------------------------------------

    if (!response.ok) {
      console.error(
        "SAFARICOM B2C ERROR:",
        data
      )

      // Roll back ONLY our reservation.
      //
      // If a callback somehow changed the withdrawal
      // to paid/failed, this condition will not match.
      await supabase
        .from("withdrawal_requests")
        .update({
          status: "pending",
          b2c_originator_conversation_id:
            null,
        })
        .eq("id", reservedWithdrawal.id)
        .eq("status", "processing")
        .eq(
          "b2c_originator_conversation_id",
          originatorConversationID
        )

      return NextResponse.json(
        {
          error: data,
        },
        { status: response.status }
      )
    }

    // ---------------------------------------------------------
    // 12. SAFARICOM ACCEPTED REQUEST
    // ---------------------------------------------------------

    const conversationId =
      data?.ConversationID ?? null

    const returnedOriginatorId =
      data?.OriginatorConversationID ||
      originatorConversationID

    // ---------------------------------------------------------
    // 13. SAVE SAFARICOM CONVERSATION ID
    // ---------------------------------------------------------

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
        .eq("id", reservedWithdrawal.id)
        .eq("status", "processing")
        .eq(
          "b2c_originator_conversation_id",
          originatorConversationID
        )

    if (updateError) {
      console.error(
        "WITHDRAWAL B2C ID UPDATE ERROR:",
        updateError
      )

      // IMPORTANT:
      //
      // Do NOT reset the withdrawal to pending.
      //
      // Safaricom already accepted the request.
      // The originator ID is already stored, so the
      // callback can still locate the withdrawal.

      return NextResponse.json({
        success: true,

        warning:
          "B2C request accepted, but final tracking update failed.",

        withdrawalId:
          reservedWithdrawal.id,

        originatorConversationId:
          returnedOriginatorId,

        data,
      })
    }

    // ---------------------------------------------------------
    // 14. SUCCESS
    // ---------------------------------------------------------

    console.log(
      "===== B2C REQUEST ACCEPTED ====="
    )

    console.log({
      withdrawalId:
        reservedWithdrawal.id,

      withdrawalReference:
        reservedWithdrawal.withdrawal_reference,

      conversationId,

      originatorConversationId:
        returnedOriginatorId,

      responseCode:
        data?.ResponseCode,

      responseDescription:
        data?.ResponseDescription,
    })

    console.log(
      "================================"
    )

    return NextResponse.json({
      success: true,

      withdrawalId:
        reservedWithdrawal.id,

      withdrawalReference:
        reservedWithdrawal.withdrawal_reference,

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
      { status: 500 }
    )
  }
}