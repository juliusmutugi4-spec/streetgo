'use client'

import { useState } from "react"
import { supabase } from "../../lib/supabase"

interface Props {
  wallet: { user_id: string; phone?: string }
  refreshWallet: () => Promise<void>
  onClose: () => void
}

export default function WalletSettingsModal({ wallet, refreshWallet, onClose }: Props) {
  const [editingPhone, setEditingPhone] = useState(false)
  const [phone, setPhone] = useState(wallet?.phone ?? "")
  const [saving, setSaving] = useState(false)

  async function savePhone() {
    if (!phone.trim()) return
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from("wallets")
        .update({ phone: phone.trim() })
        .eq("user_id", wallet.user_id)

      if (error) throw error

      await refreshWallet()
      onClose()
    } catch (error: any) {
      alert(error.message || "An error occurred.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-72 rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <h2 className="text-xs font-medium text-zinc-200">Wallet Settings</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xs">✕</button>
        </div>

        <div className="mt-3">
          <label className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">M-Pesa Number</label>
          <div className="mt-1">
            {editingPhone ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-xs text-zinc-200 outline-hidden focus:border-cyan-600 transition"
                autoFocus
              />
            ) : (
              <p className="text-xs font-medium text-zinc-300 bg-zinc-900/30 border border-zinc-900 px-2.5 py-1.5 rounded-md">
                {wallet?.phone || "Not set"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {editingPhone ? (
            <>
              <button
                onClick={() => setEditingPhone(false)}
                disabled={saving}
                className="flex-1 rounded-md border border-zinc-800 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-900 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={savePhone}
                disabled={saving}
                className="flex-1 rounded-md bg-cyan-600 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingPhone(true)}
              className="w-full rounded-md bg-zinc-900 border border-zinc-800 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition"
            >
              Change Number
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
