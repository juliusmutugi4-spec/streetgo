'use client'

import { useState } from "react"
import { supabase } from "../../lib/supabase"

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  wallet: any
  onSuccess: () => Promise<void>
}

export default function WithdrawModal({
  open,
  onClose,
  userId,
  wallet,
  onSuccess,
}: Props) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const balance = Number(wallet?.balance ?? 0)
  const phone = wallet?.phone ?? ""

async function submitWithdrawal() {
  const value = Number(amount)

  if (!value || value <= 0) {
    alert("Enter a valid withdrawal amount.")
    return
  }

  if (value > balance) {
    alert("Insufficient wallet balance.")
    return
  }

  if (!phone) {
    alert("Your wallet does not have a phone number.")
    return
  }

  setLoading(true)

  try {
    const { data, error } = await supabase.rpc(
      "request_withdrawal",
      {
        p_user_id: userId,
        p_amount: value,
      }
    )

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      throw new Error("Withdrawal request was not created.")
    }

    alert(
      "Withdrawal request submitted successfully. Your request is now pending review."
    )

    setAmount("")

    await onSuccess()

    onClose()
  } catch (error: any) {
    alert(
      error?.message ||
        "Unable to submit withdrawal request."
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose()
        }
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-zinc-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Withdraw Funds
              </h2>

              <p className="mt-1 text-xs text-zinc-400">
                Request a withdrawal from your StreetGO wallet.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              aria-label="Close withdrawal"
            >
              ×
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="space-y-4 p-4">

          {/* AVAILABLE BALANCE */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Available Balance
            </p>

            <p className="mt-1 text-xl font-bold text-white">
              KSh{" "}
              {balance.toLocaleString("en-KE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* AMOUNT */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Withdrawal Amount
            </label>

            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-300">
              M-Pesa Number
            </label>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-300">
              {phone || "No phone number linked"}
            </div>

            <p className="mt-1 text-[10px] text-zinc-500">
              This is the phone number registered on your StreetGO wallet.
            </p>
          </div>

          {/* NOTICE */}
          <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">
            <p className="text-[11px] leading-relaxed text-zinc-400">
              Withdrawals are reviewed and paid manually by StreetGO Finance.
              Your request will remain pending until it is processed.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-2 border-t border-zinc-800 p-4">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submitWithdrawal}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Request Withdrawal"}
          </button>

        </div>

      </div>
    </div>
  )
}