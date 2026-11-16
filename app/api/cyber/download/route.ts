import { NextResponse } from "next/server"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { createServerSupabase } from "../../../lib/serverSupabase"
import { S3Client } from "@aws-sdk/client-s3"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const INSTALLER_KEY = "cyber/StreetGO-Cyber-Agent-Setup.exe"

const cyberR2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_CYBER_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_CYBER_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_CYBER_SECRET_ACCESS_KEY!,
  },
})

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please sign in to download StreetGO Cyber." },
        { status: 401 }
      )
    }

    const { data: merchant, error: merchantError } = await supabase
      .from("cyber_merchants")
      .select("id, status")
      .eq("owner_user_id", user.id)
      .maybeSingle()

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: "Your Cyber business could not be verified." },
        { status: 403 }
      )
    }

    if (merchant.status !== "active") {
      return NextResponse.json(
        { error: "Your Cyber business must be active to download the agent." },
        { status: 403 }
      )
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_CYBER_BUCKET!,
      Key: INSTALLER_KEY,
      ResponseContentType: "application/vnd.microsoft.portable-executable",
      ResponseContentDisposition:
        'attachment; filename="StreetGO-Cyber-Agent-Setup.exe"',
    })

    const downloadUrl = await getSignedUrl(cyberR2, command, {
      expiresIn: 300,
    })

    return NextResponse.json({
      downloadUrl,
      expiresIn: 300,
      fileName: "StreetGO-Cyber-Agent-Setup.exe",
    })
  } catch (error) {
    console.error("CYBER INSTALLER DOWNLOAD ERROR:", error)

    return NextResponse.json(
      { error: "Unable to prepare the installer download." },
      { status: 500 }
    )
  }
}
