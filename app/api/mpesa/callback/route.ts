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

    if (callback.ResultCode !== 0) {
      console.log("Payment failed.");
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    const items = callback.CallbackMetadata.Item;

    const amount =
      items.find((i: any) => i.Name === "Amount")?.Value;

    const receipt =
      items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;

const rawPhone = String(
  items.find((i: any) => i.Name === "PhoneNumber")?.Value
);

const phone = rawPhone.startsWith("254")
  ? "0" + rawPhone.slice(3)
  : rawPhone;

    console.log({
      amount,
      receipt,
      phone,
    });

    // Find wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("phone", phone)
      .single();

    if (walletError || !wallet) {
      console.error("Wallet not found", walletError);

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    // Update balance
    const newBalance =
      Number(wallet.balance || 0) + Number(amount);

    const { error: updateError } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
      })
      .eq("id", wallet.id);

    if (updateError) {
      console.error(updateError);
    }

    // Save transaction
    await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        amount,
        type: "deposit",
        reference: receipt,
        status: "completed",
      });

    console.log("Wallet credited successfully.");

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