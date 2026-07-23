import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("M-PESA CALLBACK:", JSON.stringify(body, null, 2));

    const callback = body.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    // Only continue if payment succeeded
    if (callback.ResultCode !== 0) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    const items = callback.CallbackMetadata.Item;

    const amount = items.find((i: any) => i.Name === "Amount")?.Value;
    const receipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
    const phone = items.find((i: any) => i.Name === "PhoneNumber")?.Value;

    console.log({
      amount,
      receipt,
      phone,
    });

    // We'll add the wallet update in the next step

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });

  } catch (err) {
    console.error(err);

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  }
}