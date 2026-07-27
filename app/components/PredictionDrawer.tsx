'use client'

import React from 'react'
import { X, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react'
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
  
  const handlePanelClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        aria-hidden="true" 
      />

      {/* Floating Panel (Aligned perfectly with left-side trigger button) */}
      <aside 
        onClick={handlePanelClick} 
        className={`fixed left-9 top-1/2 -translate-y-1/2 z-50 w-[320px] max-w-[calc(100vw-3rem)] max-h-[80vh] flex flex-col rounded-xl border border-cyan-500/20 bg-slate-950/95 backdrop-blur-xl pt-8 pb-3.5 px-3.5 shadow-[0_0_40px_-15px_rgba(6,182,212,0.15)] transition-all duration-300 ease-out ${
          open ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95 pointer-events-none'
        }`} 
        role="dialog" 
        aria-label="Predictions Dashboard"
      >
        {/* Professional Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all cursor-pointer"
          aria-label="Close panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Decorative Pointing Indicator */}
        <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 border-b border-l border-cyan-500/20 bg-slate-950" />

        <PredictionsHeader />

        {/* Body Container */}
        <div className="mt-2.5 flex-1 overflow-y-auto pr-0.5 space-y-2 max-h-[calc(80vh-6rem)] scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {predictions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/10 h-32 flex flex-col items-center justify-center gap-1.5 p-3 text-center">
              <div className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500">
                <Sparkles className="w-3 h-3" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-400">No active forecasts</p>
                <p className="text-[9px] text-zinc-600 mt-0.5">Check back later.</p>
              </div>
            </div>
          ) : (
            predictions.map((prediction) => {
              const currentVotes = voteCounts[prediction.id] || { agree: 0, disagree: 0 }
              return (
                <div 
                  key={prediction.id} 
                  className="w-full rounded-lg border border-zinc-900 bg-zinc-950/40 hover:bg-zinc-900/30 p-2.5 transition-all duration-150 hover:border-cyan-500/10 group"
                >
                  {/* User Profile Header */}
                  <div className="flex items-center gap-2">
                    <img 
                      src={prediction.avatar_url || "/avatar-placeholder.png"} 
                      alt={`${prediction.username}'s avatar`} 
                      className="w-6 h-6 rounded-md object-cover ring-1 ring-zinc-900 group-hover:ring-cyan-500/20 transition-all" 
                    />
                    <div className="leading-none">
                      <h3 className="text-[10px] font-semibold text-zinc-300 tracking-tight">
                        {prediction.username}
                      </h3>
<p className="text-[7px] font-bold text-cyan-400/50 bg-cyan-500/[0.03] px-1 py-0.5 rounded uppercase tracking-widest mt-0.5 inline-block w-fit">

</p>

                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="mt-2 space-y-0.5">
                    <h4 className="text-[11px] font-medium text-zinc-100 tracking-tight leading-tight">
                      {prediction.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">
                      {prediction.description}
                    </p>
                  </div>

                  {/* Interactive Actions */}
                  <div className="mt-2 flex gap-1.5 pt-2 border-t border-zinc-900/40">
                    <button 
                      onClick={() => votePrediction(prediction.id, "agree")} 
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/20 text-emerald-400/90 hover:bg-emerald-500/10 text-[9px] font-medium transition-all"
                    >
                      <ThumbsUp className="w-2.5 h-2.5" />
                      <span>{currentVotes.agree}</span>
                    </button>
                    <button 
                      onClick={() => votePrediction(prediction.id, "disagree")} 
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/5 border border-rose-500/10 hover:border-rose-500/20 text-rose-400/90 hover:bg-rose-500/10 text-[9px] font-medium transition-all"
                    >
                      <ThumbsDown className="w-2.5 h-2.5" />
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
