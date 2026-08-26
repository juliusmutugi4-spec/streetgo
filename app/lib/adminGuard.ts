import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"


export async function getAdminRole(){

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies:{
        getAll(){
          return cookieStore.getAll()
        },
        setAll(cookiesToSet){
          try{
            cookiesToSet.forEach(({name,value,options}) =>
              cookieStore.set(name,value,options)
            )
          }catch{}
        }
      }
    }
  )


  const {
    data:{
      user
    }
  } = await supabase.auth.getUser()


  if(!user){
    
    return null
  }


  const { data, error } = await supabase
    .from("admins")
    .select("role, permissions")
    .eq("user_id", user.id)
    .eq("status","active")
    .maybeSingle()


  if(error){
    
    return null
  }


  

  return data

}



export function hasPermission(
  admin:any,
  permission:string
){

  if(!admin) return false


  if(admin.role === "super_admin"){
    return true
  }


  return admin.permissions?.[permission] === true

}