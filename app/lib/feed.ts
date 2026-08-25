import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getSupabaseBrowser } from "../lib/supabase-browser"

const LIMIT = 10

// ============================================================
// TYPES
// ============================================================

export type PostType = {
  id: string
  content: string
  video_url?: string | null
  image_urls?: string[] | null
  user_id: string
  created_at: string

  username?: string
  avatar_url?: string | null

  // Live fields
  live_id?: string | null
  is_live?: boolean
  viewer_count?: number
}

type Profile = {
  id: string
  username: string
  avatar_url: string | null
}

type LiveSession = {
  live_id: string
  title?: string
  description?: string
  host_id?: string
  host_name?: string
  location?: string
  status?: string
  viewer_count?: number
  created_at?: string
  started_at?: string | null
  ended_at?: string | null
}

type LiveResponse = {
  success?: boolean
  count?: number
  live?: LiveSession[]
}

// ============================================================
// LIVE API URL
// ============================================================

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000"

// ============================================================
// GET CURRENT LIVE SESSIONS
// ============================================================

async function fetchActiveLiveSessions(): Promise<
  Map<string, LiveSession>
> {
  try {
    const response = await fetch(
      `${API_URL}/live`,
      {
        method: "GET",
        cache: "no-store",
      }
    )

    if (!response.ok) {
      console.error(
        "STREETGO LIVE API ERROR:",
        response.status,
        response.statusText
      )

      return new Map()
    }

    const data: LiveResponse =
      await response.json()

    const sessions =
      Array.isArray(data.live)
        ? data.live
        : []

    // --------------------------------------------------------
    // ONLY CURRENTLY LIVE SESSIONS
    // --------------------------------------------------------

    const activeSessions =
      sessions.filter(
        (session) =>
          !!session?.live_id &&
          session?.status === "live"
      )

    console.log(
      "STREETGO ACTIVE LIVE SESSIONS:",
      activeSessions
    )

    return new Map(
      activeSessions.map(
        (session) => [
          session.live_id,
          session,
        ]
      )
    )
  } catch (error) {
    console.error(
      "STREETGO LIVE SESSION CHECK FAILED:",
      error
    )

    // IMPORTANT:
    // If the live engine cannot be reached,
    // do NOT show stale live posts.
    return new Map()
  }
}

// ============================================================
// FETCH POSTS
// ============================================================

