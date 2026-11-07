
'use client'

import { getSupabaseBrowser } from '../lib/supabase-browser'

import {
  Bell,
  CarFront,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
  Video,
  Wallet,
  X,
} from 'lucide-react'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
  onLogin,
  onLogout,
}: TopNavProps) {
  const router = useRouter()

  const [menuOpen, setMenuOpen] = useState(false)
  const [supportNotificationCount, setSupportNotificationCount] =
    useState(0)

  const navMenuRef = useRef<HTMLDivElement | null>(null)

  // CLOSE MENU
  useEffect(() => {
    if (!menuOpen) return

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        navMenuRef.current &&
        !navMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [menuOpen])

  // SUPPORT NOTIFICATIONS
  useEffect(() => {
    if (!user?.id) {
      setSupportNotificationCount(0)
      return
    }

    let cancelled = false

    const loadSupportNotifications = async () => {
      try {
        const supabase = getSupabaseBrowser()

        const { data, error } = await supabase
          .from('support_requests')
          .select('id, admin_reply, updated_at')
          .eq('user_id', user.id)
          .not('admin_reply', 'is', null)

        if (error) {
          console.error('SUPPORT NOTIFICATION ERROR:', error)
          return
        }

        const stored = localStorage.getItem(
          'streetgo-support-seen'
        )

        let seen: Record<string, string> = {}

        try {
          seen = stored ? JSON.parse(stored) : {}
        } catch {
          seen = {}
        }

        const unread = (data || []).filter(
          (request: {
            id: string
            admin_reply: string | null
            updated_at: string
          }) =>
            !!request.admin_reply &&
            seen[request.id] !== request.admin_reply
        ).length

        if (!cancelled) {
          setSupportNotificationCount(unread)
        }
      } catch (error) {
        console.error('SUPPORT NOTIFICATION FAILED:', error)
      }
    }

    void loadSupportNotifications()

    const refresh = () => {
      void loadSupportNotifications()
    }

    window.addEventListener('storage', refresh)
    window.addEventListener('streetgo-support-seen', refresh)

    const interval = window.setInterval(
      loadSupportNotifications,
      15000
    )

    return () => {
      cancelled = true
      window.removeEventListener('storage', refresh)
      window.removeEventListener(
        'streetgo-support-seen',
        refresh
      )
      window.clearInterval(interval)
    }
  }, [user?.id])

  // NAVIGATION
  const navigate = (path: string) => {
    setMenuOpen(false)
    router.push(path)
  }

  // PROFILE NAVIGATION
  const openCurrentProfile = async () => {
    if (!user?.id) return

    try {
      const supabase = getSupabaseBrowser()

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        console.error('PROFILE NAVIGATION ERROR:', error)
        return
      }

      const username = data?.username?.trim()

      if (!username) {
        console.error('PROFILE USERNAME NOT FOUND')
        return
      }

      setMenuOpen(false)

      router.push(
        `/profile/${encodeURIComponent(username)}`
      )
    } catch (error) {
      console.error('PROFILE NAVIGATION FAILED:', error)
    }
  }

  const menuItemClass = `
    flex min-h-[42px] w-full
    items-center gap-3
    rounded-lg px-3 py-2
    text-left text-[13px] font-medium
    text-white/85
    transition-colors duration-150
    hover:bg-white/[0.08]
    hover:text-white
  `

  const menuIconClass = `
    flex h-8 w-8 shrink-0
    items-center justify-center
    rounded-lg text-white/65
  `

  return (
    <header
      className="
        sticky top-0 z-50
        w-full overflow-visible
        border-b border-[#00d84b]/50
        bg-[#001c15]
        text-white
        shadow-lg shadow-black/10
      "
    >
      {/* NATURAL LANDSCAPE HEADER */}

      <div
        className="
          relative isolate
          h-[68px] w-full
          overflow-visible
          sm:h-[76px]
          lg:h-[86px]
        "
        style={{
          background: `
            radial-gradient(
              ellipse at 59% 110%,
              rgba(255,173,30,0.9) 0%,
              rgba(35,105,57,0.65) 35%,
              transparent 65%
            ),
            linear-gradient(
              100deg,
              #001c16 0%,
              #075037 50%,
              #00251b 100%
            )
          `,
        }}
      >
        {/* LANDSCAPE */}

        <svg
          viewBox="0 0 1200 150"
          preserveAspectRatio="xMidYMid slice"
          className="
            pointer-events-none
            absolute inset-0
            h-full w-full opacity-90
          "
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="streetgo-sun"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#ffe9a0" />
              <stop offset="100%" stopColor="#f9a51a" />
            </linearGradient>
          </defs>

          {/* SUN */}

          <circle
            cx="710"
            cy="112"
            r="39"
            fill="url(#streetgo-sun)"
            opacity=".9"
          />

          {/* HILLS */}

          <path
            d="
              M0 125
              Q160 108 300 120
              Q480 87 650 116
              Q850 94 1020 116
              Q1110 110 1200 120
              L1200 150
              L0 150 Z
            "
            fill="#052b20"
            opacity=".65"
          />

          {/* CITY */}

          <path
            d="
              M250 145
              L250 119 L275 119 L275 145
              L290 145 L290 103 L305 103 L305 145
              L320 145 L320 115 L344 115 L344 145
              L365 145 L365 88 L385 88 L385 145
              L402 145 L402 110 L425 110 L425 145
              L444 145 L444 70 L461 70 L461 145
              L479 145 L479 111 L500 111 L500 145
              L520 145 L520 96 L541 96 L541 145
              L563 145 L563 119 L583 119 L583 145
              L610 145 L610 126 L630 126 L630 145 Z
            "
            fill="#082b20"
          />

          {/* ACACIA TREE */}

          <g fill="#062b1b">
            <path
              d="
                M1000 145
                Q1005 112 1003 75
                L1011 75
                Q1010 111 1016 145 Z
              "
            />

            <path
              d="
                M1010 80
                C970 68 950 53 946 39
                C962 42 974 45 986 52
                C973 28 985 20 1002 37
                C1014 9 1031 15 1030 42
                C1050 24 1068 35 1052 54
                C1080 40 1095 50 1070 69
                C1052 82 1031 84 1010 80 Z
              "
            />
          </g>
        </svg>

        {/* HEADER CONTENT */}

        <div
          className="
            relative z-10
            mx-auto flex h-full w-full
            max-w-[1800px]
            items-center justify-between
            px-3 sm:px-5 lg:px-8
          "
        >
          {/* STREETGO WORDMARK - NO PLAY ICON */}

<div
  
  role="link"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate('/')
    }
  }}
  aria-label="StreetGO home"
  className="
    flex shrink-0 items-center
    cursor-pointer select-none
    transition-opacity duration-200
    hover:opacity-85
  "
>
<span className="
  inline-flex items-center
  text-[26px] font-black
  tracking-[-1.5px]
  leading-none
  text-white
  sm:text-[31px]
">
  Street<span className="
    bg-gradient-to-r
    from-[#00D66B]
    to-[#8BEA35]
    bg-clip-text
    text-transparent
  ">GO</span>
  <span className="
    ml-1.5 mt-0.5
    h-1.5 w-1.5
    rounded-full
    bg-[#E31B23]
  " />
</span>
</div>

          {/* SINGLE SET OF HEADER ICONS */}

          <div className="flex items-center gap-2 sm:gap-4">

            {/* SEARCH - ONLY HERE */}

            <button
              type="button"
              onClick={() => navigate('/search')}
              aria-label="Search"
              className="
                flex h-9 w-9
                items-center justify-center
                rounded-full text-white
                transition-all
                hover:bg-white/10
                hover:text-[#00ed59]
                sm:h-11 sm:w-11
              "
            >
              <Search size={23} strokeWidth={1.8} />
            </button>

            {/* NOTIFICATIONS - ONLY HERE */}

            {user && (
              <button
                type="button"
                onClick={() => navigate('/notifications')}
                aria-label="Notifications"
                className="
                  relative flex h-9 w-9
                  items-center justify-center
                  rounded-full text-white
                  transition-all
                  hover:bg-white/10
                  hover:text-[#00ed59]
                  sm:h-11 sm:w-11
                "
              >
                <Bell size={23} strokeWidth={1.8} />

                {supportNotificationCount > 0 && (
                  <span
                    className="
                      absolute right-1 top-0
                      h-2.5 w-2.5
                      rounded-full
                      border-2 border-[#063b29]
                      bg-[#00ed59]
                    "
                  />
                )}
              </button>
            )}

            {/* MENU - ONLY HERE */}

            <div
              ref={navMenuRef}
              className="relative z-[60]"
            >
              <button
                type="button"
                onClick={() =>
                  setMenuOpen(previous => !previous)
                }
                aria-label={
                  menuOpen ? 'Close menu' : 'Open menu'
                }
                aria-expanded={menuOpen}
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full text-white
                  transition-all
                  hover:bg-white/10
                  hover:text-[#00ed59]
                  active:scale-95
                  sm:h-11 sm:w-11
                "
              >
                {menuOpen ? (
                  <X size={27} strokeWidth={1.8} />
                ) : (
                  <Menu size={27} strokeWidth={1.8} />
                )}
              </button>

              {/* MENU DROPDOWN */}

              {menuOpen && (
                <div
                  className="
                    absolute right-0
                    top-[calc(100%+12px)]
                    z-[100]
                    w-[min(88vw,260px)]
                    overflow-hidden
                    rounded-xl
                    border border-white/10
                    bg-[#101a15]
                    p-1 shadow-2xl
                  "
                >
                  <div className="
                    border-b border-white/10
                    px-3 py-3
                  ">
                    <p className="text-sm font-bold text-white">
                      StreetGO
                    </p>
                    <p className="
                      mt-0.5 text-[10px]
                      text-white/45
                    ">
                      Connect · Contribute · Earn · Grow
                    </p>
                  </div>

                  {/* GET RIDE */}

                  <button
                    type="button"
                    onClick={() => navigate('/map')}
                    className={menuItemClass}
                  >
                    <span className={menuIconClass}>
                      <CarFront size={17} />
                    </span>
                    Get Ride
                  </button>

                  {/* FEEDS */}

                  <button
                    type="button"
                    onClick={() => navigate('/videos')}
                    className={menuItemClass}
                  >
                    <span className={menuIconClass}>
                      <Video size={17} />
                    </span>
                    Feeds
                  </button>

                  {user && (
                    <>
                      <div className="my-1 h-px bg-white/10" />

                      {/* PROFILE */}

                      <button
                        type="button"
                        onClick={() => void openCurrentProfile()}
                        className={menuItemClass}
                      >
                        <span className={menuIconClass}>
                          <User size={17} />
                        </span>
                        Profile
                      </button>

                      {/* WALLET */}

                      <button
                        type="button"
                        onClick={() => navigate('/reax')}
                        className={menuItemClass}
                      >
                        <span className="
                          flex h-8 w-8
                          items-center justify-center
                          text-[#00ed59]
                        ">
                          <Wallet size={17} />
                        </span>
                        REAX Wallet
                      </button>

                      {/* SETTINGS */}

                      <button
                        type="button"
                        onClick={() => navigate('/setting')}
                        className={menuItemClass}
                      >
                        <span className={menuIconClass}>
                          <Settings size={17} />
                        </span>
                        Settings
                      </button>
                    </>
                  )}

                  <div className="my-1 h-px bg-white/10" />

                  {/* HELP AND SUPPORT */}

                  <button
                    type="button"
                    onClick={() => navigate('/help')}
                    className={menuItemClass}
                  >
                    <span className="relative">
                      <span className={menuIconClass}>
                        <HelpCircle size={17} />
                      </span>

                      {supportNotificationCount > 0 && (
                        <span className="
                          absolute -right-1 -top-1
                          flex h-4 min-w-4
                          items-center justify-center
                          rounded-full bg-red-500
                          px-1 text-[9px]
                          font-bold text-white
                        ">
                          {supportNotificationCount > 9
                            ? '9+'
                            : supportNotificationCount}
                        </span>
                      )}
                    </span>
                    Help & Support
                  </button>

                  <div className="my-1 h-px bg-white/10" />

                  {/* SIGN IN */}

                  {!user && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        onLogin()
                      }}
                      className={`
                        ${menuItemClass}
                        text-[#00ed59]
                      `}
                    >
                      <span className={menuIconClass}>
                        <User size={17} />
                      </span>
                      Sign in
                    </button>
                  )}

                  {/* SIGN OUT */}

                  {user && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        onLogout()
                      }}
                      className="
                        flex min-h-[42px] w-full
                        items-center gap-3
                        rounded-lg px-3 py-2
                        text-left text-[13px]
                        font-medium text-rose-400
                        transition-colors
                        hover:bg-rose-500/10
                      "
                    >
                      <span className="
                        flex h-8 w-8
                        items-center justify-center
                      ">
                        <LogOut size={17} />
                      </span>
                      Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
