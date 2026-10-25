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
        ResultDesc: "Accepted",
      })
    }

    const checkoutRequestId =
      callback.CheckoutRequestID

    const merchantRequestId =
      callback.MerchantRequestID

    const resultCode =
      callback.ResultCode

    const resultDesc =
      callback.ResultDesc

    console.log(
      "FUNDRAISING STK CALLBACK:",
      JSON.stringify(body, null, 2)
    )

    if (!checkoutRequestId) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    // --------------------------------------------------
    // FIND CONTRIBUTION
    // --------------------------------------------------

    const {
      data: contribution,
      error: findError,
    } = await supabase
      .from("fundraising_contributions")
      .select("*")
      .eq(
        "checkout_request_id",
        checkoutRequestId
      )
      .maybeSingle()

    if (findError) {
      console.error(
        "Contribution lookup error:",
        findError
      )

      throw findError
    }

    if (!contribution) {
      console.error(
        "Fundraising contribution not found:",
        checkoutRequestId
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    // --------------------------------------------------
    // PAYMENT FAILED
    // --------------------------------------------------

    if (resultCode !== 0) {
      const {
        error: failedUpdateError,
      } = await supabase
        .from("fundraising_contributions")
        .update({
          payment_status: "failed",
          merchant_request_id:
            merchantRequestId ?? null,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", contribution.id)
        .neq("payment_status", "paid")

      if (failedUpdateError) {
        console.error(
          "Failed payment update error:",
          failedUpdateError
        )

        throw failedUpdateError
      }

      console.log(
        "Fundraising payment failed:",
        contribution.id,
        resultCode,
        resultDesc
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Accepted",
      })
    }

    // --------------------------------------------------
    // PAYMENT SUCCESS
    // --------------------------------------------------

    const items =
      callback.CallbackMetadata?.Item ?? []

    const getMetadataValue = (
      name: string
    ) =>
      items.find(
        (item: any) =>
          item.Name === name
      )?.Value ?? null

    const mpesaReceipt =
      getMetadataValue(
        "MpesaReceiptNumber"
      )

    /*
     * Amount actually charged by M-PESA.
     *
     * Example:
     *
     * Fundraiser amount: KES 10
     * Fee: 56%
     * Customer charged: KES 16
     *
     * Therefore paidAmount = 16.
     */

    const paidAmount =
      Number(
        getMetadataValue("Amount")
      ) ||
      Number(
        contribution.gross_amount
      ) ||
      Number(
        contribution.amount
      )

    const phoneNumber =
      getMetadataValue(
        "PhoneNumber"
      )

    const transactionDate =
      getMetadataValue(
        "TransactionDate"
      )

    // --------------------------------------------------
    // ATOMIC FUNDRAISER PAYMENT FINALIZATION
    // --------------------------------------------------

    /*
     * IMPORTANT:
     *
     * Do NOT return early when the contribution is
     * already marked as paid.
     *
     * finalize_fundraiser_payment() handles both:
     *
     * 1. New payment:
     *    - mark contribution paid
     *    - increase fundraiser total
     *    - create revenue ledger
     *
     * 2. Already-paid payment:
     *    - do NOT increase fundraiser total again
     *    - create missing revenue ledger if necessary
     *
     * The PostgreSQL function is therefore the single
     * source of truth for payment finalization.
     */

    const {
      data: finalization,
      error: finalizationError,
    } = await supabase.rpc(
      "finalize_fundraiser_payment",
      {
        p_contribution_id:
          contribution.id,

        p_mpesa_receipt:
          mpesaReceipt
            ? String(mpesaReceipt)
            : null,

        p_merchant_request_id:
          merchantRequestId
            ? String(merchantRequestId)
            : null,

        p_paid_amount:
          paidAmount,

        p_phone:
          phoneNumber
            ? String(phoneNumber)
            : null,

        p_transaction_date:
          transactionDate
            ? String(transactionDate)
            : null,
      }
    )

    if (finalizationError) {
      console.error(
        "FUNDRAISER PAYMENT FINALIZATION ERROR:",
        finalizationError
      )

      throw finalizationError
    }

    // --------------------------------------------------
    // SUCCESS LOG
    // --------------------------------------------------

    console.log(
      "FUNDRAISING PAYMENT SUCCESS:",
      {
        contributionId:
          contribution.id,

        checkoutRequestId,

        mpesaReceipt,

        paidAmount,

        finalization,
      }
    )

    // --------------------------------------------------
    // ACKNOWLEDGE SAFARICOM
    // --------------------------------------------------

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })

  } catch (error) {
    console.error(
      "FUNDRAISING CALLBACK ERROR:",
      error
    )

    /*
     * Safaricom expects an acknowledgement.
     */

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  }
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "StreetGO fundraising STK callback is operational",
  })
}