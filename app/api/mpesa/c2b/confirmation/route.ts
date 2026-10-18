import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("📥 STREETGO C2B CONFIRMATION:")
    console.log(JSON.stringify(body, null, 2))

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    })
  } catch (error) {
    console.error("❌ C2B CONFIRMATION ERROR:", error)

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
