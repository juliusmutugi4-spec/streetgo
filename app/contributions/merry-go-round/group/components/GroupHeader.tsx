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
  onCopyGroupNumber,
}: Props) {
  return (
    <section className="pt-2">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Merry-Go-Round
        </span>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1">
          <ShieldCheck size={11} className="text-slate-500" />
          <span className="text-[9px] uppercase tracking-wider text-slate-500">
            Verified group
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {group.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600">
              Group ID
            </span>
            <button
              type="button"
              onClick={onCopyGroupNumber}
              className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium text-slate-400 transition-colors hover:text-white"
            >
              {group.group_number}
              {copied ? (
                <Check size={11} className="text-emerald-400" />
              ) : (
                <Copy size={11} className="text-slate-600" />
              )}
            </button>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-600">
            Contribution
          </p>
          <p className="mt-0.5 text-2xl font-black tracking-tight text-white">
            KES {contributionAmount.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {frequencyLabel}
          </p>
        </div>
      </div>

      <div className="mt-6 h-px bg-slate-800/50" />
    </section>
  )
}
