"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2, Clock3, AlertCircle } from "lucide-react"

type Props = {
  myPaymentStatus: string
  receipt: string | null
  contributionAmount: number
  groupId: string
}

// UI State Matrix configuration to keep code clean and short
const STATUS_CONFIG: Record<string, { title: string; desc: string; cls: string; icon: any }> = {
  paid: {
    title: "Contribution Confirmed",
    desc: "Payment settled successfully.",
    cls: "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.02]",
    icon: CheckCircle2,
  },
  processing: {
    title: "Payment Processing",
    desc: "Verifying your M-PESA transaction details.",
    cls: "text-blue-400 border-blue-500/20 bg-blue-500/[0.02]",
    icon: Clock3,
  },
  due: {
    title: "Contribution Required",
    desc: "Required to settle the current group rotation pool.",
    cls: "text-amber-400 border-amber-500/20 bg-amber-500/[0.02]",
    icon: AlertCircle,
  },
}

export default function YourPayment({
  myPaymentStatus,
  receipt,
  contributionAmount,
  groupId,
}: Props) {
  const router = useRouter()
  
  // Fallback to "due" state configuration matrix if string is missing
  const state = STATUS_CONFIG[myPaymentStatus] || STATUS_CONFIG.due
  const StatusIcon = state.icon
  const isProcessing = myPaymentStatus === "processing"
  const isPaid = myPaymentStatus === "paid"

  return (
    <section className={`mt-5 rounded-2xl border p-4 transition-all ${state.cls}`}>
      <div className="flex gap-3 items-start">
        <StatusIcon size={18} className="shrink-0 mt-0.5" />
        
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-xs font-bold text-white">{state.title}</h3>
          <p className="text-[11px] leading-relaxed text-slate-400">
            {isPaid && receipt ? `Receipt: ${receipt}` : state.desc}
          </p>
        </div>
      </div>

      {!isPaid && (
        <button
          type="button"
          onClick={() => router.push(`/contributions/merry-go-round/group/pay?groupId=${encodeURIComponent(groupId)}`)}
          disabled={isProcessing}
          className="mt-3.5 w-full rounded-xl bg-emerald-400 py-3 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:border disabled:border-slate-700/60"
        >
          {isProcessing ? "Processing Confirmation..." : `Pay KES ${contributionAmount.toLocaleString()}`}
        </button>
      )}
    </section>
  )
}
