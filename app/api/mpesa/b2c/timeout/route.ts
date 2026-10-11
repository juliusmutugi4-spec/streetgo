import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("===== B2C TIMEOUT =====");
    console.log(JSON.stringify(body, null, 2));
    console.log("========================");

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error) {
    console.error("===== B2C TIMEOUT ERROR =====");
    console.error(error);
    console.error("==============================");

    return NextResponse.json(
      {
        ResultCode: 1,
        ResultDesc: "Failed to process timeout",
      },
      { status: 500 }
    );
  }
}