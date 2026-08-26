import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSupabaseBrowser } from "../lib/supabase-browser"

export type PostType = {
  id: string
  content: string
  video_url?: string | null
  image_urls?: string[] | null
  user_id: string
  created_at: string
  username?: string
  avatar_url?: string | null
}

type Profile = {
  id: string
  username: string
  avatar_url: string | null
}

async function fetchPostsFromSupabase(): Promise<PostType[]> {
  const supabase = getSupabaseBrowser()

  const {
    data: postsData,
    error: postsError,
  } = await supabase
    .from("posts")
    .select(`
      id,
      content,
      video_url,
      image_urls,
      user_id,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    })

  if (postsError) {
    throw new Error(
      [
        "Failed to load posts.",
        postsError.message
          ? `Message: ${postsError.message}`
          : "",
        postsError.code
          ? `Code: ${postsError.code}`
          : "",
        postsError.details
          ? `Details: ${postsError.details}`
          : "",
        postsError.hint
          ? `Hint: ${postsError.hint}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
    )
  }

  if (!postsData || postsData.length === 0) {
    return []
  }

  const userIds = [
    ...new Set(
      postsData.map(
        (post: PostType) => post.user_id
      )
    ),
  ]

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      username,
      avatar_url
    `)
    .in("id", userIds)

  /*
   * Profiles are supplementary data.
   * If the profile query fails, posts should still load.
   */
  const profileMap = new Map<string, Profile>(
    (profiles || []).map(
      (profile: Profile) => [
        profile.id,
        profile,
      ]
    )
  )

  /*
   * Prevent an unused-variable warning while
   * intentionally allowing posts to continue loading.
   */
  void profileError

  return postsData.map(
    (post: PostType): PostType => ({
      ...post,

      username:
        profileMap.get(post.user_id)
          ?.username ??
        "Unknown",

      avatar_url:
        profileMap.get(post.user_id)
          ?.avatar_url ??
        null,
    })
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

    staleTime: 1000 * 60 * 5,

    gcTime: 1000 * 60 * 30,

    refetchOnWindowFocus: false,

    refetchOnReconnect: false,

    placeholderData: (
      previousData
    ) => previousData,
  })

  const setPosts = (
    updater:
      | PostType[]
      | ((
          previous: PostType[]
        ) => PostType[])
  ) => {
    queryClient.setQueryData<PostType[]>(
      ["feed"],
      (old = []) => {
        if (typeof updater === "function") {
          return updater(old)
        }

        return updater
      }
    )
  }

  return {
    posts,
    setPosts,
    loading: isLoading,
    fetchPosts: refetch,
  }
}