import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("📥 STREETGO C2B VALIDATION:")
    console.log(JSON.stringify(body, null, 2))

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  } catch (error) {
    console.error("❌ C2B VALIDATION ERROR:", error)

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "StreetGO C2B validation endpoint is operational",
  })
}
