'use client'

import {
  Home,
  MessageCircle,
} from 'lucide-react'

import { useRouter } from 'next/navigation'

import CreateButton from './CreateButton'
import ProfileButton from './ProfileButton'

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

  const navigate = (path: string) => {
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
        bottom-4
        left-4
        right-4
        z-50
        rounded-2xl
        border
        border-white/[0.06]
        bg-[#050706]/75
        backdrop-blur-2xl
        text-[var(--muted)]
        shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)]
        select-none
        transition-all
        duration-300
      "
    >
      {/* Glossy Reflection Overlay */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent" />

      <div
        className="
          relative
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
        {/* FEED */}
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Feed"
          className="
            group flex w-full flex-col
            items-center justify-center gap-1
            py-1 transition-all duration-200
            hover:text-[var(--foreground)]
            active:scale-90 focus:outline-none
          "
        >
          <Home
            size={18}
            strokeWidth={1.8}
            className="text-white/70 transition-all duration-200 group-hover:scale-110 group-hover:text-white"
          />

          <span className="
            font-['Courier_New'] text-[7.5px]
            font-bold uppercase tracking-wider
            text-white/40
            transition-colors duration-200
            group-hover:text-[#00e694]
          ">
            Feed
          </span>
        </button>

        {/* CREATE */}
        <div className="flex w-full items-center justify-center">
          <CreateButton
            onCreateSelect={onCreateSelect}
          />
        </div>

        {/* MESSAGES */}
        <button
          type="button"
          onClick={() => navigate('/messages')}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread messages`
              : 'Messages'
          }
          className="
            group relative flex w-full flex-col
            items-center justify-center gap-1
            py-1 transition-all duration-200
            hover:text-[var(--foreground)]
            active:scale-90 focus:outline-none
          "
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle
              size={18}
              strokeWidth={1.8}
              className="text-white/70 transition-all duration-200 group-hover:scale-110 group-hover:text-white"
            />

            {unreadCount > 0 && (
              <span className="
                absolute -right-2 -top-1.5
                flex h-3.5 min-w-3.5
                items-center justify-center
                rounded-full
                border border-[#050706]
                bg-[#ff3b30] px-0.5
                font-['Courier_New']
                text-[7px] font-black
                leading-none text-white 
                shadow-[0_2px_8px_rgba(255,59,48,0.4)]
                animate-pulse
              ">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>

          <span className="
            font-['Courier_New'] text-[7.5px]
            font-bold uppercase tracking-wider
            text-white/40
            transition-colors duration-200
            group-hover:text-[#00e694]
          ">
            Comms
          </span>
        </button>

        {/* PROFILE */}
        <ProfileButton
          username={username || null}
          avatarUrl={avatarUrl}
        />

      </div>
    </nav>
  )
}
