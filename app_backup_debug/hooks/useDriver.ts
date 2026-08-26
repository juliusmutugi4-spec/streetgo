import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useDriver(user: any) {
  const [isApprovedDriver, setIsApprovedDriver] = useState(false)
  const [driverOnline, setDriverOnline] = useState(false)
  const [pendingRideCount, setPendingRideCount] = useState(0)


const loadDriver = async () => {
  console.log("Loading driver for:", user)

  if (!user) {
    console.log("No user yet")
    return
  }

  const { data: driver, error } = await supabase
    .from("drivers")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle()

  console.log("Driver:", driver)
  console.log("Driver Error:", error)

  if (!driver) {
    setIsApprovedDriver(false)
    setDriverOnline(false)
    return
  }

  setIsApprovedDriver(driver.status === "approved")

  if (driver.status === "approved") {
    const { data: location } = await supabase
      .from("driver_locations")
      .select("online")
      .eq("driver_id", driver.id)
      .maybeSingle()

    console.log("Location:", location)

    setDriverOnline(location?.online ?? false)
  }
}
const toggleDriverOnline = async () => {
  const newStatus = !driverOnline

  setDriverOnline(newStatus)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) return

  const { data: driver } = await supabase
    .from("drivers")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (!driver) return

  await supabase
    .from("driver_locations")
    .update({
      online: newStatus,
    })
    .eq("driver_id", driver.id)
}



  const loadPendingRideCount = async () => {
    const { count } = await supabase
      .from("ride_requests")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "searching")

    setPendingRideCount(count || 0)
  }

useEffect(() => {
  if (user) {
    loadDriver()
  }

  loadPendingRideCount()

  const channel = supabase
    .channel("ride-count")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "ride_requests",
      },
      () => {
        loadPendingRideCount()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user])

useEffect(() => {
  const channel = supabase
    .channel("driver-approval")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "drivers",
      },
      async () => {
        await loadDriver()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [user])


return {
  isApprovedDriver,
  setIsApprovedDriver,

  driverOnline,
  setDriverOnline,

  pendingRideCount,
  setPendingRideCount,

  loadPendingRideCount,
  loadDriver,
  toggleDriverOnline,
}
}