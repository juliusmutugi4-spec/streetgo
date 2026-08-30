'use client'

import {
  Flame,
  MessageSquare,
  Send,
} from 'lucide-react'

import ReactionButton from './ReactionButton'

interface PostActionsProps {
  liked: boolean
  likes: number
  comments: any[]
  reaxCount: number
  toggleLike: () => void
  handleSendReax: () => Promise<void>
  setOpenRoom: (
    open: boolean
  ) => void | Promise<void>
  post: {
    id: string
    content: string
  }
  onOpenDispatch: (post: any) => void
  onRequireAuth?: () => void
}

/*
 * =====================================================
 * COUNT FORMAT
 * =====================================================
 */

function formatCount(
  value: number
): string {
  const safeValue = Math.max(
    0,
    Number(value) || 0
  )

  if (safeValue < 1000) {
    return safeValue.toLocaleString()
  }

  if (safeValue < 10000) {
    return `${(safeValue / 1000)
      .toFixed(1)
      .replace('.0', '')}k`
  }

  if (safeValue < 1000000) {
    return `${Math.round(
      safeValue / 1000
    )}k`
  }

  if (safeValue < 1000000000) {
    return `${(safeValue / 1000000)
      .toFixed(1)
      .replace('.0', '')}M`
  }

  return `${(safeValue / 1000000000)
    .toFixed(1)
    .replace('.0', '')}B`
}

/*
 * =====================================================
 * COMPONENT
 * =====================================================
 */

