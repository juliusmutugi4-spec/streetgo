"use client"

import { ShieldCheck } from "lucide-react"

type Member = {
  member_number: number
  member_code: string | null
  phone_number: string | null
  phone_verified: boolean
}

type Props = {
  member: Member | undefined
}

export default function CurrentMember({ member }: Props) {
  if (!member) {
    return null
  }

  return (
    <section className="mt-5 space-y-3">
      {/* Header section with icon alignment */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800/60">
        <ShieldCheck size={14} className="text-emerald-400" />
        <h2 className="text-sm font-bold text-white">
          Your Membership
        </h2>
      </div>

      {/* Grid listing structural key-values under simple typography */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            MEMBER NUMBER
          </div>
          <div className="mt-0.5 font-semibold text-slate-200">
            #{member.member_number}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            MEMBER CODE
          </div>
          <div className="mt-0.5 font-mono font-semibold text-emerald-400">
            {member.member_code || "Pending"}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            PHONE NUMBER
          </div>
          <div className="mt-0.5 font-semibold text-slate-200">
            {member.phone_number || "Not provided"}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            STATUS VERIFICATION
          </div>
          <div
            className={`mt-0.5 font-bold text-[11px] ${
              member.phone_verified ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {member.phone_verified ? "VERIFIED" : "NOT VERIFIED"}
          </div>
        </div>
      </div>
    </section>
  )
}
