import { getSupabaseBrowser } from "./supabase-browser"


export async function getCurrentUser(){

  const supabase = getSupabaseBrowser()


  const {
    data:{
      session
    }
  } = await supabase.auth.getSession()


  if(!session?.user){

    console.log("NO CURRENT SESSION")

    return null

  }


  return session.user

}