import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { createClient } from "@supabase/supabase-js";
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SERVICE KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    },
  }
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, title, body, ride_id } = await req.json();

const { data, error } = await supabase
  .from("device_tokens")
  .select("*")
  .eq("user_id", user_id);

console.log("USER_ID:", user_id);
console.log("DATA:", data);
console.log("ERROR:", error);

if (error || !data) {
  return NextResponse.json(
    {
      success: false,
      error: "User device token not found",
    },
    { status: 404 }
  );
}

console.log('Sending notification...')



const messageId = await getMessaging().send({
  token: data[0].token,
  notification: {
    title,
    body,
  },
  data: {
    type: 'ride_request',
    ride_id: ride_id || '',
  },
})
console.log('MESSAGE ID:', messageId)
    return NextResponse.json({
      success: true,
      messageId,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}