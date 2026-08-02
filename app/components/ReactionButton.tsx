'use client'

import React, { useState } from 'react'
import { ThumbsUp } from 'lucide-react' // Using ThumbsUp for the classic Facebook layout

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
        }, 2500)
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
      aria-label={`Tip ${reaxCount} reactions`}
      className={`
        group relative inline-flex items-center gap-2 rounded-md
        px-3 py-1.5 text-sm font-semibold select-none
        transition-all duration-150 ease-in-out
        active:scale-[0.96]
        disabled:opacity-70 disabled:pointer-events-none
        
        ${
          error
            ? "text-red-500 bg-red-500/10 border border-red-500/20"
            : sent
            ? "text-[#1877F2] bg-blue-500/5" // Premium Facebook Blue Accent
            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
        }
      `}
    >
      {/* Icon Frame with Dynamic Spring Animation */}
      <ThumbsUp
        strokeWidth={2.2}
        className={`
          w-5 h-5 transition-transform duration-200 will-change-transform
          
          ${
            error
              ? "fill-red-500 stroke-red-500"
              : sent
              ? "fill-[#1877F2] stroke-[#1877F2] animate-[fb-bounce_0.35s_cubic-bezier(0.175,0.885,0.32,1.275)_1]"
              : "fill-none stroke-current group-hover:scale-105"
          }
        `}
      />

      {/* Button Text Label */}
      <span className="leading-none transition-all duration-150 min-w-[56px] text-left">
        {sending ? (
          <span className="inline-flex gap-0.5 items-center justify-start animate-pulse py-0.5">
            <span className="h-1 w-1 rounded-full bg-current" />
            <span className="h-1 w-1 rounded-full bg-current [animation-delay:0.2s]" />
            <span className="h-1 w-1 rounded-full bg-current [animation-delay:0.4s]" />
          </span>
        ) : error ? (
          "Fund REAX"
        ) : sent ? (
          "+1"
        ) : (
          `Tip ${reaxCount}`
        )}
      </span>
    </button>
  )
}
