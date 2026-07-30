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
  votePrediction: (predictionId: string, vote: "agree" | "disagree") => void
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
      {/* PROFESSIONAL DIM MEDIATED BACKDROP */}
      <div 
        onClick={onClose} 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true" 
      />

      {/* MOBILE BOTTOM SHEET + DESKTOP RIGHT DRAWER COMBINED PANEL */}
      <aside 
        onClick={handlePanelClick} 
        className={`fixed z-50 bg-[#242526] text-[#e4e6eb] shadow-[0_16px_32px_rgba(0,0,0,0.5)] border-[#3e4042] transition-all duration-300 ease-out select-none flex flex-col
          
          /* Mobile Overrides (Bottom Sheet style layout) */
          bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl border-t
          
          /* Desktop Overrides (Right Side panel style layout) */
          md:top-0 md:bottom-0 md:right-0 md:left-auto md:w-[380px] md:max-h-screen md:rounded-l-2xl md:rounded-tr-none md:border-l md:border-t-0
          
          /* Smooth Animation states */
          ${open 
            ? 'translate-y-0 md:translate-y-0 md:translate-x-0' 
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
          }
        `}
        role="dialog" 
        aria-label="Predictions Dashboard" 
      >
        
        {/* MOBILE LAYOUT DRAG HANDLE TOP PILL */}
        <div className="w-12 h-1 bg-[#3e4042] rounded-full mx-auto mt-3 md:hidden" />

        {/* CONTAINER BOUNDARY COMPONENT HEADER */}
        <div className="relative pl-5 pr-4 pt-4 pb-3 flex items-center justify-between border-b border-[#3e4042]">
          <div className="flex items-center gap-2">
            <PredictionsHeader />
          </div>
          
          {/* FACEBOOK STYLE REINFORCED CLOSE ICON ROUND BUBBLE */}
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3a3b3c] text-[#b0b3b8] hover:bg-[#4e4f50] hover:text-[#e4e6eb] transition-all"
            aria-label="Close panel" 
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* COMPONENT BODY CONTAINER BLOCK */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {predictions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#3e4042] bg-[#1c1e21]/40 h-40 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <div className="p-2 rounded-full bg-[#3a3b3c] text-zinc-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">No active forecasts</p>
                <p className="text-[12px] text-[#b0b3b8] mt-0.5">Check back later for updates.</p>
              </div>
            </div>
          ) : (
            predictions.map((prediction) => {
              const currentVotes = voteCounts[prediction.id] || { agree: 0, disagree: 0 }
              return (
                <div 
                  key={prediction.id} 
                  className="w-full rounded-xl border border-[#3e4042] bg-[#1c1e21]/60 p-3.5 transition-colors hover:bg-[#1c1e21]/90"
                >
                  {/* USER META CARD BANNER AREA */}
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={prediction.avatar_url || "/avatar-placeholder.png"} 
                      alt={`${prediction.username}'s avatar`} 
                      className="w-8 h-8 rounded-full object-cover border border-[#3e4042] bg-[#242526]" 
                    />
                    <div>
                      <h3 className="text-[13px] font-bold text-white leading-tight">
                        {prediction.username}
                      </h3>
                      <span className="text-[10px] text-[#b0b3b8] font-medium">
                        Active Forecaster
                      </span>
                    </div>
                  </div>

                  {/* ESSENTIAL HEADLINE & DESCRIPTION PARAGRAPH BLOCKS */}
                  <div className="mt-3 space-y-1">
                    <h4 className="text-[14px] font-bold text-white leading-snug tracking-normal">
                      {prediction.title}
                    </h4>
                    <p className="text-[12px] text-[#b0b3b8] leading-normal font-normal">
                      {prediction.description}
                    </p>
                  </div>

                  {/* NATIVE FACEBOOK TWO-WAY ACTION INTERACT BUTTON ARRAY */}
                  <div className="mt-3.5 flex gap-2 pt-2.5 border-t border-[#3e4042]/60">
                    
                    {/* AGREE TRACKING ACTION ACTION ROW */}
                    <button 
                      onClick={() => votePrediction(prediction.id, "agree")} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#3a3b3c]/50 border border-[#3e4042]/40 hover:bg-[#4e4f50]/60 active:scale-98 text-emerald-400 font-semibold text-[12px] transition-all"
                    >
                      <ThumbsUp size={14} strokeWidth={2.5} fill="currentColor" fillOpacity={0.1} />
                      <span>Agree</span>
                      <span className="ml-1 text-[11px] text-[#b0b3b8] font-bold bg-[#242526] px-1.5 py-0.5 rounded-md">
                        {currentVotes.agree}
                      </span>
                    </button>

                    {/* DISAGREE TRACKING ACTION ACTION ROW */}
                    <button 
                      onClick={() => votePrediction(prediction.id, "disagree")} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#3a3b3c]/50 border border-[#3e4042]/40 hover:bg-[#4e4f50]/60 active:scale-98 text-rose-400 font-semibold text-[12px] transition-all"
                    >
                      <ThumbsDown size={14} strokeWidth={2.5} fill="currentColor" fillOpacity={0.1} />
                      <span>Disagree</span>
                      <span className="ml-1 text-[11px] text-[#b0b3b8] font-bold bg-[#242526] px-1.5 py-0.5 rounded-md">
                        {currentVotes.disagree}
                      </span>
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
