"use client"

import { useState } from "react"
import { supabase } from "../../lib/supabase"

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  wallet: any
  onSuccess: () => Promise<void>
}

interface WithdrawalResult {
  id: string
  withdrawal_reference: string | null
  amount: number
  phone_number: string
  status: string
  created_at: string
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

  const [submittedWithdrawal, setSubmittedWithdrawal] =
    useState<WithdrawalResult | null>(null)

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
      /*
      =====================================================
      CREATE WITHDRAWAL
      =====================================================
      */

      const {
        data: requestId,
        error: requestError,
      } = await supabase.rpc("request_withdrawal", {
        p_user_id: userId,
        p_amount: value,
      })

      if (requestError) {
        throw new Error(requestError.message)
      }

      if (!requestId) {
        throw new Error(
          "Withdrawal request was not created."
        )
      }

      /*
      =====================================================
      FETCH CREATED WITHDRAWAL
      =====================================================
      */

      const {
        data: withdrawal,
        error: withdrawalError,
      } = await supabase
        .from("withdrawal_requests")
        .select(`
          id,
          withdrawal_reference,
          amount,
          phone_number,
          status,
          created_at
        `)
        .eq("id", requestId)
        .eq("user_id", userId)
        .single()

      if (withdrawalError) {
        console.error(
          "WITHDRAWAL FETCH ERROR:",
          withdrawalError
        )

        /*
        The withdrawal was already created successfully.
        Do not tell the user that the withdrawal failed.
        */

        alert(
          "Withdrawal submitted successfully, but we could not load the reference. Please check Withdrawal History."
        )

        setAmount("")

        await onSuccess()

        onClose()

        return
      }

      /*
      =====================================================
      SAVE CREATED WITHDRAWAL FOR IMMEDIATE DISPLAY
      =====================================================
      */

      setSubmittedWithdrawal({
        id: withdrawal.id,
        withdrawal_reference:
          withdrawal.withdrawal_reference,
        amount: Number(withdrawal.amount),
        phone_number:
          withdrawal.phone_number,
        status: withdrawal.status,
        created_at:
          withdrawal.created_at,
      })

      setAmount("")

      /*
      =====================================================
      START B2C PAYMENT
      =====================================================

      IMPORTANT:
      We only send the withdrawal ID.

      The server-side B2C route will read:
        - amount
        - phone_number
        - withdrawal_reference

      directly from withdrawal_requests.

      This prevents the browser from changing the
      payment amount or destination number.
      =====================================================
      */

