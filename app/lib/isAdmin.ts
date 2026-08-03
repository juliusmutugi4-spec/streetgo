import { getSupabaseBrowser } from "./supabase-browser"


export async function checkAdmin(userId: string) {

  const supabase = getSupabaseBrowser()


  const {
    data,
    error
  } = await supabase
    .from("admins")
    .select("role, permissions, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle()


  if(error){

    console.log("CHECK ADMIN ERROR:", error)
    return null

  }


  return data

}