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
    <section className="mt-5 rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck
          size={20}
          className="mt-0.5 text-emerald-400"
        />

        <div>
          <div className="text-sm font-black">
            Your membership
          </div>

          <div className="mt-2 grid gap-2 text-xs text-white/50 sm:grid-cols-2">
            <div>
              Member number:{" "}
              <span className="font-black text-white/80">
                #{member.member_number}
              </span>
            </div>

            <div>
              Member code:{" "}
              <span className="font-mono font-black text-emerald-300">
                {member.member_code || "Pending"}
              </span>
            </div>

            <div>
              Phone:{" "}
              <span className="font-black text-white/80">
                {member.phone_number || "Not provided"}
              </span>
            </div>

            <div>
              Verification:{" "}
              <span
                className={
                  member.phone_verified
                    ? "font-black text-emerald-400"
                    : "font-black text-amber-400"
                }
              >
                {member.phone_verified
                  ? "VERIFIED"
                  : "NOT VERIFIED"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}