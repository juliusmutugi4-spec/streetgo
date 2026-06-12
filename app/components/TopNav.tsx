'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Bell,
  Menu,
  Trophy,
  Settings,
  LogOut
} from 'lucide-react'

type TopNavProps = {
  user: any
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
  return (
    <header
  className="
    fixed
    top-0
    left-0
    right-0
    z-50
    bg-black/90
    backdrop-blur-xl
    border-b
    border-cyan-500/20
  "
>
      <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between">

        {/* LOGO */}
{/* LOGO */}
<div
  onClick={() => router.push('/')}
  className="
    group
    relative
    cursor-pointer
    select-none
    transition-all
    duration-500
    hover:scale-105
    active:scale-95
  "
>
  {/* Ambient Glow */}
  <div
    className="
      absolute
      -inset-6
      rounded-full
      bg-cyan-500/20
      blur-2xl
      transition-all
      duration-500
      group-hover:bg-cyan-500/30
      group-hover:blur-3xl
    "
  />

  {/* Core Glow */}
  <div
    className="
      absolute
      -inset-1
      rounded-xl
      bg-gradient-to-r
      from-red-500/30
      via-cyan-500/30
      to-red-500/30
      opacity-0
      blur-md
      transition-opacity
      duration-500
      group-hover:opacity-100
    "
  />

  {/* Scan Line */}
  <div
    className="
      absolute
      top-0
      left-0
      h-[2px]
      w-full
      opacity-0
      group-hover:opacity-100
      transition-all
      duration-500
      bg-gradient-to-r
      from-transparent
      via-cyan-400
      to-transparent
    "
  />

  {/* Main Container */}
  <div
    className="
      relative
      px-4
      py-2
      md:px-6
      md:py-3
      rounded-xl
      border
      border-white/5
      bg-black/40
      backdrop-blur-xl
      shadow-[inset_0_0_12px_rgba(34,211,238,0.05)]
      transition-all
      duration-500
      group-hover:border-cyan-500/30
      group-hover:shadow-[inset_0_0_20px_rgba(34,211,238,0.15)]
    "
  >

    {/* Top Left Corner */}
    <div
      className="
        absolute
        top-0
        left-0
        h-2
        w-2
        border-t-2
        border-l-2
        border-cyan-400/40
        group-hover:border-cyan-400
      "
    />

    {/* Bottom Right Corner */}
    <div
      className="
        absolute
        bottom-0
        right-0
        h-2
        w-2
        border-b-2
        border-r-2
        border-red-500/40
        group-hover:border-red-500
      "
    />

<h1 className="text-left text-2xl md:text-3xl font-bold tracking-normal text-slate-100 transition-colors duration-300">
  STREET<span className="font-black text-emerald-400">GO</span>
</h1>



    {/* System Text */}
    <div
      className="
        hidden
        md:flex
        mt-1
        items-center
        justify-between
        text-[8px]
        font-mono
        tracking-[0.3em]
        text-cyan-400/40
        group-hover:text-cyan-400/80
      "
    >
      <span>SYS.OP</span>

      <span
        className="
          h-1
          w-1
          rounded-full
          bg-red-500
          animate-pulse
        "
      />

      <span>V.4.02</span>
    </div>

  </div>
</div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-6">

          <button
            onClick={() => router.push('/videos')}
            className="
              text-sm
              font-semibold
              text-zinc-300
              hover:text-white
              transition
            "
          >
            Videos
          </button>
 

{user ? (
  <button
    onClick={() => router.push('/notifications')}
    className="
      text-zinc-300
      hover:text-cyan-400
      transition
    "
  >
    <Bell size={22} />
  </button>
) : (
  <button
    onClick={onLogin}
    className="
      px-4
      py-2
      rounded-xl
      border
      border-cyan-500/20
      bg-cyan-500/5
      text-cyan-400
      font-semibold
      hover:bg-cyan-500/10
      transition
    "
  >
    Sign In
  </button>
)}

<div className="relative">

  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="
      flex
      items-center
      justify-center
      w-10
      h-10
      rounded-xl
      border
      border-cyan-500/20
      bg-cyan-500/5
      text-cyan-400
      hover:bg-cyan-500/10
      transition
    "
  >
    {menuOpen ? '✕' : <Menu size={20} />}
  </button>

  {menuOpen && (
    <div
      className="
        absolute
        top-12
        right-0
        w-56
        rounded-2xl
        border
        border-cyan-500/20
        bg-black/95
        backdrop-blur-xl
        overflow-hidden
        shadow-[0_0_30px_rgba(0,255,255,0.15)]
      "
    >

      <button
        onClick={() => router.push('/leaderboard')}
        className="
          w-full
          px-4
          py-3
          flex
          items-center
          gap-3
          text-left
          hover:bg-cyan-500/10
          transition
        "
      >
        <Trophy size={18} />
        Leaderboard
      </button>

      <button
        onClick={() => router.push('/settings')}
        className="
          w-full
          px-4
          py-3
          flex
          items-center
          gap-3
          text-left
          hover:bg-cyan-500/10
          transition
        "
      >
        <Settings size={18} />
        Settings
      </button>

      <button
        onClick={() => router.push('/predictions')}
        className="
          w-full
          px-4
          py-3
          flex
          items-center
          gap-3
          text-left
          hover:bg-cyan-500/10
          transition
        "
      >
        📊 Predictions
      </button>

<div className="h-px bg-cyan-500/10 mx-3" />

<button
  onClick={onLogout}
  className="
    w-full
    px-4
    py-3
    flex
    items-center
    gap-3
    text-left
    text-red-400
    hover:bg-red-500/10
    transition
  "
>
  <LogOut size={18} />
  Logout
</button>

    </div>
  )}

</div>



        </div>
      </div>
    </header>
  )
}