async function fetchPostsFromSupabase(
  cursor: string | null = null
): Promise<PostType[]> {
  const supabase =
    getSupabaseBrowser()

  // ----------------------------------------------------------
  // FETCH POSTS
  // ----------------------------------------------------------

  let query = supabase
    .from("posts")
    .select(`
      id,
      content,
      video_url,
      image_urls,
      user_id,
      created_at,
      live_id,
      is_live
    `)
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(LIMIT)

  if (cursor) {
    query = query.lt(
      "created_at",
      cursor
    )
  }

  const {
    data: postsData,
    error: postsError,
  } = await query

  if (postsError) {
    console.error(
      "POST ERROR:",
      postsError
    )

    throw postsError
  }

  if (
    !postsData ||
    postsData.length === 0
  ) {
    return []
  }

  // ----------------------------------------------------------
  // CHECK CURRENT LIVE SESSIONS FIRST
  // ----------------------------------------------------------

  const hasLivePosts =
    postsData.some(
      (post: any) =>
        !!post?.live_id
    )

  let activeLiveSessions =
    new Map<string, LiveSession>()

  if (hasLivePosts) {
    activeLiveSessions =
      await fetchActiveLiveSessions()
  }

  // ----------------------------------------------------------
  // GET USER IDS
  // ----------------------------------------------------------

  const postUserIds = postsData
    .map(
      (post: any) =>
        post.user_id
    )
    .filter(Boolean)

  // ----------------------------------------------------------
  // GET LIVE HOST IDS
  //
  // IMPORTANT:
  // A live post may have a different user_id
  // from the actual broadcaster.
  //
  // Therefore we ALSO fetch profiles for
  // liveSession.host_id.
  // ----------------------------------------------------------

  const liveHostIds = Array.from(
    activeLiveSessions.values()
  )
    .map(
      (session) =>
        session.host_id
    )
    .filter(Boolean) as string[]

  const userIds = [
    ...new Set([
      ...postUserIds,
      ...liveHostIds,
    ]),
  ]

  // ----------------------------------------------------------
  // FETCH PROFILES
  // ----------------------------------------------------------

  let profiles: Profile[] = []

  if (userIds.length > 0) {
    const {
      data,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        avatar_url
      `)
      .in(
        "id",
        userIds
      )

    if (profileError) {
      console.error(
        "PROFILE ERROR:",
        profileError
      )
    }

    profiles = data || []
  }

  // ----------------------------------------------------------
  // PROFILE MAP
  // ----------------------------------------------------------

  const profileMap =
    new Map<string, Profile>(
      profiles.map(
        (profile: Profile) => [
          profile.id,
          profile,
        ]
      )
    )

  // ----------------------------------------------------------
  // BUILD FINAL FEED
  // ----------------------------------------------------------

  const finalPosts: PostType[] = []

  for (const post of postsData as any[]) {
    // ========================================================
    // NORMAL POST
    // ========================================================

    if (!post?.live_id) {
      const profile =
        profileMap.get(
          post.user_id
        )

      const username =
        profile?.username ??
        "Unknown"

      const avatar_url =
        profile?.avatar_url ??
        null

      finalPosts.push({
        ...post,

        username,
        avatar_url,

        is_live: false,
        viewer_count: 0,
      })

      continue
    }

    // ========================================================
    // LIVE POST
    // ========================================================

    const liveSession =
      activeLiveSessions.get(
        post.live_id
      )

    // --------------------------------------------------------
    // DEAD / ENDED LIVE
    // --------------------------------------------------------
    //
    // If the Python live engine does not report
    // this live_id as currently live, completely
    // remove the post from the feed.
    // --------------------------------------------------------

    if (!liveSession) {
      console.log(
        "STREETGO HIDING ENDED LIVE:",
        {
          postId: post.id,
          liveId: post.live_id,
        }
      )

      continue
    }

    // --------------------------------------------------------
    // REAL BROADCASTER
    // --------------------------------------------------------
    //
    // THIS IS THE IMPORTANT FIX.
    //
    // Never use post.user_id for the broadcaster
    // when the post represents a live session.
    //
    // Use:
    //
    // liveSession.host_id
    //        ↓
    // profiles
    //
    // --------------------------------------------------------

    const broadcasterProfile =
      liveSession.host_id
        ? profileMap.get(
            liveSession.host_id
          )
        : undefined

    const broadcasterUsername =
      broadcasterProfile?.username ??
      liveSession.host_name ??
      "Unknown"

    const broadcasterAvatar =
      broadcasterProfile?.avatar_url ??
      null

    // --------------------------------------------------------
    // CURRENTLY LIVE
    // --------------------------------------------------------

    finalPosts.push({
      ...post,

      // REAL BROADCASTER ID
      user_id:
        liveSession.host_id ??
        post.user_id,

      // REAL BROADCASTER USERNAME
      username:
        broadcasterUsername,

      // REAL BROADCASTER AVATAR
      avatar_url:
        broadcasterAvatar,

      // LIVE STATE
      is_live: true,

      // LIVE VIEWERS
      viewer_count:
        liveSession.viewer_count ??
        0,
    })

    console.log(
      "STREETGO CURRENT LIVE:",
      {
        liveId:
          liveSession.live_id,

        hostId:
          liveSession.host_id,

        username:
          broadcasterUsername,

        viewerCount:
          liveSession.viewer_count ??
          0,
      }
    )
  }

  // ----------------------------------------------------------
  // DEBUG
  // ----------------------------------------------------------

  console.log(
    "STREETGO FEED:",
    {
      fetched:
        postsData.length,

      returned:
        finalPosts.length,

      live:
        finalPosts.filter(
          (post) =>
            post.is_live === true
        ).length,
    }
  )

  return finalPosts
}

// ============================================================
// REACT QUERY FEED
// ============================================================

export function useFeed() {
  const queryClient =
    useQueryClient()

  const {
    data: posts = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "feed",
    ],

    queryFn: () =>
      fetchPostsFromSupabase(),

    // --------------------------------------------------------
    // Refresh live status every 15 seconds.
    // --------------------------------------------------------

    refetchInterval:
      1000 * 15,

    staleTime:
      1000 * 10,

    gcTime:
      1000 * 60 * 30,

    refetchOnWindowFocus:
      true,

    refetchOnReconnect:
      true,

    placeholderData:
      (
        previousData
      ) =>
        previousData,
  })

  // ==========================================================
  // SET POSTS
  // ==========================================================

  const setPosts = (
    updater:
      | PostType[]
      | ((
          previous: PostType[]
        ) => PostType[])
  ) => {
    queryClient.setQueryData<
      PostType[]
    >(
      [
        "feed",
      ],
      (
        old = []
      ) => {
        if (
          typeof updater ===
          "function"
        ) {
          return updater(
            old
          )
        }

        return updater
      }
    )
  }

  // ==========================================================
  // RETURN
  // ==========================================================

  return {
    posts,

    setPosts,

    loading:
      isLoading,

    fetching:
      isFetching,

    fetchPosts:
      refetch,
  }
}