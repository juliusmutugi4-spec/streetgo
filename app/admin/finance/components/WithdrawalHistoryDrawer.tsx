"use client"

interface WithdrawalHistory {
  id: string
  withdrawal_reference?: string | null
  user_id: string
  wallet_id: string
  amount: number
  phone_number: string
  status: string // 'paid' | 'pending' | 'rejected' | 'failed'
  admin_note?: string | null
  rejection_reason?: string | null
  processed_by?: string | null
  created_at: string
  processed_at?: string | null
  username?: string | null
  mpesa_receipt?: string | null
  mpesa_message?: string | null
  mpesa_confirmed_at?: string | null
}

interface Props {
  withdrawal: WithdrawalHistory | null
  onClose: () => void
}

export default function WithdrawalHistoryDrawer({
  withdrawal,
  onClose,
}: Props) {
  if (!withdrawal) {
    return null
  }

  const formattedAmount = Number(
    withdrawal.amount || 0
  ).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const formatDate = (value?: string | null) => {
    if (!value) return "---"
    return new Date(value).toLocaleString("en-KE")
  }

  // Pure status checks for UI mapping
  const isPaid = withdrawal.status.toLowerCase() === "paid" || withdrawal.status.toLowerCase() === "success"
  const isPending = withdrawal.status.toLowerCase() === "pending"
  const isRejected = withdrawal.status.toLowerCase() === "rejected" || withdrawal.status.toLowerCase() === "failed"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
      
      {/* Modal Container */}
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-800 bg-[#0d0d11] shadow-2xl transition-all">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/30 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                M-Pesa B2C Transaction
              </h2>
            </div>
            <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
              ID: {withdrawal.id}
            </p>

<p className="mt-1 font-mono text-[10px] font-bold tracking-wider text-sky-400">
  Reference:{" "}
  {withdrawal.withdrawal_reference ||
    "REFERENCE NOT LOADED"}
</p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">

          {/* MAIN TRANSACTION OVERVIEW GRID */}
          <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Disbursement Amount
              </p>
              <p className="mt-1 font-mono text-2xl font-black text-white tracking-tight">
                <span className="text-xs font-normal text-emerald-500 mr-1">KSh</span>
                {formattedAmount}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Gateway Status
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wide border ${
                    isPaid
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : isPending
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {withdrawal.status}
                </span>
              </div>
            </div>
          </div>

          {/* AUDIT & USER INFO GRID */}
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-zinc-900/30 p-4 border border-zinc-800/60">
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Customer Phone</p>
              <p className="mt-1 font-mono text-sm font-bold text-white tracking-wide">
                {withdrawal.phone_number}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-500 uppercase">Account Holder</p>
              <p className="mt-1 text-sm font-semibold text-zinc-200 truncate">
                {withdrawal.username || "Unknown Account"}
              </p>
              <p className="font-mono text-[9px] text-zinc-500 truncate">{withdrawal.user_id}</p>
            </div>
          </div>

          {/* SAFARICOM M-PESA DARAJA RECEIPT - ONLY FOR PAID STATUS */}
          {isPaid && (
            <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-zinc-900/50 p-5">
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  M-Pesa Callback Receipt
                </p>
                <span className="font-mono text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {withdrawal.mpesa_receipt || "PENDING_REF"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-y-3 gap-x-2">
                <div className="col-span-2">
                  <p className="text-[9px] uppercase font-medium text-zinc-500">M-Pesa API Message</p>
                  <p className="mt-1 rounded bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed text-zinc-300 border border-zinc-800/80">
                    {withdrawal.mpesa_message || "No callback payload parsed."}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] uppercase font-medium text-zinc-500">Network Confirmed At</p>
                  <p className="mt-0.5 font-mono text-xs text-zinc-300">
                    {formatDate(withdrawal.mpesa_confirmed_at)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REJECTION / FAILURE SYSTEM LOG */}
          {isRejected && (
            <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                Gateway Failure Log
              </p>
              <div className="mt-2 rounded bg-black/40 p-3 border border-zinc-800/50">
                <p className="font-mono text-xs text-zinc-200 leading-relaxed">
                  {withdrawal.rejection_reason || "Transaction failed during B2C execution API call."}
                </p>
              </div>
            </div>
          )}

          {/* TIMELINE & OPERATOR LOG */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              System Audit Trail
            </p>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <p className="text-[9px] uppercase text-zinc-500">Created / Requested</p>
                <p className="mt-0.5 font-mono text-xs text-zinc-300">
                  {formatDate(withdrawal.created_at)}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase text-zinc-500">Finalized / Settled</p>
                <p className="mt-0.5 font-mono text-xs text-zinc-300">
                  {formatDate(withdrawal.processed_at)}
                </p>
              </div>
            </div>

            <div className="border-t border-zinc-800/60 pt-2.5">
              <p className="text-[9px] uppercase text-zinc-500">System Operator Signature</p>
              <p className="mt-0.5 font-mono text-[10px] text-zinc-400 truncate">
                {withdrawal.processed_by || "AUTOMATED_SYSTEM_TRIGGER"}
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="border-t border-zinc-800 bg-zinc-900/20 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-700/80 py-2 text-xs font-bold text-zinc-200 transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>
    </div>
  )
}
