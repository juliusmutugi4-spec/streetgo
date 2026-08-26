import { supabase } from "./supabase"
import { sendReax } from "./reax"

export async function sendPostReax({
  senderId,
  receiverId,
  onSuccess,
  onRollback,
}: {
  senderId: string
  receiverId: string
  onSuccess: () => void
  onRollback: () => void
}) {
  
  
  

  // 1. Check sender REAX balance
  const { data: senderWallet, error: senderError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", senderId)
    .maybeSingle()

  
  

  if (senderError || !senderWallet) {
    throw new Error("Your REAX wallet was not found")
  }

  if ((senderWallet.reax_balance ?? 0) <= 0) {
    throw new Error("Insufficient REAX balance ⭐ Fund your REAX")
  }

  // 2. Optimistic UI update
  onSuccess()

  try {
    
    

    await sendReax(
      senderId,
      receiverId,
      1
    )

    
  } catch (error) {
    console.error("SEND REAX FAILED:", error)

    // Rollback UI
    onRollback()

    throw error
  }
}