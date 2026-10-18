"use client"

import { CalendarDays, ShieldCheck } from "lucide-react"
import type { Group } from "../types"

type Props = {
  group: Group
  frequencyLabel: string
  formattedStartDate: string
}

export default function GroupInfo({
  group,
  frequencyLabel,
  formattedStartDate,
}: Props) {
  return (
    <section className="mt-5 rounded-xl border border-slate-800 bg-slate-900/20 p-4 space-y-4 text-xs">
      {/* Header Info Label */}
      <div className="flex items-center gap-2 text-slate-400 font-medium pb-2.5 border-b border-slate-800/60">
        <CalendarDays size={14} className="text-slate-500" />
        <span className="text-[11px] uppercase tracking-wider text-slate-500">Schedule & Rules</span>
      </div>

      {/* Row Metric Rows */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Frequency</span>
          <span className="font-semibold text-slate-200">{frequencyLabel}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">Start Date</span>
          <span className="font-semibold text-slate-200">{formattedStartDate}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500">Group Status</span>
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-emerald-400 border border-emerald-500/10">
            {group.status}
          </span>
        </div>
      </div>

      {/* Integrated Security Micro Footer */}
      <div className="flex gap-2 rounded-lg bg-slate-950/60 border border-slate-800/40 p-2.5 items-center">
        <ShieldCheck size={14} className="shrink-0 text-emerald-500" />
        <p className="text-[10px] text-slate-500 leading-tight">
          Verified Group. Transactions and lockups are secured through StreetGO.
        </p>
      </div>
    </section>
  )
}
