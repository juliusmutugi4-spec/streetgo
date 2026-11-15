
import { NextResponse } from "next/server"
import { createServerSupabase } from "../../../lib/serverSupabase"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()

    // 1. Verify the signed-in StreetGO user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to register your cyber business." },
        { status: 401 }
      )
    }

    // 2. Read registration details
    const body = await req.json()

    const businessName =
      typeof body.business_name === "string"
        ? body.business_name.trim()
        : ""

    const businessPhone =
      typeof body.business_phone === "string"
        ? body.business_phone.trim()
        : null

    const businessEmail =
      typeof body.business_email === "string"
        ? body.business_email.trim().toLowerCase()
        : null

    const registrationNumber =
      typeof body.registration_number === "string"
        ? body.registration_number.trim()
        : null

    // 3. Validate input
    if (businessName.length < 2 || businessName.length > 120) {
      return NextResponse.json(
        { error: "Business name must contain 2–120 characters." },
        { status: 400 }
      )
    }

    if (businessPhone && businessPhone.length > 30) {
      return NextResponse.json(
        { error: "Please provide a valid business phone number." },
        { status: 400 }
      )
    }

    if (
      businessEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid business email." },
        { status: 400 }
      )
    }

    if (registrationNumber && registrationNumber.length > 80) {
      return NextResponse.json(
        { error: "Registration number is too long." },
        { status: 400 }
      )
    }

    // 4. Prevent duplicate registrations by this user
    const { data: existing, error: existingError } = await supabase
      .from("cyber_merchants")
      .select("id, business_name, status")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)

    if (existingError) {
      console.error("CYBER EXISTING MERCHANT ERROR:", existingError)

      return NextResponse.json(
        { error: "Unable to check your existing registration." },
        { status: 500 }
      )
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        {
          error: "You already have a cyber business registration.",
          merchant: existing[0],
        },
        { status: 409 }
      )
    }

    // 5. Create registration
    // RLS ensures owner_user_id belongs to the signed-in user
    // and status must be pending.
    const { data: merchant, error: insertError } = await supabase
      .from("cyber_merchants")
      .insert({
        owner_user_id: user.id,
        business_name: businessName,
        business_phone: businessPhone || null,
        business_email: businessEmail || null,
        registration_number: registrationNumber || null,
        status: "pending",
      })
      .select("id, business_name, status, created_at")
      .single()

    if (insertError) {
      console.error("CYBER MERCHANT INSERT ERROR:", insertError)

      return NextResponse.json(
        { error: "Unable to submit your cyber registration." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your cyber business registration has been submitted.",
        merchant,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("CYBER REGISTRATION ERROR:", error)

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    )
  }
}
