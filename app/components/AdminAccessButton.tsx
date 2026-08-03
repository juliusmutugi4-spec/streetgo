'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { getSupabaseBrowser } from "../lib/supabase-browser"


interface Props {
  userId: string
}


export default function AdminAccessButton({
  userId
}: Props) {

  const [role, setRole] = useState<string | null>(null)


  useEffect(() => {

    let mounted = true


    async function checkAdmin(){

      if(!userId) return


      const supabase = getSupabaseBrowser()


      // Get current logged in user
      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession()


      if(sessionError){

        console.log("SESSION ERROR:", sessionError)
        return

      }


      const user = sessionData.session?.user


      console.log("ADMIN CURRENT USER:", user)



      if(!user){

        console.log("NO LOGIN SESSION")
        return

      }



      // Check admin table
      const {
        data: adminData,
        error: adminError

      } = await supabase

        .from("admins")
        .select("role")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()



      console.log("ADMIN RESULT:", adminData)
      console.log("ADMIN ERROR:", adminError)



      if(adminData && mounted){

        setRole(adminData.role)

      }


    }



    checkAdmin()



    return () => {

      mounted = false

    }


  }, [userId])




  if(!role){

    return null

  }




  const adminLinks:any = {

    super_admin:{
      url:"/admin/control-center",
      text:"Control Center 👑"
    },


    driver_admin:{
      url:"/admin/drivers",
      text:"Driver Operations 🚗"
    },


    content_admin:{
      url:"/admin/videos",
      text:"Content Studio 🎬"
    },


    finance_admin:{
      url:"/admin/wallet",
      text:"Finance Center 💰"
    }

  }



  const admin = adminLinks[role]



  return (

    <Link

      href={admin?.url || "/admin"}

      className="
      inline-flex
      items-center
      gap-1.5
      rounded-md
      bg-neutral-900
      px-2
      py-1
      text-xs
      font-medium
      text-white
      transition
      hover:bg-neutral-800
      "

    >

      👑 {admin?.text || "Admin Panel"}

    </Link>

  )

}