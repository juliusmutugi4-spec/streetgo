'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import LoginModal from '../../components/LoginModal'
import Viewer from '../../live/Viewer'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://streetgo-dating-engine.onrender.com'

interface LiveSession {
  live_id: string
  title: string
  description?: string | null
  host_id: string
  host_name: string
  location?: string | null
  status: string
  viewer_count: number
  created_at: string
  started_at?: string | null
  ended_at?: string | null
}

export default function PostPage() {
  const params = useParams()

  const rawId = params.id as string

  const isLiveRoute =
    rawId.startsWith('live-') ||
    rawId.startsWith('live_')

  const liveId = rawId.startsWith('live-')
    ? rawId.slice(5)
    : rawId

  const [user, setUser] = useState<any>(null)
  const [post, setPost] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  const [live, setLive] =
    useState<LiveSession | null>(null)

  const [comments, setComments] =
    useState<any[]>([])

  const [comment, setComment] =
    useState('')

  const [showComments, setShowComments] =
    useState(false)

  const [liked, setLiked] =
    useState(false)

  const [likesCount, setLikesCount] =
    useState(0)

  const [showLogin, setShowLogin] =
    useState(false)

  const [following, setFollowing] =
    useState(false)

  const [followersCount, setFollowersCount] =
    useState(0)

  const [loading, setLoading] =
    useState(true)
  // =========================================================
  // INITIALIZE
  // =========================================================

  useEffect(() => {
    let cancelled = false

    async function runInitialize() {
      try {
        setLoading(true)

        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (cancelled) return

        if (authError) {
          console.error("AUTH ERROR:", authError)
          setUser(null)
        } else {
          setUser(currentUser)
        }

        if (isLiveRoute) {
          await fetchLive(currentUser)
        } else {
          await fetchPost(currentUser)
        }

        if (!cancelled) {
          setLoading(false)
        }
      } catch (error) {
        if (cancelled) return

        console.error(
          "POST PAGE INITIALIZE ERROR:",
          error
        )

        setLoading(false)
      }
    }

    runInitialize()

    return () => {
      cancelled = true
    }
  }, [rawId, isLiveRoute, liveId])
  // =========================================================
  // FETCH LIVE SESSION
  // =========================================================

  async function fetchLive(currentUser: any) {
    try {
      const response = await fetch(
        `${API_URL}/live`,
        {
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        throw new Error(
          `Failed to load live sessions: ${response.status}`
        )
      }

      const result = await response.json()

      const sessions: LiveSession[] =
        result.live ?? []

      const foundLive =
        sessions.find(
          (session) =>
            session.live_id === liveId
        ) ?? null

      if (!foundLive) {
        console.error(
          'LIVE SESSION NOT FOUND:',
          liveId
        )

        setLive(null)
        return
      }

      setLive(foundLive)

      // -------------------------------------------------------
      // LIVE BROADCASTER PROFILE
      // -------------------------------------------------------

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select(
          'username, avatar_url'
        )
        .eq(
          'id',
          foundLive.host_id
        )
        .maybeSingle()

      if (profileError) {
        console.error(
          'LIVE PROFILE ERROR:',
          profileError
        )
      }

      setProfile(
        profileData || {
          username:
            foundLive.host_name ||
            'StreetGO User',
          avatar_url: null,
        }
      )

      // -------------------------------------------------------
      // LIVE FOLLOWERS
      // -------------------------------------------------------

      const {
        count: followers,
      } = await supabase
        .from('followers')
        .select('*', {
          count: 'exact',
          head: true,
        })
        .eq(
          'following_id',
          foundLive.host_id
        )

      setFollowersCount(
        followers || 0
      )

      // -------------------------------------------------------
      // FOLLOW STATE
      // -------------------------------------------------------

      if (currentUser) {
        const {
          data: existingFollow,
        } = await supabase
          .from('followers')
          .select('id')
          .eq(
            'follower_id',
            currentUser.id
          )
          .eq(
            'following_id',
            foundLive.host_id
          )
          .maybeSingle()

        setFollowing(
          !!existingFollow
        )
      }

      // -------------------------------------------------------
      // IMPORTANT:
      // DO NOT QUERY normal likes/comments using live_id.
      //
      // live_4ab329954037 is NOT a UUID post.id.
      // -------------------------------------------------------

      setLikesCount(0)
      setLiked(false)

      // -------------------------------------------------------
      // LIVE COMMENTS
      //
      // We intentionally leave the normal comments table
      // alone here because its post_id expects a UUID.
      // -------------------------------------------------------

      setComments([])
    } catch (error) {
      console.error(
        'LIVE FETCH ERROR:',
        error
      )

      setLive(null)
    }
  }

  // =========================================================
  // FETCH NORMAL POST
  // =========================================================

  async function fetchPost(
    currentUser: any
  ) {
    const {
      data,
      error,
    } = await supabase
      .from('posts')
      .select('*')
      .eq('id', rawId)
      .single()

    if (error) {
      console.error(
        'POST FETCH ERROR:',
        error
      )

      setPost(null)
      return
    }

    setPost(data)

    // -------------------------------------------------------
    // PROFILE
    // -------------------------------------------------------

    const {
      data: profileData,
    } = await supabase
      .from('profiles')
      .select(
        'username, avatar_url'
      )
      .eq(
        'id',
        data.user_id
      )
      .single()

    setProfile(
      profileData
    )

    // -------------------------------------------------------
    // LIKES
    // -------------------------------------------------------

    const {
      count,
    } = await supabase
      .from('likes')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq(
        'post_id',
        data.id
      )

    setLikesCount(
      count || 0
    )

    // -------------------------------------------------------
    // FOLLOWERS
    // -------------------------------------------------------

    const {
      count: followers,
    } = await supabase
      .from('followers')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq(
        'following_id',
        data.user_id
      )

    setFollowersCount(
      followers || 0
    )

    // -------------------------------------------------------
    // FOLLOW STATE
    // -------------------------------------------------------

    if (currentUser) {
      const {
        data: existingFollow,
      } = await supabase
        .from('followers')
        .select('id')
        .eq(
          'follower_id',
          currentUser.id
        )
        .eq(
          'following_id',
          data.user_id
        )
        .maybeSingle()

      setFollowing(
        !!existingFollow
      )
    }

    // -------------------------------------------------------
    // LIKE STATE
    // -------------------------------------------------------

    if (currentUser) {
      const {
        data: existingLike,
      } = await supabase
        .from('likes')
        .select('id')
        .eq(
          'post_id',
          data.id
        )
        .eq(
          'user_id',
          currentUser.id
        )
        .maybeSingle()

      setLiked(
        !!existingLike
      )
    }

    // -------------------------------------------------------
    // COMMENTS
    // -------------------------------------------------------

    const {
      data: commentsData,
    } = await supabase
      .from('comments')
      .select('*')
      .eq(
        'post_id',
        data.id
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      )

    setComments(
      commentsData || []
    )
  }

  // =========================================================
  // FOLLOW
  // =========================================================

  async function toggleFollow() {
    if (!user) {
      setShowLogin(true)
      return
    }

    const targetUserId =
      isLiveRoute
        ? live?.host_id
        : post?.user_id

    if (!targetUserId) {
      return
    }

    if (
      user.id === targetUserId
    ) {
      return
    }

    if (following) {
      await supabase
        .from('followers')
        .delete()
        .eq(
          'follower_id',
          user.id
        )
        .eq(
          'following_id',
          targetUserId
        )

      setFollowing(false)

      setFollowersCount(
        (count) =>
          Math.max(0, count - 1)
      )
    } else {
      await supabase
        .from('followers')
        .insert({
          follower_id:
            user.id,
          following_id:
            targetUserId,
        })

      setFollowing(true)

      setFollowersCount(
        (count) =>
          count + 1
      )
    }
  }

  // =========================================================
  // IGNITE
  //
  // NEVER USE NORMAL LIKES FOR LIVE.
  // =========================================================

  async function toggleLike() {
    if (isLiveRoute) {
      

      return
    }

    if (!user) {
      setShowLogin(true)
      return
    }

    if (!post) {
      return
    }

    if (liked) {
      const {
        error,
      } = await supabase
        .from('likes')
        .delete()
        .eq(
          'post_id',
          post.id
        )
        .eq(
          'user_id',
          user.id
        )

      if (error) {
        console.error(
          'LIKE DELETE ERROR:',
          error
        )

        return
      }

      setLiked(false)

      setLikesCount(
        (count) =>
          Math.max(0, count - 1)
      )
    } else {
      const {
        error,
      } = await supabase
        .from('likes')
        .insert({
          post_id:
            post.id,
          user_id:
            user.id,
        })

      if (error) {
        console.error(
          'LIKE INSERT ERROR:',
          error
        )

        return
      }

      setLiked(true)

      setLikesCount(
        (count) =>
          count + 1
      )
    }
  }

  // =========================================================
  // COMMENTS
  // =========================================================

  async function addComment() {
    if (!user) {
      setShowLogin(true)
      return
    }

    if (!comment.trim()) {
      return
    }

    // Normal post comments only for now.
    // LIVE comments need a live-specific table/API.
    if (isLiveRoute) {
      

      return
    }

    if (!post) {
      return
    }

    const {
      error,
    } = await supabase
      .from('comments')
      .insert({
        user_id:
          user.id,

        post_id:
          post.id,

        content:
          comment.trim(),

        username:
          profile?.username,
      })

    if (error) {
      console.error(
        'COMMENT ERROR:',
        error
      )

      return
    }

    setComment('')

    await fetchPost(user)
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    )
  }

  // =========================================================
  // LIVE NOT FOUND
  // =========================================================

  if (isLiveRoute && !live) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <div>
          <div className="mb-3 text-3xl">
            🔴
          </div>

          <h1 className="text-lg font-bold">
            Live session unavailable
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            This broadcast may have ended.
          </p>
        </div>
      </div>
    )
  }

  // =========================================================
  // NORMAL POST NOT FOUND
  // =========================================================

  if (!isLiveRoute && !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Post not found.
      </div>
    )
  }

  // =========================================================
  // UNIFIED DATA
  // =========================================================

  const displayUserId =
    isLiveRoute
      ? live?.host_id
      : post?.user_id

  const displayUsername =
    profile?.username ||
    (isLiveRoute
      ? live?.host_name
      : 'StreetGO User') ||
    'StreetGO User'

  const displayContent =
    isLiveRoute
      ? live?.description ||
        live?.title ||
        'StreetGO Live'
      : post?.content || ''

  const displayAvatar =
    profile?.avatar_url ||
    post?.avatar_url ||
    '/avatar-placeholder.png'

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05070b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">

          <button
            onClick={() => history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 transition-all duration-200 hover:border-cyan-400/50 hover:bg-cyan-500/10 active:scale-95"
            aria-label="Go back"
          >
            ←
          </button>

          <div className="text-center">
            <h1 className="text-xl font-black tracking-wide text-white">
              Street
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                GO
              </span>
            </h1>

            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              {isLiveRoute
                ? 'LIVE'
                : 'POST'}
            </p>
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-zinc-400 transition-all duration-200 hover:bg-white/[0.08] hover:text-white active:scale-95"
            aria-label="More options"
          >
            ⋮
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">

        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#05070b]/60 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl">

          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* PROFILE */}

          <div className="flex items-center justify-between border-b border-white/[0.03] p-5">

            <div className="flex items-center gap-3.5">

              <img
                src={displayAvatar}
                alt=""
                className="h-12 w-12 rounded-2xl border border-white/10 bg-zinc-900 object-cover shadow-md"
              />

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="text-base font-bold tracking-tight text-white">
                    {displayUsername}
                  </h2>

                  {isLiveRoute && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-red-400 border border-red-500/20">
                      LIVE
                    </span>
                  )}

                </div>

                <p className="mt-0.5 text-xs font-medium text-zinc-500">
                  @{displayUsername.toLowerCase()}
                </p>

                <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-zinc-500">

                  <span>
                    👥{' '}
                    {Number(
                      followersCount || 0
                    ).toLocaleString()}{' '}
                    Followers
                  </span>

                  <span>•</span>

                  <span>
                    {isLiveRoute
                      ? 'Live now'
                      : post?.created_at
                        ? new Date(
                            post.created_at
                          ).toLocaleString()
                        : 'Just now'}
                  </span>

                </div>
              </div>
            </div>

            <button
              onClick={toggleFollow}
              disabled={
                user?.id === displayUserId
              }
              className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide shadow-sm transition-all duration-200 active:scale-95 ${
                following
                  ? 'border border-white/5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-emerald-500 text-white shadow-emerald-950/20 hover:bg-emerald-400'
              } ${
                user?.id === displayUserId
                  ? 'cursor-not-allowed opacity-40'
                  : ''
              }`}
            >
              {user?.id === displayUserId
                ? 'You'
                : following
                  ? 'Following'
                  : 'Follow'}
            </button>

          </div>

          {/* CONTENT */}

          <div className="px-5 pt-5 pb-4">

            <p className="whitespace-pre-wrap text-[17px] font-normal leading-relaxed tracking-wide text-zinc-200">
              {displayContent}
            </p>

          </div>

          {/* =================================================
              LIVE VIDEO
              ================================================= */}

          {isLiveRoute && live && (
            <div className="px-5 pb-5">

              <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-black">

                <div className="absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white shadow-lg">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />

                  LIVE

                </div>

                <div className="absolute bottom-3 right-3 z-20 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                  👁 {live.viewer_count ?? 0}
                </div>

                <div className="aspect-video w-full">
                  <Viewer
                    liveId={live.live_id}
                  />
                </div>

              </div>

              {live.location && (
                <p className="mt-3 text-xs text-zinc-500">
                  📍 {live.location}
                </p>
              )}

            </div>
          )}

          {/* =================================================
              NORMAL IMAGE
              ================================================= */}

          {!isLiveRoute &&
            post?.image_url && (
              <div className="px-5 pb-4">
                <img
                  src={post.image_url}
                  alt="Uploaded content"
                  className="max-h-[450px] w-full rounded-2xl border border-white/5 object-cover"
                />
              </div>
            )}

          {/* =================================================
              NORMAL VIDEO
              ================================================= */}

          {!isLiveRoute &&
            post?.video_url && (
              <div className="px-5 pb-4">
                <video
                  src={post.video_url}
                  controls
                  playsInline
                  className="max-h-[450px] w-full rounded-2xl border border-white/5 bg-black"
                />
              </div>
            )}

          {/* =================================================
              FOOTER
              ================================================= */}

          <div className="flex items-center justify-between border-t border-white/[0.04] bg-white/[0.01] px-4 py-3 text-zinc-400">

            <div className="flex items-center gap-2">

              {/* IGNITE
                  ONLY NORMAL POSTS */}

              {!isLiveRoute && (
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
                >

                  <span
                    className={`text-xl transition-transform duration-200 ${
                      liked
                        ? 'scale-110'
                        : ''
                    }`}
                  >
                    {liked
                      ? '❤️'
                      : '🤍'}
                  </span>

                  <div className="text-left leading-none">

                    <p
                      className={`text-sm font-bold ${
                        liked
                          ? 'text-red-500'
                          : 'text-white'
                      }`}
                    >
                      {likesCount}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
                      Ignite
                    </p>

                  </div>

                </button>
              )}

              {/* LIVE VIEWERS */}

              {isLiveRoute && live && (
                <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">

                  <span className="text-xl">
                    👁
                  </span>

                  <div className="text-left leading-none">

                    <p className="text-sm font-bold text-white">
                      {live.viewer_count ?? 0}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
                      Viewers
                    </p>

                  </div>

                </div>
              )}

              {/* DISCUSS */}

              <button
                onClick={() =>
                  setShowComments(
                    !showComments
                  )
                }
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95 ${
                  showComments
                    ? 'border border-cyan-500/10 bg-cyan-500/10 text-cyan-400'
                    : 'border border-transparent hover:bg-cyan-500/5 hover:text-cyan-400'
                }`}
              >

                <span className="text-lg">
                  💬
                </span>

                <div className="text-left leading-none">

                  <p
                    className={`text-sm font-bold ${
                      showComments
                        ? 'text-cyan-400'
                        : 'text-white'
                    }`}
                  >
                    {comments?.length || 0}
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
                    Discuss
                  </p>

                </div>

              </button>

              {/* REAX
                  REMAINS AVAILABLE FOR LIVE */}

              {isLiveRoute && (
                <button
                  type="button"
                  onClick={() => {
                    

                    // Reax should use the existing
                    // broadcaster UUID.
                    //
                    // The existing feed Reax system
                    // should remain responsible for
                    // the actual wallet transfer.
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-amber-500/10 hover:text-amber-400 active:scale-95"
                >

                  <span className="text-lg">
                    ✨
                  </span>

                  <div className="text-left leading-none">

                    <p className="text-sm font-bold text-white">
                      Reax
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-zinc-500">
                      Support
                    </p>

                  </div>

                </button>
              )}

            </div>

            {/* DISPATCH */}

            <button
              onClick={() => {
                const dispatchTarget =
                  isLiveRoute
                    ? {
                        id: live?.live_id,
                        live_id:
                          live?.live_id,
                        user_id:
                          live?.host_id,
                        username:
                          displayUsername,
                        content:
                          displayContent,
                        is_live: true,
                      }
                    : post

                

                // Keep your existing dispatch
                // integration here.
              }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors duration-200 hover:bg-emerald-500/5 hover:text-emerald-400 active:scale-95"
            >
              <span>🔄</span>
              Dispatch
            </button>

          </div>

          {/* =================================================
              DISCUSSION
              ================================================= */}

          {showComments && (
            <div className="border-t border-white/[0.04] bg-[#020306]/40 p-5">

              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
                Discussion
              </h3>

              <div className="mb-5 flex gap-2">

                <input
                  value={comment}
                  onChange={(e) =>
                    setComment(
                      e.target.value
                    )
                  }
                  placeholder={
                    isLiveRoute
                      ? 'Discuss this live broadcast...'
                      : 'Write a community dispatch comment...'
                  }
                  className="flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none placeholder-zinc-600 transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                />

                <button
                  onClick={addComment}
                  className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-cyan-950/20 transition-colors duration-200 hover:bg-cyan-400 active:scale-95"
                >
                  Post
                </button>

              </div>

              {!comments ||
              comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/5 bg-zinc-950/20 py-6 text-center">
                  <p className="text-sm text-zinc-600">
                    {isLiveRoute
                      ? 'Live discussion is ready.'
                      : 'No telemetry comments yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {comments.map(
                    (c) => (
                      <div
                        key={c.id}
                        className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 shadow-sm"
                      >

                        <div className="flex items-center justify-between">

                          <p className="text-xs font-bold text-cyan-400">
                            @{c.username ||
                              'anonymous'}
                          </p>

                        </div>

                        <p className="mt-1.5 text-sm leading-relaxed text-zinc-300">
                          {c.content}
                        </p>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>
          )}

        </div>

      </main>

      {/* LOGIN */}

      {showLogin && (
        <LoginModal
          onClose={() =>
            setShowLogin(false)
          }
onLogin={() => {
  setShowLogin(false)

  // Reload the current page state after login
  window.location.reload()
}}
        />
      )}

    </div>
  )
}