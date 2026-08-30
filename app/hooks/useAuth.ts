import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  AuthChangeEvent,
  Session,
} from '@supabase/supabase-js'

import { getSupabaseBrowser } from '../lib/supabase-browser'

interface StreetGoProfile {
  username?: string
  avatar_url?: string | null
  reputation?: number
  predictions_correct?: number
  predictions_wrong?: number
}

export function useAuth() {
  const supabase =
    getSupabaseBrowser()

  const [user, setUser] =
    useState<any>(null)

  const [profile, setProfile] =
    useState<StreetGoProfile | null>(
      null
    )

  const [unreadCount, setUnreadCount] =
    useState(0)

  const requestIdRef =
    useRef(0)

  /*
   * =====================================================
   * FETCH UNREAD MESSAGES
   * =====================================================
   */

  const fetchUnreadMessages =
    useCallback(
      async (userId: string) => {
        if (!userId) {
          setUnreadCount(0)
          return
        }

        const {
          count,
          error,
        } = await supabase
          .from('chat_messages')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq(
            'receiver_id',
            userId
          )

        if (error) {
          console.error(
            'UNREAD MESSAGE COUNT ERROR:',
            {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            }
          )

          setUnreadCount(0)
          return
        }

        setUnreadCount(
          Number(count) || 0
        )
      },
      [supabase]
    )

  /*
   * =====================================================
   * LOAD PROFILE
   * =====================================================
   */

  const loadProfile =
    useCallback(
      async (userId: string) => {
        if (!userId) {
          setProfile(null)
          setUnreadCount(0)
          return
        }

        const requestId =
          ++requestIdRef.current

        const {
          data,
          error,
        } = await supabase
          .from('profiles')
          .select(`
            username,
            avatar_url,
            reputation,
            predictions_correct,
            predictions_wrong
          `)
          .eq(
            'id',
            userId
          )
          .maybeSingle()

        if (
          requestId !==
          requestIdRef.current
        ) {
          return
        }

        if (error) {
          console.error(
            'PROFILE LOAD ERROR:',
            {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            }
          )

          setProfile(null)
        } else {
          /*
           * Normalize nullable username
           * to undefined so it matches
           * the rest of the application.
           */
          setProfile(
            data
              ? {
                  username:
                    data.username ??
                    undefined,

                  avatar_url:
                    data.avatar_url ??
                    null,

                  reputation:
                    data.reputation ??
                    undefined,

                  predictions_correct:
                    data.predictions_correct ??
                    undefined,

                  predictions_wrong:
                    data.predictions_wrong ??
                    undefined,
                }
              : null
          )
        }

        await fetchUnreadMessages(
          userId
        )
      },
      [
        supabase,
        fetchUnreadMessages,
      ]
    )

  /*
   * =====================================================
   * CHECK CURRENT USER
   * =====================================================
   */

  const checkUser =
    useCallback(
      async () => {
        try {
          const {
            data: {
              user: currentUser,
            },
            error,
          } =
            await supabase.auth.getUser()

          if (error) {
            console.error(
              'AUTH USER ERROR:',
              {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
              }
            )

            requestIdRef.current += 1

            setUser(null)
            setProfile(null)
            setUnreadCount(0)

            return null
          }

          setUser(
            currentUser ?? null
          )

          if (!currentUser) {
            requestIdRef.current += 1

            setProfile(null)
            setUnreadCount(0)

            return null
          }

          await loadProfile(
            currentUser.id
          )

          return currentUser
        } catch (error) {
          console.error(
            'CHECK USER FAILED:',
            error
          )

          requestIdRef.current += 1

          setUser(null)
          setProfile(null)
          setUnreadCount(0)

          return null
        }
      },
      [
        supabase,
        loadProfile,
      ]
    )

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  const handleLogout =
    useCallback(
      async () => {
        try {
          const {
            error,
          } =
            await supabase.auth.signOut()

          if (error) {
            console.error(
              'SIGN OUT ERROR:',
              {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
              }
            )

            throw error
          }
        } finally {
          requestIdRef.current += 1

          setUser(null)
          setProfile(null)
          setUnreadCount(0)
        }
      },
      [supabase]
    )

  /*
   * =====================================================
   * AUTH STATE LISTENER
   * =====================================================
   */

  useEffect(() => {
    let mounted = true

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event: AuthChangeEvent,
          session: Session | null
        ) => {
          if (!mounted) {
            return
          }

          const currentUser =
            session?.user ?? null

          setUser(
            currentUser
          )

          if (!currentUser) {
            requestIdRef.current += 1

            setProfile(null)
            setUnreadCount(0)

            return
          }

          /*
           * Never perform database work
           * directly inside the auth callback.
           */

          window.setTimeout(
            () => {
              if (!mounted) {
                return
              }

              void loadProfile(
                currentUser.id
              )
            },
            0
          )
        }
      )

    void checkUser()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [
    supabase,
    checkUser,
    loadProfile,
  ])

  return {
    user,
    profile,
    unreadCount,
    checkUser,
    handleLogout,
  }
}