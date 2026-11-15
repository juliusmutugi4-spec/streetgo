
import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
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

    const { data: computer, error: computerError } = await admin
      .from("cyber_computers")
      .select("id, branch_id")
      .eq("id", device.computer_id)
      .eq("merchant_id", device.merchant_id)
      .maybeSingle()

    if (computerError || !computer) {
      return NextResponse.json(
        { error: "Registered computer not found." },
        { status: 404 }
      )
    }

    const { data: packages, error: packagesError } = await admin
      .from("cyber_time_packages")
      .select("id, package_name, duration_minutes, price_kes")
      .eq("merchant_id", device.merchant_id)
      .eq("branch_id", computer.branch_id)
      .eq("is_active", true)
      .or(`computer_id.is.null,computer_id.eq.${computer.id}`)
      .order("duration_minutes", { ascending: true })

    if (packagesError) {
      console.error("CYBER CUSTOMER PACKAGES ERROR:", packagesError)

      return NextResponse.json(
        { error: "Unable to load computer packages." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      packages: packages ?? [],
    })
  } catch (error) {
    console.error("CYBER CUSTOMER PACKAGES API ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
