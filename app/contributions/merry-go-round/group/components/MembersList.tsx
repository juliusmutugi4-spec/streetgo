"use client"

import PaymentStatus from "./PaymentStatus"

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
  amount_paid?: number | null
  mpesa_receipt: string | null
  paid_at: string | null
}

type Props = {
  members: Member[]
  memberPaymentStatuses: MemberPaymentStatus[]
  currentUserId: string | null
  memberLimit: number
  slotsRemaining: number
  contributionAmount: number
  nextRecipient?: Member | null
  nextRecipientAmount: number
}

export default function MembersList({
  members,
  memberPaymentStatuses,
  currentUserId,
  memberLimit,
  slotsRemaining,
  contributionAmount,
  nextRecipient,
  nextRecipientAmount,
}: Props) {
  return (
    <section className="mt-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white">
            Group Roster
          </h2>

          <p className="text-[11px] text-slate-500">
            Active Merry-Go-Round contributors
          </p>
        </div>

        <span className="text-[11px] font-semibold text-slate-500">
          {members.length} / {memberLimit}
        </span>
      </div>

{/* Next recipient */}
{nextRecipient && (
  <div className="border-b border-slate-800/60 py-4">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-400">
          Next recipient
        </p>

        <p className="mt-1 truncate text-sm font-black text-white">
          {[
            nextRecipient.mpesa_first_name,
            nextRecipient.mpesa_middle_name,
            nextRecipient.mpesa_last_name,
          ]
            .filter(Boolean)
            .join(" ") ||
            nextRecipient.display_name ||
            `Member #${nextRecipient.member_number}`}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-500">
          Member #{nextRecipient.member_number}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
          Will receive
        </p>

        <p className="mt-0.5 text-base font-black text-emerald-400">
          KES{" "}
          {nextRecipientAmount.toLocaleString("en-KE", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  </div>
)}

{/* Members heading */}
<div className="border-b border-slate-800/60 py-3">
  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
    Members
  </p>
</div>

{/* Members */}
<div>
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
            (isMe
              ? "You"
              : member.role === "organizer"
                ? "Organizer"
                : `Member #${member.member_number}`)

          const maskedPhone = member.phone_number
            ? `${member.phone_number.slice(0, 4)}****${member.phone_number.slice(-2)}`
            : null

          const paymentRecord = memberPaymentStatuses.find(
            (payment) => payment.member_id === member.id
          )

          const amountPaid = Number(
            paymentRecord?.amount_paid || 0
          )

          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 border-b border-slate-900 py-3 last:border-0"
            >
              {/* Member */}
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-[11px] font-bold text-slate-400">
                  #{member.member_number}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span className="truncate">
                      {name}
                    </span>

                    {isMe && (
                      <span className="text-[9px] font-medium text-emerald-400">
                        You
                      </span>
                    )}

                    {member.role === "organizer" && (
                      <span className="text-[9px] font-medium text-purple-400">
                        Host
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-600">
                    {maskedPhone && (
                      <span>{maskedPhone}</span>
                    )}

                    {maskedPhone && (
                      <span className="text-slate-800">
                        •
                      </span>
                    )}

                    <span>
                      ID: {member.member_code || "Pending"}
                    </span>
                  </p>

                  {member.payment_code && (
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">
                      Account {member.payment_code}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment */}
<PaymentStatus
  amountPaid={amountPaid}
  requiredAmount={contributionAmount}
  paymentStatus={paymentRecord?.payment_status}
  mpesaReceipt={paymentRecord?.mpesa_receipt}
  paidAt={paymentRecord?.paid_at}
/>
            </div>
          )
        })}
      </div>

      {/* Empty slots */}
      {slotsRemaining > 0 && (
        <div className="pt-2 text-center">
          <p className="text-xs font-medium text-slate-400">
            {slotsRemaining}{" "}
            {slotsRemaining === 1
              ? "slot"
              : "slots"}{" "}
            open
          </p>

          <p className="text-[10px] text-slate-500">
            Share group number to invite extra contributors.
          </p>
        </div>
      )}
    </section>
  )
}