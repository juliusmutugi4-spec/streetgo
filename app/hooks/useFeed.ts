import { useCallback, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSupabaseBrowser } from "../lib/supabase-browser"

export type PostType = {
  id: string
  content: string
  video_url?: string | null
  image_urls?: string[] | null
  thumbnail_url?: string | null
  is_for_sale?: boolean
  item_name?: string | null
  price?: number | null
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

type FeedCursor = {
  created_at: string
  id: string
}

const PAGE_SIZE = 20
const FEED_CACHE_KEY = "streetgo-feed-cache"

function getCachedPosts(): PostType[] {
  if (typeof window === "undefined") return []

  try {
    const cached = localStorage.getItem(FEED_CACHE_KEY)
    if (!cached) return []

    const parsed = JSON.parse(cached)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn("StreetGO offline feed cache could not be read:", error)
    return []
  }
}

function saveCachedPosts(posts: PostType[]) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(FEED_CACHE_KEY, JSON.stringify(posts))
  } catch (error) {
    console.warn("StreetGO offline feed cache could not be saved:", error)
  }
}

async function fetchPostsFromSupabase(
  cursor?: FeedCursor
): Promise<PostType[]> {
  if (typeof window !== "undefined" && !navigator.onLine) {
    return cursor ? [] : getCachedPosts().slice(0, PAGE_SIZE)
  }

  const supabase = getSupabaseBrowser()

  let query = supabase
    .from("posts")
    .select(`
      id,
      content,
      video_url,
      image_urls,
      thumbnail_url,
      is_for_sale,
      item_name,
      price,
      user_id,
      created_at
    `)

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
  }

  const {
    data: postsData,
    error: postsError,
  } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE)

  if (postsError) {
    if (cursor) throw postsError

    console.warn(
      "StreetGO could not reach the feed. Using cached posts.",
      postsError.message
    )

    return getCachedPosts().slice(0, PAGE_SIZE)
  }

  if (!postsData || postsData.length === 0) {
    return cursor ? [] : getCachedPosts().slice(0, PAGE_SIZE)
  }

  const userIds = [
    ...new Set(postsData.map((post: PostType) => post.user_id)),
  ]

  let profiles: Profile[] = []

  if (userIds.length > 0) {
    const {
      data,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds)

    if (profileError) {
      console.warn("StreetGO profile lookup failed:", profileError.message)
    }

    profiles = (data || []) as Profile[]
  }

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile])
  )

  const finalPosts: PostType[] = postsData.map((post: PostType) => ({
    ...post,
    username: profileMap.get(post.user_id)?.username ?? "Unknown",
    avatar_url: profileMap.get(post.user_id)?.avatar_url ?? null,
  }))

  if (!cursor) {
    saveCachedPosts(finalPosts)
  }

  return finalPosts
}

export function useFeed() {
  const queryClient = useQueryClient()

  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const loadingMoreRef = useRef(false)

  const {
    data: posts = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: () => fetchPostsFromSupabase(),

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,

    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    placeholderData: (previousData) => previousData,
  })

  const setPosts = (
    updater:
      | PostType[]
      | ((previous: PostType[]) => PostType[])
  ) => {
    queryClient.setQueryData<PostType[]>(["feed"], (old = []) => {
      const nextPosts =
        typeof updater === "function"
          ? updater(old)
          : updater

      saveCachedPosts(nextPosts)
      return nextPosts
    })
  }

  const loadMore = useCallback(async () => {
    if (
      loadingMoreRef.current ||
      !hasMore ||
      posts.length === 0
    ) {
      return
    }

    const lastPost = [...posts]
      .reverse()
      .find((post) => !("is_live" in post && post.is_live))

    if (!lastPost) {
      setHasMore(false)
      return
    }

    loadingMoreRef.current = true
    setLoadingMore(true)

    try {
      const nextPosts = await fetchPostsFromSupabase({
        created_at: lastPost.created_at,
        id: lastPost.id,
      })

      if (nextPosts.length === 0) {
        setHasMore(false)
        return
      }

      queryClient.setQueryData<PostType[]>(["feed"], (old = []) => {
        const existingIds = new Set(old.map((post) => post.id))
        const uniquePosts = nextPosts.filter(
          (post) => !existingIds.has(post.id)
        )
        const combined = [...old, ...uniquePosts]

        saveCachedPosts(combined)
        return combined
      })

      if (nextPosts.length < PAGE_SIZE) {
        setHasMore(false)
      }
    } catch (error) {
      console.warn("StreetGO could not load more posts:", error)
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [hasMore, posts, queryClient])

  const fetchPosts = async () => {
    const result = await refetch()

    if (result.data) {
      setHasMore(result.data.length >= PAGE_SIZE)
    }

    return result
  }

  return {
    posts,
    setPosts,
    loading: isLoading,
    fetchPosts,
    loadMore,
    hasMore,
    loadingMore,
  }
}

