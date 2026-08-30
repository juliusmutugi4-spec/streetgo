'use client'

import {
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
  Check,
  Loader2,
  Search,
  Sparkles,
  UserPlus,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import { supabase } from '../lib/supabase'
import { sendReax } from '../lib/reax'

interface ProfileResult {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  followers_count: number
}

interface FollowerRow {
  following_id: string | null
}

export default function SearchPage() {
  const router = useRouter()

  const [query, setQuery] =
    useState('')

  const [results, setResults] =
    useState<ProfileResult[]>([])

  const [followingIds, setFollowingIds] =
    useState<Set<string>>(
      new Set()
    )

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [searched, setSearched] =
    useState(false)

  const [followLoadingIds, setFollowLoadingIds] =
    useState<Set<string>>(
      new Set()
    )

  const [reaxLoadingIds, setReaxLoadingIds] =
    useState<Set<string>>(
      new Set()
    )

  /*
   * =====================================================
   * LOAD CURRENT USER + FOLLOWING
   * =====================================================
   */

  useEffect(() => {
    let mounted = true

    const loadCurrentUser =
      async () => {
        try {
          const {
            data,
            error,
          } =
            await supabase.auth.getSession()

          if (error) {
            console.error(
              'SEARCH SESSION ERROR:',
              error
            )

            return
          }

          const user =
            data.session?.user ?? null

          if (!mounted) {
            return
          }

          setCurrentUserId(
            user?.id ?? null
          )

          if (!user?.id) {
            setFollowingIds(
              new Set()
            )

            return
          }

          const {
            data: follows,
            error: followsError,
          } = await supabase
            .from('followers')
            .select('following_id')
            .eq(
              'follower_id',
              user.id
            )

          if (followsError) {
            console.error(
              'FOLLOWING LOAD ERROR:',
              {
                message:
                  followsError.message,
                code:
                  followsError.code,
                details:
                  followsError.details,
                hint:
                  followsError.hint,
              }
            )

            return
          }

          if (!mounted) {
            return
          }

          setFollowingIds(
            new Set(
              (follows || [])
                .map(
                  (
                    row: FollowerRow
                  ) =>
                    row.following_id
                )
                .filter(
                  (
                    id: string | null
                  ): id is string =>
                    Boolean(id)
                )
            )
          )
        } catch (error) {
          console.error(
            'SEARCH AUTH LOAD FAILED:',
            error
          )
        }
      }

    void loadCurrentUser()

    return () => {
      mounted = false
    }
  }, [])

  /*
   * =====================================================
   * SEARCH
   * =====================================================
   */

  useEffect(() => {
    const value =
      query.trim()

    if (!value) {
      setResults([])
      setSearched(false)
      setLoading(false)

      return
    }

    const timer =
      window.setTimeout(() => {
        void searchProfiles(value)
      }, 300)

    return () => {
      window.clearTimeout(
        timer
      )
    }
  }, [query])

  const searchProfiles =
    async (
      value: string
    ) => {
      setLoading(true)
      setSearched(true)

      try {
        const {
          data,
          error,
        } = await supabase
          .from('profiles')
          .select(
            'id, username, avatar_url, bio'
          )
          .ilike(
            'username',
            `%${value}%`
          )
          .order(
            'username',
            {
              ascending: true,
            }
          )
          .limit(20)

        if (error) {
          console.error(
            'SEARCH ERROR:',
            {
              message:
                error.message,
              code:
                error.code,
              details:
                error.details,
              hint:
                error.hint,
            }
          )

          setResults([])

          return
        }

        /*
         * Load follower counts for
         * all returned profiles.
         */
const profiles: ProfileResult[] =
  data || []

const enrichedResults =
  await Promise.all(
    profiles.map(
      async (
        profile: ProfileResult
      ) => {
        const {
          count,
          error:
            countError,
        } = await supabase
          .from('followers')
          .select(
            'id',
            {
              count: 'exact',
              head: true,
            }
          )
          .eq(
            'following_id',
            profile.id
          )

        if (countError) {
          console.error(
            'FOLLOWER COUNT ERROR:',
            {
              userId:
                profile.id,
              message:
                countError.message,
              code:
                countError.code,
            }
          )
        }

        return {
          ...profile,
          followers_count:
            count || 0,
        }
      }
    )
  )

setResults(
  enrichedResults
)
      } catch (error) {
        console.error(
          'SEARCH FAILED:',
          error
        )

        setResults([])
      } finally {
        setLoading(false)
      }
    }

  /*
   * =====================================================
   * FOLLOW / UNFOLLOW
   * =====================================================
   */

  const toggleFollow =
    async (
      targetUserId: string
    ) => {
      if (!currentUserId) {
        return
      }

      if (
        currentUserId ===
        targetUserId
      ) {
        return
      }

      const isFollowing =
        followingIds.has(
          targetUserId
        )

      setFollowLoadingIds(
        (previous) => {
          const next =
            new Set(previous)

          next.add(
            targetUserId
          )

          return next
        }
      )

      try {
        /*
         * UNFOLLOW
         */

        if (isFollowing) {
          const {
            error,
          } =
            await supabase
              .from(
                'followers'
              )
              .delete()
              .eq(
                'follower_id',
                currentUserId
              )
              .eq(
                'following_id',
                targetUserId
              )

          if (error) {
            console.error(
              'UNFOLLOW ERROR:',
              {
                message:
                  error.message,
                code:
                  error.code,
                details:
                  error.details,
                hint:
                  error.hint,
              }
            )

            return
          }

          setFollowingIds(
            (previous) => {
              const next =
                new Set(
                  previous
                )

              next.delete(
                targetUserId
              )

              return next
            }
          )

          setResults(
            (previous) =>
              previous.map(
                (profile) =>
                  profile.id ===
                  targetUserId
                    ? {
                        ...profile,
                        followers_count:
                          Math.max(
                            0,
                            profile.followers_count -
                              1
                          ),
                      }
                    : profile
              )
          )

          return
        }

        /*
         * FOLLOW
         */

        const {
          error,
        } =
          await supabase
            .from('followers')
            .insert({
              follower_id:
                currentUserId,
              following_id:
                targetUserId,
            })

        if (error) {
          console.error(
            'FOLLOW ERROR:',
            {
              message:
                error.message,
              code:
                error.code,
              details:
                error.details,
              hint:
                error.hint,
            }
          )

          return
        }

        setFollowingIds(
          (previous) => {
            const next =
              new Set(
                previous
              )

            next.add(
              targetUserId
            )

            return next
          }
        )

        setResults(
          (previous) =>
            previous.map(
              (profile) =>
                profile.id ===
                targetUserId
                  ? {
                      ...profile,
                      followers_count:
                        profile.followers_count +
                        1,
                    }
                  : profile
            )
        )
      } catch (error) {
        console.error(
          'FOLLOW ACTION FAILED:',
          error
        )
      } finally {
        setFollowLoadingIds(
          (previous) => {
            const next =
              new Set(previous)

            next.delete(
              targetUserId
            )

            return next
          }
        )
      }
    }

  /*
   * =====================================================
   * SEND EXACTLY 1 REAX
   * =====================================================
   */

  const sendProfileReax =
    async (
      receiverId: string
    ) => {
      if (!currentUserId) {
        return
      }

      if (
        currentUserId ===
        receiverId
      ) {
        return
      }

      setReaxLoadingIds(
        (previous) => {
          const next =
            new Set(previous)

          next.add(receiverId)

          return next
        }
      )

      try {
        await sendReax({
          senderId:
            currentUserId,
          receiverId,
          amount: 1,
        })

        /*
         * Keep the UI feedback simple.
         * The actual wallet transfer has
         * already happened server-side.
         */
        console.log(
          'PROFILE REAX SENT:',
          {
            senderId:
              currentUserId,
            receiverId,
            amount: 1,
          }
        )
      } catch (error) {
        console.error(
          'PROFILE REAX FAILED:',
          error
        )

        const message =
          error instanceof Error
            ? error.message
            : 'Unable to send REAX.'

        window.alert(
          message
        )
      } finally {
        setReaxLoadingIds(
          (previous) => {
            const next =
              new Set(previous)

            next.delete(
              receiverId
            )

            return next
          }
        )
      }
    }

  /*
   * =====================================================
   * OPEN PROFILE
   * =====================================================
   */

  const openProfile =
    (
      username:
        | string
        | null
    ) => {
      if (!username) {
        return
      }

      router.push(
        `/profile/${encodeURIComponent(
          username
        )}`
      )
    }

  /*
   * =====================================================
   * FORMAT FOLLOWER COUNT
   * =====================================================
   */

  const formatCount =
    (count: number) => {
      if (
        count >=
        1_000_000
      ) {
        return `${(
          count / 1_000_000
        ).toFixed(
          count >=
            10_000_000
            ? 0
            : 1
        )}M`
      }

      if (
        count >=
        1_000
      ) {
        return `${(
          count / 1_000
        ).toFixed(
          count >=
            10_000
            ? 0
            : 1
        )}K`
      }

      return count.toString()
    }

  /*
   * =====================================================
   * UI
   * =====================================================
   */

  return (
    <main
      className="
        min-h-screen
        bg-[var(--background)]
        text-[var(--foreground)]
      "
    >
      {/* =================================================
          HEADER
          ================================================= */}

      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-[var(--border)]
          bg-[var(--background)]/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-12
            w-full
            max-w-3xl
            items-center
            gap-2
            px-3
          "
        >
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            aria-label="Go back"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              text-[var(--muted)]
              transition-colors
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--foreground)]
              active:scale-95
            "
          >
            <ArrowLeft
              size={18}
              strokeWidth={2}
            />
          </button>

          <div
            className="
              relative
              min-w-0
              flex-1
            "
          >
            <Search
              size={16}
              strokeWidth={2}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-[var(--muted)]
              "
            />

            <input
              type="search"
              value={query}
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search StreetGO"
              autoFocus
              autoComplete="off"
              className="
                h-10
                w-full
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface)]
                pl-10
                pr-4
                text-sm
                text-[var(--foreground)]
                outline-none
                transition-all
                duration-200
                placeholder:text-[var(--muted)]
                focus:border-[var(--accent)]
                focus:ring-2
                focus:ring-[var(--accent)]/10
              "
            />
          </div>
        </div>
      </header>

      {/* =================================================
          RESULTS
          ================================================= */}

      <section
        className="
          mx-auto
          w-full
          max-w-3xl
          px-2
          py-3
          sm:px-3
        "
      >
        {/* Loading */}

        {loading && (
          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              py-8
              text-sm
              text-[var(--muted)]
            "
          >
            <Loader2
              size={16}
              className="animate-spin"
            />

            <span>
              Searching...
            </span>
          </div>
        )}

        {/* Empty state */}

        {!loading &&
          !query.trim() && (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                px-4
                py-16
                text-center
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--surface)]
                  text-[var(--muted)]
                "
              >
                <Search
                  size={21}
                />
              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--foreground)]
                "
              >
                Search StreetGO
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--muted)]
                "
              >
                Find people by username
              </p>
            </div>
          )}

        {/* No results */}

        {!loading &&
          searched &&
          results.length === 0 && (
            <div
              className="
                px-4
                py-12
                text-center
              "
            >
              <p
                className="
                  text-sm
                  font-semibold
                  text-[var(--foreground)]
                "
              >
                No users found
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-[var(--muted)]
                "
              >
                Try a different username.
              </p>
            </div>
          )}

        {/* =================================================
            RESULTS LIST
            ================================================= */}

        {!loading &&
          results.length > 0 && (
            <div
              className="
                overflow-hidden
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
              "
            >
              {results.map(
                (
                  profile,
                  index
                ) => {
                  const isCurrentUser =
                    profile.id ===
                    currentUserId

                  const isFollowing =
                    followingIds.has(
                      profile.id
                    )

                  const isFollowLoading =
                    followLoadingIds.has(
                      profile.id
                    )

                  const isReaxLoading =
                    reaxLoadingIds.has(
                      profile.id
                    )

                  return (
                    <div
                      key={
                        profile.id
                      }
                      className={`
                        w-full
                        px-3
                        py-3
                        ${
                          index <
                          results.length -
                            1
                            ? 'border-b border-[var(--border)]'
                            : ''
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >
                        {/* AVATAR */}

                        <button
                          type="button"
                          onClick={() =>
                            openProfile(
                              profile.username
                            )
                          }
                          aria-label={`Open ${
                            profile.username ||
                            'profile'
                          }`}
                          className="
                            h-12
                            w-12
                            shrink-0
                            overflow-hidden
                            rounded-full
                            bg-[var(--surface-hover)]
                            ring-1
                            ring-[var(--border)]
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[var(--accent)]/40
                          "
                        >
                          {profile.avatar_url ? (
                            <img
                              src={
                                profile.avatar_url
                              }
                              alt={
                                profile.username ||
                                'Profile'
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />
                          ) : (
                            <span
                              className="
                                flex
                                h-full
                                w-full
                                items-center
                                justify-center
                                text-base
                                font-bold
                                text-[var(--accent)]
                              "
                            >
                              {(
                                profile.username ||
                                'U'
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </span>
                          )}
                        </button>

                        {/* PROFILE INFO */}

                        <button
                          type="button"
                          onClick={() =>
                            openProfile(
                              profile.username
                            )
                          }
                          className="
                            min-w-0
                            flex-1
                            text-left
                          "
                        >
                          <div
                            className="
                              truncate
                              text-sm
                              font-bold
                              text-[var(--foreground)]
                            "
                          >
                            {profile.username ||
                              'Unknown user'}
                          </div>

                          <div
                            className="
                              mt-0.5
                              flex
                              items-center
                              gap-1.5
                              text-[11px]
                              text-[var(--muted)]
                            "
                          >
                            <span>
                              {formatCount(
                                profile.followers_count
                              )}
                            </span>

                            <span>
                              followers
                            </span>
                          </div>

                          {profile.bio && (
                            <div
                              className="
                                mt-0.5
                                truncate
                                text-xs
                                text-[var(--muted)]
                              "
                            >
                              {
                                profile.bio
                              }
                            </div>
                          )}
                        </button>

                        {/* ACTIONS */}

                        {!isCurrentUser && (
                          <div
                            className="
                              flex
                              shrink-0
                              items-center
                              gap-1.5
                            "
                          >
                            {/* FOLLOW */}

                            <button
                              type="button"
                              disabled={
                                isFollowLoading
                              }
                              onClick={() =>
                                void toggleFollow(
                                  profile.id
                                )
                              }
                              className={`
                                inline-flex
                                min-w-[76px]
                                items-center
                                justify-center
                                gap-1.5
                                rounded-lg
                                px-2.5
                                py-2
                                text-[10px]
                                font-bold
                                transition-all
                                active:scale-[0.97]

                                ${
                                  isFollowing
                                    ? `
                                      border
                                      border-[var(--border)]
                                      bg-[var(--surface-hover)]
                                      text-[var(--foreground)]
                                    `
                                    : `
                                      bg-[var(--accent)]
                                      text-black
                                      hover:opacity-90
                                    `
                                }

                                ${
                                  isFollowLoading
                                    ? 'opacity-60'
                                    : ''
                                }
                              `}
                            >
                              {isFollowLoading ? (
                                <Loader2
                                  size={
                                    13
                                  }
                                  className="animate-spin"
                                />
                              ) : isFollowing ? (
                                <>
                                  <Check
                                    size={
                                      13
                                    }
                                  />

                                  <span>
                                    Following
                                  </span>
                                </>
                              ) : (
                                <>
                                  <UserPlus
                                    size={
                                      13
                                    }
                                  />

                                  <span>
                                    Follow
                                  </span>
                                </>
                              )}
                            </button>

                            {/* GIVE 1 REAX */}

                            <button
                              type="button"
                              disabled={
                                isReaxLoading
                              }
                              onClick={() =>
                                void sendProfileReax(
                                  profile.id
                                )
                              }
                              className={`
                                inline-flex
                                h-9
                                min-w-[58px]
                                items-center
                                justify-center
                                gap-1
                                rounded-lg
                                border
                                border-emerald-500/30
                                bg-emerald-500/10
                                px-2
                                text-[10px]
                                font-bold
                                text-emerald-500
                                transition-all
                                hover:bg-emerald-500/15
                                active:scale-[0.97]
                                ${
                                  isReaxLoading
                                    ? 'opacity-60'
                                    : ''
                                }
                              `}
                              aria-label="Send 1 REAX"
                              title="Send 1 REAX"
                            >
                              {isReaxLoading ? (
                                <Loader2
                                  size={
                                    13
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <>
                                  <Sparkles
                                    size={
                                      13
                                    }
                                    strokeWidth={
                                      2
                                    }
                                  />

                                  <span>
                                    1 REAX
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* CURRENT USER */}

                        {isCurrentUser && (
                          <span
                            className="
                              shrink-0
                              rounded-lg
                              border
                              border-[var(--border)]
                              bg-[var(--surface-hover)]
                              px-2.5
                              py-2
                              text-[10px]
                              font-bold
                              text-[var(--muted)]
                            "
                          >
                            You
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }
              )}
            </div>
          )}
      </section>
    </main>
  )
}