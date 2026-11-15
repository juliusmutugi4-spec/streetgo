import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createServerSupabase } from "../../../lib/serverSupabase"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userSupabase = await createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: admin, error: adminError } = await adminSupabase
      .from("admins")
      .select("user_id, role, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    if (adminError || !admin) {
      return NextResponse.json(
        { error: "Administrator access required" },
        { status: 403 }
      )
    }

    const { data: applications, error } = await adminSupabase
      .from("cyber_merchants")
      .select(
        "id, owner_user_id, business_name, business_phone, business_email, registration_number, status, created_at"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("CYBER APPLICATIONS LOAD ERROR:", error)
      return NextResponse.json(
        {
          error: "Unable to load Cyber applications",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      applications: applications || [],
    })
  } catch (error) {
    console.error("CYBER ADMIN API ERROR:", error)
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const userSupabase = await createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: admin, error: adminError } = await adminSupabase
      .from("admins")
      .select("user_id, role, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle()

    if (adminError || !admin) {
      return NextResponse.json(
        { error: "Administrator access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const applicationId = body?.applicationId
    const decision = body?.decision

    if (
      typeof applicationId !== "string" ||
      !["approve", "reject"].includes(decision)
    ) {
      return NextResponse.json(
        { error: "A valid application ID and decision are required" },
        { status: 400 }
      )
    }

    const newStatus = decision === "approve" ? "active" : "rejected"

    const { data: updated, error: updateError } = await adminSupabase
      .from("cyber_merchants")
      .update({ status: newStatus })
      .eq("id", applicationId)
      .eq("status", "pending")
      .select("id, business_name, status")
      .maybeSingle()

    if (updateError) {
      console.error("CYBER APPLICATION UPDATE ERROR:", updateError)
      return NextResponse.json(
        { error: "Unable to update this application" },
        { status: 500 }
      )
    }

    if (!updated) {
      return NextResponse.json(
        { error: "Application not found or already reviewed" },
        { status: 409 }
      )
    }

    return NextResponse.json({
      success: true,
      message: decision === "approve"
        ? "Cyber business approved successfully"
        : "Cyber business rejected",
      application: updated,
    })
  } catch (error) {
    console.error("CYBER ADMIN REVIEW ERROR:", error)
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    )
  }
}


