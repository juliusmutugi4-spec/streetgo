'use client'

import React from 'react'
import { X, ThumbsUp, ThumbsDown, TrendingUp, Sparkles } from 'lucide-react'
import PredictionsHeader from "./PredictionsHeader"
import type { PredictionType } from "../hooks/usePredictions"
export type VoteData = {
  agree: number
  disagree: number
}

type PredictionDrawerProps = {
  open: boolean
  onClose: () => void
  predictions: PredictionType[]
  voteCounts: Record<string, VoteData>
  votePrediction: (
    predictionId: string,
    vote: "agree" | "disagree"
  ) => void
}

export default function PredictionDrawer({
  open,
  onClose,
  predictions,
  voteCounts,
  votePrediction,
}: PredictionDrawerProps) {
  // Prevent clicks inside the panel from closing it via the backdrop
  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      {/* Backdrop with premium heavy blur */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Floating Panel (Positioned on the left, vertically centered near the button) */}
      <aside
        onClick={handlePanelClick}
        className={`fixed left-6 top-1/2 -translate-y-1/2 z-50 w-[440px] max-w-[calc(100vw-3rem)] max-h-[85vh] flex flex-col rounded-2xl border border-cyan-500/20 bg-slate-950/90 backdrop-blur-xl p-6 shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)] transition-all duration-300 ease-out ${
          open 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 -translate-x-6 scale-95 pointer-events-none'
        }`}
        role="dialog"
        aria-label="Predictions Dashboard"
      >
        {/* Decorative Pointing Indicator (Pointing left at the source tab button) */}
        <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-b border-l border-cyan-500/30 bg-slate-950" />

<PredictionsHeader />

        {/* Body Container with custom smooth scrollbar */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4 max-h-[calc(85vh-7rem)] scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {predictions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/20 h-48 flex flex-col items-center justify-center gap-3 p-4 text-center">
              <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">No active forecasts</p>
                <p className="text-xs text-zinc-500 mt-0.5">Check back later for new entries.</p>
              </div>
            </div>
          ) : (
            predictions.map((prediction) => {
              const currentVotes = voteCounts[prediction.id] || { agree: 0, disagree: 0 }
              
              return (
                <div
                  key={prediction.id}
                  className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/50 p-4 transition-all duration-200 hover:border-cyan-500/20 group"
                >
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={prediction.avatar_url || "/avatar-placeholder.png"}
                      alt={`${prediction.username}'s avatar`}
                      className="w-9 h-9 rounded-lg object-cover ring-1 ring-zinc-800 group-hover:ring-cyan-500/30 transition-all"
                    />
                    <div>
                      <h3 className="text-xs font-semibold text-zinc-200 tracking-wide">
                        {prediction.username}
                      </h3>
                      <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider mt-0.5">
                        Forecaster
                      </p>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="mt-3.5 space-y-1">
                    <h4 className="text-sm font-semibold text-white tracking-tight leading-snug">
                      {prediction.title}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {prediction.description}
                    </p>
                  </div>

                  {/* Interactive Actions */}
                  <div className="mt-4 flex gap-2 pt-3 border-t border-zinc-900/60">
                    <button
                      onClick={() => votePrediction(prediction.id, "agree")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-medium text-xs transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{currentVotes.agree}</span>
                    </button>
                    
                    <button
                      onClick={() => votePrediction(prediction.id, "disagree")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-medium text-xs transition-all"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{currentVotes.disagree}</span>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}
