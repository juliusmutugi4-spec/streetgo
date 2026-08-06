import { ArrowUpRight, Coins, Shield } from "lucide-react"

interface Props {
  wallet: {
    balance?: number | string
    reax_balance?: number | string
  }
}

export default function WalletBalance({ wallet }: Props) {
  return (
    <div className="mt-4 space-y-2">
      {/* Primary Balance Layer */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition-all duration-300 hover:border-slate-700/60 hover:shadow-lg hover:shadow-slate-950/40">
        
        {/* Futuristic background ambient grid glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:14px_24px] opacity-[0.03]" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
                Available Liquidity
              </span>
              <div className="h-1 w-1 rounded-full bg-emerald-500" />
            </div>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-xs font-semibold text-slate-400">KSh</span>
              <span className="text-2xl font-bold tracking-tight text-slate-100 font-sans">
                {Number(wallet?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action indicator - implies interactive depth */}
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-500 transition-colors group-hover:border-slate-700 group-hover:text-slate-300">
            <ArrowUpRight size={14} />
          </div>
        </div>
      </div>

      {/* Secondary Dynamic Asset Layer (REAX) */}
      <div className="rounded-xl border border-slate-900/60 bg-gradient-to-r from-slate-950/80 to-slate-900/30 p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-950/30 border border-emerald-900/30 text-emerald-400">
              <Coins size={12} strokeWidth={2.5} />
            </div>
            <div>
              <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-none">
                Protocol Yield Asset
              </span>
              <span className="text-[10px] font-medium text-slate-300">
                REAX Balance
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs font-bold text-emerald-400">
              {Number(wallet?.reax_balance ?? 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
            <span className="block text-[8px] font-medium text-emerald-500/60 tracking-tight leading-none mt-0.5">
              • Auto-compounding
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
