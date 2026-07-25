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

  async function clickReax() {
    if (sending) return
    setSending(true)
    try {
      await handleSendReax()
      setSent(true)
      setTimeout(() => setSent(false), 1500)
    } finally {
      setSending(false)
    }
  }

  return (
    <button
      onClick={clickReax}
      disabled={sending}
      type="button"
      aria-label="Send tip reaction"
      className="group relative inline-flex items-center gap-1.5 rounded-full 
                 border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 
                 text-emerald-500 dark:text-emerald-400 font-medium tracking-wide
                 transition-all duration-200 ease-out select-none
                 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:scale-[1.03] 
                 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60"
    >
      {/* Ping effect: Only flashes on idle or during active sending */}
      {!sent && (
        <span className="absolute inset-0 rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] bg-emerald-400/15" />
      )}

      {/* Icon: Scales smoothly, fills completely only when sent */}
      <Star 
        className={`relative z-10 w-3.5 h-3.5 transition-all duration-300 group-hover:rotate-12
          ${sent ? 'fill-emerald-500 stroke-emerald-500 scale-110' : 'fill-none stroke-current'}`} 
        strokeWidth={2.5}
      />

      {/* Typography: Micro-sized, clean uppercase formatting */}
      <span className="relative z-10 text-[10px] uppercase leading-none min-w-[24px] text-left">
        {sending
  ? "..."
  : sent
  ? "+1"
  : `Tip ${reaxCount}`
}
      </span>
    </button>
  )
}
