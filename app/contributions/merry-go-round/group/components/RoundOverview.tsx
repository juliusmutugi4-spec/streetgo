"use client"

type Props = {
  targetPool: number
  pool: number
  remaining: number
  recipientName: string
}

export default function RoundOverview({
  targetPool,
  pool,
  remaining,
  recipientName,
}: Props) {
  return (
    <section className="mt-5 space-y-4">
      {/* Header without a box container */}
      <h2 className="text-sm font-bold text-white">
        Round Overview
      </h2>

      {/* Grid items arranged via minimalist spacing layout */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        <div>
          <div className="text-[10px] font-bold tracking-wider text-slate-500">
            TARGET
          </div>
          <div className="mt-0.5 text-sm font-semibold text-white">
            KES {targetPool.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold tracking-wider text-slate-500">
            COLLECTED
          </div>
          <div className="mt-0.5 text-sm font-semibold text-emerald-400">
            KES {pool.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold tracking-wider text-slate-500">
            REMAINING
          </div>
          <div className="mt-0.5 text-sm font-semibold text-white">
            KES {remaining.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold tracking-wider text-slate-500">
            RECIPIENT
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-white">
            {recipientName}
          </div>
        </div>
      </div>
    </section>
  )
}
