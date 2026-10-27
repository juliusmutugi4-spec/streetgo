import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get("x-admin-id")

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin authentication required" },
        { status: 401 }
      )
    }

    // Verify active finance/super admin.
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id, role, status")
      .eq("user_id", adminId)
      .eq("status", "active")
      .in("role", ["super_admin", "finance_admin"])
      .maybeSingle()

    if (adminError) {
      console.error(
        "UNVERIFIED MEMBERS ADMIN CHECK ERROR:",
        adminError
      )

      return NextResponse.json(
        { error: "Unable to verify administrator" },
        { status: 500 }
      )
    }

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Load all active members whose phone is not verified.
    const { data: members, error: membersError } =
      await supabase
        .from("contribution_members")
        .select(`
          id,
          member_code,
          phone_number,
          phone_verified,
          phone_verified_by,
          phone_verified_at,
          status,
          group_id,
          contribution_groups (
            id,
            name,
            group_number,
            status
          )
        `)
        .eq("status", "active")
        .eq("phone_verified", false)

    if (membersError) {
      console.error(
        "UNVERIFIED MEMBERS LOAD ERROR:",
        membersError
      )

      return NextResponse.json(
        { error: membersError.message },
        { status: 500 }
      )
    }

    const unverifiedMembers = (members || []).map((member) => ({
      id: member.id,
      memberCode: member.member_code,
      phoneNumber: member.phone_number,
      phoneVerified: member.phone_verified,
      phoneVerifiedBy: member.phone_verified_by,
      phoneVerifiedAt: member.phone_verified_at,
      status: member.status,
      groupId: member.group_id,
      group: member.contribution_groups,
    }))

    return NextResponse.json({
      success: true,
      count: unverifiedMembers.length,
      members: unverifiedMembers,
    })
  } catch (error) {
    console.error(
      "UNVERIFIED MEMBERS API ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load unverified members",
      },
      { status: 500 }
    )
  }
}