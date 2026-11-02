"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { getSupabaseBrowser } from "@/app/lib/supabase-browser"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileWarning,
  Loader2,
  Search,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  User,
  WalletCards,
  XCircle,
} from "lucide-react"

const supabase = getSupabaseBrowser()

/* =========================================================
   TYPES
========================================================= */

type RoundRow = {
  id: string
  round_number: number
}

type TransactionRow = {
  id: string

  member_id: string | null
  member_code: string | null
  member_name?: string | null

  amount: number
  applied_amount: number
  credit_amount: number

  gross_amount: number | null
  fee_percentage: number | null
  fee_amount: number | null

  status: string
  payment_source: string | null
  payment_code: string | null
  phone_number: string | null

  checkout_request_id: string | null
  merchant_request_id: string | null
  mpesa_receipt: string | null

  failure_reason: string | null

  paid_at: string | null
  created_at: string
  updated_at: string
}

type MemberLedgerRow = {
  member_id: string
  member_code: string
  member_name: string
  phone_number: string | null

  required_amount: number

  mpesa_amount: number
  credit_amount: number
  applied_amount: number
  outstanding_amount: number

  status: "paid" | "partial" | "not_paid"

  reason: string

  transactions: TransactionRow[]
}

type PayoutRow = {
  id: string
  recipient_member_id: string | null

  amount: number
  status: string

  phone_number: string | null

  originator_conversation_id: string | null
  conversation_id: string | null

  mpesa_transaction_id: string | null
  mpesa_receipt: string | null

  transaction_amount: number | null

  result_code: number | null
  result_description: string | null

  failure_reason: string | null

  requested_at: string | null
  paid_at: string | null

  created_at: string
  updated_at: string
}

type RoundHistory = {
  round: {
    id: string
    group_id: string
    round_number: number
    status: string
    recipient_member_id: string | null

    target_amount: number
    collected_amount: number

    created_at: string
    completed_at: string | null
    updated_at: string

    recipient?: {
      id: string
      member_code: string
      display_name: string
      phone_number: string | null
    } | null
  }

  members: MemberLedgerRow[]
  contributions: TransactionRow[]
  payouts: PayoutRow[]
}

type Reconciliation = {
  target: number
  storedCollected: number

  mpesaFunding: number
  creditFunding: number
  verifiedFunding: number

  outstanding: number

  payoutAmount: number
  paidOut: number

  payoutStatus: string | null
  payoutDate: string | null
  payoutMpesaTransaction: string | null

  fundingDifference: number
  fundingGap: number

  payoutDifference: number
  payoutRisk: number

  duplicatePayouts: number

  severity: "healthy" | "warning" | "high" | "critical"

  title: string
  message: string
}


function formatDateTime(
  value: string | null | undefined
): string {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return (
    date.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Nairobi",
    }) +
    " " +
    date.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Africa/Nairobi",
    }) +
    " EAT"
  )
}


/* =========================================================
   HELPERS
========================================================= */

function num(value: unknown): number {
  const n = Number(value)

  return Number.isFinite(n) ? n : 0
}

