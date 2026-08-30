'use client'

import { getSupabaseBrowser } from '../lib/supabase-browser'

import {
  Bell,
  CarFront,
  HelpCircle,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  User,
  Video,
  Wallet,
  X,
} from 'lucide-react'

import { useRouter } from 'next/navigation'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

interface UserProfile {
  id: string
  name?: string | null
  username?: string | null
  email?: string | null
  avatarUrl?: string | null
}

interface TopNavProps {
  user: UserProfile | null

  profile: {
    username?: string | null
    avatar_url?: string | null
    reputation?: number
    predictions_correct?: number
    predictions_wrong?: number
  } | null

  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({
  user,
  profile,
  onLogin,
  onLogout,
}: TopNavProps) {
  const router = useRouter()

  /*
   * =====================================================
   * DEBUG
   * =====================================================
   */

  console.log(
    'TOPNAV PROFILE CHECK:',
    {
      hasUser: !!user,
      userId: user?.id,
      profileUsername:
        profile?.username,
    }
  )

  /*
   * =====================================================
   * MENU STATE
   * =====================================================
   */

  const [menuOpen, setMenuOpen] =
    useState(false)

const [supportNotificationCount, setSupportNotificationCount] =
  useState(0)


  const navMenuRef =
    useRef<HTMLDivElement | null>(null)

  /*
   * =====================================================
   * CLOSE MENU WHEN CLICKING OUTSIDE
   * =====================================================
   */

  useEffect(() => {
    if (!menuOpen) return

    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node

      if (
        navMenuRef.current &&
        !navMenuRef.current.contains(target)
      ) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    document.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )

      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [menuOpen])



/*
 * =====================================================
 * SUPPORT REPLY NOTIFICATIONS
 * =====================================================
 */

useEffect(() => {
  if (!user?.id) {
    setSupportNotificationCount(0)
    return
  }

  const loadSupportNotifications =
    async () => {
      try {
        const supabase =
          getSupabaseBrowser()

        const {
          data,
          error,
        } = await supabase
          .from('support_requests')
          .select(
            'id, admin_reply, updated_at'
          )
          .eq(
            'user_id',
            user.id
          )
          .not(
            'admin_reply',
            'is',
            null
          )

        if (error) {
          console.error(
            'SUPPORT NOTIFICATION LOAD ERROR:',
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

        const seenKey =
          'streetgo-support-seen'

        const stored =
          localStorage.getItem(
            seenKey
          )

        let seen:
          Record<string, string> = {}

        try {
          seen = stored
            ? JSON.parse(stored)
            : {}
        } catch {
          seen = {}
        }

        const unread =
          (data || []).filter(
            (
              request: {
                id: string
                admin_reply:
                  | string
                  | null
                updated_at: string
              }
            ) => {
              if (
                !request.admin_reply
              ) {
                return false
              }

              return (
                seen[request.id] !==
                request.admin_reply
              )
            }
          ).length

        setSupportNotificationCount(
          unread
        )
      } catch (error) {
        console.error(
          'SUPPORT NOTIFICATION FAILED:',
          error
        )
      }
    }

  void loadSupportNotifications()

  const refresh =
    () => {
      void loadSupportNotifications()
    }

  window.addEventListener(
    'storage',
    refresh
  )

  window.addEventListener(
    'streetgo-support-seen',
    refresh
  )

  /*
   * Check periodically so an admin
   * reply appears without a refresh.
   */
  const interval =
    window.setInterval(
      () => {
        void loadSupportNotifications()
      },
      15000
    )

  return () => {
    window.removeEventListener(
      'storage',
      refresh
    )

    window.removeEventListener(
      'streetgo-support-seen',
      refresh
    )

    window.clearInterval(
      interval
    )
  }
}, [user?.id])


  /*
   * =====================================================
   * NORMAL NAVIGATION
   * =====================================================
   */

  const navigate = (
    path: string
  ) => {
    setMenuOpen(false)
    router.push(path)
  }

  /*
   * =====================================================
   * CURRENT PROFILE NAVIGATION
   *
   * Always use the authenticated user's ID to
   * retrieve the username from the profiles table.
   * =====================================================
   */

  const openCurrentProfile =
    async () => {
      if (!user?.id) {
        console.error(
          'PROFILE NAVIGATION: user id not available'
        )
        return
      }

      try {
        const supabase =
          getSupabaseBrowser()

        const {
          data,
          error,
        } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          console.error(
            'PROFILE NAVIGATION ERROR:',
            {
              message:
                error.message,
              code: error.code,
              details:
                error.details,
              hint: error.hint,
            }
          )

          return
        }

        const username =
          data?.username?.trim()

        if (!username) {
          console.error(
            'PROFILE NAVIGATION: username not found',
            {
              userId: user.id,
            }
          )

          return
        }

        setMenuOpen(false)

        router.push(
          `/profile/${encodeURIComponent(
            username
          )}`
        )
      } catch (error) {
        console.error(
          'PROFILE NAVIGATION FAILED:',
          error
        )
      }
    }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <header
      className="
        sticky
        top-0
        z-40
        w-full
        border-b
        border-[var(--border)]
        bg-[var(--background)]/95
        text-[var(--foreground)]
        backdrop-blur-xl
      "
    >
      <div
        className="
          relative
          mx-auto
          flex
          h-11
          w-full
          max-w-7xl
          items-center
          px-2

          sm:h-12
          sm:px-4

          lg:h-14
          lg:px-6
        "
      >

        {/* =================================================
            MENU BUTTON
            ================================================= */}

        <div
          ref={navMenuRef}
          className="
            relative
            z-50
            shrink-0
          "
        >
          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (previous) =>
                  !previous
              )
            }
            aria-label={
              menuOpen
                ? 'Close menu'
                : 'Open menu'
            }
            aria-expanded={
              menuOpen
            }
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-md
              transition-colors
              duration-150
              active:scale-95
              focus:outline-none
              focus-visible:ring-1
              focus-visible:ring-[var(--accent)]/50

