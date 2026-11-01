"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { supabase } from "@/app/lib/supabase"
type Props = {
  myPaymentStatus: string
  receipt: string | null
  contributionAmount: number
  amountToPay: number
  groupId: string
  roundId?: string
  isCurrentRecipient: boolean
  payoutStuck: boolean
}

const STATUS_CONFIG: Record<
  string,
  {
    title: string
    desc: string
    icon: any
    iconCls: string
  }
> = {
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
  amountToPay,
  groupId,
  roundId,
  isCurrentRecipient,
  payoutStuck,
}: Props) {
  const router = useRouter()

  const [requestingRetry, setRequestingRetry] = useState(false)
  const [retryMessage, setRetryMessage] = useState<string | null>(null)

  const state =
    STATUS_CONFIG[myPaymentStatus] || STATUS_CONFIG.due

  const StatusIcon = state.icon

  const isProcessing =
    myPaymentStatus === "processing"

  const isPaid =
    myPaymentStatus === "paid"

  const requestPayoutRetry = async () => {
    if (!roundId || requestingRetry) return

    setRequestingRetry(true)
    setRetryMessage(null)

    try {
      const { error } = await supabase.rpc(
        "request_merry_go_round_payout_retry",
        {
          p_round_id: roundId,
        }
      )

      if (error) {
        console.error(
          "PAYOUT RETRY REQUEST FAILED:",
          error
        )

        setRetryMessage(
          error.message || "Unable to request payout retry."
        )

        return
      }

      setRetryMessage(
        "Payout retry requested. Please wait for M-PESA processing."
      )

      router.refresh()
    } finally {
      setRequestingRetry(false)
    }
  }

  return (
    <section className="mt-5 space-y-3">

      {/* STATUS */}
      <div className="flex items-start gap-2.5 py-1">

        <StatusIcon
          size={16}
          className={`mt-0.5 shrink-0 ${state.iconCls}`}
        />

        <div className="min-w-0 space-y-0.5">

          <h3 className="text-xs font-bold text-white">
            {state.title}
          </h3>

          <p className="text-[11px] leading-relaxed text-slate-500">
            {isPaid && receipt
              ? `Receipt: ${receipt}`
              : state.desc}
          </p>

        </div>
      </div>

      {/* NORMAL CONTRIBUTION BUTTON */}
      {!isPaid && (
        <button
          type="button"
          onClick={() =>
            router.push(
              `/contributions/merry-go-round/group/pay?groupId=${encodeURIComponent(
                groupId
              )}`
            )
          }
          disabled={
            isProcessing ||
            amountToPay <= 0
          }
          className="w-full rounded-xl bg-emerald-400 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-600 disabled:border disabled:border-slate-800"
        >
          {isProcessing
            ? "Processing Confirmation..."
            : amountToPay > 0
              ? `Pay KES ${amountToPay.toLocaleString()}`
              : "Contribution Covered"}
        </button>
      )}

      {/* RECIPIENT PAYOUT RECOVERY */}
      {isCurrentRecipient &&
        payoutStuck &&
        !isPaid &&
        roundId && (
          <div className="space-y-2 pt-1">

            <button
              type="button"
              onClick={requestPayoutRetry}
              disabled={requestingRetry}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-300 transition hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  requestingRetry
                    ? "animate-spin"
                    : ""
                }
              />

              {requestingRetry
                ? "Requesting Retry..."
                : "Request Payout Retry"}
            </button>

            {retryMessage && (
              <p className="text-center text-[10px] leading-relaxed text-slate-500">
                {retryMessage}
              </p>
            )}

          </div>
        )}

    </section>
  )
}