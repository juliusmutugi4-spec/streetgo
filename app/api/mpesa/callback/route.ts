import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- IoT HARDWARE SYSTEM CONFIGURATION ---
const MQTT_BROKER_URL = process.env.MQTT_BROKER_URL || "https://your-mqtt-broker.com";
const MQTT_AUTH_TOKEN = process.env.MQTT_AUTH_TOKEN || "YOUR_MQTT_SECURE_TOKEN";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const body = text ? JSON.parse(text) : {};
    const callback = body.Body?.stkCallback;

    // Safaricom verification callback
    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
    }

    // Capture the transactional mapping token
    const checkoutRequestId = callback.CheckoutRequestID;

    // Payment failed
    if (callback.ResultCode !== 0) {
      console.log(`❌ M-PESA Tx Failed for Checkout ID: ${checkoutRequestId}`);
      
      // OPTIONAL: Update a tracking table to mark this transaction as 'FAILED'
      await supabase
        .from("pool_transactions")
        .update({ status: "failed", failed_reason: callback.ResultDesc })
        .eq("checkout_request_id", checkoutRequestId);

      return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
    }

    const items = callback.CallbackMetadata?.Item || [];
    const amount = Number(items.find((i: any) => i.Name === "Amount")?.Value || 0);
    const receipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || "";
    const rawPhone = String(items.find((i: any) => i.Name === "PhoneNumber")?.Value || "");

    const phone = rawPhone.startsWith("254")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    // ====================================================
    // Process Deposit (Atomic PostgreSQL Transaction)
    // ====================================================
    const { error: rpcError } = await supabase.rpc(
      "process_wallet_deposit",
      {
        p_phone: phone,
        p_amount: amount,
        p_reference: receipt,
      }
    );

    if (rpcError) {
      console.error("RPC DATABASE ERROR:", rpcError);
      // We continue processing hardware activation even if wallet logging hits a snag
    }

    // ====================================================
    // 🎱 IoT Edge Controller Trigger Logic
    // ====================================================
    
    // 1. Fetch the unique Pool Table ID mapped to this Checkout ID from your database
    const { data: txData, error: dbError } = await supabase
      .from("pool_transactions")
      .select("table_id")
      .eq("checkout_request_id", checkoutRequestId)
      .single();

    if (dbError || !txData) {
      console.error(`🚨 Could not map CheckoutID ${checkoutRequestId} to a physical pool table:`, dbError);
    } else {
      const tableId = txData.table_id;
      console.log(`📡 Verified Payment for Table: ${tableId}. Dispatching network unlock token...`);

      // 2. Transmit the physical activation command to your MQTT broker over cellular/GSM
      const hardwareUnlocked = await triggerHardwareUnlock(tableId);
      
      if (hardwareUnlocked) {
        console.log(`✅ MQTT Signal acknowledged for Table ${tableId}. Balls released.`);
        // Update transaction row to successful and completed
        await supabase
          .from("pool_transactions")
          .update({ status: "completed", mpesa_receipt: receipt })
          .eq("checkout_request_id", checkoutRequestId);
      } else {
        console.error(`🚨 Hardware pipeline failure for Table ${tableId}. Device offline or token rejected.`);
      }
    }

    // Always return a clean success object to Safaricom to prevent payload retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });

  } catch (err) {
    console.error("CALLBACK CRITICAL ERROR:", err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  }
}

/**
 * Fires an encrypted, authorized webhook request to your central MQTT broker instance.
 */
async function triggerHardwareUnlock(tableId: string): Promise<boolean> {
  try {
    const response = await fetch(MQTT_BROKER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MQTT_AUTH_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic: `streetgo/hardware/${tableId}/unlock`,
        payload: {
          command: "RELEASE_BALLS",
          durationMs: 500,
          timestamp: Date.now()
        }
      })
    });

    return response.ok;
  } catch (err) {
    console.error("Failed to connect with MQTT network layer:", err);
    return false;
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Callback route is operational",
  });
}
