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
    const receipt = String(body.TransID || "")
    const amount = Number(body.TransAmount || 0)

    console.log("💰 C2B PAYMENT:", {
      msisdn,
      accountNumber,
      receipt,
      amount,
      firstName,
      middleName,
      lastName,
    })

    // --------------------------------------------------
    // 1. If this is a StreetGO contribution payment,
    //    complete it automatically.
    // --------------------------------------------------

    if (accountNumber && receipt && amount > 0) {
      const { data, error } = await supabase.rpc(
        "complete_merry_go_round_manual_payment",
        {
          p_member_code: accountNumber,
          p_mpesa_receipt: receipt,
          p_amount: amount,
          p_msisdn: msisdn || null,
          p_first_name: firstName,
          p_middle_name: middleName,
          p_last_name: lastName,
        }
      )

      if (error) {
        console.error(
          "❌ CONTRIBUTION PAYMENT ERROR:",
          error
        )
      } else {
        console.log(
          "✅ STREETGO CONTRIBUTION COMPLETED:",
          data
        )


const roundResult = Array.isArray(data) ? data[0] : data

if (roundResult?.round_status === "ready" && roundResult?.round_id) {
  try {
    const origin =
      req.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://streetgo.app"

    const payoutResponse = await fetch(
      `${origin}/api/mpesa/b2c/contribution/process`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roundId: roundResult.round_id,
        }),
        cache: "no-store",
      }
    )

    const payoutResult = await payoutResponse.json()

    if (!payoutResponse.ok) {
      console.error(
        "❌ AUTOMATIC CONTRIBUTION B2C FAILED:",
        payoutResult
      )
    } else {
      console.log(
        "💸 AUTOMATIC CONTRIBUTION B2C STARTED:",
        payoutResult
      )
    }
  } catch (payoutError) {
    console.error(
      "❌ AUTOMATIC CONTRIBUTION B2C ERROR:",
      payoutError
    )
  }
}


      }
    }

    // --------------------------------------------------
    // 2. Existing member verification
    // --------------------------------------------------

    if (accountNumber && firstName) {
      const { data, error } = await supabase.rpc(
        "verify_member_from_c2b",
        {
          p_msisdn: msisdn,
          p_account_number: accountNumber,
          p_first_name: firstName,
          p_middle_name: middleName,
          p_last_name: lastName,
        }
      )

      if (error) {
        console.error(
          "❌ MEMBER VERIFICATION ERROR:",
          error
        )
      } else {
        console.log(
          "✅ STREETGO MEMBERS VERIFIED:",
          data
        )
      }
    } else {
      console.log(
        "ℹ️ C2B payment did not contain enough identity information."
      )
    }

    // --------------------------------------------------
    // 3. Always acknowledge the C2B transaction
    // --------------------------------------------------

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    })
  } catch (error) {
    console.error(
      "❌ C2B CONFIRMATION ERROR:",
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
    message: "StreetGO C2B confirmation endpoint is operational",
  })
}