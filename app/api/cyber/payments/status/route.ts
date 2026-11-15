import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = String(body.token || "").trim()
    const paymentId = String(body.payment_id || "").trim()

    if (!/^[a-f0-9]{64}$/.test(token) || !paymentId) {
      return NextResponse.json(
        { error: "Valid customer access and payment reference are required." },
        { status: 400 }
      )
    }

    const admin = createAdminSupabase()
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex")

    const { data: computer, error: computerError } = await admin
      .from("cyber_computers")
      .select("id")
      .eq("kiosk_token_hash", tokenHash)
      .gt("kiosk_token_expires_at", new Date().toISOString())
      .maybeSingle()

    if (computerError || !computer) {
      return NextResponse.json(
        { error: "Customer access has expired or is invalid." },
        { status: 401 }
      )
    }

    const { data: payment, error: paymentError } = await admin
      .from("cyber_payments")
      .select("id, status, result_description, paid_at, package_name, duration_minutes")
      .eq("id", paymentId)
      .eq("computer_id", computer.id)
      .maybeSingle()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment record not found." },
        { status: 404 }
      )
    }

    let session = null

    if (payment.status === "paid") {
      const { data: sessionData, error: sessionError } = await admin
        .from("cyber_sessions")
        .select("id, status, starts_at, expires_at")
        .eq("payment_id", payment.id)
        .maybeSingle()

      if (sessionError) {
        console.error("CYBER PAYMENT STATUS SESSION ERROR:", sessionError)

        return NextResponse.json(
          { error: "Unable to retrieve session details." },
          { status: 500 }
        )
      }

      session = sessionData
    }

    return NextResponse.json(
      {
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          message: payment.result_description,
          paid_at: payment.paid_at,
          package_name: payment.package_name,
          duration_minutes: payment.duration_minutes,
        },
        session,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (error) {
    console.error("CYBER PAYMENT STATUS ERROR:", error)

    return NextResponse.json(
      { error: "Unable to check payment status." },
      { status: 500 }
    )
  }
}
