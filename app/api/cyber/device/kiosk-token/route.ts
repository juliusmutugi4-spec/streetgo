import { NextResponse } from "next/server"
import { createHash, randomBytes } from "node:crypto"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

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

    const credentialHash = createHash("sha256")
      .update(credential)
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

    const { data: merchant } = await admin
      .from("cyber_merchants")
      .select("status")
      .eq("id", device.merchant_id)
      .maybeSingle()

    if (!merchant || merchant.status !== "active") {
      return NextResponse.json(
        { error: "Business is not active." },
        { status: 403 }
      )
    }

    const { data: computer } = await admin
      .from("cyber_computers")
      .select("id, computer_name")
      .eq("id", device.computer_id)
      .eq("merchant_id", device.merchant_id)
      .maybeSingle()

    if (!computer) {
      return NextResponse.json(
        { error: "Registered computer not found." },
        { status: 404 }
      )
    }

    const token = randomBytes(32).toString("hex")
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex")

    const expiresAt = new Date(
      Date.now() + 30 * 60 * 1000
    ).toISOString()

    const { error: updateError } = await admin
      .from("cyber_computers")
      .update({
        kiosk_token_hash: tokenHash,
        kiosk_token_expires_at: expiresAt,
      })
      .eq("id", computer.id)
      .eq("merchant_id", device.merchant_id)

    if (updateError) {
      console.error("CYBER KIOSK TOKEN ERROR:", updateError)

      return NextResponse.json(
        { error: "Unable to create customer access." },
        { status: 500 }
      )
    }

    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || "https://streetgo.app"
    ).replace(/\/$/, "")

    return NextResponse.json({
      success: true,
      computer_id: computer.id,
      computer_name: computer.computer_name,
      kiosk_token: token,
      expires_at: expiresAt,
      customer_url: `${baseUrl}/cyber/customer?token=${token}`,
    })
  } catch (error) {
    console.error("CYBER KIOSK TOKEN API ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
