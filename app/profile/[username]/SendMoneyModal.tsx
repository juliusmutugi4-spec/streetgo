'use client'

import { X, Send } from "lucide-react"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
interface Props {
  open: boolean
  onClose: () => void
}

export default function SendMoneyModal({
  open,
  onClose,
}: Props) {

  const [username, setUsername] = useState("")
  const [amount, setAmount] = useState("")
const [loading, setLoading] = useState(false)
const [receiver, setReceiver] = useState<any>(null)
const [error, setError] = useState("")
  if (!open) return null

async function searchUser() {
  setLoading(true)
  setError("")
  setReceiver(null)

  const clean = username.replace("@", "").trim().toLowerCase()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("username", clean)
    .maybeSingle()



  setLoading(false)

  if (error || !data) {
    setError("User not found")
    return
  }

const { data: wallet, error: walletError } = await supabase
  .from("wallets")
  .select("id, user_id")
  .eq("user_id", data.id)
  .maybeSingle()





if (!wallet) {
  setError("This user has not activated a StreetGO Wallet yet.")
  return
}

setReceiver(data)
}

async function sendMoney() {
  if (!receiver) {
    setError("Search and select a recipient first.")
    return
  }

  if (!amount || Number(amount) <= 0) {
    setError("Enter a valid amount.")
    return
  }

  setLoading(true)
  setError("")

  try {
    const {
  data: { session },
} = await supabase.auth.getSession()
    const res = await fetch("/api/wallet/send", {
      method: "POST",
headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${session?.access_token}`,
},
      body: JSON.stringify({
        receiverId: receiver.id,
        amount: Number(amount),
      }),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      setError(data.error || "Transfer failed")
      return
    }

    alert("Connection successful!")

    

  } catch (err) {
    setError("Network error")
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="w-full max-w-sm rounded-xl bg-zinc-950 border border-zinc-900">

        <div className="flex items-center justify-between p-4 border-b border-zinc-900">
          <h2 className="text-white font-bold">
            Send Money
          </h2>

          <button onClick={onClose}>
            <X size={18}/>
          </button>
        </div>

        <div className="p-4 space-y-3">

          <input
            placeholder="@username"
            value={username}
            onChange={(e)=>setUsername(e.target.value)}
            className="w-full rounded bg-zinc-900 border border-zinc-800 p-2 text-white"
          />
<button
  onClick={searchUser}
  disabled={loading}
  className="w-full rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 py-2 text-white text-sm font-semibold"
>
  {loading ? "Searching..." : "Search User"}
</button>

{error && (
  <p className="text-red-400 text-sm">
    {error}
  </p>
)}

{receiver && (
  <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
      {receiver.avatar_url ? (
        <img
          src={receiver.avatar_url}
          alt={receiver.username}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
          {receiver.username[0].toUpperCase()}
        </div>
      )}
    </div>

    <div>
      <p className="text-white font-semibold">
        @{receiver.username}
      </p>
      <p className="text-xs text-emerald-400">
        ✓ Wallet recipient found
      </p>
    </div>
  </div>
)}


          <input
            placeholder="Amount"
            type="number"
            value={amount}
            onChange={(e)=>setAmount(e.target.value)}
            className="w-full rounded bg-zinc-900 border border-zinc-800 p-2 text-white"
          />

<button
  onClick={sendMoney}
  disabled={loading || !receiver}
  className={`w-full flex items-center justify-center gap-2 font-bold rounded p-2 transition ${
    receiver
      ? "bg-emerald-500 hover:bg-emerald-400 text-black"
      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
  }`}
>
  <Send size={16} />
  Send Money
</button>

        </div>

      </div>

    </div>
  )
}