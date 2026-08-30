import { supabase } from "./supabase"

interface SendReaxParams {
  senderId: string
  receiverId: string
  amount?: number
  postId?: string | null
}

export async function sendReax({
  senderId,
  receiverId,
  amount = 1,
  postId = null,
}: SendReaxParams) {
  if (!senderId) {
    throw new Error("Missing sender ID.")
  }

  if (!receiverId) {
    throw new Error("Missing receiver ID.")
  }

  if (senderId === receiverId) {
    throw new Error(
      "You cannot send REAX to yourself."
    )
  }

  const safeAmount = Math.max(
    1,
    Math.floor(Number(amount) || 1)
  )

  /*
   * =====================================================
   * PROFILE REAX
   *
   * No post involved.
   * Uses the existing 3-argument RPC.
   * =====================================================
   */

  if (!postId) {
    const {
      error,
    } = await supabase.rpc(
      "send_reax",
      {
        sender: senderId,
        receiver: receiverId,
        amount: safeAmount,
      }
    )

    if (error) {
      console.error(
        "PROFILE REAX ERROR:",
        error.message
      )

      throw error
    }

    return true
  }

  /*
   * =====================================================
   * POST REAX
   *
   * Uses the existing 4-argument RPC.
   * =====================================================
   */

  const {
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
      "POST REAX ERROR:",
      error.message
    )

    throw error
  }

  return true
}