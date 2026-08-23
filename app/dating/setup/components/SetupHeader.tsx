"use client"

import { ChevronLeft } from "lucide-react"

interface SetupHeaderProps {
  onBack: () => void
  onSkip: () => void
}

export default function SetupHeader({ onBack, onSkip }: SetupHeaderProps) {
  return (
    <header className="flex h-7 w-full items-center justify-between bg-black px-1 font-sans text-white antialiased select-none">
      
      {/* LEFT NAVIGATION SECTION & BRANDING */}
      <div className="flex items-center gap-2">
        {/* COMPACT BACK ACTION CONTROL */}
        <button
          type="button"
          onClick={onBack}
          className="flex h-5.5 items-center justify-center gap-1 rounded-md border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent pl-1.5 pr-2.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400 transition-all active:scale-[0.96] active:from-white/[0.05] active:text-slate-100"
        >
          <ChevronLeft className="h-3 w-3 stroke-[2.5]" />
          <span>Back</span>
        </button>

        {/* LOGO & DESCRIPTOR SUBTRACK */}
        <div className="flex items-center gap-1.5">
          <h1 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-100">
            Street<span className="bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">GO</span>
          </h1>
          
          <span className="h-1 w-1 rounded-full bg-white/15" />
          
          <p className="text-[8px] font-black uppercase tracking-[0.14em] text-slate-500">
            Setup
          </p>
        </div>
      </div>

      {/* DISMISS / SKIP ACTION CONTROL */}
      <button
        type="button"
        onClick={onSkip}
        className="flex h-5.5 items-center justify-center rounded-md border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent px-2.5 text-[8px] font-black uppercase tracking-[0.14em] text-slate-400 transition-all active:scale-[0.96] active:from-white/[0.05] active:text-slate-100"
      >
        Skip
      </button>

    </header>
  )
}
