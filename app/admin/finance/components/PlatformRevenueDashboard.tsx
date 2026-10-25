"use client"

import usePlatformRevenue from "../hooks/usePlatformRevenue"

const labels: Record<string, string> = {
  fundraiser: "Fundraiser",
  merry_go_round: "Merry-Go-Round",
  wallet_deposit: "Wallet Deposit",
  wallet_withdrawal: "Wallet Withdrawal",
}

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function PlatformRevenueDashboard() {
  const {
    summary,
    byProduct,
    loading,
    error,
    reload,
  } = usePlatformRevenue(true)

  return (
    <section
      aria-label="Platform Revenue Dashboard"
      className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5 shadow-2xl shadow-black/20"
    >
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-sm text-emerald-400">
              KSh
            </span>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-zinc-200">
              StreetGO Revenue
            </h2>

            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
              Platform fees actually generated
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={reload}
          disabled={loading}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-8 text-center">
          <p className="text-xs text-zinc-500">
            Loading revenue...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs font-semibold text-red-400">
            Unable to load platform revenue
          </p>

          <p className="mt-1 text-[11px] text-red-400/70">
            {error}
          </p>
        </div>
      ) : (
        <>
          {/* Revenue summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                Today
              </p>

              <p className="mt-2 font-mono text-xl font-bold text-white">
                {formatKES(summary.today)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                This Week
              </p>

              <p className="mt-2 font-mono text-xl font-bold text-white">
                {formatKES(summary.week)}
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-[9px] uppercase tracking-wider text-zinc-600">
                This Month
              </p>

              <p className="mt-2 font-mono text-xl font-bold text-white">
                {formatKES(summary.month)}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-[9px] uppercase tracking-wider text-emerald-500/60">
                All Time Revenue
              </p>

              <p className="mt-2 font-mono text-xl font-bold text-emerald-400">
                {formatKES(summary.allTime)}
              </p>
            </div>
          </div>

          {/* Revenue by product */}
          <div className="mt-5">
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Revenue by Product
              </p>

              <p className="mt-1 text-[10px] text-zinc-600">
                Actual platform fees recorded in the revenue ledger
              </p>
            </div>

            {byProduct.length === 0 ? (
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-center">
                <p className="text-xs text-zinc-600">
                  No platform revenue has been recorded yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {byProduct.map((product) => (
                  <div
                    key={product.source_type}
                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-4"
                  >
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {labels[product.source_type] ||
                          product.source_type}
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-600">
                        Platform Fee Revenue
                      </p>
                    </div>

                    <p className="font-mono text-sm font-bold text-emerald-400">
                      {formatKES(product.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}