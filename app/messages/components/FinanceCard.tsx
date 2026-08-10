'use client'

type FinanceCardProps = {
  data: {
    title: string
    reference: string
    amount: number
    phone?: string
    status: string
    reason?: string
    created_at: string
  }
}

export default function FinanceCard({ data }: FinanceCardProps) {
  const status = data.status.toUpperCase()
  
  // High-contrast, executive color mapping for strict enterprise audit compliance
  const statusStyle =
    status === "APPROVED" || status === "COMPLETED" || status === "SUCCESS"
      ? { text: "text-emerald-400 bg-emerald-500/[0.06] border-emerald-500/20" }
      : status === "REJECTED" || status === "FAILED"
      ? { text: "text-red-400 bg-red-500/[0.06] border-red-500/20" }
      : { text: "text-amber-400 bg-amber-500/[0.06] border-amber-500/20" }

  return (
    <div className="w-full max-w-[320px] rounded-2xl bg-[#0c131a] border border-white/[0.06] shadow-2xl select-none print:border-zinc-300 print:bg-white print:shadow-none">
      
      {/* Header Block: Verified Corporate Counterparty */}
      <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-emerald-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-zinc-100 truncate tracking-tight">
              {data.title}
            </h3>
            <p className="text-[10.5px] text-zinc-500 font-medium truncate mt-0.5">
              Verified Settlement Node
            </p>
          </div>
        </div>

        {/* Dynamic Contextual Status Capsule */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusStyle.text}`}>
          {status}
        </span>
      </div>

      {/* Ledger Accounting Metadata Display */}
      <div className="px-4 pt-5 pb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          {data.reason || "Sovereign Settlement Ledger"}
        </p>
        <h1 className="text-2xl font-bold text-zinc-100 mt-1 tracking-tight">
          KSh {data.amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
      </div>

      {/* Encrypted Audit Trail Parameters Block */}
      <div className="mx-4 mb-4 rounded-xl bg-white/[0.01] border border-white/[0.04] divide-y divide-white/[0.04] overflow-hidden">
        <div className="flex items-center justify-between p-3 gap-4">
          <span className="text-[11px] font-medium text-zinc-500">Reference ID</span>
          <span className="text-[11.5px] font-mono font-semibold text-zinc-300 truncate tracking-tight selection:bg-emerald-500/30">
            {data.reference}
          </span>
        </div>
        
        {data.phone && (
          <div className="flex items-center justify-between p-3 gap-4">
            <span className="text-[11px] font-medium text-zinc-500">Destination Gateway</span>
            <span className="text-[11.5px] font-mono font-semibold text-zinc-300 tracking-tight">
              {data.phone}
            </span>
          </div>
        )}
      </div>

      {/* Transaction Immutable Lifecycle Timestamp */}
      <div className="px-4 py-2.5 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-medium text-zinc-500">
        <span>Immutable Ledger Record</span>
        <span>
          {new Date(data.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          })} UTC
        </span>
      </div>
    </div>
  )
}
