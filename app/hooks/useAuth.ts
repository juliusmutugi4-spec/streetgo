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
  username?: string | null
  avatar_url?: string | null
  reputation?: number | null
  predictions_correct?: number | null
  predictions_wrong?: number | null
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

  /*
   * =====================================================
   * REQUEST CONTROL
   * =====================================================
   *
   * Prevent an older profile request from
   * replacing newer authentication state.
   */

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

        /*
         * Ignore stale requests.
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
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            }
          )

          setProfile(null)
        } else {
          setProfile(
            data ?? null
          )
        }

        /*
         * Load unread messages
         * outside auth callback.
         */

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

          /*
           * IMPORTANT:
           *
           * Profile loading happens here,
           * outside onAuthStateChange().
           */

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
          /*
           * Invalidate any running profile
           * request and clear local state.
           */

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

    /*
     * IMPORTANT:
     *
     * Keep this callback synchronous.
     * Do not directly await Supabase
     * database queries here.
     */

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

          /*
           * Update authentication state.
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
           * IMPORTANT:
           *
           * Defer profile/database work until
           * after the auth callback has finished.
           *
           * This avoids the Supabase auth
           * Navigator LockManager problem.
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
     * Initial authentication check.
     *
     * This happens outside the listener.
     */

    void checkUser()

    /*
     * ===================================================
     * CLEANUP
     * ===================================================
     */

    return () => {
      mounted = false

      subscription.unsubscribe()
    }
  }, [
    supabase,
    checkUser,
    loadProfile,
  ])

  /*
   * =====================================================
   * RETURN API
   * =====================================================
   */

  return {
    user,
    profile,
    unreadCount,
    checkUser,
    handleLogout,
  }
}