              ${
                menuOpen
                  ? `
                    bg-[var(--surface-hover)]
                    text-[var(--foreground)]
                  `
                  : `
                    text-[var(--muted)]
                    hover:bg-[var(--surface-hover)]
                    hover:text-[var(--foreground)]
                  `
              }
            `}
          >
            {menuOpen ? (
              <X
                size={16}
                strokeWidth={2}
              />
            ) : (
              <Menu
                size={16}
                strokeWidth={2}
              />
            )}
          </button>

          {/* =================================================
              MENU PANEL
              ================================================= */}

          {menuOpen && (
            <div
              className="
                absolute
                left-0
                top-9
                z-[100]
                w-[min(88vw,250px)]
                overflow-hidden
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                p-1
                shadow-[0_12px_35px_rgba(0,0,0,0.16)]

                sm:top-10
              "
            >

              {/* =========================================
                  SEARCH
                  ========================================= */}
<button
  type="button"
  onClick={() => navigate('/search')}
  className="
    flex
    min-h-10
    w-full
    items-center
    gap-3
    rounded-lg
    px-3
    py-2.5
    font-['Courier_New']
    text-[10px]
    font-bold
    text-[var(--foreground)]
    transition-colors
    hover:bg-[var(--surface-hover)]
    active:scale-[0.99]
  "
>
  <Search
    size={16}
    strokeWidth={1.9}
    className="shrink-0 text-[var(--accent)]"
  />

  <span>
    Search
  </span>
</button>
              {/* =========================================
                  GET RIDE
                  ========================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate('/map')
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-md
                  px-2.5
                  py-2
                  font-['Courier_New']
                  text-[9px]
                  font-bold
                  text-[var(--foreground)]
                  transition-colors
                  hover:bg-[var(--surface-hover)]
                "
              >
                <CarFront
                  size={14}
                  strokeWidth={1.9}
                  className="shrink-0"
                />

                <span>
                  Get Ride
                </span>
              </button>

              {/* =========================================
                  FEEDS
                  ========================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate('/videos')
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-md
                  px-2.5
                  py-2
                  font-['Courier_New']
                  text-[9px]
                  font-bold
                  text-[var(--foreground)]
                  transition-colors
                  hover:bg-[var(--surface-hover)]
                "
              >
                <Video
                  size={14}
                  strokeWidth={1.9}
                  className="shrink-0"
                />

                <span>
                  Feeds
                </span>
              </button>

              {/* =========================================
                  PROFILE
                  ========================================= */}

{user && (
  <button
    type="button"
    onClick={() => {
      console.log('PROFILE BUTTON CLICKED')
      void openCurrentProfile()
    }}
    className="
      flex
      w-full
      items-center
      gap-2.5
      rounded-md
      px-2.5
      py-2
      font-['Courier_New']
      text-[9px]
      font-bold
      text-[var(--foreground)]
      transition-colors
      hover:bg-[var(--surface-hover)]
      active:scale-[0.99]
    "
  >
    <User
      size={14}
      strokeWidth={1.9}
      className="
        shrink-0
        text-[var(--accent)]
      "
    />

    <span>
      Profile
    </span>
  </button>
)}

              {/* =========================================
                  REAX WALLET
                  ========================================= */}

              {user && (
                <button
                  type="button"
                  onClick={() =>
                    navigate('/reax')
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-md
                    px-2.5
                    py-2
                    font-['Courier_New']
                    text-[9px]
                    font-bold
                    text-emerald-500
                    transition-colors
                    hover:bg-emerald-500/10
                  "
                >
                  <Wallet
                    size={14}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>
                    REAX Wallet
                  </span>
                </button>
              )}

              {/* =========================================
                  NOTIFICATIONS
                  ========================================= */}

              {user && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/notifications'
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-md
                    px-2.5
                    py-2
                    font-['Courier_New']
                    text-[9px]
                    font-bold
                    text-[var(--foreground)]
                    transition-colors
                    hover:bg-[var(--surface-hover)]
                  "
                >
                  <Bell
                    size={14}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>
                    Notifications
                  </span>
                </button>
              )}

              {/* =========================================
                  SETTING
                  ========================================= */}

              {user && (
                <button
                  type="button"
                  onClick={() =>
                    navigate('/setting')
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-md
                    px-2.5
                    py-2
                    font-['Courier_New']
                    text-[9px]
                    font-bold
                    text-[var(--foreground)]
                    transition-colors
                    hover:bg-[var(--surface-hover)]
                  "
                >
                  <Settings
                    size={14}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>
                    Setting
                  </span>
                </button>
              )}

              {/* =========================================
                  HELP & SUPPORT
                  ========================================= */}

<button
  type="button"
  onClick={() => navigate('/help')}
  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors duration-200 hover:bg-[var(--surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
>
  <div className="relative flex shrink-0 items-center justify-center">
    <HelpCircle size={18} strokeWidth={2} className="text-[var(--foreground-muted)]" />
    
    {supportNotificationCount > 0 && (
      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-[var(--surface)]">
        {supportNotificationCount > 9 ? '9+' : supportNotificationCount}
      </span>
    )}
  </div>
  
  <span className="text-left font-normal">Help & Support</span>
</button>


              {/* =========================================
                  DIVIDER
                  ========================================= */}

              {user && (
                <div
                  className="
                    my-1
                    h-px
                    bg-[var(--border)]
                  "
                />
              )}

              {/* =========================================
                  SIGN IN
                  ========================================= */}

              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onLogin()
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-md
                    px-2.5
                    py-2
                    font-['Courier_New']
                    text-[9px]
                    font-bold
                    text-[var(--accent)]
                    transition-colors
                    hover:bg-[var(--surface-hover)]
                  "
                >
                  <User
                    size={14}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>
                    Sign in
                  </span>
                </button>
              )}

              {/* =========================================
                  SIGN OUT
                  ========================================= */}

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout()
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-md
                    px-2.5
                    py-2
                    font-['Courier_New']
                    text-[9px]
                    font-bold
                    text-rose-500
                    transition-colors
                    hover:bg-rose-500/10
                  "
                >
                  <LogOut
                    size={14}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>
                    Sign out
                  </span>
                </button>
              )}

            </div>
          )}
        </div>

        {/* =================================================
            STREETGO LOGO
            ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate('/')
          }
          aria-label="StreetGO home"
          className="
            ml-2
            shrink-0
            rounded-md
            px-1
            focus:outline-none
            focus-visible:ring-1
            focus-visible:ring-[var(--accent)]/50
          "
        >
          <span
            className="
              font-['Courier_New']
              text-[12px]
              font-black
              uppercase
              leading-none
              tracking-[0.08em]
              text-[var(--foreground)]

              sm:text-[14px]

              lg:text-[15px]
            "
          >
            street
            <span className="text-[var(--accent)]">
              go
            </span>
          </span>
        </button>
      </div>
    </header>
  )
}