      try {
        const b2cResponse = await fetch(
          "/api/mpesa/b2c",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              withdrawalId: withdrawal.id,
            }),
          }
        )

        const b2cData =
          await b2cResponse.json()

        console.log(
          "===== STREETGO B2C RESPONSE ====="
        )

        console.log(
          JSON.stringify(
            b2cData,
            null,
            2
          )
        )

        console.log(
          "================================="
        )

        /*
        ===================================================
        B2C REQUEST FAILED
        ===================================================
        */

        if (!b2cResponse.ok) {
          console.error(
            "B2C REQUEST FAILED:",
            b2cData
          )

          /*
          The withdrawal record already exists.

          Do not delete it.

          The user can still see the withdrawal in
          their history and StreetGO Finance can review it.
          */

          alert(
            b2cData?.error ||
              "Withdrawal was created, but the M-Pesa payment request could not be started."
          )

          await onSuccess()

          return
        }

        /*
        ===================================================
        B2C REQUEST ACCEPTED
        ===================================================
        */

        console.log(
          "B2C REQUEST ACCEPTED:",
          b2cData
        )

        /*
        Refresh the withdrawal so the UI can pick up
        the processing status saved by the API.
        */

        const {
          data: updatedWithdrawal,
        } = await supabase
          .from("withdrawal_requests")
          .select(`
            id,
            withdrawal_reference,
            amount,
            phone_number,
            status,
            created_at
          `)
          .eq("id", withdrawal.id)
          .single()

        if (updatedWithdrawal) {
          setSubmittedWithdrawal({
            id: updatedWithdrawal.id,

            withdrawal_reference:
              updatedWithdrawal.withdrawal_reference,

            amount:
              Number(
                updatedWithdrawal.amount
              ),

            phone_number:
              updatedWithdrawal.phone_number,

            status:
              updatedWithdrawal.status,

            created_at:
              updatedWithdrawal.created_at,
          })
        }

        await onSuccess()
      } catch (b2cError: any) {
        console.error(
          "B2C START ERROR:",
          b2cError
        )

        /*
        The withdrawal has already been created.

        We deliberately do NOT delete or reverse it here.
        */

        alert(
          b2cError?.message ||
            "Withdrawal was created, but the M-Pesa payment could not be started."
        )

        await onSuccess()
      }
    } catch (error: any) {
      console.error(
        "WITHDRAWAL REQUEST ERROR:",
        error
      )

      alert(
        error?.message ||
          "Unable to submit withdrawal request."
      )
    } finally {
      setLoading(false)
    }
  }

  /*
  =========================================================
  SUCCESS VIEW
  =========================================================
  */

  if (submittedWithdrawal) {
    const formattedAmount =
      Number(
        submittedWithdrawal.amount || 0
      ).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })

    const formattedDate =
      new Date(
        submittedWithdrawal.created_at
      ).toLocaleString("en-KE")

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0d11] shadow-2xl">

          {/* HEADER */}

          <div className="border-b border-zinc-800 p-5">
            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />

              <h2 className="text-base font-bold text-white">
                Withdrawal Submitted
              </h2>

            </div>

            <p className="mt-1 text-xs text-zinc-500">
              Your M-Pesa withdrawal request has been submitted for processing.
            </p>
          </div>

          {/* BODY */}

          <div className="space-y-4 p-5">

            {/* REFERENCE */}

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">

              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                Withdrawal Reference
              </p>

              <p className="mt-2 font-mono text-xl font-black tracking-wider text-white">
                {submittedWithdrawal.withdrawal_reference ||
                  "REFERENCE PENDING"}
              </p>

              <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
                Keep this reference. It can be used to verify and track this withdrawal with StreetGO Finance.
              </p>

            </div>

            {/* AMOUNT */}

            <div className="grid grid-cols-2 gap-3">

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">

                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  Amount
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  KSh {formattedAmount}
                </p>

              </div>

              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">

                <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </p>

                <span className="mt-2 inline-flex rounded-md border border-amber-500/20 bg-amber-500/5 px-2 py-1 text-[10px] font-bold uppercase text-amber-400">
                  {submittedWithdrawal.status}
                </span>

              </div>

            </div>

            {/* MPESA */}

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">

              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                M-Pesa Number
              </p>

              <p className="mt-1 font-mono text-sm font-semibold text-white">
                {submittedWithdrawal.phone_number}
              </p>

            </div>

            {/* REQUESTED */}

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">

              <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
                Requested
              </p>

              <p className="mt-1 text-xs text-zinc-300">
                {formattedDate}
              </p>

            </div>

            {/* NOTICE */}

            <div className="rounded-lg border border-amber-500/10 bg-amber-500/5 p-3">

              <p className="text-[10px] leading-relaxed text-zinc-400">
                Your withdrawal has been sent to the M-Pesa payment system. The final status will be updated when Safaricom sends the payment result.
              </p>

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-zinc-800 p-5">

            <button
              type="button"
              onClick={() => {
                setSubmittedWithdrawal(null)
                onClose()
              }}
              className="w-full rounded-lg bg-emerald-500 py-2.5 text-xs font-bold text-black transition hover:bg-emerald-400"
            >
              Done
            </button>

          </div>

        </div>
      </div>
    )
  }

  /*
  =========================================================
  WITHDRAWAL FORM
  =========================================================
  */

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading
        ) {
          onClose()
        }
      }}
    >

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0d11] shadow-2xl">

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
              onChange={(e) =>
                setAmount(e.target.value)
              }
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
              Withdrawals are sent through the StreetGO M-Pesa payment system. Your request will remain in processing until Safaricom returns the final payment result.
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
            {loading
              ? "Processing..."
              : "Request Withdrawal"}
          </button>

        </div>

      </div>

    </div>
  )
}