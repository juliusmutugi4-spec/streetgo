"use client"

import { useEffect, useState } from "react"

interface Group {
  id: string
  name: string
  group_number: string | null
  status: string
}

interface UnverifiedMember {
  id: string
  memberCode: string
  phoneNumber: string | null
  phoneVerified: boolean
  phoneVerifiedBy: string | null
  phoneVerifiedAt: string | null
  status: string
  groupId: string
  group: Group | null
}

interface UnverifiedMembersProps {
  adminId: string
}

export default function UnverifiedMembers({
  adminId,
}: UnverifiedMembersProps) {
  const [members, setMembers] = useState<UnverifiedMember[]>([])
  const [loading, setLoading] = useState(true)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!adminId) {
        throw new Error("Admin session not found")
      }

      const response = await fetch(
        "/api/admin/merry-go-round/unverified",
        {
          method: "GET",
          headers: {
            "x-admin-id": adminId,
          },
          cache: "no-store",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load unverified members"
        )
      }

      setMembers(data.members || [])
    } catch (err) {
      console.error("LOAD UNVERIFIED MEMBERS ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load members"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [adminId])

  const verifyMemberPhone = async (memberId: string) => {
    try {
      setVerifyingId(memberId)
      setError(null)

      if (!adminId) {
        throw new Error("Admin session not found")
      }

      const response = await fetch(
        "/api/admin/merry-go-round/members/verify-phone",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-id": adminId,
          },
          body: JSON.stringify({
            memberId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to verify phone number"
        )
      }

      await loadMembers()
    } catch (err) {
      console.error("VERIFY PHONE ERROR:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to verify phone number"
      )
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <section className="mb-6 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-[#090b0a] shadow-[0_10px_35px_rgba(0,0,0,0.25)]">

      {/* STREETGO HEADER */}
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">

          <div className="flex min-w-0 items-center gap-3">

            {/* StreetGO Brand Mark */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#26b14c] shadow-[0_0_20px_rgba(38,177,76,0.18)]">
              <span className="text-sm font-black tracking-tight text-white">
                SG
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">
                  StreetGO
                </h2>

                <span className="rounded-full border border-[#26b14c]/20 bg-[#26b14c]/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.15em] text-[#48d66d]">
                  Finance
                </span>
              </div>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-zinc-500">
                Phone Verification Center
              </p>
            </div>
          </div>

          {/* Counter */}
          <div className="shrink-0 text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              Pending
            </p>

            <p className="mt-0.5 text-xl font-black leading-none text-[#26b14c]">
              {members.length}
            </p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="border-b border-zinc-800/80 bg-zinc-950/40 px-5 py-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
            <span className="text-[10px] text-amber-400">
              !
            </span>
          </div>

          <p className="text-[10px] leading-relaxed text-zinc-500">
            Active Merry-Go-Round members who paid manually
            or have not completed phone verification.
            Verify the number before the member receives a payout.
          </p>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mx-5 mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-400">
              ●
            </span>

            <p className="text-[10px] font-medium text-red-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* MEMBER LIST */}
      <div className="p-4">

        {loading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-10 text-center">
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-[#26b14c]" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
              Loading verification queue
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 px-4 py-10 text-center">

            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#26b14c]/10">
              <span className="text-lg font-bold text-[#26b14c]">
                ✓
              </span>
            </div>

            <p className="text-xs font-bold text-zinc-200">
              Verification Queue Clear
            </p>

            <p className="mt-1 text-[10px] text-zinc-600">
              All active Merry-Go-Round members are verified.
            </p>
          </div>
        ) : (
          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">

            {members.map((member) => {
              const isVerifying =
                verifyingId === member.id

              return (
                <div
                  key={member.id}
                  className="group rounded-xl border border-zinc-800 bg-zinc-950 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div className="flex items-center justify-between gap-3">

                    {/* MEMBER INFORMATION */}
                    <div className="min-w-0 flex-1">

                      <div className="flex items-center gap-2">
                        <span className="truncate font-mono text-[11px] font-bold text-zinc-200">
                          {member.memberCode}
                        </span>

                        <span className="shrink-0 rounded-full border border-amber-500/20 bg-amber-500/5 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.12em] text-amber-400">
                          Unverified
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-600">
                          PHONE
                        </span>

                        <span className="font-mono text-[11px] font-medium text-zinc-300">
                          {member.phoneNumber ||
                            "No phone number"}
                        </span>
                      </div>

                      {member.group && (
                        <div className="mt-1 flex min-w-0 items-center gap-1.5">
                          <span className="text-[9px] text-zinc-600">
                            GROUP
                          </span>

                          <span className="truncate text-[10px] text-zinc-500">
                            {member.group.name}

                            {member.group.group_number
                              ? ` • ${member.group.group_number}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* VERIFY BUTTON */}
                    <button
                      type="button"
                      disabled={
                        isVerifying ||
                        !member.phoneNumber
                      }
                      onClick={() =>
                        verifyMemberPhone(member.id)
                      }
                      className="shrink-0 rounded-lg border border-[#26b14c]/30 bg-[#26b14c]/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] text-[#48d66d] shadow-sm transition-all hover:border-[#26b14c]/50 hover:bg-[#26b14c]/20 active:scale-95 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-600"
                    >
                      {isVerifying
                        ? "Verifying..."
                        : "Verify"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-zinc-800 bg-zinc-950/60 px-5 py-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-semibold uppercase tracking-[0.15em] text-zinc-700">
            StreetGO Secure Finance
          </span>

          <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-[#26b14c]" />
            Admin Control
          </span>
        </div>
      </div>
    </section>
  )
}