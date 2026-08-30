import { supabase } from "./supabase"
import { sendReax } from "./reax"

interface SendPostReaxParams {
  senderId: string
  receiverId: string
  postId: string
  onSuccess: () => void
  onRollback: () => void
}

export async function sendPostReax({
  senderId,
  receiverId,
  postId,
  onSuccess,
  onRollback,
}: SendPostReaxParams) {
  if (!senderId) {
    throw new Error("Missing sender ID.")
  }

  if (!receiverId) {
    throw new Error("Missing receiver ID.")
  }

  if (!postId) {
    throw new Error("Missing post ID.")
  }

  /*
   * ONE CLICK = ONE REAX
   */
  const amount = 1

  const {
    data: wallet,
    error: walletError,
  } = await supabase
    .from("wallets")
    .select("reax_balance")
    .eq("user_id", senderId)
    .maybeSingle()

  if (walletError) {
    throw new Error(
      walletError.message ||
        "Unable to check your REAX wallet."
    )
  }

  if (!wallet) {
    throw new Error(
      "Your REAX wallet was not found."
    )
  }

  const balance =
    Number(wallet.reax_balance) || 0

  if (balance < amount) {
    throw new Error(
      "Insufficient REAX balance ⭐ Fund your REAX"
    )
  }

  try {
    await sendReax({
      senderId,
      receiverId,
      amount,
      postId,
    })

    onSuccess()
  } catch (error) {
    console.error(
      "SEND REAX FAILED:",
      error
    )

    onRollback()

    throw error
  }
}