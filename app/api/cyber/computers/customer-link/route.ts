import { NextResponse } from "next/server"
import { randomBytes, createHash } from "node:crypto"
import { createServerSupabase } from "../../../../lib/serverSupabase"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const computerId =
      typeof body.computer_id === "string"
        ? body.computer_id.trim()
        : ""

    if (!computerId) {
      return NextResponse.json(
        { error: "Computer ID is required." },
        { status: 400 }
      )
    }

    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .select("id, status")
      .eq("owner_user_id", user.id)
      .maybeSingle()

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: "Unable to verify your business." },
        { status: 404 }
      )
    }

    if (merchant.status !== "active") {
      return NextResponse.json(
        { error: "Your business must be active." },
        { status: 403 }
      )
    }

    const { data: computer, error: computerError } = await supabase
      .from("cyber_computers")
      .select("id, computer_name, merchant_id, device_status")
      .eq("id", computerId)
      .eq("merchant_id", merchant.id)
      .maybeSingle()

    if (computerError || !computer) {
      return NextResponse.json(
        { error: "Computer not found in your business." },
        { status: 404 }
      )
    }

    if (computer.device_status === "revoked") {
      return NextResponse.json(
        { error: "This computer has been revoked." },
        { status: 403 }
      )
    }

    const admin = createAdminSupabase()

    const token = randomBytes(32).toString("hex")
    const tokenHash = createHash("sha256").update(token).digest("hex")

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
      .eq("merchant_id", merchant.id)

    if (updateError) {
      console.error("CYBER CUSTOMER LINK UPDATE ERROR:", updateError)

      return NextResponse.json(
        { error: "Unable to generate customer page link." },
        { status: 500 }
      )
    }

    const baseUrl =
      process.env.NODE_ENV === "development"
        ? new URL(req.url).origin
        : process.env.NEXT_PUBLIC_SITE_URL || "https://streetgo.app"

    const customerUrl =
      `${baseUrl}/cyber/customer?token=${encodeURIComponent(token)}`

    return NextResponse.json({
      success: true,
      computer: {
        id: computer.id,
        name: computer.computer_name,
      },
      customer_url: customerUrl,
      expires_at: expiresAt,
      expires_in_seconds: 1800,
    })
  } catch (error) {
    console.error("CYBER CUSTOMER LINK ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}

