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
        { error: "Your business must be approved before pairing computers." },
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

    const code = randomBytes(16).toString("hex").toUpperCase()
    const codeHash = createHash("sha256").update(code).digest("hex")

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Revoke any previous unused pairing codes for this computer.
    const { error: revokeError } = await admin
      .from("cyber_pairing_codes")
      .update({ revoked_at: new Date().toISOString() })
      .eq("computer_id", computer.id)
      .is("used_at", null)
      .is("revoked_at", null)

    if (revokeError) {
      console.error("CYBER PAIRING REVOKE ERROR:", revokeError)

      return NextResponse.json(
        { error: "Unable to prepare a new pairing code." },
        { status: 500 }
      )
    }

    const { error: insertError } = await admin
      .from("cyber_pairing_codes")
      .insert({
        merchant_id: merchant.id,
        computer_id: computer.id,
        code_hash: codeHash,
        expires_at: expiresAt,
      })

    if (insertError) {
      console.error("CYBER PAIRING INSERT ERROR:", insertError)

      return NextResponse.json(
        { error: "Unable to generate pairing code." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      computer: {
        id: computer.id,
        name: computer.computer_name,
      },
      pairing_code: code,
      expires_at: expiresAt,
      expires_in_seconds: 600,
    })
  } catch (error) {
    console.error("CYBER PAIRING CREATE ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
