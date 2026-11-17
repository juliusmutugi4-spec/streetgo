import { NextResponse } from "next/server"
import { createHash } from "node:crypto"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const authorization = req.headers.get("authorization")

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Device authentication required." },
        { status: 401 }
      )
    }

    const credential = authorization.slice(7).trim()

    if (!/^[a-f0-9]{64}$/.test(credential)) {
      return NextResponse.json(
        { error: "Invalid device credential." },
        { status: 401 }
      )
    }

    const credentialHash = createHash("sha256")
      .update(credential)
      .digest("hex")

    const admin = createAdminSupabase()

    const { data: device, error: deviceError } = await admin
      .from("cyber_devices")
      .select("id, computer_id, merchant_id, revoked_at")
      .eq("credential_hash", credentialHash)
      .maybeSingle()

    if (deviceError || !device || device.revoked_at) {
      console.error("CYBER DEVICE AUTH DEBUG:", {
        deviceError: deviceError?.message ?? null,
        deviceFound: !!device,
        revoked: device?.revoked_at ?? null,
      })

      return NextResponse.json(
        { error: "Device authentication failed." },
        { status: 401 }
      )
    }

    const { data: merchant, error: merchantError } = await admin
      .from("cyber_merchants")
      .select("status")
      .eq("id", device.merchant_id)
      .maybeSingle()

    if (merchantError || !merchant || merchant.status !== "active") {
      return NextResponse.json(
        { error: "Business is not active." },
        { status: 403 }
      )
    }

    const now = new Date()
    const nowIso = now.toISOString()

    const { error: heartbeatError } = await admin
      .from("cyber_devices")
      .update({ last_heartbeat_at: nowIso })
      .eq("id", device.id)
      .is("revoked_at", null)

    if (heartbeatError) {
      console.error("CYBER DEVICE HEARTBEAT ERROR:", heartbeatError)

      return NextResponse.json(
        { error: "Unable to update device heartbeat." },
        { status: 500 }
      )
    }

    const { error: computerError } = await admin
      .from("cyber_computers")
      .update({
        device_status: "online",
        last_seen_at: nowIso,
      })
      .eq("id", device.computer_id)
      .eq("merchant_id", device.merchant_id)

    if (computerError) {
      console.error("CYBER COMPUTER STATUS ERROR:", computerError)

      return NextResponse.json(
        { error: "Unable to update computer status." },
        { status: 500 }
      )
    }

    await admin
      .from("cyber_sessions")
      .update({
        status: "expired",
        ended_at: nowIso,
        end_reason: "expired",
        updated_at: nowIso,
      })
      .eq("computer_id", device.computer_id)
      .eq("status", "active")
      .lte("expires_at", nowIso)

    const { data: session, error: sessionError } = await admin
      .from("cyber_sessions")
      .select("id, package_name, duration_minutes, starts_at, expires_at")
      .eq("computer_id", device.computer_id)
      .eq("status", "active")
      .gt("expires_at", nowIso)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError) {
      console.error("CYBER SESSION HEARTBEAT ERROR:", sessionError)

      return NextResponse.json(
        { error: "Unable to retrieve computer session." },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json({
        success: true,
        status: "online",
        command: "lock",
        session: null,
        remaining_seconds: 0,
        server_time: nowIso,
      })
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil(
        (new Date(session.expires_at).getTime() - now.getTime()) / 1000
      )
    )

    return NextResponse.json({
      success: true,
      status: "online",
      command: "unlock",
      session: {
        id: session.id,
        package_name: session.package_name,
        duration_minutes: session.duration_minutes,
        starts_at: session.starts_at,
        expires_at: session.expires_at,
      },
      remaining_seconds: remainingSeconds,
      server_time: nowIso,
    })
  } catch (error) {
    console.error("CYBER HEARTBEAT API ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}

