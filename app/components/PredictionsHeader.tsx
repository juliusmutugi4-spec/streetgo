'use client'

import React from 'react'
import { Calendar, SlidersHorizontal, RefreshCw } from 'lucide-react'

export default function PredictionsHeader() {
  return (
    <div className="w-full bg-[#242526] select-none">
      <div className="flex items-center justify-between gap-4 w-full">
        
        {/* TITLE BRAND BLOCK */}
        <div className="flex items-center gap-2">
          <h1 className="text-[16px] font-bold tracking-normal text-white">
            Predictions
          </h1>
          {/* LIVE STATUS INDICATOR */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* COMPACT GLOBAL TOOLBAR */}
        <div className="flex items-center gap-1.5">
          
          {/* FORECAST TRIGGER */}
          <button 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4e4f50] active:scale-95 transition-all cursor-pointer" 
            title="Q3 Forecast"
          >
            <Calendar size={15} />
          </button>

          {/* FILTERS TOGGLE */}
          <button 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4e4f50] active:scale-95 transition-all cursor-pointer" 
            title="Filters"
          >
            <SlidersHorizontal size={15} />
          </button>

          {/* REFRESH ACTIONS BUBBLE */}
          <button 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4e4f50] active:scale-95 transition-all cursor-pointer" 
            title="Refresh Data"
          >
            <RefreshCw size={14} strokeWidth={2.5} />
          </button>

        </div>

      </div>
    </div>
  )
}
