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

const FEED_CACHE_KEY = "streetgo-feed-cache"

function getCachedPosts(): PostType[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const cached = localStorage.getItem(FEED_CACHE_KEY)

    if (!cached) {
      return []
    }

    const parsed = JSON.parse(cached)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
  } catch (error) {
    console.warn(
      "StreetGO offline feed cache could not be read:",
      error
    )

    return []
  }
}

function saveCachedPosts(posts: PostType[]) {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(
      FEED_CACHE_KEY,
      JSON.stringify(posts)
    )
  } catch (error) {
    console.warn(
      "StreetGO offline feed cache could not be saved:",
      error
    )
  }
}

async function fetchPostsFromSupabase(): Promise<PostType[]> {
  /*
   * If the device is offline, immediately use the
   * last successful StreetGO feed.
   */
  if (
    typeof window !== "undefined" &&
    !navigator.onLine
  ) {
    return getCachedPosts()
  }

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
  thumbnail_url,
  user_id,
  created_at
`)
    .order("created_at", {
      ascending: false,
    })

  /*
   * Internet/Supabase failed.
   *
   * Do NOT throw an error that destroys the feed.
   * Use the last successful feed instead.
   */
  if (postsError) {
    console.warn(
      "StreetGO could not reach the feed. Using cached posts.",
      postsError.message
    )

    return getCachedPosts()
  }

  if (!postsData || postsData.length === 0) {
    return getCachedPosts()
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
   * Profiles are supplementary.
   * If profiles fail, keep the posts.
   */
  void profileError

  const profileMap = new Map<string, Profile>(
    (profiles || []).map(
      (profile: Profile) => [
        profile.id,
        profile,
      ]
    )
  )

  const finalPosts = postsData.map(
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

  /*
   * Save the successful feed locally.
   * This is what allows StreetGO to show the
   * feed again when the device is offline.
   */
  saveCachedPosts(finalPosts)

  return finalPosts
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

    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: false,

    /*
     * Allow React Query to refresh the feed
     * when the connection comes back.
     */
    refetchOnReconnect: true,

    /*
     * Keep the previous feed visible while
     * a fresh online request is happening.
     */
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
        const nextPosts =
          typeof updater === "function"
            ? updater(old)
            : updater

        /*
         * Keep the local offline copy updated
         * whenever the feed changes.
         */
        saveCachedPosts(nextPosts)

        return nextPosts
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