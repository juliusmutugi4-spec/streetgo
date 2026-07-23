'use client'

import { useState } from "react"

interface Props {
  open: boolean
  onClose: () => void
  phone: string
}

export default function TopUpWalletModal({
  open,
  onClose,
  phone,
}: Props) {
  const [amount, setAmount] = useState("")

  if (!open) return null

  async function topUp() {
    if (!amount) {
      alert("Enter an amount.")
      return
    }

    const res = await fetch("/api/mpesa/stkpush", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        amount: Number(amount),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Top up failed.")
      return
    }

    alert("Check your phone and complete the M-Pesa payment.")

    setAmount("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 p-6">

        <h2 className="text-xl font-bold text-white">
          Top Up Wallet
        </h2>

        <p className="text-zinc-400 text-sm mt-2">
          Payment will be requested from:
        </p>

        <p className="text-cyan-400 font-semibold mt-1">
          {phone}
        </p>

        <input
          className="w-full mt-5 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-white"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="mt-6 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
          >
            Cancel
          </button>

          <button
            onClick={topUp}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold"
          >
            Pay
          </button>
        </div>

      </div>
    </div>
  )
}