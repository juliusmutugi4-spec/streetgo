"use client"

import { useState } from "react"
import usePlatformFees from "../hooks/usePlatformFees"

const labels: Record<string, string> = {
  fundraiser: "Fundraiser",
  merry_go_round: "Merry-Go-Round",
  wallet_deposit: "Wallet Deposit",
  wallet_withdrawal: "Wallet Withdrawal",
}

export default function PlatformFeeControl() {
  const { fees, loading, saving, error, updateFee } = usePlatformFees(true)
  const [editingFee, setEditingFee] = useState<string | null>(null)
  const [feeDraft, setFeeDraft] = useState("")
  const [saveError, setSaveError] = useState("")

  function startEditing(feeType: string, percentage: number) {
    setEditingFee(feeType)
    setFeeDraft(String(percentage))
    setSaveError("")
  }

  function cancelEditing() {
    setEditingFee(null)
    setFeeDraft("")
    setSaveError("")
  }

  async function handleSave(feeType: string) {
    const value = Number(feeDraft)
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      setSaveError("Fee must be between 0% and 100%.")
      return
    }

    try {
      setSaveError("")
      await updateFee(feeType, value)
      setEditingFee(null)
      setFeeDraft("")
    } catch (err: any) {
      setSaveError(err?.message || "Unable to update platform fee.")
    }
  }

  return (
    <div className="relative rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Left Side: Header & Metadata */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-sm font-medium text-emerald-400">%</span>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-200">Platform Fee Controls</h2>
            <p className="text-[10px] text-zinc-500 font-medium">StreetGO Commercial Configuration</p>
          </div>
        </div>

        {/* Right Side: Content Area */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-end py-1">
              <span className="text-[11px] font-medium text-zinc-500 animate-pulse">Loading rates...</span>
            </div>
          ) : error ? (
            <div className="flex justify-end py-1">
              <span className="text-[11px] font-medium text-red-400">Error loading metrics: {error}</span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3">
              {fees.map((fee) => {
                const isEditing = editingFee === fee.fee_type
                
                return (
                  <div 
                    key={fee.fee_type} 
                    className={`flex items-center gap-3 rounded-lg border px-3 py-1.5 transition-colors ${
                      isEditing 
                        ? "border-emerald-500/40 bg-zinc-900" 
                        : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                    }`}
                  >
                    {/* Fee Meta Info */}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-medium text-zinc-400">
                        {labels[fee.fee_type] || fee.fee_type}
                      </span>
                    </div>

                    {/* Conditional Action States */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <div className="relative w-20">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.001"
                            value={feeDraft}
                            onChange={(e) => setFeeDraft(e.target.value)}
                            disabled={saving}
                            autoFocus
                            className="w-full rounded bg-zinc-950 border border-zinc-700 px-1.5 py-0.5 pr-5 font-mono text-xs text-white outline-none focus:border-emerald-500"
                          />
                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSave(fee.fee_type)}
                          disabled={saving}
                          className="rounded bg-emerald-500 px-2 py-0.5 text-[11px] font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
                        >
                          {saving ? "..." : "Fix"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={saving}
                          className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-100">
                          {Number(fee.percentage).toFixed(2)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditing(fee.fee_type, Number(fee.percentage))}
                          className="text-[10px] font-semibold text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Global Error Banner to avoid shifting row sizes */}
      {saveError && (
        <div className="mt-2 text-right">
          <span className="text-[10px] font-medium text-red-400 bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded">
            {saveError}
          </span>
        </div>
      )}
    </div>
  )
}
