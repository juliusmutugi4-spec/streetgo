'use client'
import React from 'react'
interface Comment {
  id: string | number
  username: string
  avatar_url?: string
  created_at: string | Date
  content: string
  sentiment?: 'positive' | 'neutral'
}

interface LiveCommentCardProps {
  comment: Comment
  priority: number
}

const PROFILES = [
  { badge: "LIVE", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400", dot: "bg-emerald-400" },
  { badge: "SYNC", color: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400", dot: "bg-cyan-400" }
]

function LiveCommentCard({ comment, priority }: LiveCommentCardProps) {
  const profile = PROFILES[priority] ?? PROFILES[0]
  const words =
  comment.content?.trim().split(/\s+/).filter(Boolean).length ?? 0

const isLong = words >= 25

const size =
  words <= 6
    ? "compact"
    : words <= 24
      ? "normal"
      : "large"

  return (
    <div
  className={`
    relative
    overflow-hidden
    rounded-xl
    border
    border-white/5
    bg-zinc-950
    w-full
    max-w-full
    shadow-2xl
    transition-all
    duration-300

    ${
      size === "compact"
        ? "p-2"
        : size === "normal"
        ? "p-3"
        : "p-5"
    }
  `}
>
      {/* Animated Scan Line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-liveEdge" />

      {/* Header Area */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <img 
            src={comment.avatar_url || "/avatar-placeholder.png"} 
            className="h-7 w-7 rounded-lg border border-white/10 object-cover flex-shrink-0" 
            alt=""
          />
          <div className="min-w-0">
            <div className="font-medium text-white truncate text-[11px] leading-tight">
              {comment.username}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">
              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Dynamic Badge */}
        <div className={`flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[9px] font-medium tracking-wider ${profile.color}`}>
          <span className={`h-1 w-1 rounded-full animate-pulse ${profile.dot}`} />
          {profile.badge}
        </div>
      </div>

      {/* AI Mini Summary */}
      {isLong && (
        <div className="mb-2 rounded-md border border-cyan-500/10 bg-cyan-500/5 px-2 py-1.5 text-[10px] text-cyan-400/90">
          <span className="font-bold tracking-wider text-[9px] mr-1">AI:</span> 
          Long-form discussion detected.
        </div>
      )}

      {/* Comment Body */}
      <p className="text-zinc-300 leading-normal break-words text-[11px]">
        {comment.content}
      </p>
    </div>
  )
}

export default React.memo(LiveCommentCard)