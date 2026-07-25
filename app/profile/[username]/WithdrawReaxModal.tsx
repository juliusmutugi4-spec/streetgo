'use client'

import { useState } from "react"
import { supabase } from "../../lib/supabase"
interface Props {
  open: boolean
  onClose: () => void
  userId: string
}

export default function WithdrawReaxModal({
  open,
  onClose,
  userId,
}: Props) {

  const [amount, setAmount] = useState("")
const [loading, setLoading] = useState(false)

async function withdrawReax() {

  const value = Number(amount)
setLoading(true)
  if (!value || value <= 0) {
    alert("Enter a valid REAX amount")
    return
  }


  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("balance, reax_balance")
    .eq("user_id", userId)
    .single()


  if (error || !wallet) {
    alert("Wallet not found")
    return
  }


  if (wallet.reax_balance < value) {
    alert("Not enough REAX balance")
    return
  }


  const { error: updateError } = await supabase
    .from("wallets")
    .update({
      balance: wallet.balance + value,
      reax_balance: wallet.reax_balance - value,
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
    sender_id: userId,
    receiver_id: userId,
    amount: value,
   type: "refund",
    description: "REAX to Wallet conversion",
  })


if (transactionError) {
  alert(transactionError.message)
  setLoading(false)
  return
}


alert("REAX converted back to wallet successfully ⭐")

setAmount("")
setLoading(false)

window.location.reload()
}


  if (!open) return null


  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">

      <div className="w-full max-w-sm rounded-xl bg-zinc-950 border border-zinc-800">

        <div className="p-4 border-b border-zinc-800">
          <h2 className="text-white font-bold">
            🏦 Withdraw REAX
          </h2>

          <p className="text-sm text-zinc-400 mt-1">
            Convert REAX back into your StreetGO Wallet.
          </p>
        </div>


        <div className="p-4">

          <input
            type="number"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
            placeholder="Amount of REAX"
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-white"
          />

        </div>


        <div className="flex gap-2 p-4 border-t border-zinc-800">

          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-zinc-900 text-zinc-300 py-2"
          >
            Cancel
          </button>


<button
  onClick={withdrawReax}
  disabled={loading}
  className="flex-1 rounded-lg bg-emerald-500 text-black font-bold py-2 disabled:opacity-50"
>
  {loading ? "Processing..." : "Withdraw"}
</button>

        </div>

      </div>

    </div>
  )
}