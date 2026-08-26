import { getSupabaseBrowser } from "../../../lib/supabase-browser"
import type { Driver } from "../types"
export async function approveDriver(driver: Driver) {

  const supabase = getSupabaseBrowser()

  const { error } = await supabase
    .from("drivers")
    .update({
      status: "approved"
    })
    .eq("id", driver.id)

  if (error) {
    
    return false
  }

  await supabase
    .from("driver_locations")
    .insert({
      driver_id: driver.id,
      latitude: 0,
      longitude: 0,
      online: false
    })

  return true
}

export async function rejectDriver(
  driverId: string
) {

  const supabase = getSupabaseBrowser()

  const { error } = await supabase
    .from("drivers")
    .update({
      status: "rejected"
    })
    .eq("id", driverId)

  if (error) {
    
    return false
  }

  return true
}