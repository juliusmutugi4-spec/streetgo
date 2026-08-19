'use client'

import { Flame, MessageCircle, Sparkles } from 'lucide-react'

interface PostCardMetaProps {
  likes: number
  reaxCount: number
  commentsCount: number
  onCommentsClick?: () => void
}

export default function PostCardMeta({
  likes,
  reaxCount,
  commentsCount,
  onCommentsClick,
}: PostCardMetaProps) {
  const totalReactions = likes + reaxCount

  return (
    <div className="relative w-full select-none">
      {/* 
        PREMIUM VALLEY / RECESSED CHANNEL 
        Uses layered shadows for realistic physical depth and high-end aesthetics.
      */}
      <div
        className="
          relative
          mx-4
          -mt-[1px]
          overflow-hidden
          rounded-b-2xl
          border-x
          border-b
          border-[var(--border)]
          bg-[var(--background)]
          shadow-[inset_0_4px_12px_rgba(0,0,0,0.08),_inset_0_1px_2px_rgba(0,0,0,0.1)]
        "
      >
        {/* Top edge crisp ambient reflection mask */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-[var(--border)]
            to-transparent
            opacity-40
          "
        />

        {/* Meta content layout */}
        <div
          className="
            relative
            flex
            min-h-[36px]
            items-center
            justify-between
            gap-6
            px-4
            py-1.5
            text-[12px]
            font-medium
            text-[var(--muted)]
          "
        >
          {/* LEFT: TOTAL ENGAGEMENT */}
          <div className="flex items-center gap-2">
            {totalReactions > 0 && (
              <div className="flex items-center gap-1.5 dynamic-fade-in">
                <span
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-rose-500/10
                    text-rose-500
                    dark:text-rose-400
                  "
                >
                  <Flame size={11} strokeWidth={2.5} className="fill-current" />
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  {totalReactions.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: INTERACTIONS */}
          <div className="flex items-center gap-4">
            {/* SPECIAL REACTION COUNTER */}
            {reaxCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                <Sparkles size={12} strokeWidth={2} className="text-amber-500 dark:text-amber-400" />
                <span>
                  {reaxCount} <span className="opacity-80">Reax</span>
                </span>
              </div>
            )}

            {/* DISCUSSION INTERACTIVE BUTTON */}
            {commentsCount > 0 && (
              <button
                type="button"
                onClick={onCommentsClick}
                className="
                  group
                  flex
                  items-center
                  gap-1.5
                  rounded-md
                  px-2
                  py-1
                  text-[12px]
                  transition-all
                  duration-200
                  hover:bg-[var(--surface-hover)]
                  hover:text-[var(--foreground)]
                  active:scale-95
                "
              >
                <MessageCircle 
                  size={12} 
                  strokeWidth={2} 
                  className="text-[var(--muted)] transition-colors group-hover:text-blue-500" 
                />
                <span>
                  {commentsCount}{' '}
                  <span className="opacity-80">
                    {commentsCount === 1 ? 'discussion' : 'discussions'}
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
