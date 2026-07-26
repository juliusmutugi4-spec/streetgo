'use client'

interface StreetAIProps {
  visible: boolean
  username: string
}

export default function StreetAI({
  visible,
  username,
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
      <div className="border-b border-white/5 px-4 py-3">
        <span className="text-xs font-semibold text-cyan-400">
          🤖 StreetGO AI
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm text-white leading-relaxed">
          Hi <span className="text-cyan-400">@{username}</span> 👋
        </p>

        <p className="mt-2 text-sm text-zinc-300">
          I've noticed you're spending some time on this post...
        </p>

        <p className="mt-3 text-sm text-white">
          What caught your attention first?
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-4">
        <button className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300 whitespace-nowrap">
          🔥 Title
        </button>

        <button className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300 whitespace-nowrap">
          📸 Image
        </button>

        <button className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300 whitespace-nowrap">
          💬 Comments
        </button>

        <button className="rounded-full bg-cyan-500/10 px-3 py-2 text-xs text-cyan-300 whitespace-nowrap">
          🎥 Video
        </button>
      </div>
    </div>
  )
}