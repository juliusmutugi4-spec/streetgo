'use client'

import { Home, PlusSquare, MessageCircle, User, Radio, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type BottomNavProps = {
  user: any
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
  user,
  profile,
  unreadCount,
  onCreateSelect,
}: BottomNavProps) {
  const router = useRouter()
const [showCreateMenu, setShowCreateMenu] = useState(false)
  const navigate = (path: string) => router.push(path)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-xl border-t border-zinc-800 shadow-md">
      <div className="max-w-xl mx-auto h-16 flex items-center justify-around">

{showCreateMenu && (
  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-200">

    <div
      className="
        relative
        w-44
        overflow-hidden
        rounded-2xl
        border
        border-emerald-500/20
        bg-[#090d12]/95
        backdrop-blur-2xl
        shadow-[0_0_35px_rgba(34,197,94,.18)]
      "
    >

      {/* TOP SCAN LINE */}
      <div className="absolute left-6 right-6 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />

      {/* BOTTOM SCAN LINE */}
      <div className="absolute left-6 right-6 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      {/* LEFT LASER */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_15px_#22c55e]" />

      {/* RIGHT LASER */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_15px_#22c55e]" />

      {/* LIVE */}
      <div className="absolute top-2 right-3 flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping absolute"></div>
        <div className="h-2 w-2 rounded-full bg-emerald-400 relative"></div>
        <span className="text-[8px] font-bold tracking-widest text-emerald-300">
          LIVE
        </span>
      </div>

      <div className="p-2 pt-7">

        {/* TRANSMIT */}
        <button
          onClick={() => {
            setShowCreateMenu(false)
            onCreateSelect('post')
          }}
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            transition-all
            duration-200
            hover:bg-cyan-500/10
            hover:scale-[1.02]
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-cyan-500/15
              ring-1
              ring-cyan-400/30
              text-cyan-400
              transition-all
              group-hover:scale-110
              group-hover:rotate-12
            "
          >
            <Radio size={15} />
          </div>

          <div className="text-left">
            <p className="text-[12px] font-bold tracking-wide text-cyan-300">
              TRANSMIT
            </p>

            <p className="text-[9px] uppercase tracking-widest text-zinc-500">
              Broadcast
            </p>
          </div>
        </button>

        <div className="mx-3 my-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

        {/* PREDICT */}
        <button
          onClick={() => {
            setShowCreateMenu(false)
            onCreateSelect('prediction')
          }}
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-2.5
            transition-all
            duration-200
            hover:bg-orange-500/10
            hover:scale-[1.02]
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-orange-500/15
              ring-1
              ring-orange-400/30
              text-orange-400
              transition-all
              group-hover:scale-110
              group-hover:-rotate-12
            "
          >
            <Sparkles size={15} />
          </div>

          <div className="text-left">
            <p className="text-[12px] font-bold tracking-wide text-orange-300">
              PREDICT
            </p>

            <p className="text-[9px] uppercase tracking-widest text-zinc-500">
              Forecast
            </p>
          </div>
        </button>

      </div>

    </div>

    {/* POINTER */}
    <div className="flex justify-center -mt-[1px]">
      <div className="h-3 w-3 rotate-45 border-r border-b border-emerald-500/20 bg-[#090d12]" />
    </div>

  </div>
)}



        {/* Feed */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-zinc-400 hover:text-white transition"
        >
          <Home size={24} />
          <span className="text-[10px] mt-1">Feed</span>
        </button>

        {/* Create */}
   <button
  onClick={() => setShowCreateMenu(!showCreateMenu)}
  className="flex flex-col items-center text-emerald-400 hover:text-emerald-300 transition"
>
  <div
    className={`
      flex
      items-center
      justify-center
      transition-all
      duration-300
      ${showCreateMenu ? "rotate-45 scale-110" : ""}
    `}
  >
    <PlusSquare size={26} />
  </div>

  <span className="text-[10px] mt-1">
    {showCreateMenu ? "Close" : "Create"}
  </span>
</button>

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