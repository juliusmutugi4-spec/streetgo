"use client"

import { useState, useEffect, useMemo } from "react"
import { Lock, Clock, Flame, Layers, CircleDot } from "lucide-react"

const BRANDS: Record<string, { accent: string; glow: string }> = {
  SportPesa: { accent: "text-orange-400", glow: "shadow-orange-500/20" },
  Betika: { accent: "text-yellow-300", glow: "shadow-yellow-500/20" },
  Betway: { accent: "text-emerald-400", glow: "shadow-emerald-500/20" },
  default: { accent: "text-white", glow: "shadow-white/10" }
}

interface TipData {
  company?: string
  seller_name?: string
  created_at: string | number | Date
  duration_hours?: number
  expiry_hours?: number
  price: number | string
  odds: number | string
  secret_link?: string
  matches_count?: number
}

export default function BettingTipCard({ tip }: { tip: TipData }) {
  const [paid, setPaid] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const { expiresAt, odds, price, brand } = useMemo(() => {
    const duration = Number(tip.duration_hours ?? tip.expiry_hours ?? 24)
    const start = new Date(tip.created_at).getTime()
    const name = tip.company || tip.seller_name || "default"
    const b = BRANDS[name] || BRANDS.default

    return {
      expiresAt: start + duration * 3600000,
      odds: Number(tip.odds || 0).toFixed(2),
      price: Number(tip.price || 0),
      brand: b
    }
  }, [tip])

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setTimeLeft(diff)
    }

    tick()
    const i = setInterval(tick, 1000)
    return () => clearInterval(i)
  }, [expiresAt])

  if (timeLeft <= 0) return null

  const h = String(Math.floor(timeLeft / 3600)).padStart(2, "0")
  const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0")
  const s = String(timeLeft % 60).padStart(2, "0")

  return (
    <article className={`
      relative w-full aspect-[3/4]
      rounded-xl
      bg-[#0a0f1a]
      border border-white/10
      overflow-hidden
      flex flex-col justify-between
      p-2
      transition-all duration-300
      hover:scale-[1.03]
      ${brand.glow}
    `}>

      {/* futuristic glow layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-emerald-500/10" />

      {/* top brand row */}
      <div className="relative flex items-center justify-between text-[9px] text-white/60">
        <div className="flex items-center gap-1.5 truncate">
          <CircleDot className={`w-3 h-3 ${brand.accent}`} />
          <span className="truncate font-medium">
            {tip.company || "Signal"}
          </span>
        </div>

        <span className="text-emerald-400 font-bold">LIVE</span>
      </div>

      {/* odds section */}
      <div className="relative mt-1">
        <p className="text-[8px] text-white/40 uppercase tracking-widest">
          Odds
        </p>
        <p className={`text-xl font-black ${brand.accent}`}>
          @{odds}
        </p>
      </div>

      {/* price section */}
      <div className="relative">
        <p className="text-[8px] text-white/40 uppercase tracking-widest">
          Access
        </p>
        <p className="text-sm font-bold text-white">
          KSh {price}
        </p>
      </div>

      {/* timer */}
      <div className="relative flex items-center justify-between text-[9px] text-white/50">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>EXP</span>
        </div>

        <div className="font-mono text-white">
          {h}:{m}:{s}
        </div>
      </div>

      {/* bottom stats */}
      <div className="relative flex items-center justify-between text-[10px] text-white/50">
        <div className="flex items-center gap-1">
          <Flame className={`w-3 h-3 ${brand.accent}`} />
          <span>{odds}</span>
        </div>

        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3 text-white/40" />
          <span>{tip.matches_count || 1}</span>
        </div>
      </div>

      {/* action */}
      {!paid ? (
        <button
          onClick={() => setPaid(true)}
          className="
            relative w-full py-2 mt-2
            rounded-lg
            bg-white text-black
            text-[10px]
            font-bold
            flex items-center justify-center gap-1.5
            transition-all
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          <Lock className="w-3.5 h-3.5" />
          UNLOCK SIGNAL
        </button>
      ) : (
        <a
          href={tip.secret_link || "#"}
          className="
            w-full py-2 mt-2
            rounded-lg
            bg-emerald-500 text-black
            text-[10px] font-bold
            text-center
          "
        >
          OPEN SIGNAL
        </a>
      )}
    </article>
  )
}