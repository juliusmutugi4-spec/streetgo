import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const callback = body?.Body?.stkCallback

    if (!callback) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    const checkoutRequestId = callback.CheckoutRequestID
    const merchantRequestId = callback.MerchantRequestID
    const resultCode = callback.ResultCode
    const resultDesc = callback.ResultDesc

    console.log(
      "FUNDRAISING STK CALLBACK:",
      JSON.stringify(body, null, 2)
    )

    if (!checkoutRequestId) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    const { data: contribution, error: findError } = await supabase
      .from("fundraising_contributions")
      .select("*")
      .eq("checkout_request_id", checkoutRequestId)
      .maybeSingle()

    if (findError) {
      console.error("Contribution lookup error:", findError)
      throw findError
    }

    if (!contribution) {
      console.error(
        "Fundraising contribution not found:",
        checkoutRequestId
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    // --------------------------------------------------
    // PAYMENT FAILED
    // --------------------------------------------------

    if (resultCode !== 0) {
      await supabase
        .from("fundraising_contributions")
        .update({
          payment_status: "failed",
          merchant_request_id: merchantRequestId ?? null,
          updated_at: new Date().toISOString()
        })
        .eq("id", contribution.id)
        .neq("payment_status", "paid")

      console.log(
        "Fundraising payment failed:",
        contribution.id,
        resultCode,
        resultDesc
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    // --------------------------------------------------
    // PAYMENT SUCCESS
    // --------------------------------------------------

    const items =
      callback.CallbackMetadata?.Item ?? []

    const getMetadataValue = (name: string) =>
      items.find((item: any) => item.Name === name)?.Value ?? null

    const mpesaReceipt =
      getMetadataValue("MpesaReceiptNumber")

    const paidAmount =
      Number(getMetadataValue("Amount")) ||
      Number(contribution.amount)

    const phoneNumber =
      getMetadataValue("PhoneNumber")

    const transactionDate =
      getMetadataValue("TransactionDate")

    // Prevent duplicate callback from increasing raised amount twice
    if (contribution.payment_status === "paid") {
      console.log(
        "Fundraising contribution already paid:",
        contribution.id
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    // Mark contribution paid
    const { data: updatedContribution, error: updateError } =
      await supabase
        .from("fundraising_contributions")
        .update({
          payment_status: "paid",
          mpesa_receipt: mpesaReceipt,
          merchant_request_id: merchantRequestId ?? null,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", contribution.id)
        .neq("payment_status", "paid")
        .select("id")
        .maybeSingle()

    if (updateError) {
      console.error(
        "Contribution update error:",
        updateError
      )
      throw updateError
    }

    // Another callback may have completed it first
    if (!updatedContribution) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted"
      })
    }

    // --------------------------------------------------
    // UPDATE FUNDRAISING TOTAL
    // --------------------------------------------------

    const { data: campaign, error: campaignError } =
      await supabase
        .from("fundraising_campaigns")
        .select("raised_amount")
        .eq("id", contribution.campaign_id)
        .single()

    if (campaignError) {
      console.error(
        "Campaign lookup error:",
        campaignError
      )
      throw campaignError
    }

    const newRaisedAmount =
      Number(campaign.raised_amount || 0) + paidAmount

    const { error: raisedError } =
      await supabase
        .from("fundraising_campaigns")
        .update({
          raised_amount: newRaisedAmount,
          updated_at: new Date().toISOString()
        })
        .eq("id", contribution.campaign_id)

    if (raisedError) {
      console.error(
        "Raised amount update error:",
        raisedError
      )
      throw raisedError
    }

    console.log(
      "FUNDRAISING PAYMENT SUCCESS:",
      {
        contributionId: contribution.id,
        campaignId: contribution.campaign_id,
        amount: paidAmount,
        receipt: mpesaReceipt,
        phone: phoneNumber,
        transactionDate
      }
    )

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    })

  } catch (error) {
    console.error(
      "FUNDRAISING CALLBACK ERROR:",
      error
    )

    // Safaricom expects a response from the callback
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted"
    })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "StreetGO fundraising STK callback is operational"
  })
}
