import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyAdmin(adminId: string | null) {
  if (!adminId) {
    return {
      ok: false,
      status: 401,
      error: "Admin authentication required",
    }
  }

  const { data: admin, error } = await supabase
    .from("admins")
    .select("user_id, role, status")
    .eq("user_id", adminId)
    .eq("status", "active")
    .in("role", ["super_admin", "finance_admin"])
    .maybeSingle()

  if (error) {
    console.error(
      "AUTO PAYOUT ADMIN CHECK ERROR:",
      error
    )

    return {
      ok: false,
      status: 500,
      error: "Unable to verify administrator",
    }
  }

  if (!admin) {
    return {
      ok: false,
      status: 403,
      error: "Unauthorized",
    }
  }

  return {
    ok: true,
    admin,
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminId =
      request.headers.get("x-admin-id")

    const verification =
      await verifyAdmin(adminId)

    if (!verification.ok) {
      return NextResponse.json(
        {
          error: verification.error,
        },
        {
          status: verification.status,
        }
      )
    }

    const { data: setting, error } =
      await supabase
        .from(
          "contribution_auto_payout_settings"
        )
        .select(
          "id, enabled, updated_by, updated_at, created_at"
        )
        .limit(1)
        .maybeSingle()

    if (error) {
      console.error(
        "AUTO PAYOUT SETTING LOAD ERROR:",
        error
      )

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      )
    }

    if (!setting) {
      return NextResponse.json(
        {
          error:
            "Auto payout setting is not configured",
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      success: true,
      enabled: Boolean(setting.enabled),
      setting,
    })
  } catch (error) {
    console.error(
      "AUTO PAYOUT GET ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load auto payout setting",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const adminId =
      request.headers.get("x-admin-id")

    const verification =
      await verifyAdmin(adminId)

    if (!verification.ok) {
      return NextResponse.json(
        {
          error: verification.error,
        },
        {
          status: verification.status,
        }
      )
    }

    let body: unknown

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body",
        },
        {
          status: 400,
        }
      )
    }

    const enabled =
      typeof body === "object" &&
      body !== null &&
      "enabled" in body
        ? (body as { enabled?: unknown }).enabled
        : undefined

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        {
          error:
            "enabled must be a boolean",
        },
        {
          status: 400,
        }
      )
    }

    const { data: existing, error: findError } =
      await supabase
        .from(
          "contribution_auto_payout_settings"
        )
        .select("id")
        .limit(1)
        .maybeSingle()

    if (findError) {
      console.error(
        "AUTO PAYOUT SETTING FIND ERROR:",
        findError
      )

      return NextResponse.json(
        {
          error: findError.message,
        },
        {
          status: 500,
        }
      )
    }

    let setting

    if (existing) {
      const { data, error } =
        await supabase
          .from(
            "contribution_auto_payout_settings"
          )
          .update({
            enabled,
            updated_by: adminId,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select(
            "id, enabled, updated_by, updated_at, created_at"
          )
          .single()

      if (error) {
        console.error(
          "AUTO PAYOUT SETTING UPDATE ERROR:",
          error
        )

        return NextResponse.json(
          {
            error: error.message,
          },
          {
            status: 500,
          }
        )
      }

      setting = data
    } else {
      const { data, error } =
        await supabase
          .from(
            "contribution_auto_payout_settings"
          )
          .insert({
            enabled,
            updated_by: adminId,
          })
          .select(
            "id, enabled, updated_by, updated_at, created_at"
          )
          .single()

      if (error) {
        console.error(
          "AUTO PAYOUT SETTING CREATE ERROR:",
          error
        )

        return NextResponse.json(
          {
            error: error.message,
          },
          {
            status: 500,
          }
        )
      }

      setting = data
    }

    console.log(
      "MERRY-GO-ROUND AUTO PAYOUT SETTING UPDATED:",
      {
        adminId,
        enabled,
      }
    )

    return NextResponse.json({
      success: true,
      enabled: Boolean(setting.enabled),
      setting,
      message: enabled
        ? "Automatic payout mode enabled"
        : "Automatic payout mode disabled",
    })
  } catch (error) {
    console.error(
      "AUTO PAYOUT POST ERROR:",
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update auto payout setting",
      },
      {
        status: 500,
      }
    )
  }
}