"use client"

import { CheckCircle2, Clock3, AlertCircle, XCircle } from "lucide-react"

type Member = {
  id: string
  user_id: string
  member_number: number
  member_code: string | null
  payment_code: string | null
  role: "organizer" | "member"
  status: "active" | "left" | "removed"
  display_name: string | null
  phone_number: string | null
  phone_verified: boolean
  joined_at: string
  mpesa_first_name?: string | null
  mpesa_middle_name?: string | null
  mpesa_last_name?: string | null
}

type MemberPaymentStatus = {
  member_id: string
  member_number: number
  payment_status: string | null
  mpesa_receipt: string | null
  paid_at: string | null
}

type Props = {
  members: Member[]
  memberPaymentStatuses: MemberPaymentStatus[]
  currentUserId: string | null
  memberLimit: number
  slotsRemaining: number
}

type PaymentState = {
  label: string
  cls: string
  icon: typeof CheckCircle2
}

const PAYMENT_STATES: Record<string, PaymentState> = {
  paid: {
    label: "Paid",
    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    cls: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: Clock3,
  },
  pending: {
    label: "Pending",
    cls: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: Clock3,
  },
  due: {
    label: "Due",
    cls: "text-slate-400 bg-slate-800 border-slate-700/60",
    icon: AlertCircle,
  },
  failed: {
    label: "Failed",
    cls: "text-red-400 bg-red-500/10 border-red-500/20",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    cls: "text-slate-400 bg-slate-800 border-slate-700/60",
    icon: XCircle,
  },
}

function getPaymentState(status: string | null | undefined): PaymentState {
  const normalizedStatus = String(status || "").trim().toLowerCase()
  return PAYMENT_STATES[normalizedStatus] || PAYMENT_STATES.due
}

export default function MembersList({
  members,
  memberPaymentStatuses,
  currentUserId,
  memberLimit,
  slotsRemaining,
}: Props) {
  return (
    <section className="mt-5 space-y-4">
      {/* Header (No Card container background) */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white">Group Roster</h2>
          <p className="text-[11px] text-slate-500">Active Merry-Go-Round contributors</p>
        </div>
        <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-400">
          {members.length} / {memberLimit}
        </span>
      </div>

      {/* Members Grid/List */}
      <div className="space-y-2">
        {members.map((member) => {
          const isMe = member.user_id === currentUserId

          const mpesaName = [
            member.mpesa_first_name,
            member.mpesa_middle_name,
            member.mpesa_last_name,
          ]
            .filter(Boolean)
            .join(" ")
            .trim()

          const name =
            mpesaName ||
            member.display_name ||
            (isMe ? "You" : member.role === "organizer" ? "Organizer" : `Member #${member.member_number}`)

          const maskedPhone = member.phone_number
            ? `${member.phone_number.slice(0, 4)}****${member.phone_number.slice(-2)}`
            : null

          const paymentRecord = memberPaymentStatuses.find(
            (payment) => payment.member_id === member.id
          )

          const paymentState = getPaymentState(paymentRecord?.payment_status)
          const Icon = paymentState.icon

          return (
            <div key={member.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-900 last:border-0">
              {/* Member information */}
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-[11px] font-bold text-slate-400">
                  #{member.member_number}
                </span>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span className="truncate">{name}</span>
                    {isMe && (
                      <span className="rounded bg-emerald-500/10 px-1 text-[9px] font-medium text-emerald-400">
                        You
                      </span>
                    )}
                    {member.role === "organizer" && (
                      <span className="rounded bg-purple-500/10 px-1 text-[9px] font-medium text-purple-400">
                        Host
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    {maskedPhone && <span>{maskedPhone}</span>}
                    {maskedPhone && <span className="text-slate-700">•</span>}
                    <span>ID: {member.member_code || "Pending"}</span>
                  </p>
                  {member.payment_code && (
                    <p className="mt-1 text-[10px] font-semibold text-emerald-400">
                      M-PESA Account: {member.payment_code}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment status badge */}
              <div className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${paymentState.cls}`}>
                <Icon size={11} className="shrink-0" aria-hidden="true" />
                <span>{paymentState.label}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty slots text alert */}
      {slotsRemaining > 0 && (
        <div className="pt-2 text-center">
          <p className="text-xs font-medium text-slate-400">
            {slotsRemaining} {slotsRemaining === 1 ? "slot" : "slots"} open
          </p>
          <p className="text-[10px] text-slate-500">
            Share group number to invite extra contributors.
          </p>
        </div>
      )}
    </section>
  )
}
