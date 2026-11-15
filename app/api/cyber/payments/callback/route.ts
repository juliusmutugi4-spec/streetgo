import { NextResponse } from "next/server"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function getMetadataValue(items: any[], name: string) {
  return items.find((item) => item.Name === name)?.Value
}

function normalizePhone(value: unknown) {
  const phone = String(value ?? "").replace(/\D/g, "")

  if (phone.startsWith("0")) return `254${phone.slice(1)}`
  if (phone.startsWith("7")) return `254${phone}`

  return phone
}

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    const callback = payload?.Body?.stkCallback

    if (!callback?.CheckoutRequestID) {
      console.error("CYBER CALLBACK: Missing checkout reference")
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    const admin = createAdminSupabase()
    const checkoutRequestId = String(callback.CheckoutRequestID)
    const resultCode = Number(callback.ResultCode)

    if (resultCode !== 0) {
      const { error } = await admin
        .from("cyber_payments")
        .update({
          status: "failed",
          result_code: String(resultCode),
          result_description: String(
            callback.ResultDesc || "M-Pesa payment failed."
          ),
          updated_at: new Date().toISOString(),
        })
        .eq("checkout_request_id", checkoutRequestId)
        .eq("status", "pending")

      if (error) {
        console.error("CYBER CALLBACK FAILURE UPDATE ERROR:", error)
      }

      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    const items = callback.CallbackMetadata?.Item

    if (!Array.isArray(items)) {
      console.error("CYBER CALLBACK: Payment metadata missing")
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    const amount = Number(getMetadataValue(items, "Amount"))
    const receipt = String(
      getMetadataValue(items, "MpesaReceiptNumber") || ""
    )
    const phone = normalizePhone(
      getMetadataValue(items, "PhoneNumber")
    )

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !receipt ||
      !/^2547\d{8}$/.test(phone)
    ) {
      console.error("CYBER CALLBACK: Invalid payment metadata", {
        checkoutRequestId,
        amount,
        receiptPresent: Boolean(receipt),
        phoneValid: /^2547\d{8}$/.test(phone),
      })

      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    const { data, error } = await admin.rpc(
      "finalize_cyber_payment",
      {
        p_checkout_request_id: checkoutRequestId,
        p_mpesa_receipt: receipt,
        p_amount: amount,
        p_phone: phone,
      }
    )

    if (error) {
      console.error("CYBER PAYMENT FINALIZATION ERROR:", error)
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
    }

    if (!data?.success) {
      console.error("CYBER PAYMENT VERIFICATION REJECTED:", {
        checkoutRequestId,
        message: data?.message || "Unknown verification failure",
      })
    } else {
      console.log("CYBER PAYMENT VERIFIED:", {
        checkoutRequestId,
        sessionId: data.session_id,
        alreadyProcessed: data.already_processed || false,
      })
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
  } catch (error) {
    console.error("CYBER CALLBACK ERROR:", error)

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" })
  }
}
