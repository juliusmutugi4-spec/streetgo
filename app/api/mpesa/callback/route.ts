import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";





const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const text = await req.text();

    
    

    const body = text ? JSON.parse(text) : {};

    const callback = body.Body?.stkCallback;

    // Safaricom verification callback
    if (!callback) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    // Payment failed
    if (callback.ResultCode !== 0) {
      

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    const items = callback.CallbackMetadata?.Item || [];

    const amount = Number(
      items.find((i: any) => i.Name === "Amount")?.Value || 0
    );

    const receipt =
      items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || "";

    const rawPhone = String(
      items.find((i: any) => i.Name === "PhoneNumber")?.Value || ""
    );

    const phone = rawPhone.startsWith("254")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    
    

    // ====================================================
    // Process Deposit (Atomic PostgreSQL Transaction)
    // ====================================================

    const { error } = await supabase.rpc(
      "process_wallet_deposit",
      {
        p_phone: phone,
        p_amount: amount,
        p_reference: receipt,
      }
    );

    if (error) {
      console.error("RPC ERROR:", error);
    } else {
      
    }

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });

  } catch (err) {
    console.error("CALLBACK ERROR:", err);

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  }
}

export async function GET() {
  

  return NextResponse.json({
    success: true,
    message: "Callback route is working",
  });
}