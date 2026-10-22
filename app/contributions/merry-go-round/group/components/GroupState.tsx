"use client"

import { AlertCircle, Loader2 } from "lucide-react"

type Props = {
  loading: boolean
  error: string | null
}

export default function GroupState({
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        {/* Clean, minimalist green layout without container backgrounds */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Loader2 className="animate-spin text-emerald-400" size={24} />
          <p className="text-xs font-semibold text-slate-400">
            Loading contribution group...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        {/* Plain text-only alert without card box elements */}
        <div className="flex flex-col items-center max-w-xs text-center">
          <AlertCircle size={20} className="text-red-400" />
          <h2 className="mt-2 text-xs font-bold text-white">
            Unable to load group
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return null
}
