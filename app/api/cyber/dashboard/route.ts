
import { NextResponse } from "next/server"
import { createServerSupabase } from "../../../lib/serverSupabase"

function normalizeKenyanPhone(value: unknown): string | null {
  if (typeof value !== "string") return null

  const digits = value.replace(/\D/g, "")
  let phone = digits

  if (digits.startsWith("0")) phone = `254${digits.slice(1)}`
  else if (digits.startsWith("7") || digits.startsWith("1")) {
    phone = `254${digits}`
  }

  return /^254[17]\d{8}$/.test(phone) ? phone : null
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in to access the Cyber dashboard." },
        { status: 401 }
      )
    }

    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .select(
        "id, business_name, business_phone, business_email, registration_number, payout_phone, status, created_at"
      )
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (merchantError) {
      console.error("CYBER DASHBOARD MERCHANT ERROR:", merchantError)
      return NextResponse.json(
        { error: "Unable to load your cyber business." },
        { status: 500 }
      )
    }

    if (!merchant) {
      return NextResponse.json({
        registered: false,
        merchant: null,
        permissions: {
          canManageBranches: false,
          canManageComputers: false,
          canManagePricing: false,
          canManagePayments: false,
        },
      })
    }

    const isActive = merchant.status === "active"

    return NextResponse.json({
      registered: true,
      merchant,
      permissions: {
        canManageBranches: isActive,
        canManageComputers: isActive,
        canManagePricing: isActive,
        canManagePayments: isActive,
      },
    })
  } catch (error) {
    console.error("CYBER DASHBOARD ERROR:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred while loading the dashboard." },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerSupabase()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      )
    }

    const body = await request.json()
    const payoutPhone = normalizeKenyanPhone(body?.payout_phone)

    if (!payoutPhone) {
      return NextResponse.json(
        { error: "Enter a valid Kenyan M-Pesa number, e.g. 0712345678." },
        { status: 400 }
      )
    }

    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .update({ payout_phone: payoutPhone })
      .eq("owner_user_id", user.id)
      .select("id, payout_phone")
      .maybeSingle()

    if (merchantError) {
      console.error("CYBER PAYOUT PHONE UPDATE ERROR:", merchantError)
      return NextResponse.json(
        { error: "Unable to save your payout phone number." },
        { status: 500 }
      )
    }

    if (!merchant) {
      return NextResponse.json(
        { error: "No cyber business was found for your account." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      merchant,
      message: "Payout phone number saved successfully.",
    })
  } catch (error) {
    console.error("CYBER PAYOUT PHONE ERROR:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred while saving your payout number." },
      { status: 500 }
    )
  }
}
