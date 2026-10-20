"use client"

import {
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
} from "lucide-react"

type Member = {
  id: string
  user_id: string
  member_number: number
  member_code: string | null
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

/*
 * Safe payment-state configuration.
 *
 * IMPORTANT:
 * We do not directly use database status as a key.
 * Unknown/null statuses are safely converted to "due".
 */
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

/**
 * Converts any database payment status into a safe UI state.
 *
 * This prevents:
 *   Cannot read properties of undefined (reading 'icon')
 *
 * from crashing the entire group page.
 */
function getPaymentState(status: string | null | undefined): PaymentState {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase()

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
    <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-white">
            Group Roster
          </h2>

          <p className="text-[11px] text-slate-500">
            Active Merry-Go-Round contributors
          </p>
        </div>

        <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-400">
          {members.length} / {memberLimit}
        </span>
      </div>

      {/* Members */}
      <div className="space-y-2">
        {members.map((member) => {
          const isMe = member.user_id === currentUserId

          /*
           * Prefer the actual M-PESA name.
           * Fall back to StreetGO display name.
           * Finally use a safe member label.
           */
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
            (isMe
              ? "You"
              : member.role === "organizer"
                ? "Organizer"
                : `Member #${member.member_number}`)

          /*
           * Mask the phone number.
           *
           * Example:
           * 254793397916
           * becomes:
           * 2547****16
           */
          const maskedPhone = member.phone_number
            ? `${member.phone_number.slice(0, 4)}****${member.phone_number.slice(-2)}`
            : null

          /*
           * Find payment status for this member.
           */
          const paymentRecord = memberPaymentStatuses.find(
            (payment) => payment.member_id === member.id
          )

          /*
           * IMPORTANT:
           * Never access PAYMENT_STATES[...] directly.
           *
           * getPaymentState() guarantees that we always receive
           * a valid state, even if the database contains:
           *
           * null
           * pending
           * processing
           * paid
           * failed
           * cancelled
           * or an unexpected value.
           */
          const paymentState = getPaymentState(
            paymentRecord?.payment_status
          )

          const Icon = paymentState.icon

          return (
            <div
              key={member.id}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                isMe
                  ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                  : "border-slate-800/80 bg-slate-900/30"
              }`}
            >
              {/* Member information */}
              <div className="flex min-w-0 items-center gap-3">

                {/* Member number */}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-[11px] font-bold text-slate-400">
                  #{member.member_number}
                </span>

                <div className="min-w-0 space-y-0.5">

                  {/* Name + badges */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span className="truncate">
                      {name}
                    </span>

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

                  {/* Phone + member code */}
                  <p className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    {maskedPhone && (
                      <span>{maskedPhone}</span>
                    )}

                    {maskedPhone && (
                      <span className="text-slate-700">
                        •
                      </span>
                    )}

                    <span>
                      ID: {member.member_code || "Pending"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Payment status */}
              <div
                className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${paymentState.cls}`}
              >
                <Icon
                  size={11}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <span>
                  {paymentState.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty slots */}
      {slotsRemaining > 0 && (
        <div className="mt-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/10 p-3 text-center">
          <p className="text-xs font-medium text-slate-400">
            {slotsRemaining}{" "}
            {slotsRemaining === 1 ? "slot" : "slots"} open
          </p>

          <p className="mt-0.5 text-[10px] text-slate-500">
            Share group number to invite extra contributors.
          </p>
        </div>
      )}
    </section>
  )
}