import { NextRequest, NextResponse } from 'next/server'

import { PutObjectCommand } from "@aws-sdk/client-s3"
import { r2 } from "@/app/lib/r2"


export async function POST(req: NextRequest) {
const formData = await req.formData()

const file = formData.get('file') as File
const bucket = formData.get('bucket') as string
const fileName = formData.get('fileName') as string

if (!file) {
  return NextResponse.json(
    {
      success: false,
      error: 'No file received'
    },
    { status: 400 }
  )
}

await r2.send(
  new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: fileName,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  })
)



const url = `${process.env.R2_PUBLIC_URL}/${fileName}`

return NextResponse.json({
  success: true,
  url
})
}