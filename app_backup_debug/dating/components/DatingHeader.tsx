"use client"

import { Bell, Heart, ShieldCheck, SlidersHorizontal } from "lucide-react"

interface DatingHeaderProps {
  requestCount?: number
  onRequestsClick?: () => void
  onFiltersClick?: () => void
}

export default function DatingHeader({
  requestCount = 0,
  onRequestsClick,
  onFiltersClick,
}: DatingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

        {/* BRAND */}

        <div className="flex min-w-0 items-center gap-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-purple-500 to-emerald-400 shadow-lg shadow-purple-500/10">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-lg font-black tracking-tight text-white sm:text-xl">
                StreetGO Dating
              </h1>

              <ShieldCheck className="hidden h-4 w-4 text-emerald-400 sm:block" />
            </div>

            <p className="truncate text-xs text-slate-500">
              Meaningful connections, built with trust
            </p>
          </div>

        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 items-center gap-2">

          <button
            type="button"
            onClick={onFiltersClick}
            className="hidden h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 text-sm font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white sm:flex"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Preferences
          </button>

          <button
            type="button"
            onClick={onRequestsClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            aria-label="Connection requests"
          >
            <Bell className="h-5 w-5" />

            {requestCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-500 px-1 text-[10px] font-black text-white">
                {requestCount > 99 ? "99+" : requestCount}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* TRUST BAR */}

      <div className="border-t border-white/[0.03] bg-slate-950/60">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 sm:px-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Private</span>

          <span className="text-slate-800">•</span>

          <span>Respectful</span>

          <span className="text-slate-800">•</span>

          <span>Profile based matching</span>
        </div>
      </div>

    </header>
  )
}