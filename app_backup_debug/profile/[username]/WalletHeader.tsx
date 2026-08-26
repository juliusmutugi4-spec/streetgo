import { Wallet, Lock } from "lucide-react"

export default function WalletHeader() {
  return (
    <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-slate-500">

      {/* Left Side: Wallet Label */}
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800/50 border border-slate-700/30 text-slate-400">
          <Wallet size={11} strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-slate-200 normal-case tracking-normal text-xs">
          Wallet Balance
        </span>
      </div>

      {/* Right Side: Secure Node/Wallet ID */}
      <div className="flex items-center gap-1.5 font-mono text-[9px] font-semibold text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 tracking-wider shadow-inner">
        <Lock size={9} strokeWidth={2.5} className="text-emerald-500 animate-pulse" />
        <span>SG••4821</span>
      </div>

    </div>
  )
}
