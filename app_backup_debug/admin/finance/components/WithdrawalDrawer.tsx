'use client'

import { useEffect, useState } from "react"
import { getSupabaseBrowser } from "../../../lib/supabase-browser"

import {
  markWithdrawalPaid,
  rejectWithdrawal,
  reassignWithdrawal,
} from "../actions/financeActions"

interface Withdrawal {
  id: string
  withdrawal_reference?: string | null
  user_id: string
  wallet_id: string
  amount: number
  phone_number: string
  status: string
  assigned_to?: string | null
  assigned_at?: string | null
  admin_note?: string | null
  rejection_reason?: string | null
  processed_by?: string | null
  created_at: string
  processed_at?: string | null
  username?: string | null
}

interface Props {
  withdrawal: any
  adminId: string
  adminRole: string
  onClose: () => void
  onSuccess: (updatedWithdrawal?: any) => void
}
interface AuditLog {
  id: string
  action: string
  description: string
  created_at: string
}

export default function WithdrawalDrawer({
  withdrawal,
  adminId,
  adminRole,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState("")
const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
const [auditLoading, setAuditLoading] = useState(false)
  const [mpesaReceipt, setMpesaReceipt] =
    useState("")

  const [mpesaMessage, setMpesaMessage] =
    useState("")

const [admins, setAdmins] = useState<
  {
    user_id: string
    username: string
    role: string
  }[]
>([])

const [selectedAdminId, setSelectedAdminId] =
  useState("")

useEffect(() => {
  const withdrawalId = withdrawal?.id

  if (!withdrawalId) {
    setAuditLogs([])
    return
  }

  let cancelled = false

  async function loadAuditLogs() {
    setAuditLoading(true)

    const supabase = getSupabaseBrowser()

    const { data, error } = await supabase
      .from("admin_logs")
      .select(
        "id, action, description, created_at"
      )
      .eq("target_type", "withdrawal")
      .eq("target_id", withdrawalId)
      .order("created_at", {
        ascending: true,
      })

    if (error) {
      console.error(
        "WITHDRAWAL AUDIT LOG ERROR:",
        error
      )

      if (!cancelled) {
        setAuditLogs([])
      }
    } else if (!cancelled) {
      setAuditLogs(data || [])
    }

    if (!cancelled) {
      setAuditLoading(false)
    }
  }

  loadAuditLogs()
async function loadAdmins() {
  if (adminRole !== "super_admin") {
    setAdmins([])
    return
  }

  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase
    .from("admins")
    .select(`
      user_id,
      role,
      profiles (
        username
      )
    `)
    .eq("status", "active")
    .in("role", ["super_admin", "finance_admin"])

  if (error) {
    console.error(
      "ADMIN LIST LOAD ERROR:",
      error
    )
    return
  }

  if (cancelled) return

  setAdmins(
    (data || []).map((admin: any) => ({
      user_id: admin.user_id,
      role: admin.role,
      username:
        admin.profiles?.username ||
        "Unknown Admin",
    }))
  )
}

loadAdmins()

if (withdrawal?.assigned_to) {
  setSelectedAdminId(
    withdrawal.assigned_to
  )
} else {
  setSelectedAdminId("")
}

  return () => {
    cancelled = true
  }
}, [withdrawal?.id, adminRole])

if (!withdrawal) {
  return null
}


  /*
  =====================================================
  NOTHING SELECTED
  =====================================================
  */


  /*
  =====================================================
  MARK AS PAID
  =====================================================
  */

  async function handlePaid() {
    if (!withdrawal) return

    if (!mpesaReceipt.trim()) {
      alert("Enter the M-Pesa receipt number.")
      return
    }

    if (!mpesaMessage.trim()) {
      alert(
        "Enter the M-Pesa confirmation message."
      )
      return
    }



    



    const confirmed = window.confirm(
      `Confirm payment of KSh ${Number(
        withdrawal.amount
      ).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} to ${withdrawal.phone_number}?`
    )

    if (!confirmed) return

    setLoading(true)

    try {
      const success =
        await markWithdrawalPaid(
          withdrawal.id,
          adminId,
          mpesaReceipt,
          mpesaMessage
        )

      if (!success) {
        alert(
          "Unable to mark withdrawal as paid."
        )
        return
      }

      alert(
        "Withdrawal marked as paid successfully."
      )

      setMpesaReceipt("")
      setMpesaMessage("")

      onClose()
      onSuccess()
    } catch (error) {
      console.error(
        "MARK WITHDRAWAL PAID ERROR:",
        error
      )

      alert(
        "Failed to mark withdrawal as paid."
      )
    } finally {
      setLoading(false)
    }
  }

  /*
  =====================================================
  REJECT WITHDRAWAL
  =====================================================
  */

  async function handleReject() {
    if (!withdrawal) return

    if (!reason.trim()) {
      alert(
        "Please enter a rejection reason."
      )
      return
    }

    const confirmed = window.confirm(
      "Reject this withdrawal request?"
    )

    if (!confirmed) return

    setLoading(true)

    try {
      const success =
        await rejectWithdrawal(
          withdrawal.id,
          adminId,
          reason
        )

      if (!success) {
        alert(
          "Unable to reject withdrawal."
        )
        return
      }

      alert(
        "Withdrawal rejected successfully."
      )

      setReason("")

      onClose()
      onSuccess()
    } catch (error) {
      console.error(
        "REJECT WITHDRAWAL ERROR:",
        error
      )

      alert(
        "Failed to reject withdrawal."
      )
    } finally {
      setLoading(false)
    }
  }

  /*
  =====================================================
  FORMATTING
  =====================================================
  */

  const formattedAmount =
    Number(
      withdrawal.amount || 0
    ).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const formattedDate =
    withdrawal.created_at
      ? new Date(
          withdrawal.created_at
        ).toLocaleString("en-KE")
      : "Unknown"

  /*
  =====================================================
  UI
  =====================================================
  */


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0d11] shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-zinc-800 p-5">

          <div>
            <h2 className="text-base font-semibold text-white">
              Withdrawal Review
            </h2>

            <p className="mt-1 text-[11px] text-zinc-500">
              Manual payment authorization
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-md px-2 py-1 text-zinc-500 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>

        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">

          {/* =================================================
              WITHDRAWAL REFERENCE
          ================================================= */}

          <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4">

            <div className="flex items-center justify-between">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">
                Withdrawal Reference
              </p>

              <span className="rounded border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[9px] font-bold uppercase text-sky-400">
                Case ID
              </span>

            </div>

            <p className="mt-2 font-mono text-base font-bold tracking-wider text-white">
              {withdrawal.withdrawal_reference || "REFERENCE NOT LOADED"}
            </p>

            <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
              Use this reference when investigating,
              communicating, or verifying this withdrawal.
            </p>

          </div>

          {/* =================================================
              USER
          ================================================= */}

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              User
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {withdrawal.username ||
                "Unknown User"}
            </p>

            <p className="mt-1 break-all text-[10px] text-zinc-600">
              {withdrawal.user_id}
            </p>

          </div>

          {/* =================================================
              AMOUNT + STATUS
          ================================================= */}

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Amount
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                KSh {formattedAmount}
              </p>

            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </p>

              <p className="mt-2 inline-flex rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[10px] font-bold uppercase text-amber-400">
                {withdrawal.status}
              </p>

            </div>

          </div>

          {/* =================================================
              M-PESA NUMBER
          ================================================= */}

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              M-Pesa Number
            </p>

            <p className="mt-1 font-mono text-sm font-semibold text-white">
              {withdrawal.phone_number}
            </p>

          </div>


{/* =================================================
    SUPER ADMIN ASSIGNMENT
================================================= */}

{adminRole === "super_admin" &&
  withdrawal.status === "pending" && (
    <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
        Withdrawal Assignment
      </p>

      <p className="mt-1 text-[10px] text-zinc-500">
        Super Admin control — move this withdrawal to another admin.
      </p>


<div className="mb-3 rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2.5">
  <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
    Currently Assigned To
  </p>

  <p className="mt-1 text-xs font-semibold text-zinc-300">
    {admins.find(
      (admin) =>
        admin.user_id === withdrawal.assigned_to
    )?.username || "Unassigned"}
  </p>
</div>


      <div className="mt-3">

        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Assign To
        </label>

        <select
          value={selectedAdminId}
          onChange={(e) =>
            setSelectedAdminId(e.target.value)
          }
          disabled={loading}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-white outline-none focus:border-violet-500 disabled:opacity-50"
        >

          <option value="">
            Select admin
          </option>

          {admins.map((admin) => (
            <option
              key={admin.user_id}
              value={admin.user_id}
            >
              {admin.username} — {admin.role}
            </option>
          ))}

        </select>

      </div>

      <button
        type="button"
        disabled={
          loading ||
          !selectedAdminId
        }
onClick={async () => {
  if (!selectedAdminId) {
    alert("Select an admin first.")
    return
  }

  const confirmed = window.confirm(
    "Reassign this withdrawal to the selected admin?"
  )

  if (!confirmed) return

  setLoading(true)

  try {
    const success = await reassignWithdrawal(
      withdrawal.id,
      adminId,
      selectedAdminId
    )

    if (!success) {
      alert("Unable to reassign this withdrawal.")
      return
    }

alert("Withdrawal reassigned successfully.")

const updatedWithdrawal = {
  ...withdrawal,
  assigned_to: selectedAdminId,
  assigned_at: new Date().toISOString(),
}

setSelectedAdminId("")

onClose()
onSuccess(updatedWithdrawal)
  } catch (error) {
    console.error(
      "REASSIGN WITHDRAWAL ERROR:",
      error
    )

    alert("Failed to reassign withdrawal.")
  } finally {
    setLoading(false)
  }
}}
        className="mt-3 w-full rounded-lg border border-violet-500/20 bg-violet-500/10 py-2.5 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Reassign Withdrawal
      </button>

    </div>
  )}





          {/* =================================================
              REQUEST DATE
          ================================================= */}

          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Requested
            </p>

            <p className="mt-1 text-xs text-zinc-300">
              {formattedDate}
            </p>

          </div>



{/* =================================================
    ACTIVITY / AUDIT HISTORY
================================================= */}

<div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">

  <div className="flex items-center justify-between">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
      Activity
    </p>

    {auditLoading && (
      <span className="text-[9px] text-zinc-600">
        Loading...
      </span>
    )}
  </div>

  <div className="mt-4 space-y-4">

    {/* Withdrawal requested */}
    <div className="flex gap-3">

      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-400" />

      <div className="min-w-0">
        <p className="text-xs font-semibold text-zinc-200">
          Withdrawal requested
        </p>

        <p className="mt-1 text-[10px] text-zinc-500">
          {formattedDate}
        </p>
      </div>

    </div>

    {/* Admin actions */}
    {auditLogs.map((log) => (

      <div
        key={log.id}
        className="flex gap-3"
      >

        <div
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
            log.action === "MARK_WITHDRAWAL_PAID"
              ? "bg-emerald-400"
              : log.action === "REJECT_WITHDRAWAL"
              ? "bg-red-400"
              : "bg-zinc-500"
          }`}
        />

        <div className="min-w-0">

          <p className="text-xs font-semibold text-zinc-200">
            {log.action === "MARK_WITHDRAWAL_PAID"
              ? "Withdrawal marked as paid"
              : log.action === "REJECT_WITHDRAWAL"
              ? "Withdrawal rejected"
              : log.action.replaceAll("_", " ")}
          </p>

          <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
            {log.description}
          </p>

          <p className="mt-1 text-[9px] text-zinc-600">
            {new Date(
              log.created_at
            ).toLocaleString("en-KE")}
          </p>

        </div>

      </div>

    ))}

    {!auditLoading && auditLogs.length === 0 && (
      <p className="text-[10px] text-zinc-600">
        No administrative activity recorded yet.
      </p>
    )}

  </div>
</div>


          {/* =================================================
              M-PESA RECEIPT
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              M-Pesa Receipt
            </label>

            <input
              type="text"
              value={mpesaReceipt}
              onChange={(e) =>
                setMpesaReceipt(
                  e.target.value
                )
              }
              disabled={loading}
              placeholder="e.g. QJH7K8L9M2"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 font-mono text-xs text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500 disabled:opacity-50"
            />

            <p className="mt-1 text-[9px] text-zinc-600">
              Enter the M-Pesa transaction receipt
              after payment has actually been sent.
            </p>

          </div>

          {/* =================================================
              M-PESA CONFIRMATION MESSAGE
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              M-Pesa Confirmation Message
            </label>

            <textarea
              value={mpesaMessage}
              onChange={(e) =>
                setMpesaMessage(
                  e.target.value
                )
              }
              disabled={loading}
              placeholder="Paste the M-Pesa confirmation message here..."
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs leading-relaxed text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500 disabled:opacity-50"
            />

            <p className="mt-1 text-[9px] text-zinc-600">
              This message becomes part of the permanent
              payment record.
            </p>

          </div>

          {/* =================================================
              REJECTION REASON
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Rejection Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              disabled={loading}
              placeholder="Required only when rejecting..."
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-red-500 disabled:opacity-50"
            />

          </div>

          {/* =================================================
              WARNING
          ================================================= */}

          <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">

            <p className="text-[10px] leading-relaxed text-zinc-400">
              Confirm that the M-Pesa payment has
              actually been sent before marking this
              withdrawal as paid.
            </p>

          </div>

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex gap-2 border-t border-zinc-800 p-5">

          <button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="flex-1 rounded-lg border border-red-500/20 bg-red-500/5 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Reject"}
          </button>

          <button
            type="button"
            onClick={handlePaid}
            disabled={
              loading ||
              withdrawal.status !==
                "pending"
            }
            className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : "Mark as Paid"}
          </button>

        </div>

      </div>

    </div>
  )
}