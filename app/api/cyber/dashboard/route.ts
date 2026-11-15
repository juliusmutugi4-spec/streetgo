import { NextResponse } from "next/server"
import { createServerSupabase } from "../../../lib/serverSupabase"

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
        "id, business_name, business_phone, business_email, registration_number, status, created_at"
      )
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

if (merchantError) {
  console.error("CYBER DASHBOARD MERCHANT ERROR:", merchantError)

  return NextResponse.json(
    {
      error: "Unable to load your cyber business.",
      debug: {
        message: merchantError.message,
        code: merchantError.code,
        details: merchantError.details,
        hint: merchantError.hint,
      },
    },
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
