import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

const { error } = await supabase.storage
  .from(bucket)
  .upload(fileName, file, {
    upsert: false
  })

if (error) {
  throw error
}

const { data } = supabase.storage
  .from(bucket)
  .getPublicUrl(fileName)

return NextResponse.json({
  success: true,
  url: data.publicUrl
})
}