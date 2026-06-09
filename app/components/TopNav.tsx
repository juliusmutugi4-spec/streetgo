'use client'

import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

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

    {/* Logo */}
    <h1
      className="
        relative
        text-3xl
        md:text-5xl
        font-black
        tracking-widest
        text-center
        transition-all
        duration-500
        group-hover:tracking-[0.25em]
      "
    >
      <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
        C
      </span>

<span className="group relative mx-2 inline-block font-black select-none transition-all duration-700 hover:scale-110">
  {/* Layer 1: Hyper-Space Reality Tear (Deep Neon Silhouette Aura) */}
  <span className="absolute inset-0 translate-x-[2px] translate-y-[2px] select-none text-red-500/40 blur-[4px] filter transition-transform duration-500 group-hover:translate-x-[4px] group-hover:translate-y-[4px]">
    W
  </span>

  {/* Layer 2: Quantum Distortion Glow (Deep Blue Volumetric Under-glow) */}
  <span className="absolute inset-0 select-none text-blue-600 blur-xl filter opacity-90 mix-blend-screen drop-shadow-[0_0_35px_rgba(37,99,235,1)] animate-pulse">
    W
  </span>

  {/* Layer 3: Plasma Shield (Sharp Cyan Neon Core Silhouette) */}
  <span className="absolute inset-0 select-none text-cyan-400 blur-[2px] filter opacity-80 mix-blend-color-dodge group-hover:animate-ping">
    W
  </span>

  {/* Layer 4: The Physical Hologram (Your Original Gradient, Perfected) */}
  <span className="
    relative
    block
    bg-gradient-to-b
    from-white
    via-cyan-200
    to-blue-600
    bg-clip-text
    text-transparent
    font-black
    tracking-tighter
    drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]
    [text-shadow:0_0_50px_rgba(37,99,235,0.5)]
  ">
    W
  </span>

  {/* Layer 5: Chrome Light Flare Reflection (Simulated Liquid Metal Specular Highlight) */}
  <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/80 to-transparent bg-clip-text text-transparent opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100">
    W
  </span>
</span>


      <span className="text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]">
        V
      </span>
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
            <>
              <button
                onClick={() =>
                  router.push('/notifications')
                }
                className="
                  text-zinc-300
                  hover:text-white
                  transition
                "
              >
                <Bell size={22} />
              </button>

              <button
                onClick={onLogout}
                className="
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-red-400
                  border
                  border-zinc-700
                  rounded-lg
                  hover:bg-red-900/20
                  transition
                "
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="
                px-4
                py-2
                text-sm
                font-bold
                text-white
                rounded-lg
                bg-gradient-to-r
                from-red-600
                to-red-700
                hover:from-red-500
                hover:to-red-600
                transition
              "
            >
              Login
            </button>
          )}

        </div>
      </div>
    </header>
  )
}