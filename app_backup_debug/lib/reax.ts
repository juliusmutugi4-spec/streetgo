import { supabase } from "./supabase"

export async function sendReax(
  senderId: string,
  receiverId: string,
  amount: number = 1
) {

  const { error } = await supabase.rpc("send_reax", {
    sender: senderId,
    receiver: receiverId,
    amount,
  })


  if (error) {
    console.error("REAX ERROR:", error.message)
    throw error
  }


  return true
}