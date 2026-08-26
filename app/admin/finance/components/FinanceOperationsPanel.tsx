"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"

interface FinanceAdmin {
  user_id: string
  role: string
  status: string
  username: string
}
interface FinanceOperationsPanelProps {
  pendingCount: number
  adminId: string
  withdrawals: any[]
  setWithdrawals: React.Dispatch<React.SetStateAction<any[]>>
  onSelectWithdrawal: (withdrawal: any) => void
}

export default function FinanceOperationsPanel({
  pendingCount,
  adminId,
  withdrawals,
  setWithdrawals,
  onSelectWithdrawal,
}: FinanceOperationsPanelProps) {

  const supabase = getSupabaseBrowser()

  const [claimingId, setClaimingId] = useState<string | null>(null)

const [admins, setAdmins] = useState<FinanceAdmin[]>([])
type AdminRow = {
  user_id: string
  role: string
  status: string
}

type ProfileRow = {
  id: string
  username: string | null
}

useEffect(() => {
  async function loadAdmins() {
    const {
      data,
      error,
    }: {
      data: AdminRow[] | null
      error: any
    } = await supabase
      .from("admins")
      .select("user_id, role, status")
      .eq("status", "active")
      .in("role", [
        "super_admin",
        "finance_admin",
      ])

    if (error) {
      console.error(
        "FINANCE ADMINS ERROR:",
        error
      )
      return
    }

    if (!data || data.length === 0) {
      setAdmins([])
      return
    }

    const userIds = data.map(
      (admin: AdminRow) => admin.user_id
    )

    const {
      data: profiles,
      error: profileError,
    }: {
      data: ProfileRow[] | null
      error: any
    } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds)

    if (profileError) {
      console.error(
        "FINANCE ADMIN PROFILES ERROR:",
        profileError
      )
    }

    const profileMap = new Map<string, string | null>(
      (profiles ?? []).map(
        (profile: ProfileRow) => [
          profile.id,
          profile.username,
        ]
      )
    )

    setAdmins(
      data.map((admin: AdminRow) => ({
        user_id: admin.user_id,
        role: admin.role,
        status: admin.status,
        username:
          profileMap.get(admin.user_id) ||
          "Unknown Admin",
      }))
    )
  }

  loadAdmins()
}, [supabase])

  const myWithdrawals = withdrawals.filter(
    (withdrawal) =>
      withdrawal.assigned_to === adminId &&
      withdrawal.status === "pending"
  )

  const unassignedWithdrawals = withdrawals.filter(
    (withdrawal) =>
      !withdrawal.assigned_to &&
      withdrawal.status === "pending"
  )

  async function handleClaim(withdrawalId: string) {
    if (claimingId) return

    setClaimingId(withdrawalId)

    try {
      const { data, error } = await supabase.rpc(
        "claim_withdrawal",
        {
          p_withdrawal_id: withdrawalId,
        }
      )

if (error) {
  if (
    error.message?.includes(
      "WITHDRAWAL_ALREADY_ASSIGNED"
    )
  ) {
    alert(
      "This withdrawal has already been claimed by another admin."
    )
    return
  }

  console.error("CLAIM WITHDRAWAL ERROR:", error)
  
  alert(
    error.message ||
      error.details ||
      "Unable to claim withdrawal."
  )

  return
}
      


setWithdrawals((current) =>
  current.map((withdrawal) =>
    withdrawal.id === withdrawalId
      ? {
          ...withdrawal,
          ...(Array.isArray(data)
            ? data[0]
            : data),
          assigned_to: adminId,
          assigned_at:
            new Date().toISOString(),
        }
      : withdrawal
  )
)


      /*
       * The database has now assigned the withdrawal
       * to the logged-in admin.
       *
       * Realtime synchronization will update the
       * withdrawal list for all admins.
       */
    } catch (error) {
      console.error(
        "CRITICAL CLAIM ERROR:",
        error
      )

      alert(
        "Something went wrong while claiming the withdrawal."
      )
    } finally {
      setClaimingId(null)
    }
  }

  return (
    <aside className="w-[320px] shrink-0 border-l border-zinc-800 bg-zinc-950">
      <div className="sticky top-0 h-screen overflow-y-auto">

        {/* HEADER */}
        <div className="border-b border-zinc-800 px-5 py-4">
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Finance Operations
              </h2>

              <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
                Withdrawal control center
              </p>
            </div>

            <span className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 font-mono text-[9px] text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              LIVE
            </span>

          </div>
        </div>

        {/* ACTION REQUIRED */}
        <div className="border-b border-zinc-800 p-5">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Action Required
          </p>

          <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">

            <div className="flex items-end justify-between">

              <div>
                <p className="text-2xl font-semibold text-amber-400">
                  {pendingCount}
                </p>

                <p className="mt-1 text-xs text-zinc-400">
                  Pending withdrawals
                </p>
              </div>

              <span className="rounded-md bg-amber-500/10 px-2 py-1 font-mono text-[9px] uppercase text-amber-400">
                Attention
              </span>

            </div>

          </div>

        </div>

        {/* UNASSIGNED QUEUE */}
        <div className="border-b border-zinc-800 p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Unassigned
              </p>

              <p className="mt-1 text-[10px] text-zinc-600">
                Available for an admin to claim
              </p>
            </div>

            <span className="rounded bg-amber-500/10 px-2 py-1 font-mono text-[9px] text-amber-400">
              {unassignedWithdrawals.length}
            </span>

          </div>

          <div className="mt-3 space-y-2">

            {unassignedWithdrawals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-center">
                <p className="text-xs text-zinc-600">
                  No unassigned withdrawals
                </p>
              </div>
            ) : (
              unassignedWithdrawals.map(
                (withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="truncate font-mono text-[10px] font-semibold text-emerald-400">
                          {withdrawal.withdrawal_reference ||
                            "Unknown reference"}
                        </p>

                        <p className="mt-1 text-[10px] text-zinc-500">
                          {withdrawal.username ||
                            withdrawal.profiles?.username ||
                            "Unknown user"}
                        </p>

                      </div>

                      <p className="shrink-0 text-xs font-semibold text-white">
                        KSh{" "}
                        {Number(
                          withdrawal.amount || 0
                        ).toLocaleString(
                          "en-KE",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleClaim(
                          withdrawal.id
                        )
                      }
                      disabled={
                        claimingId ===
                        withdrawal.id
                      }
                      className="mt-3 w-full rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {claimingId ===
                      withdrawal.id
                        ? "Claiming..."
                        : "Claim Withdrawal"}
                    </button>

                  </div>
                )
              )
            )}

          </div>

        </div>

        {/* MY QUEUE */}
        <div className="border-b border-zinc-800 p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                My Queue
              </p>

              <p className="mt-1 text-[10px] text-zinc-600">
                Withdrawals assigned to you
              </p>
            </div>

            <span className="rounded bg-zinc-900 px-2 py-1 font-mono text-[9px] text-zinc-500">
              {myWithdrawals.length}
            </span>

          </div>

          <div className="mt-3 space-y-2">

            {myWithdrawals.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-800 p-4 text-center">
                <p className="text-xs text-zinc-600">
                  No withdrawals assigned
                </p>
              </div>
            ) : (
              myWithdrawals.map(
                (withdrawal) => (
<button
  key={withdrawal.id}
  type="button"
onClick={() => onSelectWithdrawal(withdrawal)}
  className="w-full rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3 text-left transition hover:border-emerald-500/30 hover:bg-emerald-500/10"
>

                    <div className="flex items-center justify-between gap-3">

                      <span className="truncate font-mono text-[10px] text-emerald-400">
                        {withdrawal.withdrawal_reference ||
                          "Unknown reference"}
                      </span>

                      <span className="shrink-0 text-xs font-semibold text-white">
                        KSh{" "}
                        {Number(
                          withdrawal.amount || 0
                        ).toLocaleString(
                          "en-KE",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>

                    </div>

                    <div className="mt-2 flex items-center justify-between">

                      <span className="text-[10px] text-zinc-500">
                        {withdrawal.username ||
                          withdrawal.profiles?.username ||
                          "Unknown user"}
                      </span>

                      <span className="rounded bg-amber-500/10 px-2 py-1 text-[9px] font-semibold uppercase text-amber-400">
                        Pending
                      </span>

                    </div>

                  </button>
                )
              )
            )}

          </div>

        </div>
{/* TEAM QUEUE */}
<div className="border-b border-zinc-800 p-5">

  <div className="flex items-center justify-between">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Team Queue
      </p>

      <p className="mt-1 text-[10px] text-zinc-600">
        Current withdrawal workload
      </p>
    </div>

    <span className="rounded bg-zinc-900 px-2 py-1 font-mono text-[9px] text-zinc-500">
      {withdrawals.filter(
        (withdrawal) =>
          withdrawal.status === "pending" &&
          withdrawal.assigned_to
      ).length}
    </span>
  </div>

  <div className="mt-3 space-y-2">

    {admins.map((admin) => {

      const assignedCount = withdrawals.filter(
        (withdrawal) =>
          withdrawal.status === "pending" &&
          withdrawal.assigned_to === admin.user_id
      ).length

      return (
        <div
          key={admin.user_id}
          className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-3"
        >

          <div className="flex items-center justify-between gap-3">

            <div className="min-w-0">

              <p className="truncate text-xs font-medium text-zinc-200">
                {admin.username}
              </p>

              <p className="mt-0.5 text-[9px] uppercase tracking-wider text-zinc-600">
                {admin.role === "super_admin"
                  ? "Super Admin"
                  : "Finance Admin"}
              </p>

            </div>

            <div className="flex items-center gap-2">

              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  assignedCount > 0
                    ? "bg-emerald-400"
                    : "bg-zinc-700"
                }`}
              />

              <span
                className={`font-mono text-xs font-semibold ${
                  assignedCount > 0
                    ? "text-emerald-400"
                    : "text-zinc-600"
                }`}
              >
                {assignedCount}
              </span>

            </div>

          </div>

          <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">

            <div
              className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
              style={{
                width:
                  pendingCount > 0
                    ? `${Math.min(
                        (assignedCount / pendingCount) * 100,
                        100
                      )}%`
                    : "0%",
              }}
            />

          </div>

        </div>
      )
    })}

  </div>

</div>





        {/* SYSTEM STATUS */}
        <div className="p-5">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            System Status
          </p>

          <div className="mt-3 space-y-3">

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Finance
              </span>

              <span className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                ONLINE
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Withdrawals
              </span>

              <span className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Realtime
              </span>

              <span className="flex items-center gap-1.5 font-mono text-[9px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                CONNECTED
              </span>
            </div>

          </div>

        </div>

      </div>
    </aside>
  )
}