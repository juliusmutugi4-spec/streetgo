import { useState } from "react"
import { supabase } from "../lib/supabase"

export type PostType = {
  id: string
  content: string
  video_url?: string | null
  user_id: string
  created_at: string
  username?: string
  avatar_url?: string | null
}

export function useFeed() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    if (posts.length === 0) {
      setLoading(true)
    }

    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

 if (postsError) {
  console.log("Posts Error:", JSON.stringify(postsError, null, 2))
  console.log(postsError)
  return
}
    const userIds = postsData?.map((p: any) => p.user_id) ?? []

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds)

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.id, p])
    )

    const postsWithProfiles =
      postsData?.map((post: any) => ({
        ...post,
        username: profileMap.get(post.user_id)?.username,
        avatar_url: profileMap.get(post.user_id)?.avatar_url,
      })) ?? []

    setPosts(postsWithProfiles)
    setLoading(false)
  }

  return {
    posts,
    setPosts,
    loading,
    fetchPosts,
  }
}