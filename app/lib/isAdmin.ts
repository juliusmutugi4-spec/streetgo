import { supabase } from "./supabase"

export async function checkAdmin(userId: string) {
  const { data, error } = await supabase
    .from("admins")
    .select("role, permissions, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  if (error || !data) {
    return null
  }

  return data
}