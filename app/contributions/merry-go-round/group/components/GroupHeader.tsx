"use client"

import { Check, Copy } from "lucide-react"
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
  onCopyGroupNumber,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-5 shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        
        {/* Left Side: Meta info & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400">
            Merry-Go-Round
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {group.name}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Group ID:</span>
            <button
              type="button"
              onClick={onCopyGroupNumber}
              className="inline-flex items-center gap-1.5 rounded bg-slate-800/60 px-2 py-1 font-mono text-[11px] text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              {group.group_number}
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          </div>
        </div>

        {/* Right Side: Contribution Details */}
        <div className="border-t border-slate-800/60 pt-4 sm:border-0 sm:pt-0 sm:text-right">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Contribution</p>
          <p className="mt-0.5 text-xl font-black text-white">
            KES {contributionAmount.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{frequencyLabel}</p>
        </div>

      </div>
    </section>
  )
}
