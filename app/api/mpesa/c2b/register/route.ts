import { NextResponse } from "next/server"
import { getMpesaAccessToken } from "@/app/lib/mpesa"

export async function POST() {
  try {
    const accessToken = await getMpesaAccessToken()

    const response = await fetch(
      "https://api.safaricom.co.ke/mpesa/c2b/v2/registerurl",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ShortCode: process.env.MPESA_SHORTCODE,
          ResponseType: "Completed",
          ConfirmationURL:
            "https://streetgo.app/api/mpesa/c2b/confirmation",
          ValidationURL:
            "https://streetgo.app/api/mpesa/c2b/validation",
        }),
      }
    )

    const data = await response.json()

    console.log("📡 STREETGO C2B REGISTRATION RESPONSE:")
    console.log(JSON.stringify(data, null, 2))

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ C2B REGISTRATION ERROR:", error)

    return NextResponse.json(
      {
        error: "C2B registration failed",
      },
      {
        status: 500,
      }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "StreetGO C2B registration endpoint is operational",
  })
}
