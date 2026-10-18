import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { disbursementId } = body

    if (!disbursementId) {
      return NextResponse.json(
        { error: "disbursementId is required" },
        { status: 400 }
      )
    }

    // Prepare and lock this contribution payout.
    const { data, error } = await supabase.rpc(
      "prepare_contribution_b2c",
      {
        p_disbursement_id: disbursementId,
      }
    )

    if (error) {
      console.error("Contribution B2C preparation failed:", error)

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Unable to prepare contribution payout" },
        { status: 400 }
      )
    }

    const payout = data[0]

    const consumerKey = process.env.MPESA_B2C_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_B2C_CONSUMER_SECRET
    const initiatorName = process.env.MPESA_B2C_INITIATOR_NAME
    const securityCredential = process.env.MPESA_B2C_SECURITY_CREDENTIAL
    const shortcode = process.env.MPESA_B2C_SHORTCODE
    const resultUrl = process.env.MPESA_B2C_RESULT_URL
    const timeoutUrl = process.env.MPESA_B2C_TIMEOUT_URL

    if (
      !consumerKey ||
      !consumerSecret ||
      !initiatorName ||
      !securityCredential ||
      !shortcode ||
      !resultUrl ||
      !timeoutUrl
    ) {
      throw new Error("Missing B2C production configuration")
    }

    // Production OAuth
    const credentials = Buffer.from(
      `${consumerKey}:${consumerSecret}`
    ).toString("base64")

    const tokenResponse = await fetch(
      "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        method: "GET",
        headers: {
          Authorization: `Basic ${credentials}`,
        },
        cache: "no-store",
      }
    )

    const tokenText = await tokenResponse.text()

    if (!tokenResponse.ok) {
      console.error("B2C OAuth failed:", tokenText)
      throw new Error("Unable to obtain Safaricom access token")
    }

    let tokenData: { access_token?: string }

    try {
      tokenData = JSON.parse(tokenText)
    } catch {
      console.error("Invalid OAuth response:", tokenText)
      throw new Error("Invalid Safaricom OAuth response")
    }

    if (!tokenData.access_token) {
      throw new Error("Safaricom access token missing")
    }

    // Safaricom expects 12-digit format: 2547XXXXXXXX
    let phoneNumber = String(payout.phone_number).replace(/\D/g, "")

    if (phoneNumber.startsWith("0")) {
      phoneNumber = `254${phoneNumber.slice(1)}`
    } else if (phoneNumber.startsWith("7")) {
      phoneNumber = `254${phoneNumber}`
    }

    if (!/^2547\d{8}$/.test(phoneNumber)) {
      throw new Error("Invalid recipient Safaricom phone number")
    }

    const originatorConversationId = `SG-CONTRIBUTION-${Date.now()}`

    const payload = {
      OriginatorConversationID: originatorConversationId,
      InitiatorName: initiatorName,
      SecurityCredential: securityCredential,
      CommandID: "BusinessPayment",
      Amount: Number(payout.amount),
      PartyA: shortcode,
      PartyB: phoneNumber,
      Remarks: `StreetGO contribution round payout`,
      QueueTimeOutURL: timeoutUrl,
      ResultURL: resultUrl,
      Occasion: `Round ${payout.round_id}`,
    }

    const b2cResponse = await fetch(
      "https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      }
    )

    const b2cText = await b2cResponse.text()

    let b2cData: Record<string, unknown>

    try {
      b2cData = JSON.parse(b2cText)
    } catch {
      console.error("Invalid B2C response:", b2cText)
      throw new Error("Invalid Safaricom B2C response")
    }

    if (!b2cResponse.ok) {
      console.error("Contribution B2C request failed:", b2cData)

      await supabase
        .from("contribution_disbursements")
        .update({
          status: "failed",
          failure_reason: "Safaricom rejected B2C request",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payout.disbursement_id)

      return NextResponse.json(
        {
          error: "Safaricom B2C request failed",
          details: b2cData,
        },
        { status: 502 }
      )
    }

    await supabase
      .from("contribution_disbursements")
      .update({
        originator_conversation_id: originatorConversationId,
        conversation_id:
          typeof b2cData.ConversationID === "string"
            ? b2cData.ConversationID
            : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payout.disbursement_id)

    return NextResponse.json({
      success: true,
      disbursementId: payout.disbursement_id,
      roundId: payout.round_id,
      amount: payout.amount,
      message: "Contribution B2C request accepted by Safaricom",
      safaricom: b2cData,
    })
  } catch (error) {
    console.error("Contribution B2C error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Contribution B2C request failed",
      },
      { status: 500 }
    )
  }
}