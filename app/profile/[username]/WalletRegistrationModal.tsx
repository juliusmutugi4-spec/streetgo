'use client'

import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { Wallet, ShieldCheck, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
  userId?: string
  onSuccess: () => void
}

export default function WalletRegistrationModal({ open, onClose, userId, onSuccess }: Props) {
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null)

  if (!open) return null

  // Safely auto-format Kenyan phone inputs
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '') // Keep digits only
    if (value.startsWith('254') && value.length > 3) {
      value = '0' + value.slice(3)
    }
    if (value.length <= 10) {
      setPhone(value)
    }
  }

  async function registerWallet() {
    setFeedback(null)
    
    // Client validations
    if (!fullName.trim() || !phone.trim()) {
      setFeedback({ type: 'error', message: 'Please provide both your name and phone number.' })
      return
    }
    
    if (!userId) {
      setFeedback({ type: 'error', message: 'Authentication required. Please sign in.' })
      return
    }

    if (phone.length < 10 || (!phone.startsWith('07') && !phone.startsWith('01'))) {
      setFeedback({ type: 'error', message: 'Please enter a valid Safaricom number (e.g., 07XXXXXXXX).' })
      return
    }

    setIsLoading(true)

    try {

const {
  data: { user },
} = await supabase.auth.getUser()

alert("Logged in user: " + (user?.id ?? "NONE"))
alert("userId prop: " + userId)


      // Check existing ledger
const { data: existingWallet, error: selectError } = await supabase
  .from("wallets")
  .select("id")
  .eq("user_id", userId)
  .maybeSingle()

alert("SELECT ERROR: " + JSON.stringify(selectError))

      if (existingWallet) {
        setFeedback({ type: 'error', message: 'A StreetGO Wallet is already linked to this account.' })
        setIsLoading(false)
        return
      }

      // Secure Insertion
const { error } = await supabase.from("wallets").insert({
  user_id: userId,
  full_name: fullName.trim(),
  phone: phone.trim(),
  balance: 0,
  is_verified: false,
})

alert("INSERT ERROR: " + JSON.stringify(error))
alert("INSERT ERROR: " + JSON.stringify(error))

      if (error) throw error

      setFeedback({ type: 'success', message: 'Your StreetGO Wallet has been activated successfully!' })
      setFullName("")
      setPhone("")
      
      // Deliberate crisp success delay before closing
      setTimeout(() => {
        onSuccess()
        onClose()
        setFeedback(null)
      }, 1800)

    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'An unexpected error occurred. Try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 selection:bg-emerald-500/20">
      <div className="w-full max-w-sm rounded-xl bg-zinc-950 border border-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* TOP ACCENT LINE */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500" />

        <div className="p-5">
          {/* HEADER SECTION */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-emerald-400">
              <Wallet size={16} />
            </div>
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors disabled:opacity-30"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3">
            <h2 className="text-base font-bold text-white tracking-tight">Activate StreetGO Wallet</h2>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Link your Safaricom line securely to enable instant M-Pesa automated deposits and driver payouts.
            </p>
          </div>

          {/* DYNAMIC FEEDBACK BANNER */}
          {feedback && (
            <div className={`mt-4 flex items-start gap-2 border rounded-lg p-2.5 text-[11px] animate-in slide-in-from-top-2 duration-200 ${
              feedback.type === 'error' 
                ? 'bg-red-500/5 border-red-500/20 text-red-400' 
                : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
            }`}>
              {feedback.type === 'error' ? <AlertCircle size={13} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={13} className="shrink-0 mt-0.5" />}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* INPUT FORM ELEMENTS */}
          <div className="mt-4 space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Full Name (As shown on ID)
              </label>
              <input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                disabled={isLoading || feedback?.type === 'success'}
                className="w-full rounded-md bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 px-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors disabled:opacity-50" 
                placeholder="e.g. John Kamau" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Safaricom Number
              </label>
              <div className="relative">
                <input 
                  type="tel"
                  value={phone} 
                  onChange={handlePhoneChange} 
                  disabled={isLoading || feedback?.type === 'success'}
                  className="w-full rounded-md bg-zinc-900/60 border border-zinc-800 focus:border-zinc-700 px-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none transition-colors disabled:opacity-50 tracking-wide font-mono" 
                  placeholder="07XXXXXXXX" 
                />
              </div>
            </div>
          </div>

          {/* TRUST BADGE FOOTER */}
          <div className="mt-4 flex items-center gap-1.5 justify-center text-[10px] text-zinc-500 bg-zinc-900/30 border border-zinc-900 py-1.5 rounded-md">
            <ShieldCheck size={11} className="text-sky-500" />
            <span>Secured Escrow Account Integration</span>
          </div>

          {/* ACTION BUTTON SYSTEM */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-zinc-900 pt-3">
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button 
              onClick={registerWallet} 
              disabled={isLoading || feedback?.type === 'success'}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold bg-emerald-500 text-black hover:bg-emerald-400 disabled:bg-emerald-950 disabled:text-emerald-600 transition-all shadow-md min-w-[110px]"
            >
              {isLoading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Activate Wallet</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
