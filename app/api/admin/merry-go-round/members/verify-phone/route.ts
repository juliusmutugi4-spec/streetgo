import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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
        "VERIFY PHONE ADMIN CHECK ERROR:",
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

    const body = await request.json()
    const memberId = body?.memberId

    if (!memberId) {
      return NextResponse.json(
        { error: "memberId is required" },
        { status: 400 }
      )
    }

    // Load the member.
    const { data: member, error: memberError } = await supabase
      .from("contribution_members")
      .select(
        "id, member_code, phone_number, phone_verified, status, group_id"
      )
      .eq("id", memberId)
      .maybeSingle()

    if (memberError) {
      console.error(
        "VERIFY PHONE MEMBER LOAD ERROR:",
        memberError
      )

      return NextResponse.json(
        { error: memberError.message },
        { status: 500 }
      )
    }

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    if (member.status !== "active") {
      return NextResponse.json(
        {
          error:
            "Only active members can have their phone verified",
        },
        { status: 409 }
      )
    }

    if (
      !member.phone_number ||
      member.phone_number.trim() === ""
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot verify this member because no phone number is stored",
        },
        { status: 409 }
      )
    }

    if (member.phone_verified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Member phone is already verified",
        member: {
          id: member.id,
          memberCode: member.member_code,
          phoneNumber: member.phone_number,
          phoneVerified: true,
        },
      })
    }

    // Verify the member and record the admin audit information.
    const { data: updatedMember, error: updateError } =
      await supabase
        .from("contribution_members")
        .update({
          phone_verified: true,
          phone_verified_by: adminId,
          phone_verified_at: new Date().toISOString(),
        })
        .eq("id", member.id)
        .eq("status", "active")
        .select(
          "id, member_code, phone_number, phone_verified, phone_verified_by, phone_verified_at"
        )
        .single()

    if (updateError) {
      console.error(
        "VERIFY PHONE UPDATE ERROR:",
        updateError
      )

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      alreadyVerified: false,
      message: "Member phone verified successfully",
      member: {
        id: updatedMember.id,
        memberCode: updatedMember.member_code,
        phoneNumber: updatedMember.phone_number,
        phoneVerified: updatedMember.phone_verified,
        phoneVerifiedBy: updatedMember.phone_verified_by,
        phoneVerifiedAt: updatedMember.phone_verified_at,
      },
    })
  } catch (error) {
    console.error(
      "VERIFY PHONE API ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify member phone",
      },
      { status: 500 }
    )
  }
}