function money(value: number | null | undefined): string {
  return `KES ${num(value).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(
  value: string | null | undefined
): string {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return date.toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function statusIsPaid(status: string | null | undefined) {
  return String(status || "").toLowerCase() === "paid"
}

/* =========================================================
   RECONCILIATION
========================================================= */

function calculateReconciliation(
  history: RoundHistory
): Reconciliation {
  const target = num(history.round.target_amount)

  const storedCollected = num(
    history.round.collected_amount
  )

  /*
   * These values come from the member ledger produced by
   * the round-history RPC.
   *
   * We deliberately do NOT reconstruct credit/M-Pesa
   * balances from raw transactions here.
   *
   * The database ledger is the source of truth for the
   * member-level applied funding.
   */

  const mpesaFunding = history.members.reduce(
    (sum, member) =>
      sum + num(member.mpesa_amount),
    0
  )

  const creditFunding = history.members.reduce(
    (sum, member) =>
      sum + num(member.credit_amount),
    0
  )

  const verifiedFunding = history.members.reduce(
    (sum, member) =>
      sum + num(member.applied_amount),
    0
  )

  const outstanding = history.members.reduce(
    (sum, member) =>
      sum + num(member.outstanding_amount),
    0
  )
  const payoutAmount = history.payouts.reduce(
    (sum, payout) =>
      sum + num(payout.amount),
    0
  )

  const paidPayouts = history.payouts.filter(
    payout => statusIsPaid(payout.status)
  )

  const paidOut = paidPayouts.reduce(
    (sum, payout) =>
      sum + num(payout.amount),
    0
  )

  const duplicatePayouts = paidPayouts.length

  const primaryPaidPayout =
    paidPayouts[0] ?? null

  const payoutStatus =
    primaryPaidPayout?.status ?? null

  const payoutDate =
    primaryPaidPayout?.paid_at ??
    primaryPaidPayout?.requested_at ??
    primaryPaidPayout?.created_at ??
    null

  const payoutMpesaTransaction =
    primaryPaidPayout?.mpesa_transaction_id ?? null

  const payoutEvidence = {
    payoutStatus,
    payoutDate,
    payoutMpesaTransaction,
  }


  /*
   * Signed difference:
   *
   * positive  = verified funding is above target
   * negative  = verified funding is below target
   */
  const fundingDifference =
    verifiedFunding - target

  /*
   * Positive funding gap means money is still missing.
   */
  const fundingGap = Math.max(
    target - verifiedFunding,
    0
  )

  /*
   * Signed payout difference:
   *
   * positive = payout exceeded verified funding
   * zero     = fully supported
   * negative = funding exists but has not been paid out
   */
  const payoutDifference =
    paidOut - verifiedFunding

  /*
   * Never display a negative "Payout Risk".
   */
  const payoutRisk = Math.max(
    payoutDifference,
    0
  )

  /* -------------------------------------------------------
     1. UNSUPPORTED PAYOUT
  ------------------------------------------------------- */

  if (payoutRisk > 0) {
return {
  target,
  storedCollected,

  ...payoutEvidence,

      mpesaFunding,
      creditFunding,
      verifiedFunding,

      outstanding,

      payoutAmount,
      paidOut,

      fundingDifference,
      fundingGap,

      payoutDifference,
      payoutRisk,

      duplicatePayouts,
      ...payoutEvidence,
      severity: "critical",

      title: "CRITICAL PAYOUT RISK",

      message:
        `${money(paidOut)} has been paid out, but only ` +
        `${money(verifiedFunding)} is supported by verified ` +
        `member funding. Unsupported payout: ` +
        `${money(payoutRisk)}.`,
    }
  }

  /* -------------------------------------------------------
     2. DUPLICATE PAID PAYOUTS
  ------------------------------------------------------- */

  if (duplicatePayouts > 1) {
    return {
      target,
      storedCollected,

      mpesaFunding,
      creditFunding,
      verifiedFunding,

      outstanding,

      payoutAmount,
      paidOut,

      fundingDifference,
      fundingGap,

      payoutDifference,
      payoutRisk,

      duplicatePayouts,
      ...payoutEvidence,
      severity: "critical",

      title: "DUPLICATE PAYOUT RISK",

      message:
        `This round has ${duplicatePayouts} paid ` +
        `disbursements. Automatic additional payout ` +
        `must remain blocked.`,
    }
  }

  /* -------------------------------------------------------
     3. PAYOUT EXISTS BUT ROUND IS NOT FULLY FUNDED
  ------------------------------------------------------- */

  if (
    paidOut > 0 &&
    verifiedFunding < target
  ) {
    return {
      target,
      storedCollected,

      mpesaFunding,
      creditFunding,
      verifiedFunding,

      outstanding,

      payoutAmount,
      paidOut,

      fundingDifference,
      fundingGap,

      payoutDifference,
      payoutRisk,

      duplicatePayouts,
      ...payoutEvidence,
      severity: "critical",

      title: "PAYOUT NOT FULLY SUPPORTED",

      message:
        `The round has already paid ${money(paidOut)}, ` +
        `but verified member funding is only ` +
        `${money(verifiedFunding)}. ` +
        `${money(fundingGap)} remains unsupported.`,
    }
  }

  /* -------------------------------------------------------
     4. STORED VS VERIFIED MISMATCH
  ------------------------------------------------------- */

  if (
    Math.abs(
      storedCollected - verifiedFunding
    ) > 0.001
  ) {
    return {
      target,
      storedCollected,

      mpesaFunding,
      creditFunding,
      verifiedFunding,

      outstanding,

      payoutAmount,
      paidOut,

      fundingDifference,
      fundingGap,

      payoutDifference,
      payoutRisk,

      duplicatePayouts,
      ...payoutEvidence,
      severity: "high",

      title:
        "ACCOUNTING RECONCILIATION REQUIRED",

      message:
        `Stored collected amount is ` +
        `${money(storedCollected)}, while verified ` +
        `member funding is ${money(verifiedFunding)}. ` +
        `Difference: ${money(
          Math.abs(
            storedCollected -
              verifiedFunding
          )
        )}.`,
    }
  }

  /* -------------------------------------------------------
     5. ROUND NOT FULLY FUNDED
  ------------------------------------------------------- */

  if (verifiedFunding < target) {
    return {
      target,
      storedCollected,

      mpesaFunding,
      creditFunding,
      verifiedFunding,

      outstanding,

      payoutAmount,
      paidOut,

      fundingDifference,
      fundingGap,

      payoutDifference,
      payoutRisk,

      duplicatePayouts,
      ...payoutEvidence,
      severity: "warning",

      title: "ROUND NOT FULLY FUNDED",

      message:
        `${money(verifiedFunding)} has been verified ` +
        `against a target of ${money(target)}. ` +
        `${money(fundingGap)} remains outstanding. ` +
        `No payout should be created.`,
    }
  }

  /* -------------------------------------------------------
     6. FULLY FUNDED, NO PAYOUT YET
  ------------------------------------------------------- */

  if (paidOut === 0) {
    return {
      target,
      storedCollected,

      mpesaFunding,
      creditFunding,
      verifiedFunding,

      outstanding,

      payoutAmount,
      paidOut,

      fundingDifference,
      fundingGap,

      payoutDifference,
      payoutRisk,

      duplicatePayouts,
      ...payoutEvidence,
      severity: "healthy",

      title: "SYSTEM HEALTHY",

      message:
        `Verified member funding fully supports the ` +
        `${money(target)} round. No payout has been ` +
        `created or paid.`,
    }
  }

  /* -------------------------------------------------------
     7. FULLY FUNDED + FULLY SUPPORTED PAYOUT
  ------------------------------------------------------- */

  return {
    target,
    storedCollected,

    mpesaFunding,
    creditFunding,
    verifiedFunding,

    outstanding,

    payoutAmount,
    paidOut,

    fundingDifference,
    fundingGap,

    payoutDifference,
    payoutRisk,

    duplicatePayouts,
    ...payoutEvidence,
    severity: "healthy",

    title: "SYSTEM HEALTHY",

    message:
      `Verified member funding fully supports the ` +
      `${money(target)} target, and the ` +
      `${money(paidOut)} payout is fully supported ` +
      `by verified funding.`,
  }
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status: MemberLedgerRow["status"]
}) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        PAID
      </span>
    )
  }

  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        <AlertTriangle size={13} />
        PARTIAL
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
      <XCircle size={13} />
      NOT PAID
    </span>
  )
}

/* =========================================================
   RISK BANNER
========================================================= */

function RiskBanner({
  reconciliation,
}: {
  reconciliation: Reconciliation
}) {
  const styles = {
    healthy: {
      box:
        "border-emerald-200 bg-emerald-50",
      icon: "text-emerald-600",
      title: "text-emerald-800",
      text: "text-emerald-700",
      Icon: CheckCircle2,
    },

    warning: {
      box:
        "border-amber-200 bg-amber-50",
      icon: "text-amber-600",
      title: "text-amber-800",
      text: "text-amber-700",
      Icon: AlertTriangle,
    },

    high: {
      box:
        "border-orange-200 bg-orange-50",
      icon: "text-orange-600",
      title: "text-orange-800",
      text: "text-orange-700",
      Icon: ShieldAlert,
    },

    critical: {
      box:
        "border-red-200 bg-red-50",
      icon: "text-red-600",
      title: "text-red-800",
      text: "text-red-700",
      Icon: ShieldAlert,
    },
  }

  const style =
    styles[reconciliation.severity]

  const Icon = style.Icon

  return (
    <div
      className={`rounded-2xl border p-4 ${style.box}`}
    >
      <div className="flex gap-3">
        <Icon
          size={22}
          className={`mt-0.5 shrink-0 ${style.icon}`}
        />

        <div className="min-w-0">
          <div
            className={`text-sm font-bold ${style.title}`}
          >
            {reconciliation.title}
          </div>

          <p
            className={`mt-1 text-sm leading-6 ${style.text}`}
          >
            {reconciliation.message}
          </p>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   EVIDENCE CARD
========================================================= */

function EvidenceCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        {icon}
        <span>{title}</span>
      </div>

      <div className="mt-1 break-words text-base font-bold text-slate-900">
        {value}
      </div>
    </div>
  )
}


function getPaymentMethod(tx: TransactionRow): "STK" | "CREDIT" | "MANUAL" {
  const source = String(tx.payment_source || "").toUpperCase()

  if (source === "CREDIT") {
    return "CREDIT"
  }

  if (source === "MANUAL") {
    return "MANUAL"
  }

  // A checkout request identifies an STK Push payment.
  if (tx.checkout_request_id) {
    return "STK"
  }

  // Legacy/manual records without an STK checkout request.
  return "MANUAL"
}




/* =========================================================
   TRANSACTION EVIDENCE
========================================================= */

function TransactionEvidence({
  tx,
}: {
  tx: TransactionRow
}) {

    return (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
    {/* =====================================================
        SAFARICOM / PAYMENT HEADER
    ===================================================== */}

    <div className="h-1 w-full bg-emerald-500" />

    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        {/* STATUS */}

        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
            statusIsPaid(tx.status)
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {String(tx.status || "—").toUpperCase()}
        </span>

        {/* RECEIPT */}

        <div className="min-w-0">
          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            M-Pesa Receipt
          </div>

          <div className="break-all font-mono text-xs font-bold text-slate-900">
            {tx.mpesa_receipt || "NO RECEIPT"}
          </div>
        </div>
      </div>

      {/* TRANSACTION AMOUNT */}

      <div className="shrink-0 text-right">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Transaction Amount
        </div>

        <div className="mt-0.5 text-xl font-black text-emerald-700">
          {money(tx.amount)}
        </div>
      </div>
    </div>

    {/* =====================================================
        ACCOUNTING EVIDENCE
    ===================================================== */}

    <div className="p-4">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* APPLIED */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Applied Principal
          </div>

          <div
            className="text-sm font-bold"
            style={{
              color: "#0f172a",
              opacity: 1,
            }}
          >
            {money(tx.applied_amount)}
          </div>
        </div>

        {/* CREDIT */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Credit Balance
          </div>

          <div
            className="text-sm font-bold"
            style={{
              color: "#1d4ed8",
              opacity: 1,
            }}
          >
            {money(tx.credit_amount)}
          </div>
        </div>

        {/* FEE */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            M-Pesa Tariff Fee
          </div>

          <div
            className="text-sm font-semibold"
            style={{
              color: "#334155",
              opacity: 1,
            }}
          >
            {money(tx.fee_amount)}
          </div>
        </div>

        {/* PAYMENT SOURCE */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Payment Source
          </div>

          <div
            className="break-words text-sm font-bold uppercase tracking-wide"
            style={{
              color: "#0f172a",
              opacity: 1,
            }}
          >
            {tx.payment_source || "—"}
          </div>
        </div>

        {/* PHONE */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Customer Phone Number
          </div>

          <div
            className="break-words text-sm font-semibold"
            style={{
              color: "#0f172a",
              opacity: 1,
            }}
          >
            {tx.phone_number || "—"}
          </div>
        </div>

        {/* CHECKOUT REQUEST */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Checkout Request ID
          </div>

          <div
            className="break-all font-mono text-[11px]"
            style={{
              color: "#334155",
              opacity: 1,
            }}
          >
            {tx.checkout_request_id || "—"}
          </div>
        </div>

        {/* MERCHANT REQUEST */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Merchant Request ID
          </div>

          <div
            className="break-all font-mono text-[11px]"
            style={{
              color: "#334155",
              opacity: 1,
            }}
          >
            {tx.merchant_request_id || "—"}
          </div>
        </div>

        {/* PAID AT */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Settled / Paid At
          </div>

          <div
            className="text-sm font-semibold"
            style={{
              color: "#334155",
              opacity: 1,
            }}
          >
            {formatDate(tx.paid_at)}
          </div>
        </div>

        {/* CREATED */}

        <div className="min-w-0 border-b border-slate-100 pb-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Created On
          </div>

          <div
            className="text-sm font-semibold"
            style={{
              color: "#334155",
              opacity: 1,
            }}
          >
            {formatDate(tx.created_at)}
          </div>
        </div>
      </div>

      {/* =====================================================
          FAILURE EVIDENCE
      ===================================================== */}

      {tx.failure_reason && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <span className="shrink-0 rounded border border-red-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
            Error
          </span>

          <p
            className="min-w-0 flex-1 text-xs leading-relaxed"
            style={{
              color: "#991b1b",
              opacity: 1,
            }}
          >
            {tx.failure_reason}
          </p>
        </div>
      )}
    </div>
  </div>
)
}

/* =========================================================
   MEMBER EVIDENCE
========================================================= */

function MemberEvidence({
  member,
}: {
  member: MemberLedgerRow
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* MEMBER HEADER */}

      <button
        type="button"
        onClick={() =>
          setOpen(value => !value)
        }
        className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <User size={17} />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">
              {member.member_name}
            </div>

            <div className="truncate text-xs text-slate-600">
              {member.member_code}

              {member.phone_number
                ? ` • ${member.phone_number}`
                : ""}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge
            status={member.status}
          />

          {open ? (
            <ChevronDown
              size={17}
              className="text-slate-500"
            />
          ) : (
            <ChevronRight
              size={17}
              className="text-slate-500"
            />
          )}
        </div>
      </button>

      {/* MEMBER SUMMARY */}

      <div className="grid grid-cols-2 border-t border-slate-100 bg-slate-50 sm:grid-cols-5">
        <div className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Required
          </div>

          <div className="mt-1 text-sm font-bold text-slate-900">
            {money(member.required_amount)}
          </div>
        </div>

        <div className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            M-Pesa
          </div>

          <div className="mt-1 text-sm font-bold text-emerald-700">
            {money(member.mpesa_amount)}
          </div>
        </div>

        <div className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Credit
          </div>

          <div
            className="mt-1 text-sm font-bold"
            style={{
              color: "#1d4ed8",
              opacity: 1,
            }}
          >
            {money(member.credit_amount)}
          </div>
        </div>

        <div className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Applied
          </div>

          <div
            className="mt-1 text-sm font-bold"
            style={{
              color: "#0f172a",
              opacity: 1,
            }}
          >
            {money(member.applied_amount)}
          </div>
        </div>

        <div className="p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            Outstanding
          </div>

          <div className="mt-1 text-sm font-bold text-red-600">
            {money(member.outstanding_amount)}
          </div>
        </div>
      </div>

      {/* MEMBER DETAIL */}

      {open && (
        <div className="space-y-5 border-t border-slate-200 bg-white p-4">
          {/* EXPLANATION */}

          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Funding Explanation
            </div>

            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {member.reason ||
                "No additional explanation recorded."}
            </div>
          </div>

          {/* TRANSACTIONS */}

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Payment Evidence
              </div>

              <div className="text-xs font-semibold text-slate-500">
                {member.transactions.length} transaction
                {member.transactions.length === 1
                  ? ""
                  : "s"}
              </div>
            </div>

            {member.transactions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No transaction evidence exists for
                this member in this round.
              </div>
            ) : (
              <div className="space-y-3">
                {member.transactions.map(tx => (
                  <TransactionEvidence
                    key={tx.id}
                    tx={tx}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* =========================================================
   PAYOUT EVIDENCE
========================================================= */

function PayoutEvidence({
  payouts,
}: {
  payouts: PayoutRow[]
}) {
  if (payouts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        No payout has been created for this
        round.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {payouts.map(payout => {
        const paid =
          statusIsPaid(payout.status)

        return (
          <div
            key={payout.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {/* PAYOUT HEADER */}

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div
                  className={
                    paid
                      ? "text-sm font-bold text-emerald-700"
                      : "text-sm font-bold text-slate-900"
                  }
                >
                  PAYOUT{" "}
                  {String(
                    payout.status || "UNKNOWN"
                  ).toUpperCase()}
                </div>

                <div className="mt-1 text-xs text-slate-600">
                  {payout.phone_number ||
                    "No phone recorded"}
                </div>
              </div>

              <div className="text-lg font-black text-slate-900">
                {money(payout.amount)}
              </div>
            </div>

            {/* PAYOUT EVIDENCE */}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Recipient Phone
                </div>

                <div className="font-semibold text-slate-900">
                  {payout.phone_number || "—"}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Amount
                </div>

                <div className="font-semibold text-slate-900">
                  {money(payout.amount)}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Originator Conversation
                </div>

                <div className="break-all font-mono text-xs text-slate-900">
                  {payout.originator_conversation_id ||
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  API Conversation
                </div>

                <div className="break-all font-mono text-xs text-slate-900">
                  {payout.conversation_id ||
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  M-Pesa Transaction
                </div>

                <div className="break-all font-mono text-xs text-slate-900">
                  {payout.mpesa_transaction_id ||
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  M-Pesa Receipt
                </div>

                <div className="break-all font-mono text-xs text-slate-900">
                  {payout.mpesa_receipt ||
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Transaction Amount
                </div>

                <div className="font-semibold text-slate-900">
                  {money(
                    payout.transaction_amount
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Result Code
                </div>

                <div className="font-mono text-xs font-semibold text-slate-900">
                  {payout.result_code ??
                    "—"}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Requested
                </div>

                <div className="text-xs font-semibold text-slate-900">
                  {formatDate(
                    payout.requested_at
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate-500">
                  Paid
                </div>

                <div className="text-xs font-semibold text-slate-900">
                  {formatDate(
                    payout.paid_at
                  )}
                </div>
              </div>
            </div>

            {payout.failure_reason && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <strong>Failure:</strong>{" "}
                {payout.failure_reason}
              </div>
            )}

            {payout.result_description && (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <strong>
                  Safaricom result:
                </strong>{" "}
                {payout.result_description}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* =========================================================
   MAIN DRAWER
========================================================= */

export default function MerryGoRoundIntegrityDrawer({
  round,
  onClose,
  onRecalculate,
  repairing = false,
  onTriggerB2C,
  triggeringB2C = false,
  onCreatePayoutJob,
  creatingPayoutJob = false,
}: {
  round: RoundRow | null
  onClose: () => void
  onRecalculate?: (roundId: string) => Promise<void>
  repairing?: boolean
  onTriggerB2C?: (roundId: string) => Promise<void> | void
  triggeringB2C?: boolean
  onCreatePayoutJob?: (roundId: string) => Promise<void> | void
  creatingPayoutJob?: boolean
}) {
  const [history, setHistory] =
    useState<RoundHistory | null>(null)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [search, setSearch] =
    useState("")

  /* -------------------------------------------------------
     LOAD HISTORY
  ------------------------------------------------------- */

  useEffect(() => {
    if (!round) {
      setHistory(null)
      setError(null)
      setSearch("")
      return
    }

    /*
     * Capture the ID before entering the async
     * function. This fixes:
     *
     * "'round' is possibly null"
     */
    const roundId = round.id

    let cancelled = false

    async function loadHistory() {
      setLoading(true)
      setError(null)
      setHistory(null)

      const {
        data,
        error: rpcError,
      } = await supabase.rpc(
        "get_merry_go_round_round_history",
        {
          p_round_id: roundId,
        }
      )

      if (cancelled) return

      if (rpcError) {
        console.error(
          "ROUND HISTORY ERROR:",
          rpcError
        )

        setError(rpcError.message)
        setLoading(false)
        return
      }

      if (!data) {
        setError(
          "The round history RPC returned no financial evidence."
        )
        setLoading(false)
        return
      }

      /*
       * Defensive normalization.
       *
       * Older RPC versions may have returned
       * "disbursements" instead of "payouts".
       */
      const raw =
        data as Partial<RoundHistory> & {
          disbursements?: PayoutRow[]
        }

      const normalized: RoundHistory = {
        round:
          raw.round as RoundHistory["round"],

        members:
          Array.isArray(raw.members)
            ? raw.members
            : [],

        contributions:
          Array.isArray(
            raw.contributions
          )
            ? raw.contributions
            : [],

        payouts:
          Array.isArray(raw.payouts)
            ? raw.payouts
            : Array.isArray(
                  raw.disbursements
                )
              ? raw.disbursements
              : [],
      }

      if (!normalized.round) {
        setError(
          "The round history response does not contain round evidence."
        )
        setLoading(false)
        return
      }

      setHistory(normalized)
      setLoading(false)
    }

    void loadHistory()

    return () => {
      cancelled = true
    }
  }, [round])

  /* -------------------------------------------------------
     RECONCILIATION
  ------------------------------------------------------- */

  const reconciliation =
    useMemo(() => {
      if (!history) return null

      return calculateReconciliation(
        history
      )
    }, [history])

  /* -------------------------------------------------------
     MEMBER SEARCH
  ------------------------------------------------------- */

  const filteredMembers =
    useMemo(() => {
      if (!history) return []

      const query =
        search.trim().toLowerCase()

      if (!query) {
        return history.members
      }

      return history.members.filter(
        member =>
          [
            member.member_name,
            member.member_code,
            member.phone_number,
            member.status,
          ]
            .filter(Boolean)
            .some(value =>
              String(value)
                .toLowerCase()
                .includes(query)
            )
      )
    }, [history, search])

  /* -------------------------------------------------------
     RESET SEARCH WHEN CLOSING
  ------------------------------------------------------- */

  function handleClose() {
    setSearch("")
    onClose()
  }

  if (!round) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <aside className="flex h-full w-full max-w-3xl flex-col overflow-hidden bg-slate-50 shadow-2xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                StreetGO Finance Supervisor
              </div>

              <h2 className="mt-1 text-xl font-black text-slate-900">
                Round #{round.round_number}{" "}
                Investigation
              </h2>

              <div className="mt-1 break-all text-xs text-slate-500">
                Round ID:{" "}
                <span className="font-mono text-slate-600">
                  {round.id}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Close
            </button>
          </div>
        </header>

        {/* =================================================
            SCROLLABLE BODY
        ================================================= */}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50 p-5">
          {/* LOADING */}

          {loading && (
            <div className="flex min-h-[300px] items-center justify-center text-slate-500">
              <Loader2
                className="mr-2 animate-spin"
                size={20}
              />

              <span>
                Loading financial evidence...
              </span>
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <div className="flex items-start gap-3">
                <ShieldAlert
                  size={21}
                  className="mt-0.5 shrink-0"
                />

                <div className="min-w-0">
                  <div className="font-bold">
                    Unable to load investigation
                  </div>

                  <div className="mt-1 break-words">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              EVIDENCE
          ================================================= */}

          {!loading &&
            !error &&
            history &&
            reconciliation && (
              <div className="space-y-6">
                {/* =================================================
                    RISK
                ================================================= */}

                <section>
                  <RiskBanner
                    reconciliation={
                      reconciliation
                    }
                  />
                </section>

                {/* =================================================
                    ROUND EVIDENCE
                ================================================= */}

                <section>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Round Evidence
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <EvidenceCard
                      title="Target"
                      value={money(
                        reconciliation.target
                      )}
                      icon={
                        <CircleDollarSign
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Stored Collected"
                      value={money(
                        reconciliation.storedCollected
                      )}
                      icon={
                        <WalletCards
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Verified M-Pesa"
                      value={money(
                        reconciliation.mpesaFunding
                      )}
                      icon={
                        <Smartphone
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Verified Credit"
                      value={money(
                        reconciliation.creditFunding
                      )}
                      icon={
                        <CreditCard
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Verified Funding"
                      value={money(
                        reconciliation.verifiedFunding
                      )}
                      icon={
                        <CheckCircle2
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Outstanding"
                      value={money(
                        reconciliation.outstanding
                      )}
                      icon={
                        <AlertTriangle
                          size={14}
                        />
                      }
                    />
                  </div>
                </section>

                {/* =================================================
                    PAYOUT RECONCILIATION
                ================================================= */}

                <section>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Payout Reconciliation
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <EvidenceCard
                      title="Payout Amount"
                      value={money(
                        reconciliation.payoutAmount
                      )}
                      icon={
                        <CircleDollarSign
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Confirmed Paid"
                      value={money(
                        reconciliation.paidOut
                      )}
                      icon={
                        <CheckCircle2
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Funding Gap"
                      value={money(
                        reconciliation.fundingGap
                      )}
                      icon={
                        <WalletCards
                          size={14}
                        />
                      }
                    />

                    <EvidenceCard
                      title="Payout Risk"
                      value={money(
                        reconciliation.payoutRisk
                      )}
                      icon={
                        <ShieldAlert
                          size={14}
                        />
                      }
                    />
                  </div>
                </section>

                {/* =================================================
                    MEMBER LEDGER
                ================================================= */}

                <section>
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Locked Round Members
                      </div>

                      <div className="mt-1 text-sm text-slate-600">
                        {history.members.length}{" "}
                        member
                        {history.members.length ===
                        1
                          ? ""
                          : "s"}
                      </div>
                    </div>

                    {/* SEARCH */}

                    <div className="relative w-full sm:w-64">
                      <Search
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        value={search}
                        onChange={event =>
                          setSearch(
                            event.target.value
                          )
                        }
                        placeholder="Search member..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>
                  </div>

                  {/* MEMBER RESULTS */}

                  <div className="space-y-3">
                    {filteredMembers.map(
                      member => (
                        <MemberEvidence
                          key={
                            member.member_id
                          }
                          member={member}
                        />
                      )
                    )}

                    {filteredMembers.length ===
                      0 && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                        No members match the
                        search.
                      </div>
                    )}
                  </div>
                </section>

                {/* =================================================
                    DISBURSEMENT EVIDENCE
                ================================================= */}

                <section>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Disbursement Evidence
                  </div>

                  <PayoutEvidence
                    payouts={history.payouts}
                  />
                </section>

                {/* =================================================
                    CONTRIBUTION EVIDENCE
                ================================================= */}

                <section>
                  <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Contribution Evidence
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xl font-black text-slate-900">
                          {
                            history
                              .contributions
                              .length
                          }
                        </div>

                        <div className="text-[10px] uppercase tracking-wide text-slate-500">
                          Transactions
                        </div>
                      </div>

                      <div>
                        <div className="text-xl font-black text-emerald-600">
                          {
                            history.contributions.filter(
                              tx =>
                                statusIsPaid(
                                  tx.status
                                )
                            ).length
                          }
                        </div>

                        <div className="text-[10px] uppercase tracking-wide text-slate-500">
                          Paid
                        </div>
                      </div>

                      <div>
                        <div className="text-xl font-black text-red-600">
                          {
                            history.contributions.filter(
                              tx =>
                                !statusIsPaid(
                                  tx.status
                                )
                            ).length
                          }
                        </div>

                        <div className="text-[10px] uppercase tracking-wide text-slate-500">
                          Failed/Pending
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ALL CONTRIBUTION TRANSACTIONS */}

                  <div className="mt-3 space-y-3">
                    {history.contributions.map(
                      tx => (
                        <TransactionEvidence
                          key={tx.id}
                          tx={tx}
                        />
                      )
                    )}
                  </div>
                </section>

                {/* =================================================
                    ADMIN SAFETY
                ================================================= */}

                <section>
                  <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-white shadow-sm">
                    <div className="flex gap-3">
                      <ShieldAlert
                        size={21}
                        className="mt-0.5 shrink-0 text-slate-200"
                      />

                      <div className="min-w-0">
                        <div className="text-sm font-bold">
                          ADMIN ACTION SAFETY
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-300">
                          Administrative repair is limited to
                          recalculating stored accounting from
                          verified contribution evidence. It does
                          not create money, delete transactions, or
                          send a payout. Unsupported payouts remain
                          locked until they are reconciled.
                        </p>

                        {reconciliation.payoutRisk >
                          0 && (
                          <div className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
                            <strong>
                              PAYOUT BLOCK:
                            </strong>{" "}
                            The current payout exceeds
                            verified funding by{" "}
                            {money(
                              reconciliation.payoutRisk
                            )}
                            . Do not create another
                            payout.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    ADMINISTRATIVE REPAIR
                ================================================= */}

                {onRecalculate && (
                  <section>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <FileWarning
                          size={21}
                          className="mt-0.5 shrink-0 text-slate-500"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-900">
                            Administrative Repair
                          </div>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Recalculate the stored collected amount
                            from verified paid contribution evidence.
                            This action does not create money and does
                            not send a payout.
                          </p>

                          {reconciliation.payoutRisk > 0 && (
  <div className="mt-3 rounded-xl border-2 border-red-500 bg-red-100 p-4 text-sm text-red-900 shadow-sm">
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-black">
        !
      </div>

      <div className="min-w-0 flex-1">
        <div className="font-black text-red-900">
          REPAIR LOCKED
        </div>

        <div className="mt-1 font-semibold text-red-800">
          The payout exceeds verified funding by{" "}
          <span className="font-black text-red-950">
            {money(reconciliation.payoutRisk)}
          </span>.
        </div>

        {/* PAYOUT RECONCILIATION EVIDENCE */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-red-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Verified Funding
            </div>

            <div className="mt-1 text-lg font-black text-slate-900">
              {money(reconciliation.verifiedFunding)}
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Payout Amount
            </div>

            <div className="mt-1 text-lg font-black text-red-700">
              {money(reconciliation.payoutAmount)}
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Payout Status
            </div>

            <div className="mt-1 text-sm font-black uppercase text-slate-900">
              {reconciliation.payoutStatus || "—"}
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Payout Date
            </div>

            <div className="mt-1 text-sm font-bold text-slate-900">
              {formatDateTime(reconciliation.payoutDate)}
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-white p-3 sm:col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              M-Pesa Transaction
            </div>

            <div className="mt-1 break-all font-mono text-xs font-bold text-slate-900">
              {reconciliation.payoutMpesaTransaction || "NO M-PESA TRANSACTION"}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3">
          <div className="font-bold text-red-900">
            Payout reconciliation is required first.
          </div>

          <div className="mt-1 text-xs leading-5 text-red-800">
            Administrative repair remains locked until the payout evidence
            has been reconciled against verified funding.
          </div>
        </div>
      </div>
    </div>
  </div>
)}


{(() => {
  const recoverablePayout =
    history?.payouts?.length === 1
      ? history.payouts[0]
      : null

  const payoutCanBeRecovered =
    !!recoverablePayout &&
    ['pending', 'processing'].includes(
      String(recoverablePayout.status || '').toLowerCase()
    ) &&
    !recoverablePayout.mpesa_transaction_id &&
    !recoverablePayout.originator_conversation_id &&
    !recoverablePayout.conversation_id

  if (!payoutCanBeRecovered) {
    return null
  }

  return (
    <>
      {onCreatePayoutJob && (
        <section>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <RefreshCw
                size={21}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-amber-900">
                  Payout Job Recovery
                </div>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  The existing payout is eligible for processing. Create or confirm
                  its payout job without creating another disbursement.
                </p>

                <button
                  type="button"
                  onClick={() => void onCreatePayoutJob(round.id)}
                  disabled={creatingPayoutJob || triggeringB2C}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingPayoutJob ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Payout Job...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Create Payout Job
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {onTriggerB2C && (
        <section>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Smartphone
                size={21}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-emerald-900">
                  B2C Payout Recovery
                </div>

                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Retry the existing unpaid payout through the normal B2C pipeline.
                  This does not create another disbursement.
                </p>

                <button
                  type="button"
                  onClick={() => void onTriggerB2C(round.id)}
                  disabled={triggeringB2C || creatingPayoutJob}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {triggeringB2C ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Triggering B2C...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4" />
                      Trigger B2C
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
})()}




                          <button
                            type="button"
                            onClick={() => void onRecalculate(round.id)}
                            disabled={
                              repairing ||
                              reconciliation.payoutRisk > 0
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {repairing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Recalculating...
                              </>
                            ) : (
                              <>
                                Recalculate Round
                                <ChevronRight className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}
        </div>
      </aside>
    </div>
  )
}