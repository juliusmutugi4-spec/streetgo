'use client'

import React, { useState } from 'react'
import { Sparkles, Loader2, Wallet, Check } from 'lucide-react'

interface Props {
  handleSendReax: () => Promise<void>
  reaxCount: number
}

export default function ReactionButton({ handleSendReax, reaxCount }: Props) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(false)

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
        gain.gain.setValueAtTime(0.05, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      } else if (type === 'success') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
      } else {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      }
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.2)
    } catch (e) {
      console.error(e)
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
      setTimeout(() => setSent(false), 2000)
    } catch (err: any) {
      playClickSound('error')
      if (err?.message?.includes("Insufficient REAX")) {
        setError(true)
        setTimeout(() => setError(false), 3000)
      } else {
        alert(err?.message || "Error")
      }
    } finally {
      setSending(false)
    }
  }

  const displayCount = sent ? reaxCount + 1 : reaxCount

  return (
    <button
      onClick={clickReax}
      disabled={sending && !sent}
      type="button"
      aria-label={`Reax: ${displayCount}`}
className={`
  group
  relative
  flex
  items-center
  gap-1.5
  rounded-md
  px-2
  py-1
  text-[10px]
  font-mono
  font-medium
  select-none
  transition-all
  duration-200
  active:scale-[0.95]
  overflow-hidden
  border

  ${
    error
      ?
      `
      text-rose-600
      bg-rose-500/5
      border-rose-500/20
      animate-[shake_0.3s_ease-in-out]
      `

      :

    sent
      ?
      `
      text-emerald-600
      bg-emerald-500/5
      border-emerald-500/20
      `

      :

      `
      text-[var(--muted)]
      bg-[var(--surface)]
      border-[var(--border)]
      hover:bg-[var(--surface-hover)]
      hover:text-[var(--foreground)]
      `
  }
`}
    >
      {/* Mini Micro Icon Block */}
      <div className="flex items-center justify-center w-3.5 h-3.5">
        {sending ? (
          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
        ) : error ? (
          <Wallet className="w-3 h-3 text-rose-500" />
        ) : sent ? (
          <Check className="w-3 h-3 text-emerald-500 animate-[scale_0.2s_ease-in-out]" />
        ) : (
          <Sparkles className="w-3 h-3 text-zinc-400 group-hover:text-amber-500 group-hover:scale-110 transition-transform" />
        )}
      </div>

      {/* Clean Inline Value / Status */}
      <span className="font-bold tracking-tight">
        {sending ? "..." : error ? "Empty" : sent ? "+1" : displayCount.toLocaleString()}
      </span>

      {/* Tiny Progress Line */}
      <span 
        className={`absolute bottom-0 left-0 h-[1.5px] transition-all duration-200
          ${sending ? "bg-amber-500 w-1/2 animate-[loading-bar_1s_infinite_linear]" : ""}
          ${sent ? "bg-emerald-500 w-full" : ""}
          ${error ? "bg-rose-500 w-full" : ""}
          ${!sending && !sent && !error ? "bg-transparent w-0" : ""}
        `} 
      />
    </button>
  )
}
