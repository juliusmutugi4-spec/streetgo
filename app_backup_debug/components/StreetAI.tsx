'use client'

interface StreetAIProps {
  visible: boolean
  username: string
  viewerCount: number
}

export default function StreetAI({
  visible,
  username,
  viewerCount,
}: StreetAIProps) {
  if (!visible) return null

  return (
    <div
      className="
        absolute
top-2
left-14
        z-40
        w-56
        overflow-hidden
        rounded-2xl
        border
        border-cyan-500/20
        bg-zinc-950/95
        backdrop-blur-xl
        shadow-[0_20px_60px_rgba(0,0,0,0.45)]
        animate-in
        fade-in
        slide-in-from-top-2
        duration-500
      "
    >
<div className="border-b border-cyan-500/20 bg-cyan-500/5 px-4 py-3">
  <div className="flex items-center justify-between">
    <span className="text-xs font-bold text-cyan-400">
      🔥 LIVE NOW
    </span>

    <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-400">
      {viewerCount} HERE
    </span>
  </div>
</div>

<div className="p-4">
  <p className="text-sm font-semibold text-white">
    🔥 Live Discussion Started
  </p>

  <p className="mt-2 text-sm text-zinc-300">
    <span className="font-semibold text-cyan-400">
      {viewerCount}
    </span>{" "}
    people are viewing this post right now.
  </p>

  <p className="mt-3 text-sm text-white">
    Join the live conversation and react together.
  </p>
</div>

<div className="px-4 pb-4">
  <button
    className="
      w-full
      rounded-xl
      bg-cyan-500
      py-3
      text-sm
      font-semibold
      text-black
      transition
      hover:scale-[1.02]
      active:scale-95
    "
  >
    🚀 Join Live Discussion
  </button>
</div>
    </div>
  )
}