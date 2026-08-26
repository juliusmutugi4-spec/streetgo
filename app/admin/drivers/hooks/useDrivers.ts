import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"
import type { Driver } from "../types"
export default function useDrivers(
  filter: "pending" | "approved" | "rejected"
){

  const supabase = getSupabaseBrowser()

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading,setLoading] = useState(true)

  const [approvedCount,setApprovedCount] = useState(0)
  const [pendingCount,setPendingCount] = useState(0)
  const [rejectedCount,setRejectedCount] = useState(0)


  async function loadDrivers(){

    setLoading(true)

  const {
  data,
  error,
} = await supabase
  .from("drivers")
  .select("*")
  .eq("status", filter)
  .order("created_at", {
    ascending: false,
  })

const typedDrivers = (data ?? []) as Driver[]


    if(error){

      

      setLoading(false)

      return

    }


    const driversWithUrls =
    await Promise.all(

      typedDrivers.map(async (driver) => {

        const { data:license } =
        await supabase.storage
        .from("driver-license")
        .createSignedUrl(
          driver.license_url,
          3600
        )

        const { data:front } =
        await supabase.storage
        .from("driver-id")
        .createSignedUrl(
          driver.id_front_url,
          3600
        )

        const { data:back } =
        await supabase.storage
        .from("driver-id")
        .createSignedUrl(
          driver.id_back_url,
          3600
        )

        const { data:vehicle } =
        await supabase.storage
        .from("driver-vehicle")
        .createSignedUrl(
          driver.vehicle_photo_url,
          3600
        )
return {
  ...driver,

  license_url: license?.signedUrl || undefined,

  id_front_url: front?.signedUrl || undefined,

  id_back_url: back?.signedUrl || undefined,

  vehicle_photo_url: vehicle?.signedUrl || undefined,
} as Driver
      })

    )


    setDrivers(driversWithUrls)


    const [
      pending,
      approved,
      rejected
    ] = await Promise.all([

      supabase
      .from("drivers")
      .select("*",{
        count:"exact",
        head:true
      })
      .eq("status","pending"),

      supabase
      .from("drivers")
      .select("*",{
        count:"exact",
        head:true
      })
      .eq("status","approved"),

      supabase
      .from("drivers")
      .select("*",{
        count:"exact",
        head:true
      })
      .eq("status","rejected")

    ])


    setPendingCount(
      pending.count || 0
    )

    setApprovedCount(
      approved.count || 0
    )

    setRejectedCount(
      rejected.count || 0
    )

    setLoading(false)

  }


  useEffect(()=>{

    loadDrivers()

  },[filter])


  return{

    drivers,
    setDrivers,

    loading,

    loadDrivers,

    pendingCount,
    approvedCount,
    rejectedCount

  }

}