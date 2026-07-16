'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Bell,
  Menu,
  Trophy,
  Settings,
  LogOut,
  Sun,
  Moon
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

const [lightMode, setLightMode] = useState(false)

useEffect(() => {
  document.body.style.backgroundColor = lightMode
    ? "#f0f2f5"
    : "#000000"

  document.body.style.color = lightMode
    ? "#111827"
    : "#ffffff"
}, [lightMode])
  return (
<header
  style={{
    color: "var(--foreground)",
  }}
  className="
    relative
    sticky
    top-0
    z-50

    bg-[rgba(10,10,10,0.75)]
    backdrop-blur-2xl

    border-b
    border-white/5

    shadow-[0_10px_40px_rgba(0,0,0,.35)]

    transition-all
    duration-500
"
>
      <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between">

        {/* LOGO */}
{/* LOGO */}
<div
  onClick={() => router.push('/map')}
  className="
    group
    relative
    cursor-pointer
    select-none
    transition-all
    duration-500
    hover:scale-[1.02]
    active:scale-[0.98]
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

<div className="flex justify-start py-2">
  <h1 className="font-['Nunito',_sans-serif] text-3xl md:text-4xl font-extrabold lowercase tracking-tight text-neutral-900 dark:text-neutral-50">
    street<span className="font-black text-emerald-500 ml-0.5">go</span>
  </h1>
</div>




</div>

        {/* NAVIGATION */}
        <div className="flex items-center gap-6">

<button
  onClick={() => router.push('/videos')}
  className="
    group
    relative
    px-5
    py-1.5
    font-mono
    text-xs
    font-bold
    tracking-[0.3em]
    text-cyan-400/80
    bg-slate-950/20
    border-y
    border-cyan-500/10
    transition-all
    duration-500
    ease-out
    hover:text-emerald-300
    hover:tracking-[0.4em]
    hover:shadow-[0_0_40px_-5px_rgba(52,211,153,0.15)]
    active:scale-95
    
    /* Left Structural Bracket */
    before:absolute
    before:top-0
    before:left-0
    before:w-1.5
    before:h-full
    before:border-y
    before:border-l
    before:border-cyan-400/40
    before:transition-all
    before:duration-300
    hover:before:border-emerald-400
    hover:before:scale-y-110
    
    /* Right Structural Bracket */
    after:absolute
    after:top-0
    after:right-0
    after:w-1.5
    after:h-full
    after:border-y
    after:border-r
    after:border-cyan-400/40
    after:transition-all
    after:duration-300
    hover:after:border-emerald-400
    hover:after:scale-y-110
  "
>
  {/* Hyper-Dimensional Plasma Core */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-cyan-500/10 via-emerald-500/5 to-cyan-500/10 blur-md transition-opacity duration-500 pointer-events-none" />

  <span className="relative z-10 flex items-center gap-2 uppercase">
    {/* Vector Grid Telemetry Node */}
    <span className="text-[9px] text-cyan-500/40 group-hover:text-emerald-400/60 transition-colors select-none font-sans">
      
    </span>
    
    1
    
    {/* Micro Photon Indicator */}
  <span className="
  w-1 
  h-1 
  rounded-full 
  bg-red-500 
  group-hover:bg-rose-400 
  group-hover:animate-ping 
  shadow-[0_0_10px_rgba(239,68,68,0.8)] 
  transition-all
" />

  </span>
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
    SignIn
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
      top-14
      right-0
      w-60
      overflow-hidden
      rounded-3xl

      border border-white/10

      bg-gradient-to-br
      from-slate-950/95
      via-black/95
      to-cyan-950/40

      backdrop-blur-2xl

      shadow-[0_20px_60px_rgba(0,0,0,0.6)]
      before:absolute
      before:inset-0
      before:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.15),transparent_40%)]

      after:absolute
      after:inset-0
      after:bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent)]

      animate-in
      fade-in
      zoom-in-95
      duration-200
    "
  >
    {/* Glow line */}
    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />


{/* Theme Toggle */}
<div className="absolute top-4 right-4 z-20">
  <button
onClick={() => setLightMode(!lightMode)}
    className="
      h-9
      w-9
      rounded-full
      border
      border-cyan-500/20
      bg-white/5
      flex
      items-center
      justify-center
      text-yellow-400
      hover:bg-cyan-500/10
      transition-all
      duration-300
      hover:rotate-180
    "
  >
{lightMode ? (
  <Moon size={18} />
) : (
  <Sun size={18} />
)}
  </button>
</div>


    <div className="relative z-10">

      <button
        onClick={() => router.push('/settings')}
        className="
          w-full
          px-5
          py-3
          flex
          items-center
          gap-3
          text-left
          text-slate-200
          hover:bg-cyan-500/10
          hover:text-cyan-300
          transition-all
          duration-300
        "
      >
        <Settings size={18} />
        Settings
      </button>

      <button
        onClick={() => router.push('/leaderboard')}
        className="
          w-full
          px-5
          py-3
          flex
          items-center
          gap-3
          text-left
          text-slate-200
          hover:bg-cyan-500/10
          hover:text-cyan-300
          transition-all
          duration-300
        "
      >
        <Trophy size={18} />
        Leaderboard
      </button>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

      <button
        onClick={onLogout}
        className="
          w-full
          px-5
          py-3
          flex
          items-center
          gap-3
          text-left
          text-red-400
          hover:bg-red-500/10
          transition-all
          duration-300
        "
      >
        <LogOut size={18} />
        Logout
      </button>

    </div>
  </div>
)}

</div>



        </div>
      </div>
            

      {/* Bottom Red Accent */}
   <div className="absolute left-0 right-0 top-full pointer-events-none z-[60]">
  <div className="h-[2px] w-full bg-red-500" />
</div>
    </header>
  )
}