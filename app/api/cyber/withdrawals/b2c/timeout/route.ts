import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.error("===== CYBER B2C TIMEOUT =====")
    console.error(JSON.stringify(body, null, 2))
    console.error("=============================")

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  } catch (error) {
    console.error("CYBER B2C TIMEOUT ERROR:", error)

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    })
  }
}
