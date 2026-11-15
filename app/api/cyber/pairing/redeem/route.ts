import { NextResponse } from "next/server"
import { createHash, randomBytes } from "node:crypto"
import { createAdminSupabase } from "../../../../lib/adminSupabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const code =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : ""

    if (!/^[A-F0-9]{32}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid pairing code." },
        { status: 400 }
      )
    }

    const codeHash = createHash("sha256")
      .update(code)
      .digest("hex")

    const deviceCredential = randomBytes(32).toString("hex")

    const credentialHash = createHash("sha256")
      .update(deviceCredential)
      .digest("hex")

    const admin = createAdminSupabase()

    const { data, error } = await admin.rpc(
      "redeem_cyber_pairing_code",
      {
        p_code_hash: codeHash,
        p_credential_hash: credentialHash,
      }
    )

    if (error) {
      console.error("CYBER DEVICE REDEMPTION ERROR:", error)

      return NextResponse.json(
        { error: "Pairing failed. The code may be expired, used, or invalid." },
        { status: 400 }
      )
    }

    if (!data || data.length !== 1) {
      return NextResponse.json(
        { error: "Device pairing could not be completed." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Computer paired successfully.",
      device: {
        id: data[0].device_id,
        computer_id: data[0].computer_id,
        merchant_id: data[0].merchant_id,
      },
      credential: deviceCredential,
    })
  } catch (error) {
    console.error("CYBER REDEEM API ERROR:", error)

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    )
  }
}
