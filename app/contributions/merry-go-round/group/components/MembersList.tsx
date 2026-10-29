"use client"

import { useMemo } from "react"
import PaymentStatus from "./PaymentStatus"
import ProfessionalMemberBadge from "./ProfessionalMemberBadge"

export type Member = {
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

export type MemberPaymentStatus = {
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

  // When this member joined after the current round was created,
  // they belong to the next round.
  currentRoundCreatedAt?: string | null
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
  currentRoundCreatedAt,
}: Props) {
  // Memoize payment mapping to eliminate O(N^2) lookups on re-renders
  const paymentMap = useMemo(() => {
    return new Map<string, MemberPaymentStatus>(
      memberPaymentStatuses.map((p) => [p.member_id, p])
    )
  }, [memberPaymentStatuses])

  // Extract full display name logic cleanly
  const getFullName = (m: Member) => {
    const fullMpesaName = [
      m.mpesa_first_name,
      m.mpesa_middle_name,
      m.mpesa_last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim()

    return fullMpesaName || m.display_name || `Member #${m.member_number}`
  }

  return (
    <section className="mt-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white">Group Roster</h2>
          <p className="text-[11px] text-slate-500">
            Active Chamas & Merry-Go-Round contributors
          </p>
        </div>

        <span className="rounded border border-slate-800 bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
          {members.length} / {memberLimit}
        </span>
      </div>

      {/* Next Recipient Stage */}
      {nextRecipient && (
        <div className="rounded-lg border border-emerald-500/10 bg-gradient-to-r from-emerald-950/20 to-transparent p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-400">
                Next Recipient
              </span>

              <p className="mt-2 truncate text-sm font-black text-white">
                {getFullName(nextRecipient)}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                Position #{nextRecipient.member_number}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                Payout Value
              </p>

              <p className="mt-0.5 text-base font-black tracking-tight text-emerald-400">
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

      {/* Roster Section Split */}
      <div className="border-b border-slate-800/40 pb-1.5 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Members Allocation
        </p>
      </div>

      {/* Members Map Output */}
      <div className="divide-y divide-slate-900">
        {members.map((member) => {
          const isMe = member.user_id === currentUserId
          const name = getFullName(member)

          /*
           * IMPORTANT:
           *
           * A member who joined AFTER the current round was created
           * is NOT part of the current round.
           *
           * Example:
           *
           * Round 11 created: 27 Oct
           * Member #6 joined: 28 Oct
           *
           * Therefore Member #6 waits for Round 12.
           */
          const isWaitingNextRound =
            !!currentRoundCreatedAt &&
            new Date(member.joined_at).getTime() >
              new Date(currentRoundCreatedAt).getTime()

          // Format telephone accurately (e.g. +2547****12)
          const maskedPhone = member.phone_number
            ? member.phone_number.length > 6
              ? `${member.phone_number.slice(0, 4)}****${member.phone_number.slice(-2)}`
              : `${member.phone_number.slice(0, 2)}****`
            : null

          const paymentRecord = paymentMap.get(member.id)
          const amountPaid = Number(paymentRecord?.amount_paid || 0)

          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 rounded-sm px-1 py-3 transition-colors duration-150 hover:bg-slate-950/40"
            >
              {/* Profile Meta Frame */}
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <ProfessionalMemberBadge
                    member={member}
                    nextRecipient={nextRecipient}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                    <span className="truncate">
                      {isMe ? "You" : name}
                    </span>

                    {isMe && (
                      <span className="rounded border border-emerald-500/10 bg-emerald-500/15 px-1 py-0.2 text-[9px] font-medium text-emerald-400">
                        You
                      </span>
                    )}

                    {member.role === "organizer" && (
                      <span className="rounded border border-purple-500/10 bg-purple-500/15 px-1 py-0.2 text-[9px] font-medium text-purple-400">
                        Host
                      </span>
                    )}
                  </div>

                  {/* Operational Telemetry Subtext */}
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] text-slate-500">
                    {maskedPhone && <span>{maskedPhone}</span>}

                    {maskedPhone && (
                      <span className="select-none text-slate-700">
                        •
                      </span>
                    )}

                    <span>
                      ID: {member.member_code || "Pending Verification"}
                    </span>
                  </div>

                  {member.payment_code && (
                    <p className="mt-1 inline-block rounded border border-slate-800/40 bg-slate-900/60 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                      Acc:{" "}
                      <span className="font-bold text-slate-300">
                        {member.payment_code}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Payment / Next-Round Status */}
              <div className="shrink-0">
                {isWaitingNextRound ? (
                  <div className="text-right">
                    <div className="text-sm font-black tracking-wide text-sky-400">
                      WAITING NEXT ROUND
                    </div>

                    <div className="mt-1 text-[10px] font-semibold text-slate-500">
                      Contribution applies to next round
                    </div>
                  </div>
                ) : (
                  <PaymentStatus
                    amountPaid={amountPaid}
                    requiredAmount={contributionAmount}
                    paymentStatus={paymentRecord?.payment_status}
                    mpesaReceipt={paymentRecord?.mpesa_receipt}
                    paidAt={paymentRecord?.paid_at}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dynamic Call To Action For Remaining Slots */}
      {slotsRemaining > 0 && (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-950/20 p-4 text-center">
          <p className="text-xs font-semibold text-slate-300">
            {slotsRemaining} Open{" "}
            {slotsRemaining === 1
              ? "Contributor Slot"
              : "Contributor Slots"}
          </p>

          <p className="mx-auto mt-1 max-w-[280px] text-[10px] leading-relaxed text-slate-500">
            Share this Chama link or group number to invite extra verified
            contributors.
          </p>
        </div>
      )}
    </section>
  )
}
