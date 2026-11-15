import { NextResponse } from "next/server"
import { createServerSupabase } from "../../../lib/serverSupabase"

export const dynamic = "force-dynamic"

export async function GET() {
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

    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .select("id, status")
      .eq("owner_user_id", user.id)
      .maybeSingle()

    if (merchantError || !merchant) {
      console.error("CYBER COMPUTER MERCHANT ERROR:", merchantError)

      return NextResponse.json(
        { error: "Unable to verify your cyber business." },
        { status: 404 }
      )
    }

    const { data: computers, error } = await supabase
      .from("cyber_computers")
      .select(`
        id,
        merchant_id,
        branch_id,
        computer_name,
        device_status,
        operating_system,
        last_seen_at,
        created_at
      `)
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("CYBER COMPUTER FETCH ERROR:", error)

      return NextResponse.json(
        { error: "Unable to load computers." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      computers: computers ?? [],
      merchantStatus: merchant.status,
    })
  } catch (error) {
    console.error("CYBER COMPUTER GET ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}

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

    const branchId =
      typeof body.branch_id === "string" ? body.branch_id.trim() : ""

    const computerName =
      typeof body.computer_name === "string"
        ? body.computer_name.trim()
        : ""

    const operatingSystem =
      typeof body.operating_system === "string"
        ? body.operating_system.trim()
        : null

    if (!branchId) {
      return NextResponse.json(
        { error: "Select a branch." },
        { status: 400 }
      )
    }

    if (computerName.length < 2 || computerName.length > 100) {
      return NextResponse.json(
        { error: "Computer name must contain 2–100 characters." },
        { status: 400 }
      )
    }

    if (operatingSystem && operatingSystem.length > 100) {
      return NextResponse.json(
        { error: "Operating system name is too long." },
        { status: 400 }
      )
    }

    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .select("id, status")
      .eq("owner_user_id", user.id)
      .maybeSingle()

    if (merchantError || !merchant) {
      console.error("CYBER COMPUTER MERCHANT LOOKUP ERROR:", merchantError)

      return NextResponse.json(
        { error: "Unable to verify your cyber business." },
        { status: 404 }
      )
    }

    if (merchant.status !== "active") {
      return NextResponse.json(
        { error: "Your business must be approved before registering computers." },
        { status: 403 }
      )
    }

    const { data: branch, error: branchError } = await supabase
      .from("cyber_branches")
      .select("id")
      .eq("id", branchId)
      .eq("merchant_id", merchant.id)
      .maybeSingle()

    if (branchError || !branch) {
      return NextResponse.json(
        { error: "The selected branch does not belong to your business." },
        { status: 400 }
      )
    }

    const { data: computer, error: insertError } = await supabase
      .from("cyber_computers")
      .insert({
        merchant_id: merchant.id,
        branch_id: branch.id,
        computer_name: computerName,
        operating_system: operatingSystem || null,
        device_status: "pending",
      })
      .select(`
        id,
        merchant_id,
        branch_id,
        computer_name,
        device_status,
        operating_system,
        created_at
      `)
      .single()

    if (insertError) {
      console.error("CYBER COMPUTER INSERT ERROR:", insertError)

      return NextResponse.json(
        { error: "Unable to register computer." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        computer,
        message: "Computer registered successfully. Pairing is the next step.",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("CYBER COMPUTER POST ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
