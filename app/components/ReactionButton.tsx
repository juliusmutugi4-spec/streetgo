'use client'

import React, { useEffect, useState } from 'react'
import {
  Check,
  Loader2,
  Sparkles,
  Wallet,
} from 'lucide-react'

interface Props {
  handleSendReax: () => Promise<void>
  reaxCount: number
}

export default function ReactionButton({
  handleSendReax,
  reaxCount,
}: Props) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)

  /*
   * =====================================================
   * SOUND
   * =====================================================
   */

  const playClickSound = (
    type: 'click' | 'success' | 'error'
  ) => {
    try {
      const AudioContext =
        window.AudioContext ||
        (window as any).webkitAudioContext

      if (!AudioContext) return

      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'click') {
        oscillator.type = 'sine'

        oscillator.frequency.setValueAtTime(
          400,
          ctx.currentTime
        )

        oscillator.frequency.exponentialRampToValueAtTime(
          800,
          ctx.currentTime + 0.05
        )

        gain.gain.setValueAtTime(
          0.04,
          ctx.currentTime
        )

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.08
        )

        oscillator.start()
        oscillator.stop(
          ctx.currentTime + 0.08
        )
      }

      if (type === 'success') {
        oscillator.type = 'sine'

        oscillator.frequency.setValueAtTime(
          600,
          ctx.currentTime
        )

        oscillator.frequency.exponentialRampToValueAtTime(
          1200,
          ctx.currentTime + 0.1
        )

        gain.gain.setValueAtTime(
          0.06,
          ctx.currentTime
        )

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.2
        )

        oscillator.start()
        oscillator.stop(
          ctx.currentTime + 0.2
        )
      }

      if (type === 'error') {
        oscillator.type = 'sine'

        oscillator.frequency.setValueAtTime(
          180,
          ctx.currentTime
        )

        oscillator.frequency.linearRampToValueAtTime(
          90,
          ctx.currentTime + 0.12
        )

        gain.gain.setValueAtTime(
          0.05,
          ctx.currentTime
        )

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + 0.15
        )

        oscillator.start()
        oscillator.stop(
          ctx.currentTime + 0.15
        )
      }

      setTimeout(() => {
        try {
          void ctx.close()
        } catch {}
      }, 250)
    } catch {
      // Sound must never break the button.
    }
  }

  /*
   * =====================================================
   * SENT STATE
   * =====================================================
   */

  useEffect(() => {
    if (!sent) return

    const timer = window.setTimeout(() => {
      setSent(false)
    }, 1800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [sent])

  /*
   * =====================================================
   * ERROR STATE
   * =====================================================
   */

  useEffect(() => {
    if (!error) return

    const timer = window.setTimeout(() => {
      setError(false)
    }, 2500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [error])

  /*
   * =====================================================
   * SEND REAX
   * =====================================================
   */

  const clickReax = async () => {
    if (sending) return

    setSending(true)
    setError(false)

    playClickSound('click')

    try {
      await handleSendReax()

      setSent(true)

      playClickSound('success')
    } catch (err: any) {
      playClickSound('error')

      const message =
        err?.message || ''

      if (
        message
          .toLowerCase()
          .includes('insufficient reax')
      ) {
        setError(true)
      } else {
        alert(
          message || 'Unable to send Reax.'
        )
      }
    } finally {
      setSending(false)
    }
  }

  /*
   * =====================================================
   * DISPLAY COUNT
   * =====================================================
   */

  const displayCount =
    sent
      ? reaxCount + 1
      : reaxCount

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <button
      type="button"
      onClick={clickReax}
      disabled={sending}
      aria-label={`Send Reax. Current count: ${displayCount}`}
      className={`
        group
        relative
        flex
        h-10
        w-full
        items-center
        justify-center
        gap-2
        rounded-lg
        px-2
        font-['Courier_New']
        text-[11px]
        font-bold
        tracking-wide
        select-none
        touch-manipulation
        transition-all
        duration-150
        active:scale-[0.97]
        focus:outline-none
        focus-visible:ring-2

        ${
          sending
            ? `
              text-purple-500
              focus-visible:ring-purple-400/40
            `
            : error
              ? `
                text-rose-500
                focus-visible:ring-rose-400/40
              `
              : sent
                ? `
                  text-emerald-500
                  focus-visible:ring-emerald-400/40
                `
                : `
                  text-emerald-500
                  hover:bg-emerald-500/10
                  hover:text-emerald-400
                  focus-visible:ring-emerald-400/40
                `
        }

        disabled:cursor-wait
        disabled:opacity-90
      `}
    >

      {/* =================================================
          ICON
          ================================================= */}

      <span
        className="
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
        "
      >
        {sending ? (
          <Loader2
            size={17}
            strokeWidth={2.2}
            className="
              animate-spin
              text-purple-500
            "
          />
        ) : error ? (
          <Wallet
            size={17}
            strokeWidth={2}
            className="
              text-rose-500
            "
          />
        ) : sent ? (
          <Check
            size={17}
            strokeWidth={2.5}
            className="
              text-emerald-500
              animate-[scale_0.2s_ease-out]
            "
          />
        ) : (
          <Sparkles
            size={17}
            strokeWidth={2}
            className="
              text-emerald-500
              transition-all
              duration-150
              group-hover:scale-110
              group-hover:text-emerald-400
            "
          />
        )}
      </span>

      {/* =================================================
          LABEL
          ================================================= */}

      <span className="whitespace-nowrap">
        {sending
          ? 'Sending'
          : error
            ? 'Empty'
            : sent
              ? 'Sent'
              : 'Reax'}
      </span>

      {/* =================================================
          COUNT
          ================================================= */}

      <span
        className={`
          min-w-[18px]
          text-left
          tabular-nums

          ${
            sending
              ? 'text-purple-500'
              : error
                ? 'text-rose-500'
                : 'text-emerald-500'
          }
        `}
      >
        {displayCount.toLocaleString()}
      </span>

      {/* =================================================
          STATUS LINE
          ================================================= */}

      <span
        className={`
          pointer-events-none
          absolute
          bottom-0
          left-2
          right-2
          h-[2px]
          rounded-full
          transition-all
          duration-300

          ${
            sending
              ? `
                bg-purple-500
                animate-pulse
              `
              : sent
                ? `
                  bg-emerald-500
                `
                : error
                  ? `
                    bg-rose-500
                  `
                  : `
                    scale-x-0
                    bg-transparent
                  `
          }
        `}
      />

    </button>
  )
}