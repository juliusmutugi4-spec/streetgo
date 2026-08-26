import { ShieldCheck } from "lucide-react"

export default function WalletSecurity() {
  return (
    <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-950/20 bg-emerald-950/5 px-2.5 py-1 text-[9px] font-medium tracking-wide text-slate-400 backdrop-blur-xs">
      <div className="relative flex h-2 w-2 items-center justify-center">
        {/* Radar ping effect to signal live, active infrastructure protection */}
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/30 opacity-75"></span>
        <ShieldCheck
          size={10}
          strokeWidth={2.5}
          className="relative text-emerald-500"
        />
      </div>
      <span className="font-mono uppercase tracking-wider text-[8px] text-emerald-500/80">
        Live
      </span>
      <span className="text-slate-400">
        PCI-DSS Compliant Encryption Node
      </span>
    </div>
  )
}
