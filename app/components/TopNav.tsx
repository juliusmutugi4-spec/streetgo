'use client'

import {
  Bell,
  Bookmark,
  HelpCircle,
  Home,
  LogOut,
  Map,
  Menu,
  Search,
  Settings,
  User,
  Video,
  Wallet,
  X,
} from 'lucide-react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

interface UserProfile {
  id: string
  name: string
  username: string
  email: string
  avatarUrl?: string
}
interface TopNavProps {
  user: UserProfile | null
  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({
  user,
  onLogin,
  onLogout,
}: TopNavProps) {
  const router = useRouter()

  const [menuOpen, setMenuOpen] =
    useState(false)

  const navMenuRef =
    useRef<HTMLDivElement | null>(null)

  /*
   * =====================================================
   * CLOSE MENU
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
        !navMenuRef.current.contains(
          target
        )
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
   * NAVIGATION
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
            MENU
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
              MASTER MENU
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
                  ACCOUNT
                  ========================================= */}

              {user && (
                <button
                  type="button"
                  onClick={() =>
                  navigate(`/profile/${user.username}`)
                    
                  }
                  className="
                    mb-1
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-lg
                    bg-[var(--surface-hover)]
                    px-2.5
                    py-2
                    text-left
                    transition-colors
                    hover:bg-[var(--surface-hover)]
                  "
                >
                  <div
                    className="
                      h-8
                      w-8
                      shrink-0
                      overflow-hidden
                      rounded-full
                      bg-[var(--surface)]
                    "
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={
                          user.avatarUrl
                        }
                  alt={user.username}
                        
                        width={32}
                        height={32}
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
                          font-['Courier_New']
                          text-[10px]
                          font-bold
                          text-[var(--foreground)]
                        "
                      >
                   {user.username
  ?.charAt(0)
  .toUpperCase()}
                      </span>
                    )}
                  </div>

<div className="min-w-0">
  <div
    className="
      truncate
      font-['Courier_New']
      text-[10px]
      font-bold
      text-[var(--foreground)]
    "
  >
    {user.username}
  </div>
</div>
                </button>
              )}

              {/* =========================================
                  SEARCH
                  ========================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate('/search')
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
                <Search
                  size={14}
                  strokeWidth={1.9}
                  className="shrink-0"
                />

                <span>
                  Search
                </span>
              </button>

              {/* =========================================
                  HOME
                  ========================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate('/')
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
                <Home
                  size={14}
                  strokeWidth={1.9}
                  className="shrink-0"
                />

                <span>
                  Home
                </span>
              </button>

              {/* =========================================
                  MAP
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
                <Map
                  size={14}
                  strokeWidth={1.9}
                  className="shrink-0"
                />

                <span>
                  Map
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
                  onClick={() =>
                    navigate(
                      `/profile/${user.name}`
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
                  <User
                    size={14}
                    strokeWidth={1.9}
                    className="shrink-0"
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
                  SAVED
                  ========================================= */}

              {user && (
                <button
                  type="button"
                  onClick={() =>
                    navigate('/saved')
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
                  <Bookmark
                    size={14}
                    strokeWidth={1.9}
                    className="shrink-0"
                  />

                  <span>
                    Saved
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
                  SETTING — SINGULAR ROUTE
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
                  HELP
                  ========================================= */}

              <button
                type="button"
                onClick={() =>
                  navigate('/help')
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
                <HelpCircle
                  size={14}
                  strokeWidth={1.9}
                  className="shrink-0"
                />

                <span>
                  Help & Support
                </span>
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