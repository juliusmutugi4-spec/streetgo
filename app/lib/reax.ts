import { supabase } from "./supabase"

interface SendReaxParams {
  senderId: string
  receiverId: string
  amount?: number
  postId: string
}

export async function sendReax({
  senderId,
  receiverId,
  amount = 1,
  postId,
}: SendReaxParams) {
  if (!senderId) {
    throw new Error("Missing sender ID.")
  }

  if (!receiverId) {
    throw new Error("Missing receiver ID.")
  }

  if (!postId) {
    throw new Error("Missing post ID.")
  }

  const safeAmount = Math.max(
    1,
    Math.floor(Number(amount) || 1)
  )

  const {
    data,
    error,
  } = await supabase.rpc(
    "send_reax",
    {
      sender: senderId,
      receiver: receiverId,
      amount: safeAmount,
      post_id: postId,
    }
  )

  if (error) {
    console.error(
      "REAX ERROR:",
      error.message
    )

    throw error
  }

  return data ?? true
}