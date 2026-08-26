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
  setOpenRoom: React.Dispatch<React.SetStateAction<boolean>>
  post: {
    id: string
    content: string
  }
  onOpenDispatch: (post: any) => void
  onRequireAuth?: () => void
}

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
  onRequireAuth,
}: PostActionsProps) {

  // --------------------------------------------------
  // SOUND ENGINE
  // --------------------------------------------------

  const playSound = (
    type: 'click' | 'success' | 'pop'
  ) => {
    try {
      const AudioContext =
        window.AudioContext ||
        (window as any).webkitAudioContext

      if (!AudioContext) return

      const ctx = new AudioContext()

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'click') {
        osc.type = 'sine'

        osc.frequency.setValueAtTime(
          400,
          ctx.currentTime
        )

        osc.frequency.exponentialRampToValueAtTime(
          100,
          ctx.currentTime + 0.05
        )

        gain.gain.setValueAtTime(
          0.05,
          ctx.currentTime
        )

        gain.gain.linearRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.05
        )

        osc.start()
        osc.stop(
          ctx.currentTime + 0.05
        )
      }

      if (type === 'success') {
        osc.type = 'triangle'

        osc.frequency.setValueAtTime(
          523.25,
          ctx.currentTime
        )

        osc.frequency.setValueAtTime(
          659.25,
          ctx.currentTime + 0.06
        )

        gain.gain.setValueAtTime(
          0.08,
          ctx.currentTime
        )

        gain.gain.linearRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.15
        )

        osc.start()
        osc.stop(
          ctx.currentTime + 0.15
        )
      }

      if (type === 'pop') {
        osc.type = 'sine'

        osc.frequency.setValueAtTime(
          150,
          ctx.currentTime
        )

        osc.frequency.exponentialRampToValueAtTime(
          600,
          ctx.currentTime + 0.08
        )

        gain.gain.setValueAtTime(
          0.06,
          ctx.currentTime
        )

        gain.gain.linearRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.08
        )

        osc.start()
        osc.stop(
          ctx.currentTime + 0.08
        )
      }

    } catch (error) {
      console.error(error)
    }
  }

  // --------------------------------------------------
  // SHARE
  // --------------------------------------------------

  const handleShare = async () => {
    playSound('success')

    const url =
      `${window.location.origin}/post/${post.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StreetGO',
          text: post.content,
          url,
        })
      } catch (error) {
        console.error(
          'Error sharing:',
          error
        )
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  // --------------------------------------------------
  // LIKE
  // --------------------------------------------------

  const handleLikeClick = () => {
    playSound(
      liked
        ? 'click'
        : 'pop'
    )

    toggleLike()
  }

  // --------------------------------------------------
  // COMMENTS
  // --------------------------------------------------

  const handleCommentClick = () => {
    playSound('click')
    setOpenRoom(true)
  }

  return (
    <div
      className="
        w-full
        bg-[var(--surface)]
        p-0
        m-0
        select-none
        border-t
        border-[var(--border)]
        rounded-b-xl
      "
    >

      {/* SUPER SLIM ACTION BAR */}
      <div
        className="
          flex
          h-5
          w-full
          items-center
          justify-between
          gap-0
          p-0
          m-0
        "
      >

        {/* =========================================
            IGNITE
        ========================================= */}

        <button
          type="button"
          onClick={handleLikeClick}
          className="
            flex
            h-5
            min-h-0
            flex-1
            items-center
            justify-center
            gap-0.5
            rounded-md
            p-0
            m-0
            text-[9px]
            font-semibold
            leading-none
            text-[var(--muted)]
            transition-all
            duration-150
            hover:bg-[var(--surface-hover)]
            hover:text-[var(--foreground)]
            active:scale-95
            group
          "
        >

          <Flame
            size={10}
            strokeWidth={2}
            className={`
              shrink-0
              transition-all
              duration-200
              ${
                liked
                  ? `
                    text-rose-500
                    fill-rose-500
                    drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]
                    scale-105
                  `
                  : `
                    text-[var(--muted)]
                    group-hover:text-rose-400
                  `
              }
            `}
          />

          <span
            className={
              liked
                ? 'text-rose-400'
                : ''
            }
          >
            Ignite
          </span>

        </button>


        {/* =========================================
            DISCUSS
        ========================================= */}

        <button
          type="button"
          onClick={handleCommentClick}
          className="
            flex
            h-5
            min-h-0
            flex-1
            items-center
            justify-center
            gap-0.5
            rounded-md
            p-0
            m-0
            text-[9px]
            font-semibold
            leading-none
            text-[var(--muted)]
            transition-all
            duration-150
            hover:bg-[var(--surface-hover)]
            hover:text-[var(--foreground)]
            active:scale-95
            group
          "
        >

          <MessageSquare
            size={10}
            strokeWidth={1.8}
            className="
              shrink-0
              transition-colors
              group-hover:text-cyan-400
            "
          />

          <span>
            Discuss
          </span>

        </button>


        {/* =========================================
            REAX
        ========================================= */}

        <div
          onClick={() =>
            playSound('pop')
          }
          className="
            flex
            h-5
            min-h-0
            flex-1
            items-center
            justify-center
            gap-0
            rounded-md
            p-0
            m-0
            transition-all
            duration-150
            hover:bg-[var(--surface-hover)]
          "
        >

          <ReactionButton
            handleSendReax={
              handleSendReax
            }
            reaxCount={
              reaxCount
            }
          />

        </div>


        {/* =========================================
            DISPATCH
        ========================================= */}

        <div
          className="
            relative
            flex
            h-5
            min-h-0
            flex-1
            p-0
            m-0
          "
        >

          <button
            type="button"
            onClick={() => {
              playSound('success')
              onOpenDispatch(post)
            }}
            className="
              flex
              h-5
              min-h-0
              w-full
              items-center
              justify-center
              gap-0.5
              rounded-md
              p-0
              m-0
              text-[9px]
              font-semibold
              leading-none
              text-[var(--muted)]
              transition-all
              duration-150
              hover:bg-emerald-400/5
              hover:text-[var(--foreground)]
              active:scale-95
              group
            "
          >

            <Send
              size={10}
              strokeWidth={1.8}
              className="
                shrink-0
                transition-all
                duration-150
                group-hover:text-emerald-400
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            />

            <span>
              Dispatch
            </span>

          </button>

        </div>

      </div>

    </div>
  )
}