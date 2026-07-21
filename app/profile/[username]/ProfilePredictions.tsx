'use client'

import React, { useState } from "react"
import { Target, CheckCircle2, XCircle, AlertCircle, Loader2, Calendar } from "lucide-react"
import { supabase } from "../../lib/supabase"

type PredictionStatus = "correct" | "wrong" | "pending"

interface Prediction {
  id: string
  title: string
  created_at: string
  target_date?: string | null
  status?: PredictionStatus | null
  confidence_rating?: number // Support dynamic values falling back to defaults
}

interface ProfilePredictionsProps {
  predictions: Prediction[]
  onRefresh: () => void
}

export default function ProfilePredictions({
  predictions = [],
  onRefresh,
}: ProfilePredictionsProps) {
  // Tracks loading independently per prediction ID to prevent UI lockup
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const updatePredictionStatus = async (id: string, status: "correct" | "wrong") => {
    setLoadingStates((prev) => ({ ...prev, [id]: true }))
    
    try {
      const { error } = await supabase
        .from("predictions")
        .update({ status })
        .eq("id", id)

      if (error) throw error
      onRefresh()
    } catch (error: any) {
      console.error("[PredictionUpdate Error]:", error.message)
    } finally {
      setLoadingStates((prev) => ({ ...prev, [id]: false }))
    }
  }

  // Clean date formatter helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return "Recent Log"
    }
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-6" aria-label="Verified Predictions Market">
      {/* Component Header */}
      <header className="flex items-center justify-between border-b border-zinc-900 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 shadow-inner">
            <Target className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase font-mono">
              Oracle // Predictions
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase mt-0.5">
              Verified Settlement History
            </p>
          </div>
        </div>
        <div className="rounded-md border border-emerald-500/10 bg-emerald-950/20 px-3 py-1 font-mono text-[11px] font-bold text-emerald-400">
          {predictions.length} {predictions.length === 1 ? "PICK" : "PICKS"}
        </div>
      </header>

      {/* Main Content Area */}
      {predictions.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950/20 p-12 text-center backdrop-blur-sm">
          <Target className="h-8 w-8 text-zinc-800 mb-3 stroke-[1.5]" />
          <p className="text-xs text-zinc-500 font-medium font-mono uppercase tracking-wider">
            No active nodes mapped in this timeline.
          </p>
        </div>
      ) : (
        /* Prediction List Grid */
        <div className="space-y-4">
          {predictions.map((prediction) => {
            const isSettling = loadingStates[prediction.id]
            const confidence = prediction.confidence_rating ?? 82 // Fallback default
            
            return (
              <article 
                key={prediction.id} 
                className="group rounded-xl border border-zinc-900 bg-[#04080e]/40 hover:border-zinc-800/80 transition-all duration-300 p-5 shadow-lg backdrop-blur-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Metadata Header line */}
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-cyan-400 font-bold uppercase tracking-widest">
                        Data Stream
                      </span>
                      <span className="text-zinc-700">•</span>
                      <time className="text-zinc-500" dateTime={prediction.created_at}>
                        {formatDate(prediction.created_at)}
                      </time>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold leading-snug text-zinc-100 tracking-tight max-w-2xl selection:bg-cyan-500/20">
                      {prediction.title}
                    </h3>

                    {/* Target Date Pill */}
                    {prediction.target_date && (
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1 text-zinc-400">
                        <Calendar size={12} className="text-zinc-500" />
                        <span className="text-[11px] font-mono">
                          Target: {prediction.target_date}
                        </span>
                      </div>
                    )}

                    {/* Confidence Metric Matrix Slider */}
                    <div className="pt-2 max-w-md">
                      <div className="mb-1.5 flex items-center justify-between text-[11px] font-mono">
                        <span className="uppercase tracking-wider text-zinc-500">
                          Community Consensus
                        </span>
                        <span className="font-bold text-cyan-400">{confidence}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-900 shadow-inner">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(34,211,238,0.4)]" 
                          style={{ width: `${confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Panel Group Footer */}
                    <div className="pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <button 
                          disabled={isSettling}
                          onClick={() => updatePredictionStatus(prediction.id, "correct")} 
                          className="inline-flex items-center justify-center min-w-[110px] rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] font-bold text-emerald-400 font-mono tracking-wider transition hover:bg-emerald-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isSettling ? <Loader2 size={12} className="animate-spin" /> : "✓ RESOLVE TRUE"}
                        </button>
                        <button 
                          disabled={isSettling}
                          onClick={() => updatePredictionStatus(prediction.id, "wrong")} 
                          className="inline-flex items-center justify-center min-w-[110px] rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] font-bold text-red-400 font-mono tracking-wider transition hover:bg-red-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                          {isSettling ? <Loader2 size={12} className="animate-spin" /> : "✕ RESOLVE FALSE"}
                        </button>
                      </div>
                      
                      <div className="text-right font-mono hidden sm:block">
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Weight</div>
                        <div className="text-xs font-bold text-zinc-400">{confidence}% ACC</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator Badge Anchor */}
                  <div className="sm:ml-4 self-start shrink-0">
                    <StatusBadge status={prediction.status} />
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

// Extracted Stateless Professional Status Badge Component
function StatusBadge({ status }: { status: PredictionStatus | null | undefined }) {
  if (status === "correct") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-emerald-400 font-mono text-[10px] font-bold tracking-widest uppercase">
        <CheckCircle2 size={12} className="text-emerald-400" />
        <span>Verified</span>
      </div>
    )
  }

  if (status === "wrong") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1 text-red-400 font-mono text-[10px] font-bold tracking-widest uppercase">
        <XCircle size={12} className="text-red-400" />
        <span>Failed</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-amber-400 font-mono text-[10px] font-bold tracking-widest uppercase animate-pulse">
      <AlertCircle size={12} className="text-amber-400" />
      <span>Live Node</span>
    </div>
  )
}
