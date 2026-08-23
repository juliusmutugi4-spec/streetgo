import { supabase } from "./supabase"

let userPromise:
  | ReturnType<typeof supabase.auth.getUser>
  | null = null

export async function getCurrentUser() {
  if (!userPromise) {
    userPromise = supabase.auth
      .getUser()
      .finally(() => {
        userPromise = null
      })
  }

  return userPromise
}