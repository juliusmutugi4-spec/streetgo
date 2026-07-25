'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

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

  async function clickReax() {
    if (sending) return

    setSending(true)
    setError(false)

    try {
      await handleSendReax()

      setSent(true)

      setTimeout(() => {
        setSent(false)
      }, 1500)

    } catch (err: any) {

      const message = err?.message || ""

      // ONLY show Fund REAX if sender has no balance
      if (message.includes("Insufficient REAX")) {

        setError(true)

        setTimeout(() => {
          setError(false)
        }, 2000)

      } else {

        // Any other error
        alert(message)

      }

    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={clickReax}
      disabled={sending}
      type="button"
      aria-label="Send REAX"
      className={`
        group relative inline-flex items-center gap-1.5 rounded-full
        px-2 py-1 text-[10px] uppercase font-medium tracking-wide
        transition-all duration-200 ease-out
        hover:scale-[1.03]
        active:scale-[0.97]
        disabled:pointer-events-none disabled:opacity-60

        ${
          error
            ? "border border-red-500/40 bg-red-500/10 text-red-500"
            : "border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/30"
        }
      `}
    >
      {!sent && !error && (
        <span className="absolute inset-0 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] bg-emerald-400/15" />
      )}

      <Star
        strokeWidth={2.5}
        className={`
          relative z-10 w-3.5 h-3.5 transition-all duration-300

          ${
            error
              ? "fill-red-500 stroke-red-500"
              : sent
              ? "fill-emerald-500 stroke-emerald-500 scale-110"
              : "fill-none stroke-current"
          }
        `}
      />

      <span className="relative z-10 leading-none min-w-[52px] text-left">
        {sending
          ? "..."
          : error
          ? "Fund REAX"
          : sent
          ? "+1"
          : `Tip ${reaxCount}`}
      </span>
    </button>
  )
}