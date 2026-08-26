import { getSupabaseBrowser } from "./supabase-browser"


export async function getCurrentUser(){

  const supabase = getSupabaseBrowser()


  const {
    data:{
      session
    }
  } = await supabase.auth.getSession()


  if(!session?.user){

    

    return null

  }


  return session.user

}