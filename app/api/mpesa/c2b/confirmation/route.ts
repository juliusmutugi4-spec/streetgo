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