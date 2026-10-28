"use client"

import { Check, Copy, ShieldCheck } from "lucide-react"
import type { Group } from "../types"

type Props = {
  group: Group
  contributionAmount: number
  frequencyLabel: string
  copied: boolean
  onCopyGroupNumber: () => void
}

export default function GroupHeader({
  group,
  contributionAmount,
  frequencyLabel,
  copied,
}: Props) {
  // Mock function if not passed, but using props for production
  const onCopyGroupNumber = () => {
    navigator.clipboard.writeText(group.group_number)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/70 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left Side: Metadata & Title */}
        <div className="space-y-1.5">
          {/* Status Badges */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Merry-Go-Round
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              <ShieldCheck size={13} className="text-emerald-500" />
              Verified
            </span>
          </div>

          {/* Group Name & Copyable ID */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-50 sm:text-2xl">
              {group.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">ID:</span>
              <button
                type="button"
                onClick={onCopyGroupNumber}
                className="inline-flex items-center gap-1 rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] text-slate-300 transition-all hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-1 focus:ring-slate-700"
                title="Copy Group ID"
              >
                {group.group_number}
                {copied ? (
                  <Check size={12} className="text-emerald-400" />
                ) : (
                  <Copy size={12} className="text-slate-500 group-hover:text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Financial Metric Card */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3 sm:px-4 sm:py-2.5">
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Contribution Amount
            </p>
            <p className="font-mono text-lg font-bold text-white sm:text-xl">
              KES {contributionAmount.toLocaleString()}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="rounded bg-slate-800/60 px-2 py-1 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-300">
              {frequencyLabel}
            </span>
          </div>
        </div>

      </div>
    </header>
  )
}
