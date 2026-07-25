'use client'

import { useState } from "react"
import { supabase } from "../../lib/supabase"
interface Props {
  open: boolean
  onClose: () => void
  userId: string
}
export default function TopUpReaxModal({
  open,
  onClose,
  userId,
}: Props) {

const [amount, setAmount] = useState("")
const [loading, setLoading] = useState(false)
async function topUpReax() {

  const {
    data: { user },
  } = await supabase.auth.getUser()


  if (!user) {
    alert("User not logged in")
    return
  }


  const value = Number(amount)

  setLoading(true)


if (!value || value <= 0) {
  alert("Enter a valid amount")
  setLoading(false)
  return
}


  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("balance, reax_balance")
    .eq("user_id", userId)
    .single()


if (error || !wallet) {
  alert("Wallet not found")
  setLoading(false)
  return
}


 if (wallet.balance < value) {
  alert("Insufficient wallet balance")
  setLoading(false)
  return
}


  const { error: updateError } = await supabase
    .from("wallets")
    .update({
      balance: wallet.balance - value,
      reax_balance: wallet.reax_balance + value,
    })
    .eq("user_id", userId)


if (updateError) {
  alert(updateError.message)
  setLoading(false)
  return
}

const { error: transactionError } = await supabase
  .from("reax_transactions")
  .insert({
    sender_id: user.id,
    receiver_id: user.id,
    amount: value,
    type: "topup",
    description: "Wallet to REAX conversion",
  })


if (transactionError) {
  alert(transactionError.message)
  setLoading(false)
  return
}


alert("REAX added successfully ⭐")

setAmount("")
setLoading(false)

window.location.reload()
}
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950">

        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-lg font-bold text-white">
            💰 Top Up REAX
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Exchange money from your StreetGO Wallet into REAX.
          </p>
        </div>

        <div className="p-4 space-y-4">

          <div>
            <label className="text-xs text-zinc-500">
              Amount (KES)
            </label>

<input
  type="number"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  placeholder="100"
  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-white outline-none"
/>
          </div>

          <div className="rounded-lg border border-emerald-900 bg-emerald-950/30 p-3">
            <p className="text-xs text-emerald-400">
              Exchange Rate
            </p>

            <p className="mt-1 font-bold text-white">
              1 KES = ⭐ 1 REAX
            </p>
          </div>

        </div>

        <div className="flex gap-2 border-t border-zinc-800 p-4">

          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-700 py-2 text-zinc-300"
          >
            Cancel
          </button>

<button
  onClick={topUpReax}
  disabled={loading}
  className="flex-1 rounded-lg bg-emerald-500 py-2 font-bold text-black disabled:opacity-50"
>
  {loading ? "Processing..." : "Continue"}
</button>

        </div>

      </div>
    </div>
  )
}