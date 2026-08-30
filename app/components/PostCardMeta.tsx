'use client'

import {
  Flame,
  MessageCircle,
  Sparkles,
} from 'lucide-react'

import PostCardValley from './PostCardValley'

interface PostCardMetaProps {
  likes: number
  reaxCount: number
  commentsCount: number
  onCommentsClick?: () => void
}

/*
 * =====================================================
 * FORMAT COUNTS
 * =====================================================
 */

function formatCount(value: number): string {
  if (value < 1000) {
    return value.toLocaleString()
  }

  if (value < 10000) {
    return `${(value / 1000)
      .toFixed(1)
      .replace('.0', '')}k`
  }

  if (value < 1000000) {
    return `${Math.round(value / 1000)}k`
  }

  return `${(value / 1000000)
    .toFixed(1)
    .replace('.0', '')}M`
}

/*
 * =====================================================
 * COMPONENT
 * =====================================================
 */

export default function PostCardMeta({
  likes,
  reaxCount,
  commentsCount,
  onCommentsClick,
}: PostCardMetaProps) {
  const totalReactions = Math.max(
    0,
    likes
  )

  const hasContent =
    totalReactions > 0 ||
    reaxCount > 0 ||
    commentsCount > 0

  if (!hasContent) {
    return null
  }

  return (
    <PostCardValley>
      <div
        className="
          flex
          min-h-[32px]
          w-full
          items-center
          justify-between
          gap-3
          px-4
          py-1.5
          font-['Courier_New']
          text-[11px]
          leading-none
          text-[var(--muted)]
          select-none
        "
      >

        {/* =================================================
            LEFT — REACTION COUNT
            ================================================= */}

        <div className="flex min-w-0 items-center">
          {totalReactions > 0 && (
            <div
              className="
                flex
                items-center
                gap-1.5
              "
            >
              {/* Reaction icon */}
              <span
                className="
                  flex
                  h-[18px]
                  w-[18px]
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

              {/* Count */}
              <span
                className="
                  font-['Courier_New']
                  text-[11px]
                  font-bold
                  text-[var(--foreground)]
                "
              >
                {formatCount(
                  totalReactions
                )}
              </span>
            </div>
          )}
        </div>

        {/* =================================================
            RIGHT — REAX + COMMENTS
            ================================================= */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >

          {/* =================================================
              REAX
              ================================================= */}

          {reaxCount > 0 && (
            <div
              className="
                flex
                shrink-0
                items-center
                gap-1
                font-['Courier_New']
                text-[10px]
              "
            >
              <Sparkles
                size={11}
                strokeWidth={2}
                className="
                  shrink-0
                  text-amber-500
                  dark:text-amber-400
                "
              />

              <span
                className="
                  font-semibold
                  text-[var(--muted)]
                "
              >
                {formatCount(
                  reaxCount
                )}
              </span>

              <span
                className="
                  hidden
                  text-[9px]
                  opacity-60
                  min-[380px]:inline
                "
              >
                Reax
              </span>
            </div>
          )}

          {/* =================================================
              COMMENTS
              ================================================= */}

          {commentsCount > 0 && (
            <button
              type="button"
              onClick={onCommentsClick}
              aria-label={`Open ${commentsCount} ${
                commentsCount === 1
                  ? 'comment'
                  : 'comments'
              }`}
              className="
                group
                flex
                shrink-0
                items-center
                gap-1.5
                rounded-md
                px-1.5
                py-1
                font-['Courier_New']
                text-[10px]
                text-[var(--muted)]
                transition-colors
                duration-150
                hover:bg-[var(--surface-hover)]
                hover:text-[var(--foreground)]
                active:scale-95
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#1877F2]/40
                touch-manipulation
              "
            >
              <MessageCircle
                size={11}
                strokeWidth={2}
                className="
                  shrink-0
                  transition-colors
                  duration-150
                  group-hover:text-[#1877F2]
                  group-active:text-[#1877F2]
                "
              />

              <span
                className="
                  whitespace-nowrap
                  font-semibold
                "
              >
                {formatCount(
                  commentsCount
                )}
              </span>

              <span
                className="
                  hidden
                  opacity-60
                  min-[400px]:inline
                "
              >
                {commentsCount === 1
                  ? 'comment'
                  : 'comments'}
              </span>
            </button>
          )}

        </div>
      </div>
    </PostCardValley>
  )
}