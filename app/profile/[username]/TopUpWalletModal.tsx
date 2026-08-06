'use client'

import MpesaGatewayBadge from "./MpesaGatewayBadge"
import { useState } from "react"
import { ShieldCheck, X, Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  phone: string
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000]

export default function TopUpWalletModal({ open, onClose, phone }: Props) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null)

  if (!open) return null

  // Highly professional enterprise real-time M-Pesa tariff estimator 
  const parsedAmount = Number(amount) || 0
  const estimateMpesaFee = (amt: number): number => {
    if (amt <= 0) return 0
    if (amt <= 100) return 0 // Free for transactions up to KSh 100
    if (amt <= 500) return 7
    if (amt <= 1000) return 13
    if (amt <= 1500) return 23
    if (amt <= 2500) return 34
    if (amt <= 3500) return 53
    if (amt <= 5000) return 71
    if (amt <= 7500) return 89
    if (amt <= 10000) return 102
    if (amt <= 15000) return 110
    if (amt <= 20000) return 112
    return 115 // Max STK cap tariff step
  }

  const mpesaFee = estimateMpesaFee(parsedAmount)
  const settlementTotal = parsedAmount

  async function topUp() {
    if (!amount.trim() || Number(amount) < 10) {
      setStatus({ type: 'error', msg: "Minimum institutional threshold is KSh 10.00." })
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
        throw new Error(data.error || "M-Pesa API remote node rejected connection authorization.")
      }

      setStatus({ type: 'success', msg: "Secure STK push dispatch successful. Input your M-Pesa PIN on your mobile device instantly." })
      setAmount("")
      setTimeout(() => {
        setStatus(null)
        onClose()
      }, 5000)
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "Gateway routing failed. Verify Safaricom network connectivity." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="w-[340px] rounded-2xl border border-slate-800/60 bg-slate-950 p-5 shadow-2xl shadow-slate-950/70 relative overflow-hidden">
        
        {/* Top security vector status bar accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-950/40 border border-emerald-900/30 text-emerald-400">
              <ShieldCheck size={12} strokeWidth={2.5} />
            </div>
            <h2 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
              Top Up Wallet
            </h2>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading} 
            className="text-slate-500 hover:text-slate-300 transition rounded-md p-1 hover:bg-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Integrated Real M-Pesa Identity Segment */}
        <MpesaGatewayBadge phone={phone} />

        {/* Amount Entry Input */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[9px] font-bold tracking-wider text-slate-500 uppercase">
              Funding Allocation
            </label>
            <span className="font-mono text-[8px] text-slate-500 tracking-tight">
              Safaricom Daraja API v2
            </span>
          </div>
          
          <div className="relative mt-2 flex items-center">
            <span className="absolute left-3.5 font-mono text-xs font-bold text-slate-500 select-none">
              KSh
            </span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => {
                setAmount(e.target.value)
                if (status) setStatus(null)
              }}
              placeholder="0.00" 
              disabled={loading}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/20 pl-12 pr-4 py-3 text-base font-bold text-slate-100 font-sans placeholder-slate-700 outline-hidden focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/10 transition-all shadow-inner"
              autoFocus
            />
          </div>
        </div>

        {/* Quick Inject Preset Smart Chips */}
        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              disabled={loading}
              onClick={() => {
                setAmount(preset.toString())
                if (status) setStatus(null)
              }}
              className={`rounded-lg py-1.5 text-[10px] font-mono font-bold border transition-all ${
                amount === preset.toString()
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900/30 border-slate-800/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              } disabled:opacity-40 cursor-pointer`}
            >
              +{preset.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Real-World Transaction Breakdown Statement Ledger */}
        <div className="mt-4 rounded-xl border border-slate-900/80 bg-slate-950/40 p-3 space-y-2 text-[10px] font-mono">
          <div className="flex items-center justify-between text-slate-500">
            <span>Principal Amount</span>
            <span className="text-slate-300">KSh {parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1">
              Estimated Tariff Fee 
              <Info size={10} className="text-slate-600" />
            </span>
            <span className="text-slate-400">
              {mpesaFee === 0 && parsedAmount > 0 ? "Free (Below 100)" : `~ KSh ${mpesaFee.toFixed(2)}`}
            </span>
          </div>
          <div className="h-[1px] bg-slate-900 my-1" />
          <div className="flex items-center justify-between font-sans text-[11px] font-semibold">
            <span className="text-slate-400">Total Settlement Balance</span>
            <span className="text-emerald-400 font-mono font-bold">KSh {settlementTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Intelligent Inline Messaging Pipeline */}
        {status && (
          <div className={`mt-3 flex items-start gap-2.5 text-[10px] leading-relaxed font-medium rounded-xl p-3 border backdrop-blur-xs transition-all ${
            status.type === 'error' 
              ? 'bg-red-950/10 border-red-900/20 text-red-400' 
              : 'bg-emerald-950/10 border-emerald-900/20 text-emerald-400'
          }`}>
            {status.type === 'error' ? (
              <AlertCircle size={14} className="shrink-0 text-red-500 mt-0.5" />
            ) : (
              <CheckCircle2 size={14} className="shrink-0 text-emerald-500 mt-0.5" />
            )}
            <span>{status.msg}</span>
          </div>
        )}

        {/* Execution Actions Button Suite */}
        <div className="mt-4 flex gap-2.5">
          <button 
            onClick={onClose} 
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-800 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            Abort
          </button>
          <button 
            onClick={topUp} 
            disabled={loading || !amount || parsedAmount < 10}
            className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 py-2.5 text-xs font-bold transition-all duration-200 disabled:opacity-30 shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin stroke-[2.5]" />
                <span>Awaiting Auth</span>
              </>
            ) : (
              <span>Push STK Prompt</span>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
