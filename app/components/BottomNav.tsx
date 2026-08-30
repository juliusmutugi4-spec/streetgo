'use client'

import {
  Home,
  MessageCircle,
  User,
} from 'lucide-react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import CreateButton from './CreateButton'

interface BottomNavProfile {
  username?: string | null
  avatar_url?: string | null
}

interface BottomNavProps {
  profile: BottomNavProfile | null
  unreadCount: number
  onCreateSelect: (
    mode: 'post' | 'prediction'
  ) => void
}

export default function BottomNav({
  profile,
  unreadCount,
  onCreateSelect,
}: BottomNavProps) {
  const router = useRouter()

  const navigate = (
    path: string
  ) => {
    router.push(path)
  }

  const username =
    profile?.username?.trim() || ''

  const avatarUrl =
    profile?.avatar_url || null

  return (
    <nav
      className="
        lg:hidden
        fixed
        bottom-0
        left-0
        right-0
        z-50
        border-t
        border-[var(--border)]
        bg-[var(--background)]/90
        backdrop-blur-xl
        text-[var(--muted)]
        shadow-[0_-8px_25px_rgba(0,0,0,0.12)]
        select-none
      "
    >
      <div
        className="
          mx-auto
          grid
          h-14
          w-full
          max-w-xl
          grid-cols-4
          items-center
          justify-items-center
          px-3
        "
      >

        {/* =================================================
            FEED
            ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate('/')
          }
          aria-label="Feed"
          className="
            group
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-0.5
            py-1
            transition-colors
            duration-150
            hover:text-[var(--foreground)]
            active:scale-95
            focus:outline-none
          "
        >
          <Home
            size={18}
            strokeWidth={1.9}
            className="
              transition-transform
              duration-150
              group-hover:scale-105
            "
          />

          <span
            className="
              font-['Courier_New']
              text-[8px]
              font-bold
              uppercase
              tracking-wide
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          >
            Feed
          </span>
        </button>

        {/* =================================================
            CREATE
            ================================================= */}

        <div
          className="
            flex
            w-full
            items-center
            justify-center
          "
        >
          <CreateButton
            onCreateSelect={
              onCreateSelect
            }
          />
        </div>

        {/* =================================================
            MESSAGES
            ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate('/messages')
          }
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread messages`
              : 'Messages'
          }
          className="
            group
            relative
            flex
            w-full
            flex-col
            items-center
            justify-center
            gap-0.5
            py-1
            transition-colors
            duration-150
            hover:text-[var(--foreground)]
            active:scale-95
            focus:outline-none
          "
        >
          <div
            className="
              relative
              flex
              items-center
              justify-center
            "
          >
            <MessageCircle
              size={18}
              strokeWidth={1.9}
              className="
                transition-transform
                duration-150
                group-hover:scale-105
              "
            />

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  -right-2
                  -top-1.5
                  flex
                  h-3.5
                  min-w-3.5
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[var(--background)]
                  bg-red-500
                  px-0.5
                  font-['Courier_New']
                  text-[7px]
                  font-black
                  leading-none
                  text-white
                  shadow-sm
                "
              >
                {unreadCount > 99
                  ? '99+'
                  : unreadCount}
              </span>
            )}
          </div>

          <span
            className="
              font-['Courier_New']
              text-[8px]
              font-bold
              uppercase
              tracking-wide
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          >
            Comms
          </span>
        </button>

        {/* =================================================
            PROFILE
            ================================================= */}

        <button
          type="button"
          onClick={() => {
            if (username) {
              navigate(
                `/profile/${encodeURIComponent(
                  username
                )}`
              )
            } else {
              navigate('/')
            }
          }}
          aria-label={
            username
              ? `Open ${username}'s profile`
              : 'Open profile'
          }
          className="
            group
            flex
            w-full
            min-w-0
            flex-col
            items-center
            justify-center
            gap-0.5
            py-1
            transition-colors
            duration-150
            hover:text-[var(--foreground)]
            active:scale-95
            focus:outline-none
          "
        >
          {/* AVATAR */}

          {avatarUrl ? (
            <div
              className="
                relative
                h-5
                w-5
                shrink-0
                overflow-hidden
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface)]
                transition-transform
                duration-150
                group-hover:scale-105
              "
            >
              <Image
                src={avatarUrl}
                alt={
                  username ||
                  'Profile'
                }
                fill
                sizes="20px"
                className="
                  object-cover
                  select-none
                "
              />
            </div>
          ) : (
            <div
              className="
                flex
                h-5
                w-5
                shrink-0
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface)]
                font-['Courier_New']
                text-[8px]
                font-bold
                text-[var(--foreground)]
                transition-transform
                duration-150
                group-hover:scale-105
              "
            >
              {username ? (
                username
                  .charAt(0)
                  .toUpperCase()
              ) : (
                <User
                  size={12}
                  strokeWidth={1.8}
                />
              )}
            </div>
          )}

          {/* USERNAME */}

          <span
            className="
              max-w-[65px]
              truncate
              font-['Courier_New']
              text-[8px]
              font-bold
              leading-none
              tracking-tight
              text-[var(--muted)]
              group-hover:text-[var(--foreground)]
            "
          >
            {username || 'Profile'}
          </span>
        </button>

      </div>
    </nav>
  )
}