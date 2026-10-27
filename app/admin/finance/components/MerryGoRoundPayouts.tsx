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
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
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

  async function loadAutoPayoutSetting() {
    if (!adminId) return

    try {
      const response = await fetch(
        "/api/admin/merry-go-round/auto-payout",
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
            "Unable to load auto payout setting"
        )
      }

      setAutoPayoutEnabled(
        Boolean(result.enabled)
      )
    } catch (error) {
      console.error(
        "AUTO PAYOUT SETTING LOAD ERROR:",
        error
      )
    }
  }

  async function toggleAutoPayout() {
    if (!adminId) return

    const nextValue = !autoPayoutEnabled

    const confirmed = window.confirm(
      nextValue
        ? "Enable automatic Merry-Go-Round payouts?\n\nAutomatic processing will be enabled, but Safaricom B2C will NOT be initiated by this switch yet."
        : "Disable automatic Merry-Go-Round payouts?"
    )

    if (!confirmed) return

    try {
      setAutoLoading(true)
      setError("")

      const response = await fetch(
        "/api/admin/merry-go-round/auto-payout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-id": adminId,
          },
          body: JSON.stringify({
            enabled: nextValue,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to update auto payout setting"
        )
      }

      setAutoPayoutEnabled(
        Boolean(result.enabled)
      )

      alert(
        Boolean(result.enabled)
          ? "Automatic Merry-Go-Round payout mode is now ON."
          : "Automatic Merry-Go-Round payout mode is now OFF."
      )
    } catch (error) {
      console.error(
        "AUTO PAYOUT TOGGLE ERROR:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update auto payout setting"
      )
    } finally {
      setAutoLoading(false)
    }
  }

  async function handleApprovePayout(
    roundId: string
  ) {
    if (!adminId) return

    const confirmed = window.confirm(
      "Approve this Merry-Go-Round payout?\n\n" +
        "The payout will be prepared and the deduction will be calculated.\n\n" +
        "Safaricom B2C will NOT be called yet."
    )

    if (!confirmed) return

    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        "/api/admin/merry-go-round/payouts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-id": adminId,
          },
          body: JSON.stringify({
            roundId,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to approve payout"
        )
      }

      console.log(
        "MERRY-GO-ROUND PAYOUT APPROVED:",
        result
      )

      alert(
        `Payout prepared successfully.\n\n` +
          `Gross: KSh ${Number(
            result.disbursement?.grossAmount || 0
          ).toLocaleString("en-KE")}\n` +
          `Deduction: KSh ${Number(
            result.disbursement?.deductionAmount || 0
          ).toLocaleString("en-KE")}\n` +
          `Member receives: KSh ${Number(
            result.disbursement?.netAmount || 0
          ).toLocaleString("en-KE")}\n\n` +
          `Safaricom B2C was NOT initiated.`
      )

      await loadPayouts()
    } catch (error) {
      console.error(
        "MERRY-GO-ROUND APPROVAL ERROR:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Unable to approve payout"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminId) return

    loadPayouts()
    loadAutoPayoutSetting()
  }, [adminId])

  if (loading && rounds.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5">
        <p className="text-xs text-zinc-500">
          Loading Merry-Go-Round payouts...
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5">

      {/* HEADER */}
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

      {/* ERROR */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* AUTO PAYOUT CONTROL */}
      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-semibold text-zinc-200">
              Automatic Payout Processing
            </p>

            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
              Automatically process eligible Merry-Go-Round payouts
            </p>

            <p
              className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                autoPayoutEnabled
                  ? "text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              {autoPayoutEnabled
                ? "● AUTO PAYOUT ON"
                : "● AUTO PAYOUT OFF"}
            </p>
          </div>

          <button
            type="button"
            onClick={toggleAutoPayout}
            disabled={autoLoading}
            className={`rounded-lg px-4 py-3 text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${
              autoPayoutEnabled
                ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {autoLoading
              ? "Updating..."
              : autoPayoutEnabled
                ? "Turn Auto Payout Off"
                : "Enable Auto Payout"}
          </button>
        </div>

        <div className="mt-3 border-t border-zinc-800 pt-3">
          <p className="text-[9px] uppercase tracking-wider text-zinc-600">
            Safety mode: the switch only controls the automatic
            payout setting. Safaricom B2C is not connected to
            automatic processing yet.
          </p>
        </div>
      </div>

      {/* READY PAYOUTS */}
      {rounds.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-zinc-800 py-8 text-center">
          <p className="text-xs text-zinc-500">
            No Merry-Go-Round payouts awaiting approval.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">

          {rounds.map((round) => {
            const grossAmount = Number(
              round.targetAmount || 0
            )

            const collectedAmount = Number(
              round.collectedAmount || 0
            )

            const recipientMemberId =
              round.recipientMemberId

            const deduction =
              grossAmount >= 5000 ? 50 : 20

            const netAmount = Math.max(
              grossAmount - deduction,
              0
            )

            return (
              <div
                key={round.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
              >

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                      Merry-Go-Round Round
                    </p>

                    <p className="mt-1 font-mono text-xs text-zinc-300">
                      {round.id}
                    </p>
                  </div>

                  <span className="rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase text-amber-400">
                    Awaiting Approval
                  </span>
                </div>

                {/* PAYOUT AMOUNTS */}
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                      Gross Payout
                    </p>

                    <p className="mt-1 text-lg font-bold text-white">
                      KSh{" "}
                      {grossAmount.toLocaleString(
                        "en-KE"
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                      Platform Deduction
                    </p>

                    <p className="mt-1 text-lg font-bold text-red-400">
                      - KSh{" "}
                      {deduction.toLocaleString(
                        "en-KE"
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                      Member Receives
                    </p>

                    <p className="mt-1 text-lg font-bold text-emerald-400">
                      KSh{" "}
                      {netAmount.toLocaleString(
                        "en-KE"
                      )}
                    </p>
                  </div>

                </div>

                {/* ROUND DETAILS */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                      Collected
                    </p>

                    <p className="mt-1 text-xs font-semibold text-zinc-300">
                      KSh{" "}
                      {collectedAmount.toLocaleString(
                        "en-KE"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500">
                      Recipient Member
                    </p>

                    <p className="mt-1 font-mono text-xs text-zinc-300">
                      {recipientMemberId ||
                        "Not available"}
                    </p>
                  </div>

                </div>

                {/* MANUAL APPROVAL */}
                <div className="mt-5 border-t border-zinc-800 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      handleApprovePayout(
                        round.id
                      )
                    }
                    disabled={
                      loading ||
                      autoPayoutEnabled
                    }
                    className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading
                      ? "Preparing Payout..."
                      : autoPayoutEnabled
                        ? "Auto Payout Enabled"
                        : "Approve & Prepare Payout"}
                  </button>

                  <p className="mt-2 text-center text-[9px] uppercase tracking-wider text-zinc-600">
                    Safaricom B2C initiation will be enabled after payout verification
                  </p>

                </div>
              </div>
            )
          })}

        </div>
      )}
    </section>
  )
}