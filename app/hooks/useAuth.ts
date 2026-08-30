'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  AuthChangeEvent,
  Session,
  User as SupabaseUser,
} from '@supabase/supabase-js'

import { getSupabaseBrowser } from '../lib/supabase-browser'

interface StreetGoProfile {
  username?: string
  avatar_url?: string | null
  reputation?: number
  predictions_correct?: number
  predictions_wrong?: number
}

interface ChatCountError {
  message?: string
  code?: string
  details?: string | null
  hint?: string | null
  status?: number
  name?: string
}

/*
 * =====================================================
 * AUTH HOOK
 * =====================================================
 */

export function useAuth() {
  const supabase =
    getSupabaseBrowser()

  const [user, setUser] =
    useState<SupabaseUser | null>(
      null
    )

  const [profile, setProfile] =
    useState<StreetGoProfile | null>(
      null
    )

  const [unreadCount, setUnreadCount] =
    useState(0)

  /*
   * Used to ignore stale profile requests.
   */
  const requestIdRef =
    useRef(0)

  /*
   * Prevent multiple simultaneous
   * auth/profile initialization calls.
   */
  const loadingUserRef =
    useRef(false)

  /*
   * =====================================================
   * FETCH UNREAD MESSAGES
   *
   * IMPORTANT:
   * This is independent from profile loading.
   * A message-count failure must NEVER destroy
   * the authenticated user/profile state.
   * =====================================================
   */

  const fetchUnreadMessages =
    useCallback(
      async (
        userId: string
      ) => {
        if (!userId) {
          setUnreadCount(0)
          return
        }

        try {
          const {
            count,
            error,
          } =
            await supabase
              .from(
                'chat_messages'
              )
              .select(
                'id',
                {
                  count:
                    'exact',
                  head: true,
                }
              )
              .eq(
                'receiver_id',
                userId
              )
              .eq(
                'is_read',
                false
              )

          if (error) {
            const safeError: ChatCountError =
              {
                message:
                  error.message,
                code:
                  error.code,
                details:
                  error.details,
                hint:
                  error.hint,
                status:
                  error.status,
                name:
                  error.name,
              }

            /*
             * Don't wipe the user's profile
             * just because the badge failed.
             */
            console.error(
              'UNREAD MESSAGE COUNT ERROR:',
              safeError
            )

            setUnreadCount(0)
            return
          }

          setUnreadCount(
            Number(count) || 0
          )
        } catch (error) {
          /*
           * Network failures such as
           * "Failed to fetch" are isolated here.
           */
          console.error(
            'UNREAD MESSAGE COUNT FAILED:',
            error
          )

          setUnreadCount(0)
        }
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
      async (
        userId: string
      ) => {
        if (!userId) {
          requestIdRef.current += 1

          setProfile(null)
          setUnreadCount(0)

          return
        }

        const requestId =
          ++requestIdRef.current

        try {
          const {
            data,
            error,
          } =
            await supabase
              .from('profiles')
              .select(
                `
                  username,
                  avatar_url,
                  reputation,
                  predictions_correct,
                  predictions_wrong
                `
              )
              .eq(
                'id',
                userId
              )
              .maybeSingle()

          /*
           * Ignore stale responses.
           */
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
                message:
                  error.message,
                code:
                  error.code,
                details:
                  error.details,
                hint:
                  error.hint,
                status:
                  error.status,
                name:
                  error.name,
              }
            )

            setProfile(null)
          } else {
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

          /*
           * IMPORTANT:
           * Do NOT await this.
           *
           * Profile loading is complete even if
           * the message-count request fails.
           */
          void fetchUnreadMessages(
            userId
          )
        } catch (error) {
          if (
            requestId !==
            requestIdRef.current
          ) {
            return
          }

          console.error(
            'PROFILE LOAD FAILED:',
            error
          )

          setProfile(null)

          /*
           * Badge failure is isolated.
           */
          setUnreadCount(0)
        }
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
        /*
         * Prevent duplicate startup calls.
         */
        if (
          loadingUserRef.current
        ) {
          return null
        }

        loadingUserRef.current =
          true

        try {
          const {
            data,
            error,
          } =
            await supabase.auth.getSession()

          if (error) {
            console.error(
              'AUTH SESSION ERROR:',
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

            requestIdRef.current += 1

            setUser(null)
            setProfile(null)
            setUnreadCount(0)

            return null
          }

          const currentUser =
            data.session?.user ??
            null

          setUser(
            currentUser
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
        } finally {
          loadingUserRef.current =
            false
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
            session?.user ??
            null

          /*
           * Update auth state immediately.
           */
          setUser(
            currentUser
          )

          /*
           * Signed out.
           */
          if (!currentUser) {
            requestIdRef.current += 1

            setProfile(null)
            setUnreadCount(0)

            return
          }

          /*
           * Defer database work so we don't
           * perform PostgREST requests inside
           * Supabase's auth callback.
           *
           * But do it only once.
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

    /*
     * Initial auth check.
     */
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