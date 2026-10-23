"use client"

import { useState } from "react"
import {
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  TrendingUp,
  Ban,
  Calendar,
  Receipt,
} from "lucide-react"

type Props = {
  amountPaid: number
  requiredAmount: number
  paymentStatus?: string | null
  mpesaReceipt?: string | null
  paidAt?: string | null
}

type PaymentDisplay = {
  label: string
  textCls: string
  icon: typeof CheckCircle2
}

const PAYMENT_STATES: Record<string, PaymentDisplay> = {
  paid: {
    label: "Paid",
    textCls: "text-emerald-600",
    icon: CheckCircle2,
  },

  overpaid: {
    label: "Extra payment",
    textCls: "text-sky-600",
    icon: TrendingUp,
  },

  partial: {
    label: "Partial",
    textCls: "text-purple-600",
    icon: AlertCircle,
  },

  processing: {
    label: "Processing",
    textCls: "text-blue-600",
    icon: Clock3,
  },

  pending: {
    label: "Pending",
    textCls: "text-amber-600",
    icon: Clock3,
  },

  failed: {
    label: "Failed",
    textCls: "text-red-600",
    icon: XCircle,
  },

  cancelled: {
    label: "Cancelled",
    textCls: "text-slate-500",
    icon: Ban,
  },

  due: {
    label: "Payment due",
    textCls: "text-orange-600",
    icon: AlertCircle,
  },
}

function getPaymentState(
  amountPaid: number,
  requiredAmount: number,
  paymentStatus?: string | null
): PaymentDisplay {
  const status = String(paymentStatus || "")
    .trim()
    .toLowerCase()

  if (status === "failed") {
    return PAYMENT_STATES.failed
  }

  if (status === "cancelled") {
    return PAYMENT_STATES.cancelled
  }

  if (status === "processing") {
    return PAYMENT_STATES.processing
  }

  if (status === "pending" && amountPaid <= 0) {
    return PAYMENT_STATES.pending
  }

  if (amountPaid <= 0) {
    return PAYMENT_STATES.due
  }

  if (amountPaid > requiredAmount) {
    return PAYMENT_STATES.overpaid
  }

  if (amountPaid >= requiredAmount) {
    return PAYMENT_STATES.paid
  }

  return PAYMENT_STATES.partial
}

export default function PaymentStatus({
  amountPaid,
  requiredAmount,
  paymentStatus,
  mpesaReceipt,
  paidAt,
}: Props) {
  const [showDetails, setShowDetails] = useState(false)

  const remainingAmount = Math.max(
    requiredAmount - amountPaid,
    0
  )

  const extraAmount = Math.max(
    amountPaid - requiredAmount,
    0
  )

  const payment = getPaymentState(
    amountPaid,
    requiredAmount,
    paymentStatus
  )

  const Icon = payment.icon

  const isPaid =
    amountPaid >= requiredAmount &&
    requiredAmount > 0

  const hasDetails = Boolean(
    mpesaReceipt || paidAt
  )

  const formattedAmount = amountPaid.toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )

  const formattedRemaining =
    remainingAmount.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })

  const formattedExtra =
    extraAmount.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })

  const formattedDate = paidAt
    ? new Date(paidAt).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null

  function toggleDetails() {
    if (!hasDetails) return

    setShowDetails((value) => !value)
  }

  return (
    <div className="min-w-0 flex-1">
      {/* Main payment row */}
      <div className="flex items-center justify-end gap-3">
        {/* Center payment information */}
        <div className="min-w-0 text-center">
          {/* Amount */}
          <p
            className={`text-base font-black tracking-tight ${
              payment.textCls
            }`}
          >
            +KES {formattedAmount}
          </p>

          {/* Fully paid */}
          {isPaid && extraAmount === 0 && (
            <button
              type="button"
              disabled={!hasDetails}
              onClick={toggleDetails}
              className="mt-0.5 text-[10px] font-bold text-emerald-600"
            >
              Paid
            </button>
          )}

          {/* Overpaid */}
          {isPaid && extraAmount > 0 && (
            <button
              type="button"
              disabled={!hasDetails}
              onClick={toggleDetails}
              className="mt-0.5 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-sky-600"
            >
              <TrendingUp size={11} />

              <span>
                +KES {formattedExtra} extra
              </span>
            </button>
          )}

          {/* Partial */}
          {amountPaid > 0 &&
            amountPaid < requiredAmount && (
              <>
                <p
                  className={`mt-0.5 text-[9px] font-semibold ${
                    amountPaid < requiredAmount / 2
                      ? "text-red-500"
                      : "text-purple-600"
                  }`}
                >
                  KES {formattedRemaining} remaining
                </p>

                <div
                  className={`mt-0.5 flex items-center justify-center gap-1 ${
                    amountPaid < requiredAmount / 2
                      ? "text-red-500"
                      : "text-purple-600"
                  }`}
                >
                  <AlertCircle size={10} />

                  <span className="text-[9px] font-bold">
                    {amountPaid <
                    requiredAmount / 2
                      ? "Low"
                      : "Partial"}
                  </span>
                </div>
              </>
            )}

          {/* No payment */}
          {amountPaid <= 0 &&
            !["processing", "pending", "failed", "cancelled"].includes(
              String(paymentStatus || "").toLowerCase()
            ) && (
              <div className="mt-0.5 flex items-center justify-center gap-1 text-orange-600">
                <AlertCircle size={10} />

                <span className="text-[9px] font-bold">
                  Payment due
                </span>
              </div>
            )}

          {/* Processing / pending / failed / cancelled */}
          {amountPaid <= 0 &&
            ["processing", "pending", "failed", "cancelled"].includes(
              String(paymentStatus || "").toLowerCase()
            ) && (
              <button
                type="button"
                disabled={!hasDetails}
                onClick={toggleDetails}
                className={`mt-0.5 inline-flex items-center justify-center gap-1 text-[9px] font-bold ${payment.textCls}`}
              >
                <Icon size={10} />

                <span>{payment.label}</span>
              </button>
            )}
        </div>

        {/* BIG PAID TICK — FAR RIGHT */}
        {isPaid ? (
          <button
            type="button"
            disabled={!hasDetails}
            onClick={toggleDetails}
            aria-label="Payment paid"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-emerald-600 transition-transform active:scale-90"
          >
            <CheckCircle2
              size={30}
              strokeWidth={2.7}
            />
          </button>
        ) : (
          /*
           * Keep the right side aligned even when
           * the member has not paid.
           */
          <div className="h-10 w-10 shrink-0" />
        )}
      </div>

      {/* Payment details */}
      {showDetails && hasDetails && (
        <div className="mt-2 ml-auto w-full max-w-[230px] rounded-lg bg-slate-50 p-3 text-left">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            Payment details
          </p>

          {/* M-PESA receipt */}
          {mpesaReceipt && (
            <div className="mt-2 flex items-center gap-2">
              <Receipt
                size={13}
                className="shrink-0 text-emerald-600"
              />

              <div className="min-w-0">
                <p className="text-[8px] text-slate-400">
                  M-PESA receipt
                </p>

                <p className="truncate font-mono text-[10px] font-bold text-slate-700">
                  {mpesaReceipt}
                </p>
              </div>
            </div>
          )}

          {/* Payment time */}
          {formattedDate && (
            <div className="mt-2 flex items-center gap-2">
              <Calendar
                size={13}
                className="shrink-0 text-slate-400"
              />

              <div>
                <p className="text-[8px] text-slate-400">
                  Payment time
                </p>

                <p className="text-[10px] font-medium text-slate-700">
                  {formattedDate}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}