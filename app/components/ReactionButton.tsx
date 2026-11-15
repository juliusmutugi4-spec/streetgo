
'use client'

import { useEffect, useState } from 'react'
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

  const count = Math.max(0, Number(reaxCount) || 0)

  const playSound = (type: 'click' | 'success' | 'error') => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext

      if (!AudioContextClass) return

      const ctx = new AudioContextClass()
      const oscillator = ctx.createOscillator()
      const gain = ctx.createGain()

      oscillator.connect(gain)
      gain.connect(ctx.destination)

      const settings = {
        click: { start: 400, end: 800, duration: 0.08, volume: 0.04 },
        success: { start: 600, end: 1200, duration: 0.2, volume: 0.06 },
        error: { start: 180, end: 90, duration: 0.15, volume: 0.05 },
      }[type]

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(settings.start, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(
        settings.end,
        ctx.currentTime + settings.duration
      )

      gain.gain.setValueAtTime(settings.volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + settings.duration
      )

      oscillator.start()
      oscillator.stop(ctx.currentTime + settings.duration)

      window.setTimeout(() => {
        void ctx.close().catch(() => {})
      }, 300)
    } catch {
      // Audio is optional.
    }
  }

  useEffect(() => {
    if (!sent) return

    const timer = window.setTimeout(() => setSent(false), 1800)
    return () => window.clearTimeout(timer)
  }, [sent])

  useEffect(() => {
    if (!error) return

    const timer = window.setTimeout(() => setError(false), 2500)
    return () => window.clearTimeout(timer)
  }, [error])

  const clickReax = async () => {
    if (sending) return

    setSending(true)
    setError(false)
    setSent(false)

    playSound('click')

    try {
      await handleSendReax()

      setSent(true)
      playSound('success')
    } catch (err: any) {
      const message = err?.message || ''

      // Authentication modal has already been requested by Post.tsx.
      if (message === 'AUTH_REQUIRED') return

      playSound('error')

      if (message.toLowerCase().includes('insufficient reax')) {
        setError(true)
      } else {
        alert(message || 'Unable to send REAX.')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={clickReax}
      disabled={sending}
      aria-label={`Send REAX. Current count: ${count}`}
      className={`
        group relative flex h-10 w-full min-w-0
        items-center justify-center gap-1.5
        rounded-lg px-1
        font-sans text-[11px] sm:text-xs font-semibold
        leading-none
        transition-colors duration-150
        touch-manipulation select-none
        active:scale-[0.97]
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-emerald-400/50
        disabled:cursor-wait disabled:opacity-80
        ${
          sending
            ? 'text-purple-500'
            : error
              ? 'text-rose-500'
              : 'text-emerald-500 hover:bg-emerald-500/10'
        }
      `}
    >
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        {sending ? (
          <Loader2 size={17} className="animate-spin" />
        ) : error ? (
          <Wallet size={17} />
        ) : sent ? (
          <Check size={17} strokeWidth={2.5} />
        ) : (
          <Sparkles
            size={17}
            strokeWidth={2}
            className="transition-transform group-hover:scale-110"
          />
        )}
      </span>

      <span className="truncate">
        {sending ? 'Sending' : error ? 'Empty' : sent ? 'Sent' : 'REAX'}
      </span>

      {/* Use the parent count directly; never add another +1 here. */}
      <span className="shrink-0 tabular-nums">
        {count.toLocaleString()}
      </span>

      {sending && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 animate-pulse rounded-full bg-purple-500" />
      )}

      {sent && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-emerald-500" />
      )}

      {error && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-rose-500" />
      )}
    </button>
  )
}
