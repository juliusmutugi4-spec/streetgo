
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

    if (merchantError) {
      console.error("CYBER MERCHANT ERROR:", merchantError)
      return NextResponse.json(
        { error: "Unable to load your business." },
        { status: 500 }
      )
    }

    if (!merchant) {
      return NextResponse.json(
        { error: "Register your cyber business first." },
        { status: 404 }
      )
    }

    const { data: branches, error } = await supabase
      .from("cyber_branches")
      .select("id, branch_name, address, city, phone, status, created_at")
      .eq("merchant_id", merchant.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("CYBER BRANCH FETCH ERROR:", error)
      return NextResponse.json(
        { error: "Unable to load branches." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      branches: branches ?? [],
      merchantStatus: merchant.status,
    })
  } catch (error) {
    console.error("CYBER BRANCH GET ERROR:", error)
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

    const branchName =
      typeof body.branch_name === "string"
        ? body.branch_name.trim()
        : ""

    const address =
      typeof body.address === "string" ? body.address.trim() : null

    const city =
      typeof body.city === "string" ? body.city.trim() : null

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : null

    if (branchName.length < 2 || branchName.length > 100) {
      return NextResponse.json(
        { error: "Branch name must contain 2–100 characters." },
        { status: 400 }
      )
    }

    if (address && address.length > 250) {
      return NextResponse.json(
        { error: "Address is too long." },
        { status: 400 }
      )
    }

    if (city && city.length > 100) {
      return NextResponse.json(
        { error: "City is too long." },
        { status: 400 }
      )
    }

    if (phone && phone.length > 30) {
      return NextResponse.json(
        { error: "Phone number is too long." },
        { status: 400 }
      )
    }

    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .select("id, status")
      .eq("owner_user_id", user.id)
      .maybeSingle()

    if (merchantError || !merchant) {
      console.error("CYBER MERCHANT LOOKUP ERROR:", merchantError)
      return NextResponse.json(
        { error: "Unable to verify your cyber business." },
        { status: 500 }
      )
    }

    if (merchant.status !== "active") {
      return NextResponse.json(
        { error: "Your business must be approved before adding branches." },
        { status: 403 }
      )
    }

    const { data: branch, error: insertError } = await supabase
      .from("cyber_branches")
      .insert({
        merchant_id: merchant.id,
        branch_name: branchName,
        address: address || null,
        city: city || null,
        phone: phone || null,
        status: "active",
      })
      .select("id, branch_name, address, city, phone, status, created_at")
      .single()

    if (insertError) {
      console.error("CYBER BRANCH INSERT ERROR:", insertError)
      return NextResponse.json(
        { error: "Unable to create branch." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, branch },
      { status: 201 }
    )
  } catch (error) {
    console.error("CYBER BRANCH POST ERROR:", error)
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
