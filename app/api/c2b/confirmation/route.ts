import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("STREETGO C2B CONFIRMATION:")
    console.log(JSON.stringify(body, null, 2))

    const msisdn = String(body.MSISDN || "")
    const accountNumber = String(body.BillRefNumber || "")
    const firstName = String(body.FirstName || "")
    const middleName = String(body.MiddleName || "")
    const lastName = String(body.LastName || "")
    const amount = Number(body.TransAmount || 0)
    const receipt = String(body.TransID || "")

    // FUNDRAISING PAYMENT
    if (
      accountNumber.toUpperCase().startsWith("FUND-") &&
      receipt &&
      amount > 0
    ) {
      console.log("FUNDRAISING C2B PAYMENT:", {
        accountNumber,
        amount,
        receipt,
        msisdn,
      })

      const { data: fundraisingData, error: fundraisingError } =
        await supabase.rpc(
          "complete_fundraising_c2b_payment",
          {
            p_reference: accountNumber,
            p_mpesa_receipt: receipt,
            p_amount: amount,
            p_msisdn: msisdn,
            p_first_name: firstName,
            p_middle_name: middleName,
            p_last_name: lastName,
          }
        )

      if (fundraisingError) {
        console.error(
          "FUNDRAISING PAYMENT ERROR:",
          fundraisingError
        )
      } else {
        console.log(
          "FUNDRAISING PAYMENT COMPLETED:",
          fundraisingData
        )
      }

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      })
    }

    // MERRY-GO-ROUND PAYMENT
    if (!accountNumber || !firstName) {
      console.log(
        "C2B payment did not contain enough identity information."
      )

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      })
    }

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
        "CONTRIBUTION PAYMENT ERROR:",
        paymentError
      )
    } else {
      console.log(
        "CONTRIBUTION PAYMENT COMPLETED:",
        paymentData
      )
    }

    // VERIFY MEMBER
    const {
      data: verificationData,
      error: verificationError,
    } = await supabase.rpc(
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
        "MEMBER VERIFICATION ERROR:",
        verificationError
      )
    } else {
      console.log(
        "STREETGO MEMBER VERIFIED:",
        verificationData
      )
    }

    // AUTOMATIC MERRY-GO-ROUND PAYOUT
    const paymentRow =
      Array.isArray(paymentData)
        ? paymentData[0]
        : paymentData

    if (
      paymentRow?.round_id &&
      paymentRow?.round_status === "ready"
    ) {
      console.log(
        "ROUND READY - STARTING AUTOMATIC B2C PAYOUT:",
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
          "AUTOMATIC CONTRIBUTION PAYOUT FAILED:",
          processResult
        )
      } else {
        console.log(
          "AUTOMATIC CONTRIBUTION PAYOUT STARTED:",
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
      "C2B CONFIRMATION ERROR:",
      error
    )

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