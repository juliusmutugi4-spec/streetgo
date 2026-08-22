"use client"

import { Heart, RefreshCw, SlidersHorizontal } from "lucide-react"

interface DatingEmptyStateProps {
  title?: string
  message?: string
  onRefresh?: () => void
  onPreferences?: () => void
}

export default function DatingEmptyState({
  title = "No new connections yet",
  message = "We're looking for people who match your preferences. Try widening your preferences or check back later.",
  onRefresh,
  onPreferences,
}: DatingEmptyStateProps) {
  return (
    <div className="flex min-h-[420px] w-full items-center justify-center rounded-[28px] border border-slate-800 bg-slate-950 px-6 py-12">

      <div className="max-w-md text-center">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-rose-500/10 bg-rose-500/[0.06]">
          <Heart className="h-8 w-8 fill-rose-500/20 text-rose-400" />
        </div>

        <h2 className="mt-6 text-2xl font-black tracking-tight text-white">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {message}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">

          {onPreferences && (
            <button
              type="button"
              onClick={onPreferences}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-slate-200"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Adjust preferences
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          )}

        </div>

        <div className="mt-8 border-t border-slate-800 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            StreetGO Dating
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Better connections start with meaningful profiles.
          </p>
        </div>

      </div>

    </div>
  )
}