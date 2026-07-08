import { useQuery, useQueryClient } from "@tanstack/react-query"
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

async function fetchPostsFromSupabase(): Promise<PostType[]> {
  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (postsError) {
    throw postsError
  }

  const userIds = postsData?.map((p: any) => p.user_id) ?? []

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", userIds)

  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id, p])
  )

  return (
    postsData?.map((post: any) => ({
      ...post,
      username: profileMap.get(post.user_id)?.username,
      avatar_url: profileMap.get(post.user_id)?.avatar_url,
    })) ?? []
  )
}

export function useFeed() {
  const queryClient = useQueryClient()

  const {
    data: posts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: fetchPostsFromSupabase,
  })

  const setPosts = (
    updater:
      | PostType[]
      | ((previous: PostType[]) => PostType[])
  ) => {
    queryClient.setQueryData<PostType[]>(
      ["feed"],
      (old = []) =>
        typeof updater === "function"
          ? updater(old)
          : updater
    )
  }

  return {
    posts,
    setPosts,
    loading: isLoading,
    fetchPosts: refetch,
  }
}