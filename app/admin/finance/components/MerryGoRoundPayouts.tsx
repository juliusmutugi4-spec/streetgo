"use client"

import { useEffect, useState } from "react"

interface MerryGoRoundPayoutsProps {
  adminId: string
  adminRole: string
}

export default function MerryGoRoundPayouts({
  adminId,
  adminRole,
}: MerryGoRoundPayoutsProps) {
  const [rounds, setRounds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function loadPayouts() {
    if (!adminId) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        "/api/admin/merry-go-round/payouts",
        {
          method: "GET",
          headers: {
            "x-admin-id": adminId,
          },
          cache: "no-store",
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to load Merry-Go-Round payouts"
        )
      }

      setRounds(result.rounds || [])
    } catch (error) {
      console.error(
        "MERRY-GO-ROUND PAYOUT LOAD ERROR:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load Merry-Go-Round payouts"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminId) return

    loadPayouts()
  }, [adminId])

  if (loading) {
    return (
      <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5">
        <p className="text-xs text-zinc-500">
          Loading Merry-Go-Round payouts...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <p className="text-xs text-red-400">
          {error}
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">
            Merry-Go-Round Payouts
          </h2>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
            Admin payout approval queue
          </p>
        </div>

        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-mono text-zinc-500">
          {rounds.length} READY
        </span>
      </div>

      {rounds.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-800 py-8 text-center">
          <p className="text-xs text-zinc-500">
            No Merry-Go-Round payouts awaiting approval.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {rounds.map((round) => (
            <div
              key={round.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
            >
              <p className="font-mono text-xs text-zinc-400">
                Round: {round.id}
              </p>

              <p className="mt-2 text-sm font-semibold text-white">
                KSh{" "}
                {Number(
                  round.target_amount || 0
                ).toLocaleString("en-KE")}
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Collected: KSh{" "}
                {Number(
                  round.collected_amount || 0
                ).toLocaleString("en-KE")}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}