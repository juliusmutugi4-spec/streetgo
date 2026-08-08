import { ArrowUpRight, Coins } from "lucide-react"

interface Props {
  wallet: {
    balance?: number | string
    reax_balance?: number | string
  }
}

export default function WalletBalance({ wallet }: Props) {
  return (
    <div className="w-full max-w-[280px] space-y-1.5 font-sans antialiased">
      {/* Primary Liquidity Card */}
      <div className="group relative overflow-hidden rounded-lg border border-[#262626] bg-[#0d0d0d] p-3 transition-all duration-200 hover:border-[#3a3a3a]">
        {/* Subtle Micro-Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:10px_10px] opacity-40" />
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-[#737373]">
                Available money
              </span>
              <span className="h-1 w-1 rounded-full bg-[#10b981] animate-pulse" />
            </div>

            <div className="flex items-baseline gap-0.5">
              <span className="font-mono text-[10px] font-semibold text-[#a3a3a3]">KSh</span>
              <span className="text-xl font-bold tracking-tight text-[#f5f5f7]">
                {Number(wallet?.balance ?? 0).toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
            </div>
          </div>

          {/* Micro Action Button */}
          <button className="flex h-5 w-5 items-center justify-center rounded-md border border-[#262626] bg-[#171717] text-[#737373] transition-colors group-hover:border-[#404040] group-hover:text-[#f5f5f7]">
            <ArrowUpRight size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

{/* Secondary Protocol Asset Layer */}
<div className="w-full max-w-sm rounded-xl border border-[#1f1f1f] bg-gradient-to-r from-[#0a0a0a] to-[#121212] p-3 shadow-sm transition-all duration-200 hover:border-[#2a2a2a]">
  <div className="flex items-center justify-between gap-4">
    {/* Left Identity Segment */}
    <div className="flex items-center gap-2.5">
      {/* Precision Icon Base */}
      <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-[#065f46]/25 bg-[#064e3b]/10 text-[#34d399]">
        <Coins size={12} strokeWidth={2.2} />
      </div>
      
      <div className="space-y-0.5">
        <span className="block font-mono text-[8px] font-bold uppercase tracking-widest text-[#525252] leading-none">
          earnigs 
        </span>
        <span className="block text-[11px] font-medium tracking-tight text-[#d4d4d4] leading-none">
          REAX Balance
        </span>
      </div>
    </div>

    {/* Right Metric Segment */}
    <div className="text-right space-y-0.5">
      <span className="block font-mono text-[13px] font-bold tracking-tight text-[#34d399] leading-none">
        {Number(wallet?.reax_balance ?? 0).toLocaleString(undefined, { 
          minimumFractionDigits: 2,
          maximumFractionDigits: 4 
        })}
      </span>
      <span className="block font-sans text-[8px] font-medium tracking-normal text-[#10b981]/50 leading-none">
        Auto-compounding
      </span>
    </div>
  </div>
</div>

    </div>
  )
}
