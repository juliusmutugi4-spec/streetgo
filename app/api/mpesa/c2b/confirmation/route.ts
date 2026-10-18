import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("📥 STREETGO C2B CONFIRMATION:")
    console.log(JSON.stringify(body, null, 2))

    const msisdn = String(body.MSISDN || "")
    const accountNumber = String(body.BillRefNumber || "")
    const firstName = String(body.FirstName || "")
    const middleName = String(body.MiddleName || "")
    const lastName = String(body.LastName || "")
    const amount = Number(body.TransAmount || 0)
    const receipt = String(body.TransID || "")

    if (!accountNumber || !firstName) {
      console.log(
        "ℹ️ C2B payment did not contain enough identity information."
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      })
    }

    // 1. Complete the contribution payment.
    const { data: paymentData, error: paymentError } =
      await supabase.rpc(
        "complete_merry_go_round_manual_payment",
        {
          p_member_code: accountNumber,
          p_mpesa_receipt: receipt,
          p_amount: amount,
          p_msisdn: msisdn,
          p_first_name: firstName,
          p_middle_name: middleName,
          p_last_name: lastName,
        }
      )

    if (paymentError) {
      console.error(
        "❌ CONTRIBUTION PAYMENT ERROR:",
        paymentError
      )
    } else {
      console.log(
        "✅ CONTRIBUTION PAYMENT COMPLETED:",
        paymentData
      )
    }

    // 2. Verify the member identity.
    const { data: verificationData, error: verificationError } =
      await supabase.rpc(
        "verify_member_from_c2b",
        {
          p_msisdn: msisdn,
          p_account_number: accountNumber,
          p_first_name: firstName,
          p_middle_name: middleName,
          p_last_name: lastName,
        }
      )

    if (verificationError) {
      console.error(
        "❌ MEMBER VERIFICATION ERROR:",
        verificationError
      )
    } else {
      console.log(
        "✅ STREETGO MEMBER VERIFIED:",
        verificationData
      )
    }

    // 3. If this payment completed the round,
    // automatically start the B2C payout.
    const paymentRow =
      Array.isArray(paymentData)
        ? paymentData[0]
        : paymentData

    if (
      paymentRow?.round_id &&
      paymentRow?.round_status === "ready"
    ) {
      console.log(
        "🚀 ROUND READY — STARTING AUTOMATIC B2C PAYOUT:",
        paymentRow.round_id
      )

      const origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://streetgo.app"

      const processResponse = await fetch(
        `${origin}/api/mpesa/b2c/contribution/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roundId: paymentRow.round_id,
          }),
          cache: "no-store",
        }
      )

      const processResult =
        await processResponse.json()

      if (!processResponse.ok) {
        console.error(
          "❌ AUTOMATIC CONTRIBUTION PAYOUT FAILED:",
          processResult
        )
      } else {
        console.log(
          "✅ AUTOMATIC CONTRIBUTION PAYOUT STARTED:",
          processResult
        )
      }
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    })
  } catch (error) {
    console.error(
      "❌ C2B CONFIRMATION ERROR:",
      error
    )

    // Always acknowledge Safaricom.
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "StreetGO C2B confirmation endpoint is operational",
  })
}