"use client"

import { Sparkles } from "lucide-react"

export default function SetupIntro() {
  return (
    <section className="w-full max-w-md bg-black px-1 font-sans text-white antialiased select-none text-center mt-2 mb-4">
      {/* BRAND SPARK BADGE */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/10 bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent px-2.5 py-0.5 shadow-[0_0_12px_rgba(244,63,94,0.02)]">
        <Sparkles className="h-2.5 w-2.5 text-rose-400 animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-rose-400">
          StreetGO Ecosystem
        </span>
      </div>

      {/* CORE TITLE */}
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-100">
        Choose your dynamic path
      </h2>

      {/* VALUE PROP SUBTEXT */}
      <p className="mx-auto mt-1 max-w-[280px] text-[11px] leading-normal text-slate-400">
        Define your immediate target. You can seamlessly alternate profiles or expand paths directly within settings.
      </p>
    </section>
  )
}
