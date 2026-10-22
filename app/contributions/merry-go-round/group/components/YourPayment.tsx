"use client"

import { useRouter } from "next/navigation"
import { CheckCircle2, Clock3, AlertCircle } from "lucide-react"

type Props = {
  myPaymentStatus: string
  receipt: string | null
  contributionAmount: number
  groupId: string
}

const STATUS_CONFIG: Record<string, { title: string; desc: string; icon: any; iconCls: string }> = {
  paid: {
    title: "Contribution Confirmed",
    desc: "Payment settled successfully.",
    iconCls: "text-emerald-400",
    icon: CheckCircle2,
  },
  processing: {
    title: "Payment Processing",
    desc: "Verifying your M-PESA transaction details.",
    iconCls: "text-amber-400",
    icon: Clock3,
  },
  due: {
    title: "Contribution Required",
    desc: "Required to settle the current group rotation pool.",
    iconCls: "text-slate-400",
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
  
  const state = STATUS_CONFIG[myPaymentStatus] || STATUS_CONFIG.due
  const StatusIcon = state.icon
  const isProcessing = myPaymentStatus === "processing"
  const isPaid = myPaymentStatus === "paid"

  return (
    <section className="mt-5 space-y-3">
      {/* Dynamic text layouts without card wrappers */}
      <div className="flex gap-2.5 items-start py-1">
        <StatusIcon size={16} className={`shrink-0 mt-0.5 ${state.iconCls}`} />
        
        <div className="space-y-0.5 min-w-0">
          <h3 className="text-xs font-bold text-white">{state.title}</h3>
          <p className="text-[11px] leading-relaxed text-slate-500">
            {isPaid && receipt ? `Receipt: ${receipt}` : state.desc}
          </p>
        </div>
      </div>

      {/* Clean button alignment */}
      {!isPaid && (
        <button
          type="button"
          onClick={() => router.push(`/contributions/merry-go-round/group/pay?groupId=${encodeURIComponent(groupId)}`)}
          disabled={isProcessing}
          className="w-full rounded-xl bg-emerald-400 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-600 disabled:border disabled:border-slate-800"
        >
          {isProcessing ? "Processing Confirmation..." : `Pay KES ${contributionAmount.toLocaleString()}`}
        </button>
      )}
    </section>
  )
}
