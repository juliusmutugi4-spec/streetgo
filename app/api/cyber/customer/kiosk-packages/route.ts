import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get("token")

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json(
        { error: "Valid customer access token required." },
        { status: 401 }
      )
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex")

    const admin = createAdminSupabase()
    const now = new Date().toISOString()

    const { data: computer, error: computerError } = await admin
      .from("cyber_computers")
      .select("id, computer_name, merchant_id, branch_id")
      .eq("kiosk_token_hash", tokenHash)
      .gt("kiosk_token_expires_at", now)
      .maybeSingle()

    if (computerError || !computer) {
      return NextResponse.json(
        { error: "Customer access has expired or is invalid." },
        { status: 401 }
      )
    }

    const { data: merchant, error: merchantError } = await admin
      .from("cyber_merchants")
      .select("status")
      .eq("id", computer.merchant_id)
      .maybeSingle()

    if (merchantError || !merchant || merchant.status !== "active") {
      return NextResponse.json(
        { error: "Business is not active." },
        { status: 403 }
      )
    }

    const { data: packages, error: packagesError } = await admin
      .from("cyber_time_packages")
      .select("id, package_name, duration_minutes, price_kes, is_active")
      .eq("merchant_id", computer.merchant_id)
      .eq("branch_id", computer.branch_id)
      .eq("is_active", true)
      .or(`computer_id.is.null,computer_id.eq.${computer.id}`)
      .order("duration_minutes", { ascending: true })

    if (packagesError) {
      console.error("CYBER KIOSK PACKAGES ERROR:", packagesError)

      return NextResponse.json(
        { error: "Unable to load packages." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      computer: {
        id: computer.id,
        name: computer.computer_name,
      },
      packages: packages ?? [],
    })
  } catch (error) {
    console.error("CYBER KIOSK PACKAGES API ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
