import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../lib/supabase-browser"


export function useAuth() {

  const supabase = getSupabaseBrowser()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [unreadCount, setUnreadCount] = useState(0)


  const fetchUnreadMessages = async (userId: string) => {

    const { count, error } = await supabase
      .from("chat_messages")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("receiver_id", userId)


    if(error){
      
    }

    setUnreadCount(count || 0)
  }



  const loadProfile = async (userId: string) => {

    const { data, error } = await supabase
      .from("profiles")
      .select(`
        username,
        avatar_url,
        reputation,
        predictions_correct,
        predictions_wrong
      `)
      .eq("id", userId)
      .maybeSingle()


    if(error){
      
    }


    setProfile(data)

    await fetchUnreadMessages(userId)

  }



  const checkUser = async () => {

    const {
      data:{
        session
      }
    } = await supabase.auth.getSession()


    const currentUser = session?.user ?? null

    setUser(currentUser)


    if(!currentUser){

      setProfile(null)
      setUnreadCount(0)

      return
    }


    await loadProfile(currentUser.id)

  }



  const handleLogout = async () => {

    const { error } = await supabase.auth.signOut()


    if(error){
      
    }


    setUser(null)
    setProfile(null)
    setUnreadCount(0)

  }




  useEffect(()=>{


    checkUser()


 const {
  data:{
    subscription
  }
} = supabase.auth.onAuthStateChange(
  (_event: string, session: any)=>{


        const currentUser = session?.user ?? null


        setUser(currentUser)


        if(!currentUser){

          setProfile(null)
          setUnreadCount(0)

          return
        }


        loadProfile(currentUser.id)

      }
    )



    return ()=>{

      subscription.unsubscribe()

    }


  },[])



  return {

    user,
    profile,
    unreadCount,

    checkUser,
    handleLogout

  }

}