'use client'

import { Clock3, Smartphone, UserRound, ChevronRight } from "lucide-react"

interface Withdrawal {
  id: string
  user_id: string
  wallet_id: string
  amount: number
  phone_number: string
  status: string
  admin_note?: string | null
  rejection_reason?: string | null
  processed_by?: string | null
  created_at: string
  processed_at?: string | null
  username?: string | null
}

interface Props {
  withdrawals: Withdrawal[]
  onSelect: (withdrawal: Withdrawal) => void
}

export default function WithdrawalTable({
  withdrawals,
  onSelect,
}: Props) {
  return (
    <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5 shadow-2xl shadow-black/20">

      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Pending Withdrawals
            </h2>

            <span className="rounded-md border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-400">
              {withdrawals.length}
            </span>
          </div>

          <p className="mt-1 text-[10px] uppercase tracking-tight text-zinc-500">
            Manual payment queue
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider text-zinc-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          Awaiting review
        </div>

      </div>

      {/* EMPTY STATE */}
      {withdrawals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-950/40 px-4 py-10 text-center">

          <Clock3 className="mx-auto h-5 w-5 text-zinc-700" />

          <p className="mt-3 text-xs font-medium text-zinc-400">
            No pending withdrawals
          </p>

          <p className="mt-1 text-[10px] text-zinc-600">
            The withdrawal queue is clear.
          </p>

        </div>
      ) : (

        <div className="overflow-hidden rounded-lg border border-zinc-800/70">

          {/* TABLE HEADER */}
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_90px_28px] gap-3 border-b border-zinc-800 bg-zinc-950/70 px-3 py-2 md:grid">

            <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
              User
            </span>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
              Amount
            </span>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
              M-Pesa
            </span>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
              Status
            </span>

            <span />
          </div>

          {/* ROWS */}
          <div className="divide-y divide-zinc-800/70">

            {withdrawals.map((withdrawal) => (

              <button
                key={withdrawal.id}
                type="button"
                onClick={() => onSelect(withdrawal)}
                className="group w-full text-left transition-colors hover:bg-zinc-900/80"
              >

                <div className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-[1.4fr_1fr_1fr_90px_28px] md:items-center">

                  {/* USER */}
                  <div className="flex items-center gap-2">

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900">
                      <UserRound
                        size={12}
                        className="text-zinc-500"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-zinc-300">
                        {withdrawal.username || "Unknown user"}
                      </p>

                      <p className="truncate font-mono text-[8px] text-zinc-600">
                        {withdrawal.id.slice(0, 12)}...
                      </p>
                    </div>

                  </div>

                  {/* AMOUNT */}
                  <div>
                    <p className="text-xs font-bold text-white">
                      KSh{" "}
                      {Number(
                        withdrawal.amount
                      ).toLocaleString("en-KE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    <p className="text-[8px] uppercase tracking-wider text-zinc-600">
                      Requested
                    </p>
                  </div>

                  {/* PHONE */}
                  <div className="flex items-center gap-1.5">

                    <Smartphone
                      size={11}
                      className="text-zinc-600"
                    />

                    <span className="font-mono text-[10px] text-zinc-400">
                      {withdrawal.phone_number}
                    </span>

                  </div>

                  {/* STATUS */}
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/5 px-1.5 py-1 text-[8px] font-semibold uppercase tracking-wider text-amber-400">
                      <span className="h-1 w-1 rounded-full bg-amber-400" />
                      Pending
                    </span>
                  </div>

                  {/* ARROW */}
                  <div className="hidden justify-end md:flex">

                    <ChevronRight
                      size={13}
                      className="text-zinc-700 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-400"
                    />

                  </div>

                </div>

              </button>

            ))}

          </div>

        </div>

      )}

    </section>
  )
}