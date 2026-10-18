import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --------------------------------------------------
// Supabase service client
// --------------------------------------------------

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// --------------------------------------------------
// IoT HARDWARE SYSTEM CONFIGURATION
// --------------------------------------------------

const MQTT_BROKER_URL =
  process.env.MQTT_BROKER_URL || "https://your-mqtt-broker.com";

const MQTT_AUTH_TOKEN = process.env.MQTT_AUTH_TOKEN || "YOUR_MQTT_SECURE_TOKEN";

// --------------------------------------------------
// STK CALLBACK
// --------------------------------------------------

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const body = text ? JSON.parse(text) : {};

    const callback = body.Body?.stkCallback;

    // ------------------------------------------------
    // Invalid / empty callback
    // ------------------------------------------------

    if (!callback) {
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    // ------------------------------------------------
    // Safaricom checkout ID
    // ------------------------------------------------

    const checkoutRequestId = callback.CheckoutRequestID;

    console.log("📥 STREETGO STK CALLBACK:", JSON.stringify(body, null, 2));

    // ------------------------------------------------
    // PAYMENT FAILED
    // ------------------------------------------------

    if (callback.ResultCode !== 0) {
      console.log(`❌ M-PESA Tx Failed for Checkout ID: ${checkoutRequestId}`);

      /*
       * First check whether this was a
       * Merry-Go-Round contribution.
       */

      if (checkoutRequestId) {
        const { data: contribution } = await supabase
          .from("contribution_transactions")
          .select("id")
          .eq("checkout_request_id", checkoutRequestId)
          .maybeSingle();

        if (contribution) {
          await supabase
            .from("contribution_transactions")
            .update({
              status: "failed",
              failure_reason: callback.ResultDesc || "M-PESA payment failed.",
              updated_at: new Date().toISOString(),
            })
            .eq("id", contribution.id);

          console.log("❌ STREETGO CONTRIBUTION FAILED:", contribution.id);
        }
      }

      // Existing pool transaction handling
      await supabase
        .from("pool_transactions")
        .update({
          status: "failed",
          failed_reason: callback.ResultDesc,
        })
        .eq("checkout_request_id", checkoutRequestId);

      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Success",
      });
    }

    // ------------------------------------------------
    // Extract successful payment metadata
    // ------------------------------------------------

    const items = callback.CallbackMetadata?.Item || [];

    const amount = Number(
      items.find((i: any) => i.Name === "Amount")?.Value || 0,
    );

    const receipt =
      items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value || "";

    const rawPhone = String(
      items.find((i: any) => i.Name === "PhoneNumber")?.Value || "",
    );

    const phone = rawPhone.startsWith("254")
      ? "0" + rawPhone.slice(3)
      : rawPhone;

    // =================================================
    // MERRY-GO-ROUND CONTRIBUTION
    // =================================================

    if (checkoutRequestId) {
      const { data: contribution } = await supabase
        .from("contribution_transactions")
        .select(
          `
            id,
            group_id,
            member_id,
            member_code,
            amount,
            status
          `,
        )
        .eq("checkout_request_id", checkoutRequestId)
        .maybeSingle();

      if (contribution) {
        console.log(
          "💰 STREETGO CONTRIBUTION PAYMENT FOUND:",
          JSON.stringify(contribution, null, 2),
        );

        const { data: completed, error } = await supabase.rpc(
          "complete_merry_go_round_payment",
          {
            p_checkout_request_id: checkoutRequestId,

            p_mpesa_receipt: receipt,

            p_amount: amount,
          },
        );
        if (error) {
          console.error("❌ CONTRIBUTION COMPLETION ERROR:", error);
        } else {
          console.log("✅ STREETGO CONTRIBUTION COMPLETED:", completed);

          // ---------------------------------------------
          // VERIFY THE CONTRIBUTION MEMBER'S PHONE
          // ---------------------------------------------

          if (phone) {
            const { data: phoneVerified, error: phoneError } =
              await supabase.rpc("verify_contribution_phone_after_stk", {
                p_checkout_request_id: checkoutRequestId,

                p_phone_number: phone,
              });

            if (phoneError) {
              console.error(
                "❌ CONTRIBUTION PHONE VERIFICATION ERROR:",
                phoneError,
              );
            } else {
              console.log(
                "📱 CONTRIBUTION PHONE VERIFICATION:",
                phoneVerified ? "VERIFIED" : "NOT VERIFIED",
              );
            }
          }
        }

        /*
         * IMPORTANT:
         *
         * We stop here because this payment
         * belongs to the contribution system.
         *
         * It must NOT also become a normal
         * wallet deposit or pool-table payment.
         */

        return NextResponse.json({
          ResultCode: 0,
          ResultDesc: "Success",
        });
      }
    }

    // =================================================
    // EXISTING WALLET DEPOSIT
    // =================================================

    const { error: rpcError } = await supabase.rpc("process_wallet_deposit", {
      p_phone: phone,
      p_amount: amount,
      p_reference: receipt,
    });

    if (rpcError) {
      console.error("RPC DATABASE ERROR:", rpcError);
    }

    // =================================================
    // EXISTING POOL TABLE SYSTEM
    // =================================================

    const { data: txData, error: dbError } = await supabase
      .from("pool_transactions")
      .select("table_id")
      .eq("checkout_request_id", checkoutRequestId)
      .single();

    if (dbError || !txData) {
      console.error(
        `🚨 Could not map CheckoutID ${checkoutRequestId} to a physical pool table:`,
        dbError,
      );
    } else {
      const tableId = txData.table_id;

      console.log(
        `📡 Verified Payment for Table: ${tableId}. Dispatching network unlock token...`,
      );

      const hardwareUnlocked = await triggerHardwareUnlock(tableId);

      if (hardwareUnlocked) {
        console.log(
          `✅ MQTT Signal acknowledged for Table ${tableId}. Balls released.`,
        );

        await supabase
          .from("pool_transactions")
          .update({
            status: "completed",
            mpesa_receipt: receipt,
          })
          .eq("checkout_request_id", checkoutRequestId);
      } else {
        console.error(
          `🚨 Hardware pipeline failure for Table ${tableId}. Device offline or token rejected.`,
        );
      }
    }

    // ------------------------------------------------
    // Always acknowledge Safaricom
    // ------------------------------------------------

    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  } catch (err) {
    console.error("CALLBACK CRITICAL ERROR:", err);

    // Always acknowledge Safaricom
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });
  }
}

// --------------------------------------------------
// MQTT HARDWARE UNLOCK
// --------------------------------------------------

async function triggerHardwareUnlock(tableId: string): Promise<boolean> {
  try {
    const response = await fetch(MQTT_BROKER_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${MQTT_AUTH_TOKEN}`,

        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        topic: `streetgo/hardware/${tableId}/unlock`,

        payload: {
          command: "RELEASE_BALLS",
          durationMs: 500,
          timestamp: Date.now(),
        },
      }),
    });

    return response.ok;
  } catch (err) {
    console.error("Failed to connect to MQTT network layer:", err);

    return false;
  }
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Callback route is operational",
  });
}
