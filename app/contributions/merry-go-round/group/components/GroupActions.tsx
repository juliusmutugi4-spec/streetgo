"use client"

import { ArrowLeft, RefreshCw } from "lucide-react"

type Props = {
  refreshing: boolean
  onBack: () => void
  onRefresh: () => void
}

export default function GroupActions({
  refreshing,
  onBack,
  onRefresh,
}: Props) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
      >
        <RefreshCw
          size={15}
          className={refreshing ? "animate-spin" : ""}
        />

        {refreshing ? "REFRESHING" : "REFRESH"}
      </button>
    </div>
  )
}