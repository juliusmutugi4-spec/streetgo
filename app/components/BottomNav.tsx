'use client'

import { Home, MessageCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

import CreateButton from './CreateButton'
type BottomNavProps = {
  profile: {
    username?: string
    avatar_url?: string | null
  } | null
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

  const navigate = (path: string) => router.push(path)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-xl border-t border-zinc-800 shadow-md">
      <div className="max-w-xl mx-auto h-16 flex items-center justify-around">




        {/* Feed */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-zinc-400 hover:text-white transition"
        >
          <Home size={24} />
          <span className="text-[10px] mt-1">Feed</span>
        </button>

{/* Create */}
<CreateButton
  onCreateSelect={onCreateSelect}
/>

        {/* Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="relative flex flex-col items-center text-zinc-400 hover:text-white transition"
        >
          <MessageCircle size={24} />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -top-2
                -right-3
                min-w-[18px]
                h-[18px]
                px-1
                rounded-full
                bg-red-500
                text-white
                text-[10px]
                font-bold
                flex
                items-center
                justify-center
                border
                border-[#060608]
              "
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          <span className="text-[10px] mt-1">
            Messages
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() =>
            navigate(
              profile?.username
                ? `/profile/${profile.username}`
                : '/'
            )
          }
          className="flex flex-col items-center text-zinc-400 hover:text-white transition"
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username ?? 'Profile'}
              className="w-6 h-6 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <User size={24} />
          )}

          <span className="text-[10px] mt-1">
            Profile
          </span>
        </button>

      </div>
    </nav>
  )
}