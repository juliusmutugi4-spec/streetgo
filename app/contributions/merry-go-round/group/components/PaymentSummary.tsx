"use client"

type PaymentSummaryData = {
  my_credit: number
  total_funds_received: number
}

type Props = {
  paymentSummary: PaymentSummaryData
  pool: number
  targetPool: number
  progressPercent: number
  paidMembers: number
  memberLimit: number
  slotsRemaining: number
}

export default function PaymentSummary({
  paymentSummary,
  pool,
  targetPool,
  progressPercent,
  paidMembers,
  memberLimit,
  slotsRemaining,
}: Props) {
  const remaining = Math.max(targetPool - pool, 0)

  return (
    <section className="mt-5 border-y border-slate-800 py-4 text-xs font-medium text-slate-400">
      {/* Top Header Metrics */}
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Round Progress</p>
          <p className="text-xl font-black text-white mt-0.5">KES {pool.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">of KES {targetPool.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-base font-bold text-white">{paidMembers}/{memberLimit}</p>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Members Paid</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Compressed 3-Column Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-3">
        {[
          { label: "Remaining", val: `KES ${remaining.toLocaleString()}`, cls: "text-white" },
          { label: "Credits", val: `KES ${Number(paymentSummary.my_credit || 0).toLocaleString()}`, cls: "text-emerald-400" },
          { label: "Received", val: `KES ${Number(paymentSummary.total_funds_received || 0).toLocaleString()}`, cls: "text-white" }
        ].map((c, i) => (
          <div key={i} className="text-center first:text-left last:text-right">
            <span className="block text-[9px] uppercase tracking-wider text-slate-500">{c.label}</span>
            <span className={`block font-bold mt-0.5 ${c.cls}`}>{c.val}</span>
          </div>
        ))}
      </div>

      {/* Group Status Footer */}
      <p className="mt-3 text-[10px] text-slate-500 italic text-center">
        {slotsRemaining > 0 ? `${slotsRemaining} member${slotsRemaining === 1 ? "" : "s"} needed to fill group.` : "Group is full."}
      </p>
    </section>
  )
}
