import { NextRequest, NextResponse } from "next/server"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { r2 } from "@/app/lib/r2"

export async function POST(req: NextRequest) {
  try {
    const { fileName, fileType } = await req.json()

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: fileName,
      ContentType: fileType,
    })

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 60,
    })

    return NextResponse.json({ uploadUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    )
  }
}