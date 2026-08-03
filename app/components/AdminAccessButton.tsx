'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "../lib/supabase"

interface Props {
  userId: string
}

export default function AdminAccessButton({
  userId
}: Props) {

  const [role, setRole] = useState<string | null>(null)


  useEffect(() => {

    async function checkAdmin(){

      const { data, error } = await supabase
        .from("admins")
        .select("role")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle()


      if(error){
        console.log(error)
        return
      }


      if(data){
        setRole(data.role)
      }

    }


    checkAdmin()

  }, [userId])


  if(!role){
    return null
  }


  const adminLinks:any = {

    super_admin: {
      url: "/admin/control-center",
      text: "Control Center 👑"
    },

    driver_admin: {
      url: "/admin/drivers",
      text: "Driver Operations 🚗"
    },

    content_admin: {
      url: "/admin/videos",
      text: "Content Studio 🎬"
    },

    finance_admin: {
      url: "/admin/wallet",
      text: "Finance Center 💰"
    }

  }


  const admin = adminLinks[role]


  return (

    <Link
      href={admin?.url || "/admin"}
      className="
      inline-flex
      items-center
      gap-2
      mt-3
      px-4
      py-2
      rounded-xl
      bg-yellow-500
      text-black
      font-bold
      text-sm
      hover:bg-yellow-400
      transition
      "
    >

      👑 {admin?.text || "Admin Panel"}

    </Link>

  )
}