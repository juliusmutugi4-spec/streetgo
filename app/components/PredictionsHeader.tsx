'use client'

import React from 'react'
import { 
  TrendingUp, 
  ArrowUpRight, 
  Calendar, 
  SlidersHorizontal, 
  RefreshCw, 
  TrendingDown
} from 'lucide-react'

export default function PredictionsHeader() {
  return (
    <div className="w-full bg-zinc-950/50 border-b border-zinc-800 backdrop-blur-md px-6 py-4">
      <div className="mx-auto w-full max-w-[1400px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
{/* Title Brand Block */}
<div className="flex items-center gap-3">

  <div>
    <div className="flex items-center gap-2">
      <h1 className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
        Prediction Hub
      </h1>
      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 text-[10px] font-medium tracking-wide uppercase">
        Live
      </span>
    </div>
    <p className="text-xs text-zinc-400 mt-0.5">
    
    </p>
  </div>
</div>


        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 sm:justify-end">
          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Q3 Forecast</span>
          </button>
          
          <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-zinc-100 transition-colors cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
            <span>Filters</span>
          </button>

          <div className="w-px h-5 bg-zinc-800 mx-1 hidden sm:block" />

          <button 
            className="p-1.5 text-zinc-400 hover:text-cyan-400 bg-zinc-900 border border-zinc-800 rounded-md hover:border-cyan-500/20 transition-colors cursor-pointer" 
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  )
}
