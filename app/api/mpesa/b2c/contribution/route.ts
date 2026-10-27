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

    /*
     * STEP 1
     * Load the payout first.
     *
     * We do NOT immediately call Safaricom.
     */
    const {
      data: existingDisbursement,
      error: existingError,
    } = await supabase
      .from("contribution_disbursements")
      .select(
        `
        id,
        round_id,
        amount,
        deduction_amount,
        net_amount,
        phone_number,
        status,
        originator_conversation_id,
        conversation_id,
        mpesa_transaction_id
        `
      )
      .eq("id", disbursementId)
      .single()

    if (existingError || !existingDisbursement) {
      console.error(
        "Unable to load contribution disbursement:",
        existingError
      )

      return NextResponse.json(
        { error: "Contribution disbursement not found" },
        { status: 404 }
      )
    }

    /*
     * DUPLICATE PROTECTION
     *
     * If Safaricom has already been contacted for this payout,
     * NEVER send another B2C request.
     */
    if (
      existingDisbursement.originator_conversation_id ||
      existingDisbursement.conversation_id ||
      existingDisbursement.mpesa_transaction_id
    ) {
      return NextResponse.json(
        {
          error:
            "This payout has already been submitted to Safaricom and cannot be submitted again.",
          disbursementId,
          status: existingDisbursement.status,
          originatorConversationId:
            existingDisbursement.originator_conversation_id,
          conversationId:
            existingDisbursement.conversation_id,
          mpesaTransactionId:
            existingDisbursement.mpesa_transaction_id,
        },
        { status: 409 }
      )
    }

    /*
     * A payout must already be prepared.
     *
     * The admin approval endpoint prepares the payout and
     * changes it to processing.
     */
    if (
      existingDisbursement.status !== "processing"
    ) {
      return NextResponse.json(
        {
          error:
            `Payout is not ready for B2C. Current status: ${existingDisbursement.status}`,
        },
        { status: 409 }
      )
    }

    /*
     * Net amount must already exist.
     */
    if (existingDisbursement.net_amount === null) {
      return NextResponse.json(
        {
          error:
            "Net payout amount has not been calculated",
        },
        { status: 400 }
      )
    }

    const netPayoutAmount = Number(
      existingDisbursement.net_amount
    )

    if (
      !Number.isFinite(netPayoutAmount) ||
      netPayoutAmount < 10
    ) {
      return NextResponse.json(
        {
          error: "Invalid net payout amount",
        },
        { status: 400 }
      )
    }

    /*
     * STEP 2
     * Load production B2C configuration.
     */
    const consumerKey =
      process.env.MPESA_B2C_CONSUMER_KEY

    const consumerSecret =
      process.env.MPESA_B2C_CONSUMER_SECRET

    const initiatorName =
      process.env.MPESA_B2C_INITIATOR_NAME

    const securityCredential =
      process.env.MPESA_B2C_SECURITY_CREDENTIAL

    const shortcode =
      process.env.MPESA_B2C_SHORTCODE

    const resultUrl =
      process.env.MPESA_CONTRIBUTION_B2C_RESULT_URL

    const timeoutUrl =
      process.env.MPESA_CONTRIBUTION_B2C_TIMEOUT_URL

    if (
      !consumerKey ||
      !consumerSecret ||
      !initiatorName ||
      !securityCredential ||
      !shortcode ||
      !resultUrl ||
      !timeoutUrl
    ) {
      throw new Error(
        "Missing B2C production configuration"
      )
    }

    /*
     * STEP 3
     * Obtain Safaricom OAuth token.
     */
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
      console.error(
        "B2C OAuth failed:",
        tokenText
      )

      throw new Error(
        "Unable to obtain Safaricom access token"
      )
    }

    let tokenData: {
      access_token?: string
    }

    try {
      tokenData = JSON.parse(tokenText)
    } catch {
      console.error(
        "Invalid OAuth response:",
        tokenText
      )

      throw new Error(
        "Invalid Safaricom OAuth response"
      )
    }

    if (!tokenData.access_token) {
      throw new Error(
        "Safaricom access token missing"
      )
    }

    /*
     * STEP 4
     * Normalize and validate phone number.
     */
    let phoneNumber = String(
      existingDisbursement.phone_number
    ).replace(/\D/g, "")

    if (phoneNumber.startsWith("0")) {
      phoneNumber = `254${phoneNumber.slice(1)}`
    } else if (phoneNumber.startsWith("7")) {
      phoneNumber = `254${phoneNumber}`
    }

    if (!/^2547\d{8}$/.test(phoneNumber)) {
      throw new Error(
        "Invalid recipient Safaricom phone number"
      )
    }

    /*
     * STEP 5
     * Create a unique Safaricom originator ID.
     */
    const originatorConversationId =
      `SG-CONTRIBUTION-${existingDisbursement.id}-${Date.now()}`

    /*
     * CRITICAL DUPLICATE LOCK
     *
     * We claim this payout BEFORE calling Safaricom.
     *
     * Only the request that successfully changes
     * originator_conversation_id from NULL to our ID
     * is allowed to continue.
     *
     * A second simultaneous request will update 0 rows
     * and therefore cannot call Safaricom.
     */
    const {
      data: claim,
      error: claimError,
    } = await supabase
      .from("contribution_disbursements")
      .update({
        originator_conversation_id:
          originatorConversationId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingDisbursement.id)
      .eq("status", "processing")
      .is("originator_conversation_id", null)
      .is("conversation_id", null)
      .is("mpesa_transaction_id", null)
      .select("id")
      .maybeSingle()

    if (claimError) {
      console.error(
        "Contribution B2C claim error:",
        claimError
      )

      return NextResponse.json(
        {
          error:
            "Unable to safely claim payout for B2C",
        },
        { status: 500 }
      )
    }

    /*
     * No row means another request already claimed it.
     */
    if (!claim) {
      const {
        data: lockedPayout,
      } = await supabase
        .from("contribution_disbursements")
        .select(
          `
          id,
          status,
          originator_conversation_id,
          conversation_id,
          mpesa_transaction_id
          `
        )
        .eq("id", disbursementId)
        .single()

      return NextResponse.json(
        {
          error:
            "This payout is already being processed or has already been submitted to Safaricom.",
          disbursementId,
          status: lockedPayout?.status,
          originatorConversationId:
            lockedPayout?.originator_conversation_id,
          conversationId:
            lockedPayout?.conversation_id,
          mpesaTransactionId:
            lockedPayout?.mpesa_transaction_id,
        },
        { status: 409 }
      )
    }

    /*
     * STEP 6
     * Build Safaricom request.
     */
    const payload = {
      OriginatorConversationID:
        originatorConversationId,
      InitiatorName: initiatorName,
      SecurityCredential: securityCredential,
      CommandID: "BusinessPayment",
      Amount: netPayoutAmount,
      PartyA: shortcode,
      PartyB: phoneNumber,
      Remarks:
        "StreetGO contribution round payout",
      QueueTimeOutURL: timeoutUrl,
      ResultURL: resultUrl,
      Occasion:
        `Round ${existingDisbursement.round_id}`,
    }

    /*
     * STEP 7
     * Call Safaricom.
     *
     * IMPORTANT:
     * If this network request fails, we DO NOT automatically
     * mark the payout failed because Safaricom may have received
     * the request even though our server did not receive a response.
     *
     * This prevents a dangerous duplicate retry.
     */
    let b2cResponse: Response

    try {
      b2cResponse = await fetch(
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
    } catch (error) {
      console.error(
        "Contribution B2C network error after payout claim:",
        error
      )

      return NextResponse.json(
        {
          error:
            "Safaricom connection failed after the payout was safely claimed. Do NOT retry automatically. Reconcile using the callback/status before sending again.",
          disbursementId,
          originatorConversationId,
        },
        { status: 502 }
      )
    }

    const b2cText =
      await b2cResponse.text()

    let b2cData: Record<
      string,
      unknown
    >

    try {
      b2cData = JSON.parse(b2cText)
    } catch {
      console.error(
        "Invalid B2C response:",
        b2cText
      )

      /*
       * We already claimed the payout.
       * Do not send another request.
       */
      return NextResponse.json(
        {
          error:
            "Safaricom returned an invalid response. Payout remains locked for reconciliation.",
          disbursementId,
          originatorConversationId,
        },
        { status: 502 }
      )
    }

    /*
     * Safaricom explicitly rejected the request.
     *
     * This is different from a network timeout.
     * Because Safaricom explicitly rejected it,
     * retrying may be acceptable after the record is
     * returned to a safe state.
     */
    if (!b2cResponse.ok) {
      console.error(
        "Contribution B2C request failed:",
        b2cData
      )

      await supabase
        .from("contribution_disbursements")
        .update({
          status: "failed",
          failure_reason:
            "Safaricom rejected B2C request",
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          existingDisbursement.id
        )

      return NextResponse.json(
        {
          error:
            "Safaricom B2C request failed",
          details: b2cData,
        },
        { status: 502 }
      )
    }

    /*
     * STEP 8
     * Save Safaricom conversation ID.
     */
    await supabase
      .from("contribution_disbursements")
      .update({
        conversation_id:
          typeof b2cData.ConversationID ===
          "string"
            ? b2cData.ConversationID
            : null,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        existingDisbursement.id
      )

    /*
     * STEP 9
     * Return success.
     */
    return NextResponse.json({
      success: true,
      disbursementId:
        existingDisbursement.id,
      roundId:
        existingDisbursement.round_id,
      amount: netPayoutAmount,
      grossAmount: Number(
        existingDisbursement.amount
      ),
      deductionAmount: Number(
        existingDisbursement.deduction_amount
      ),
      netAmount: netPayoutAmount,
      originatorConversationId,
      message:
        "Contribution B2C request accepted by Safaricom",
      safaricom: b2cData,
    })
  } catch (error) {
    console.error(
      "Contribution B2C error:",
      error
    )

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