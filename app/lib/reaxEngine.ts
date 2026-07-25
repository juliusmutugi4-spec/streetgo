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
console.log("SENDER ID:", senderId)
console.log("RECEIVER ID:", receiverId)
  // 1. Check sender REAX balance
const { data: senderWallet, error: senderError } = await supabase
  .from("wallets")
  .select("*")
  .eq("user_id", senderId)
  .maybeSingle()

console.log("SENDER WALLET:", senderWallet)
console.log("SENDER ERROR:", senderError)


  if (senderError || !senderWallet) {
    throw new Error("Your REAX wallet was not found")
  }


  if ((senderWallet.reax_balance ?? 0) <= 0) {
    throw new Error("Insufficient REAX balance ⭐ Fund your REAX")
  }



  // 2. Check receiver wallet exists




  // 3. Optimistic UI update
  onSuccess()



  try {

    // 4. Send REAX in database
    await sendReax(
      senderId,
      receiverId,
      1
    )


  } catch (error) {

    // 5. Rollback if database fails
    onRollback()

    throw error
  }

}