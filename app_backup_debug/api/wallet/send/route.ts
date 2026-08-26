import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const token = authHeader.replace("Bearer ", "")

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid session" },
        { status: 401 }
      )
    }

    const { receiverId, amount } = await req.json()
const { data: senderWallet, error: senderError } = await supabase
  .from("wallets")
  .select("*")
  .eq("user_id", user.id)
  .single()



if (senderError || !senderWallet) {
  return NextResponse.json(
    {
      success: false,
      error: "Sender wallet not found",
    },
    {
      status: 404,
    }
  )
}

// Receiver wallet
const { data: receiverWallet, error: receiverError } = await supabase
  .from("wallets")
  .select("*")
  .eq("user_id", receiverId)
  .single()

if (receiverError || !receiverWallet) {
  return NextResponse.json(
    {
      success: false,
      error: "This user has not activated a StreetGO Wallet yet.",
    },
    {
      status: 404,
    }
  )
}

 
    return NextResponse.json({
      success: true,
      senderId: user.id,
      receiverId,
      amount,
    })

  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    )
  }
}