'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, CheckCircle2, Wallet } from 'lucide-react'

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

  // Web Audio API sound synthesizer
  const playClickSound = (type: 'click' | 'success' | 'error') => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      if (type === 'click') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
      } else if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      } else {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      }
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    } catch (e) {
      console.error("Audio blocked:", e)
    }
  }

  async function clickReax() {
    if (sending) return

    setSending(true)
    setError(false)
    playClickSound('click')

    try {
      await handleSendReax()
      setSent(true)
      playClickSound('success')

      setTimeout(() => {
        setSent(false)
      }, 2500)

    } catch (err: any) {
      const message = err?.message || ""
      playClickSound('error')

      if (message.includes("Insufficient REAX")) {
        setError(true)
        setTimeout(() => setError(false), 4000)
      } else {
        alert(message)
      }
    } finally {
      setSending(false)
    }
  }

  // Optimistic display value to keep the interface fast and informative
  const displayCount = sent ? reaxCount + 1 : reaxCount

  return (
    <button
      onClick={clickReax}
      disabled={sending && !sent}
      type="button"
      aria-label={`Send reaction. Current count is ${displayCount}`}
      className={`
        group relative flex items-center gap-3 rounded-xl
        pl-3.5 pr-4 py-2.5 text-xs font-medium select-none
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        active:scale-[0.97] overflow-hidden border backdrop-blur-md
        
        ${
          error
            ? "text-rose-600 bg-rose-500/[0.06] border-rose-500/30 shadow-sm shadow-rose-500/5 animate-[shake_0.4s_ease-in-out]"
            : sent
            ? "text-emerald-600 bg-emerald-500/[0.06] border-emerald-500/30 shadow-sm shadow-emerald-500/5" 
            : "text-zinc-800 bg-zinc-50/80 border-zinc-200/80 dark:text-zinc-200 dark:bg-zinc-900/80 dark:border-zinc-800 hover:bg-white hover:border-zinc-300 dark:hover:bg-zinc-850 dark:hover:border-zinc-700 hover:shadow-md hover:shadow-zinc-500/5"
        }
      `}
    >
      {/* Dynamic Background Progress/Status Bar */}
      <span 
        className={`absolute bottom-0 left-0 h-[2px] transition-all duration-300 left-0
          ${sending ? "bg-amber-500 w-1/2 animate-[loading-bar_1.5s_infinite_linear]" : ""}
          ${sent ? "bg-emerald-500 w-full" : ""}
          ${error ? "bg-rose-500 w-full" : ""}
          ${!sending && !sent && !error ? "bg-transparent w-0" : ""}
        `} 
      />

      {/* Modern Shimmer Reflection */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-zinc-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

      {/* Icon Frame */}
      <div className={`
        flex items-center justify-center w-5 h-5 rounded-lg transition-colors duration-200
        ${error ? "bg-rose-500/10" : sent ? "bg-emerald-500/10" : "bg-zinc-500/5 group-hover:bg-amber-500/10"}
      `}>
        {sending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
        ) : error ? (
          <Wallet className="w-3.5 h-3.5 text-rose-500" />
        ) : sent ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 group-hover:text-amber-500 group-hover:scale-110 transition-transform" />
        )}
      </div>

      {/* Informative Status Block */}
      <div className="flex flex-col items-start gap-0.5 text-left pointer-events-none">
        <span className="font-semibold tracking-tight text-[11px] leading-tight">
          {sending ? (
            "Processing Tx..."
          ) : error ? (
            "Refill Balance"
          ) : sent ? (
            "Tip Complete"
          ) : (
            "Appreciate Content"
          )}
        </span>
        
        <span className={`font-mono text-[10px] leading-none transition-colors duration-200
          ${error ? "text-rose-500/80" : sent ? "text-emerald-500/80" : "text-zinc-400 dark:text-zinc-500"}`}
        >
          {error ? (
            "Insufficient REAX"
          ) : sent ? (
            "Sent +1 REAX"
          ) : (
            <>
              Total Support: <span className="font-bold text-zinc-700 dark:text-zinc-300">{displayCount}</span>
            </>
          )}
        </span>
      </div>
    </button>
  )
}
