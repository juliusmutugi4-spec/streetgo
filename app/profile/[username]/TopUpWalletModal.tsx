'use client'

import { useState } from "react"

interface Props {
  open: boolean
  onClose: () => void
  phone: string
}

export default function TopUpWalletModal({ open, onClose, phone }: Props) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null)

  if (!open) return null

  async function topUp() {
    if (!amount.trim()) {
      setStatus({ type: 'error', msg: "Enter an amount." })
      return
    }
    
    setLoading(true)
    setStatus(null)

    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount: Number(amount) }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Top up failed.")
      }

      setStatus({ type: 'success', msg: "Check phone for M-Pesa PIN prompt." })
      setAmount("")
      setTimeout(() => {
        setStatus(null)
        onClose()
      }, 3500)
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "Request failed." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <h2 className="text-xs font-medium text-zinc-200">Top Up Wallet</h2>
          <button onClick={onClose} disabled={loading} className="text-zinc-500 hover:text-zinc-300 text-xs disabled:opacity-30">✕</button>
        </div>

        {/* Target Details */}
        <div className="mt-3 flex items-center justify-between bg-zinc-900/30 border border-zinc-900 px-2.5 py-1.5 rounded-md">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">M-Pesa Target</span>
          <span className="text-xs font-mono font-medium text-cyan-500">{phone || "No phone"}</span>
        </div>

        {/* Input Field */}
        <div className="mt-3">
          <label className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">Amount (KES)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => {
              setAmount(e.target.value)
              if (status) setStatus(null)
            }}
            placeholder="Min 10" 
            disabled={loading}
            className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-xs text-zinc-200 outline-hidden focus:border-emerald-600 transition"
            autoFocus
          />
        </div>

        {/* Inline Feedback Messages */}
        {status && (
          <div className={`mt-2 text-[11px] rounded-md px-2 py-1 border ${
            status.type === 'error' 
              ? 'bg-red-950/20 border-red-900/50 text-red-400' 
              : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400'
          }`}>
            {status.msg}
          </div>
        )}

        {/* Micro Actions Layout */}
        <div className="mt-4 flex gap-2">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 rounded-md border border-zinc-800 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-900 disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button 
            onClick={topUp} 
            disabled={loading}
            className="flex-1 rounded-md bg-emerald-600 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {loading ? "Sending..." : "Pay"}
          </button>
        </div>

      </div>
    </div>
  )
}
