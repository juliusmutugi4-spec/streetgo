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
    <section className="mt-5 space-y-4">
      {/* Header Info Label (No background container) */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
        <CalendarDays size={14} className="text-slate-500" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Schedule & Rules
        </span>
      </div>

      {/* Row Metric Items */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Frequency</span>
          <span className="font-semibold text-slate-200">{frequencyLabel}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Start Date</span>
          <span className="font-semibold text-slate-200">{formattedStartDate}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">Group Status</span>
          <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium capitalize text-emerald-400">
            {group.status}
          </span>
        </div>
      </div>

      {/* Clean Security Info Text Layout */}
      <div className="flex gap-2 items-start pt-1.5">
        <ShieldCheck size={14} className="shrink-0 mt-0.5 text-emerald-500" />
        <p className="text-[11px] text-slate-500 leading-normal">
          Verified Group. Transactions and lockups are secured through StreetGO.
        </p>
      </div>
    </section>
  )
}
