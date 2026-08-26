'use client'

import { Flame, MessageCircle, Sparkles } from 'lucide-react'
import PostCardValley from './PostCardValley'

interface PostCardMetaProps {
  likes: number
  reaxCount: number
  commentsCount: number
  onCommentsClick?: () => void
}

function formatCount(value: number): string {
  if (value < 1000) {
    return value.toLocaleString()
  }

  if (value < 10000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  if (value < 1000000) {
    return `${Math.round(value / 1000)}k`
  }

  return `${(value / 1000000).toFixed(1)}M`
}

export default function PostCardMeta({
  likes,
  reaxCount,
  commentsCount,
  onCommentsClick,
}: PostCardMetaProps) {
  const totalReactions = likes

  const hasContent =
    totalReactions > 0 ||
    reaxCount > 0 ||
    commentsCount > 0

  if (!hasContent) return null

  return (
    <PostCardValley>

      <div
        className="
          flex
          min-h-[28px]
          w-full
          items-center
          justify-between
          gap-2
          px-2.5
          py-1
          text-[10px]
          font-medium
          leading-none
          tracking-tight
          text-[var(--muted)]
          antialiased
        "
      >

        {/* LEFT — REACTIONS */}
        <div className="flex min-w-0 items-center">

          {totalReactions > 0 && (
            <div className="flex items-center gap-1.5">

              <span
                className="
                  flex
                  h-4
                  w-4
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-rose-500/10
                  text-rose-500
                  dark:text-rose-400
                "
              >
                <Flame
                  size={10}
                  strokeWidth={2.5}
                  className="fill-current"
                />
              </span>

              <span className="font-semibold text-[var(--foreground)]">
                {formatCount(totalReactions)}
              </span>

            </div>
          )}

        </div>

        {/* RIGHT */}
        <div className="flex min-w-0 items-center gap-2.5">

          {/* REAX */}
          {reaxCount > 0 && (
            <div className="flex shrink-0 items-center gap-1">

              <Sparkles
                size={10}
                strokeWidth={2}
                className="
                  text-amber-500
                  dark:text-amber-400
                "
              />

              <span>
                {formatCount(reaxCount)}

                <span
                  className="
                    ml-0.5
                    hidden
                    min-[360px]:inline
                    opacity-60
                  "
                >
                  Reax
                </span>
              </span>

            </div>
          )}

          {/* DISCUSSIONS */}
          {commentsCount > 0 && (
            <button
              type="button"
              onClick={onCommentsClick}
              aria-label={`Open ${commentsCount} ${
                commentsCount === 1
                  ? 'discussion'
                  : 'discussions'
              }`}
              className="
                group
                relative
                flex
                shrink-0
                items-center
                gap-1
                rounded-md
                px-1.5
                py-1
                text-[10px]
                transition-all
                duration-150
                touch-manipulation
                hover:bg-[var(--surface-hover)]
                hover:text-[var(--foreground)]
                active:scale-95
              "
            >

              <MessageCircle
                size={10}
                strokeWidth={2}
                className="
                  shrink-0
                  text-[var(--muted)]
                  transition-colors
                  group-hover:text-cyan-400
                  group-active:text-cyan-400
                "
              />

              <span className="whitespace-nowrap">
                {formatCount(commentsCount)}

                <span className="ml-0.5 opacity-60">
                  <span className="hidden min-[340px]:inline">
                    {commentsCount === 1
                      ? 'discussion'
                      : 'discussions'}
                  </span>
                </span>
              </span>

            </button>
          )}

        </div>

      </div>

    </PostCardValley>
  )
}