export default function PostActions({
  liked,
  likes,
  comments,
  reaxCount,
  toggleLike,
  handleSendReax,
  setOpenRoom,
  post,
  onOpenDispatch,
}: PostActionsProps) {
  const safeLikes = Math.max(
    0,
    Number(likes) || 0
  )

  const commentsCount =
    Array.isArray(comments)
      ? comments.length
      : 0

  const safeReax = Math.max(
    0,
    Number(reaxCount) || 0
  )

  /*
   * =====================================================
   * SOUND
   * =====================================================
   */

  const playSound = (
    type:
      | 'click'
      | 'success'
      | 'pop'
  ) => {
    try {
      const AudioContext =
        window.AudioContext ||
        (
          window as any
        ).webkitAudioContext

      if (!AudioContext) {
        return
      }

      const ctx =
        new AudioContext()

      const oscillator =
        ctx.createOscillator()

      const gain =
        ctx.createGain()

      oscillator.connect(gain)
      gain.connect(
        ctx.destination
      )

      if (type === 'click') {
        oscillator.type = 'sine'

        oscillator.frequency.setValueAtTime(
          400,
          ctx.currentTime
        )

        oscillator.frequency.exponentialRampToValueAtTime(
          100,
          ctx.currentTime + 0.05
        )

        gain.gain.setValueAtTime(
          0.04,
          ctx.currentTime
        )

        gain.gain.linearRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.05
        )

        oscillator.start()
        oscillator.stop(
          ctx.currentTime + 0.05
        )
      }

      if (type === 'success') {
        oscillator.type =
          'triangle'

        oscillator.frequency.setValueAtTime(
          523.25,
          ctx.currentTime
        )

        oscillator.frequency.setValueAtTime(
          659.25,
          ctx.currentTime + 0.06
        )

        gain.gain.setValueAtTime(
          0.06,
          ctx.currentTime
        )

        gain.gain.linearRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.15
        )

        oscillator.start()
        oscillator.stop(
          ctx.currentTime + 0.15
        )
      }

      if (type === 'pop') {
        oscillator.type = 'sine'

        oscillator.frequency.setValueAtTime(
          150,
          ctx.currentTime
        )

        oscillator.frequency.exponentialRampToValueAtTime(
          600,
          ctx.currentTime + 0.08
        )

        gain.gain.setValueAtTime(
          0.05,
          ctx.currentTime
        )

        gain.gain.linearRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.08
        )

        oscillator.start()
        oscillator.stop(
          ctx.currentTime + 0.08
        )
      }

      window.setTimeout(() => {
        try {
          void ctx.close()
        } catch {
          // Ignore cleanup.
        }
      }, 200)
    } catch {
      // Sound should never affect the UI.
    }
  }

  /*
   * =====================================================
   * ACTIONS
   * =====================================================
   */

  const handleLikeClick = () => {
    playSound(
      liked
        ? 'click'
        : 'pop'
    )

    toggleLike()
  }

  const handleCommentClick = () => {
    playSound('click')
    void setOpenRoom(true)
  }

  const handleDispatch = () => {
    playSound('success')
    onOpenDispatch(post)
  }

  /*
   * =====================================================
   * MICRO BUTTON
   * =====================================================
   */

  const buttonBase = `
    group
    flex
    h-7
    min-w-0
    flex-1
    items-center
    justify-center
    gap-1
    rounded-md
    px-1
    font-['Courier_New']
    text-[9px]
    font-bold
    leading-none
    tracking-tight
    text-[var(--muted)]
    transition-colors
    duration-150
    touch-manipulation
    select-none
    active:scale-[0.97]
    focus:outline-none
    focus-visible:ring-1
    focus-visible:ring-[var(--accent)]/40
    hover:bg-[var(--surface-hover)]
  `

  return (
    <div
      className="
        w-full
        bg-[var(--surface)]
        px-1.5
        py-0.5
        select-none
      "
    >
      <div
        className="
          flex
          w-full
          items-center
          gap-0.5
        "
      >

        {/* =================================================
            IGNITE
            ================================================= */}

        <button
          type="button"
          onClick={handleLikeClick}
          aria-label={
            liked
              ? `Remove Ignite. ${safeLikes}`
              : `Ignite post. ${safeLikes}`
          }
          aria-pressed={liked}
          className={`
            ${buttonBase}

            ${
              liked
                ? `
                  text-rose-500
                  hover:bg-rose-500/10
                `
                : `
                  hover:text-rose-500
                `
            }
          `}
        >
          <Flame
            size={13}
            strokeWidth={2}
            className={`
              shrink-0
              transition-transform
              duration-150

              ${
                liked
                  ? `
                    fill-current
                    scale-105
                  `
                  : `
                    group-hover:scale-105
                  `
              }
            `}
          />

          <span className="truncate">
            Ignite
          </span>

          <span
            className={`
              shrink-0
              tabular-nums

              ${
                liked
                  ? 'text-rose-500'
                  : 'text-[var(--muted)]'
              }
            `}
          >
            {formatCount(
              safeLikes
            )}
          </span>
        </button>

        {/* =================================================
            DISCUSS
            ================================================= */}

        <button
          type="button"
          onClick={
            handleCommentClick
          }
          aria-label={`Open comments. ${commentsCount}`}
          className={`
            ${buttonBase}

            hover:text-[var(--accent)]
          `}
        >
          <MessageSquare
            size={13}
            strokeWidth={2}
            className="
              shrink-0
              transition-transform
              duration-150
              group-hover:scale-105
            "
          />

          <span className="truncate">
            Discuss
          </span>

          <span
            className="
              shrink-0
              tabular-nums
              text-[var(--muted)]
            "
          >
            {formatCount(
              commentsCount
            )}
          </span>
        </button>

        {/* =================================================
            REAX
            ================================================= */}

        <div
          className="
            flex
            h-7
            min-w-0
            flex-1
            items-center
            justify-center
            overflow-hidden
            rounded-md
            hover:bg-emerald-500/[0.04]
          "
        >
          <ReactionButton
            handleSendReax={
              handleSendReax
            }
            reaxCount={
              safeReax
            }
          />
        </div>

        {/* =================================================
            DISPATCH
            ================================================= */}

        <button
          type="button"
          onClick={
            handleDispatch
          }
          aria-label="Dispatch post"
          className={`
            ${buttonBase}

            hover:text-emerald-500
            hover:bg-emerald-500/[0.04]
          `}
        >
          <Send
            size={13}
            strokeWidth={2}
            className="
              shrink-0
              transition-transform
              duration-150
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          />

          <span className="truncate">
            Dispatch
          </span>
        </button>

      </div>
    </div>
  )
}