import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { createAdminSupabase } from "../../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Computer authentication required." },
        { status: 401 }
      )
    }

    const credential = authorization.slice(7).trim()

    if (!/^[a-f0-9]{64}$/.test(credential)) {
      return NextResponse.json(
        { error: "Invalid computer credential." },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => null)
    const token = body?.kiosk_token

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { error: "Valid kiosk token required." },
        { status: 400 }
      )
    }

    const credentialHash = createHash("sha256")
      .update(credential)
      .digest("hex")

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex")

    const admin = createAdminSupabase()

    const { data: device, error: deviceError } = await admin
      .from("cyber_devices")
      .select("id, computer_id, merchant_id, revoked_at")
      .eq("credential_hash", credentialHash)
      .maybeSingle()

    if (deviceError || !device || device.revoked_at) {
      return NextResponse.json(
        { error: "Computer authentication failed." },
        { status: 401 }
      )
    }

    const { data: merchant, error: merchantError } = await admin
      .from("cyber_merchants")
      .select("status")
      .eq("id", device.merchant_id)
      .maybeSingle()

    if (merchantError || !merchant || merchant.status !== "active") {
      return NextResponse.json(
        { error: "Business is not active." },
        { status: 403 }
      )
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    const { data: computer, error: updateError } = await admin
      .from("cyber_computers")
      .update({
        kiosk_token_expires_at: expiresAt,
      })
      .eq("id", device.computer_id)
      .eq("merchant_id", device.merchant_id)
      .eq("kiosk_token_hash", tokenHash)
      .select("id")
      .maybeSingle()

    if (updateError) {
      console.error("CYBER KIOSK TOKEN RENEWAL ERROR:", updateError)

      return NextResponse.json(
        { error: "Unable to renew customer access." },
        { status: 500 }
      )
    }

    if (!computer) {
      return NextResponse.json(
        { error: "Kiosk token is invalid or has been replaced." },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      expires_at: expiresAt,
    })
  } catch (error) {
    console.error("CYBER KIOSK TOKEN RENEWAL API ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
