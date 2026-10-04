import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("B2C RESULT:", JSON.stringify(body, null, 2));

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  } catch (error) {
    console.error("B2C RESULT ERROR:", error);

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  }
}