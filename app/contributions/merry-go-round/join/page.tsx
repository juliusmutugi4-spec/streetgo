"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  CheckCircle2,
} from "lucide-react"
import { supabase } from "@/app/lib/supabase"

type Group = {
  id: string
  group_number: string
  name: string
  member_limit: number
  contribution_amount: number
  frequency: "weekly" | "monthly"
  start_date: string
  status: "forming" | "active" | "completed" | "cancelled"
}

type Member = {
  id: string
  user_id: string
  member_number: number
  member_code: string | null
  display_name: string | null
  phone_verified: boolean
  status: "active" | "left" | "removed"
}

export default function JoinMerryGoRoundPage() {
  const router = useRouter()

  const [groupCode, setGroupCode] = useState("")
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const findGroup = async () => {
    const code = groupCode.trim().toUpperCase()

    if (!code) return

    setLoading(true)
    setError("")
    setGroup(null)
    setMembers([])

    try {
      // Make sure user is authenticated
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw userError
      }

      if (!user) {
        router.push("/login")
        return
      }

      // Find the real group
      const {
        data: groupData,
        error: groupError,
      } = await supabase
        .from("contribution_groups")
        .select(`
          id,
          group_number,
          name,
          member_limit,
          contribution_amount,
          frequency,
          start_date,
          status
        `)
        .eq("group_number", code)
        .eq("status", "forming")
        .maybeSingle()

      if (groupError) {
        throw groupError
      }

      if (!groupData) {
        setError(
          "No active forming group was found with that group number."
        )
        return
      }

      // Get current real members
      const {
        data: memberData,
        error: memberError,
      } = await supabase
        .from("contribution_members")
        .select(`
          id,
          user_id,
          member_number,
          member_code,
          display_name,
          phone_verified,
          status
        `)
        .eq("group_id", groupData.id)
        .eq("status", "active")
        .order("member_number", {
          ascending: true,
        })

      if (memberError) {
        throw memberError
      }

      const activeMembers = memberData || []

      // Check if group is full
      if (
        activeMembers.length >=
        groupData.member_limit
      ) {
        setError(
          "This Merry-Go-Round is already full."
        )
        return
      }

      // Check whether this user is already a member
      const alreadyMember = activeMembers.some(
        (member: Member) =>
          member.user_id === user.id
      )

      if (alreadyMember) {
        setError(
          "You are already a member of this Merry-Go-Round."
        )
        return
      }

      setGroup(groupData)
      setMembers(activeMembers)
    } catch (err: any) {
      console.error(
        "FIND MERRY-GO-ROUND ERROR:",
        JSON.stringify(
          err,
          Object.getOwnPropertyNames(err),
          2
        )
      )

      setError(
        err?.message ||
          err?.details ||
          "Unable to find this group."
      )
    } finally {
      setLoading(false)
    }
  }

  const remainingSlots =
    group
      ? group.member_limit - members.length
      : 0

  const pool =
    group
      ? group.member_limit *
        Number(group.contribution_amount)
      : 0

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/95 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-2xl items-center px-4">

          <button
            onClick={() => router.back()}
            className="mr-3 rounded-full p-2 hover:bg-white/10"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-lg font-black">
              JOIN MERRY-GO-ROUND
            </h1>

            <p className="text-[11px] text-slate-400">
              Find your group
            </p>
          </div>

        </div>

      </header>

      <section className="mx-auto max-w-2xl px-5 py-10">

        {!group ? (

          <>
            <div className="mb-8">

              <div className="mb-3 text-4xl">
                🔑
              </div>

              <h2 className="text-3xl font-black">
                Enter group number
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Enter the special number given to you by
                the organizer.
              </p>

            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

              <label className="mb-2 block text-sm font-bold">
                Group number
              </label>

              <input
                type="text"
                value={groupCode}
                onChange={(e) =>
                  setGroupCode(
                    e.target.value.toUpperCase()
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    findGroup()
                  }
                }}
                placeholder="4995"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-4 font-mono text-lg tracking-wider text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />

              {error && (
                <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">

                  <p className="text-sm font-bold text-red-300">
                    Group not found
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-200/70">
                    {error}
                  </p>

                </div>
              )}

              <button
                type="button"
                disabled={
                  !groupCode.trim() ||
                  loading
                }
                onClick={findGroup}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-4 font-black text-[#02130b] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Search size={20} />

                {loading
                  ? "SEARCHING..."
                  : "FIND GROUP"}
              </button>

            </div>
          </>

        ) : (

          <>
            <div className="mb-8">

              <div className="mb-3 text-4xl">
                🔄
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Group found
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {group.name}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Merry-Go-Round
              </p>

              <div className="mt-3 inline-flex rounded-full border border-blue-900/60 bg-blue-950/30 px-3 py-1">

                <span className="font-mono text-[11px] font-black tracking-wider text-blue-300">
                  {group.group_number}
                </span>

              </div>

            </div>

            <div className="space-y-4">

              {/* Group information */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

                <div className="grid grid-cols-2 gap-5">

                  <div>
                    <p className="text-xs text-slate-500">
                      Members
                    </p>

                    <p className="mt-1 text-xl font-black">
                      {members.length} / {group.member_limit}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Contribution
                    </p>

                    <p className="mt-1 text-xl font-black">
                      KES{" "}
                      {Number(
                        group.contribution_amount
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Frequency
                    </p>

                    <p className="mt-1 text-xl font-black capitalize">
                      {group.frequency}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Pool
                    </p>

                    <p className="mt-1 text-xl font-black text-emerald-400">
                      KES {pool.toLocaleString()}
                    </p>
                  </div>

                </div>

              </div>

              {/* Current members */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">

                <p className="mb-4 text-sm font-black">
                  Current members
                </p>

                <div className="space-y-3">

                  {members.map((member) => (

                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-black text-emerald-400">
                          {member.member_number}
                        </div>

                        <div>

                          <p className="font-bold">
                            {member.display_name ||
                              `Member #${member.member_number}`}
                          </p>

                          {member.member_code && (
                            <p className="text-[10px] text-slate-500">
                              Code: {member.member_code}
                            </p>
                          )}

                          {member.phone_verified && (
                            <p className="mt-1 text-[10px] font-bold text-emerald-400">
                              ✓ Safaricom Verified
                            </p>
                          )}

                        </div>

                      </div>

                      <CheckCircle2
                        size={18}
                        className="text-emerald-400"
                      />

                    </div>

                  ))}

                  <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-slate-500">
                    {remainingSlots}{" "}
                    {remainingSlots === 1
                      ? "member slot"
                      : "member slots"}{" "}
                    available
                  </div>

                </div>

              </div>

              {/* Security notice */}
              <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.05] p-5">

                <p className="text-sm font-black text-amber-300">
                  Before joining
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  You will create or use your StreetGO
                  account and verify your Safaricom number.
                  Payment integration will be connected
                  separately.
                </p>

              </div>

              {/* Join */}
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/contributions/merry-go-round/join/account?groupId=${encodeURIComponent(
                      group.id
                    )}&groupNumber=${encodeURIComponent(
                      group.group_number
                    )}`
                  )
                }
                className="w-full rounded-2xl bg-emerald-400 px-5 py-4 font-black text-[#02130b] transition hover:bg-emerald-300"
              >
                JOIN THIS GROUP
              </button>

              <button
                type="button"
                onClick={() => {
                  setGroup(null)
                  setMembers([])
                  setError("")
                }}
                className="w-full rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-300 hover:bg-white/[0.05]"
              >
                USE A DIFFERENT GROUP NUMBER
              </button>

            </div>
          </>

        )}

      </section>

    </main>
  )
}