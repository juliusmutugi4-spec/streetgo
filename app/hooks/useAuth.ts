import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadMessages = async (userId: string) => {
    const { count } = await supabase
      .from("chat_messages")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("receiver_id", userId)

    setUnreadCount(count || 0)
  }

  const checkUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setUser(session?.user ?? null)

    if (!session?.user) {
      setProfile(null)
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select(`
        username,
        avatar_url,
        reputation,
        predictions_correct,
        predictions_wrong
      `)
      .eq("id", session.user.id)
      .single()

    setProfile(data)

    await fetchUnreadMessages(session.user.id)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setUnreadCount(0)
  }

useEffect(() => {
  checkUser()

  const { data: sub } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      setUser(session?.user ?? null)

      if (!session?.user) {
        setProfile(null)
        setUnreadCount(0)
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select(`
          username,
          avatar_url,
          reputation,
          predictions_correct,
          predictions_wrong
        `)
        .eq("id", session.user.id)
        .single()

      setProfile(data)

      await fetchUnreadMessages(session.user.id)
    }
  )

  return () => {
    sub.subscription.unsubscribe()
  }
}, [])



  return {
    user,
    profile,
    unreadCount,
    setUser,
    setProfile,
    setUnreadCount,
    checkUser,
    fetchUnreadMessages,
    handleLogout,
  }
}