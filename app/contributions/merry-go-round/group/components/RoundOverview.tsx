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
    <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-lg font-black">
        Round overview
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-[10px] font-black tracking-widest text-white/30">
            TARGET
          </div>

          <div className="mt-1 text-lg font-black">
            KES {targetPool.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black tracking-widest text-white/30">
            COLLECTED
          </div>

          <div className="mt-1 text-lg font-black text-emerald-400">
            KES {pool.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black tracking-widest text-white/30">
            REMAINING
          </div>

          <div className="mt-1 text-lg font-black">
            KES {remaining.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-black tracking-widest text-white/30">
            RECIPIENT
          </div>

          <div className="mt-1 truncate text-lg font-black">
            {recipientName}
          </div>
        </div>
      </div>
    </section>
  )
}