"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

type Group = {
  id: string
  group_number: string
  name: string
  organizer_id: string
  member_limit: number
  contribution_amount: number
  frequency: string
  start_date: string
  status: string
  created_at: string
}

type Member = {
  id: string
  group_id: string
  user_id: string
  member_number: number
  role: "organizer" | "member"
  status: "active" | "left" | "removed"
  joined_at: string

  display_name: string | null
  phone_number: string | null
  phone_verified: boolean

  mpesa_first_name: string | null
  mpesa_middle_name: string | null
  mpesa_last_name: string | null
}
function MerryGoRoundGroupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const groupId = searchParams.get("groupId")

  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Prevent multiple simultaneous loadGroup requests.
  const loadingGroupRef = useRef(false)

  useEffect(() => {
    loadGroup()
  }, [groupId])

  async function loadGroup() {
    if (loadingGroupRef.current) {
      return
    }

    loadingGroupRef.current = true

    setLoading(true)
    setError("")

    try {
      // =====================================================
      // 1. GET CURRENT USER
      // =====================================================

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

      setCurrentUserId(user.id)

      // =====================================================
      // 2. FIND GROUP
      // =====================================================

      let foundGroup: Group | null = null

      if (groupId) {
        const {
          data,
          error: groupError,
        } = await supabase
          .from("contribution_groups")
          .select(`
            id,
            group_number,
            name,
            organizer_id,
            member_limit,
            contribution_amount,
            frequency,
            start_date,
            status,
            created_at
          `)
          .eq("id", groupId)
          .single()

        if (groupError) {
          console.error(
            "GROUP LOAD ERROR:",
            JSON.stringify(groupError, null, 2)
          )

          throw new Error(
            groupError.message || "Unable to load this group."
          )
        }

        foundGroup = data
      } else {
        // =====================================================
        // 3. NO GROUP ID
        // FIND A GROUP WHERE USER IS A MEMBER
        // =====================================================

        const {
          data: membership,
          error: membershipError,
        } = await supabase
          .from("contribution_members")
          .select("group_id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("joined_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle()

        if (membershipError) {
          console.error(
            "MEMBERSHIP LOOKUP ERROR:",
            JSON.stringify(membershipError, null, 2)
          )

          throw new Error(
            membershipError.message ||
              "Unable to find your contribution group."
          )
        }

        if (!membership) {
          throw new Error(
            "No Merry-Go-Round group was found for your account."
          )
        }

        const {
          data,
          error: groupError,
        } = await supabase
          .from("contribution_groups")
          .select(`
            id,
            group_number,
            name,
            organizer_id,
            member_limit,
            contribution_amount,
            frequency,
            start_date,
            status,
            created_at
          `)
          .eq("id", membership.group_id)
          .single()

        if (groupError) {
          console.error(
            "MEMBER GROUP LOAD ERROR:",
            JSON.stringify(groupError, null, 2)
          )

          throw new Error(
            groupError.message ||
              "Unable to load your contribution group."
          )
        }

        foundGroup = data
      }

      if (!foundGroup) {
        throw new Error("Group was not found.")
      }

      setGroup(foundGroup)

      // =====================================================
      // 4. LOAD REAL GROUP MEMBERS
      // =====================================================

      const {
        data: memberData,
        error: memberError,
      } = await supabase
        .from("contribution_members")
.select(`
  id,
  group_id,
  user_id,
  member_number,
  role,
  status,
  joined_at,
  display_name,
  phone_number,
  phone_verified,
  mpesa_first_name,
  mpesa_middle_name,
  mpesa_last_name
`)
        .eq("group_id", foundGroup.id)
        .eq("status", "active")
        .order("member_number", {
          ascending: true,
        })

      if (memberError) {
        console.error(
          "MEMBERS LOAD ERROR:",
          JSON.stringify(memberError, null, 2)
        )

        throw new Error(
          memberError.message ||
            "Unable to load group members."
        )
      }

      setMembers(memberData || [])
    } catch (err: any) {
      console.error(
        "LOAD MERRY-GO-ROUND ERROR:",
        JSON.stringify(
          err,
          Object.getOwnPropertyNames(err),
          2
        )
      )

      setError(
        err?.message ||
          "Unable to load group."
      )
    } finally {
      loadingGroupRef.current = false
      setLoading(false)
    }
  }

  // =====================================================
  // CALCULATIONS
  // =====================================================

  const target = useMemo(() => {
    if (!group) return 0

    return (
      Number(group.member_limit) *
      Number(group.contribution_amount)
    )
  }, [group])

  const memberCount = members.length

  const remainingSlots = group
    ? Math.max(
        Number(group.member_limit) - memberCount,
        0
      )
    : 0

  const currentMember = members.find(
    (member) => member.user_id === currentUserId
  )

  const isOrganizer =
    currentMember?.role === "organizer" ||
    group?.organizer_id === currentUserId

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-6">
            <p className="text-xs font-black tracking-[0.2em] text-emerald-400">
              STREETGO CONTRIBUTIONS
            </p>

            <h1 className="mt-3 text-2xl font-black">
              Loading group...
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Please wait while StreetGO loads your
              Merry-Go-Round.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !group) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-red-500/30 bg-red-950/30 p-6">
            <p className="text-xs font-black tracking-[0.2em] text-red-400">
              GROUP ERROR
            </p>

            <h1 className="mt-3 text-2xl font-black">
              Unable to load group
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-200/70">
              {error || "Group was not found."}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/contributions")
            }
            className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d]"
          >
            BACK TO CONTRIBUTIONS
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        {/* HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.push("/contributions")
            }
            className="text-xs font-black text-blue-300"
          >
            ← MY CONTRIBUTIONS
          </button>

          <p className="mt-5 text-xs font-black tracking-[0.2em] text-emerald-400">
            MERRY-GO-ROUND
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {group.name}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Group contribution dashboard
          </p>

          <div className="mt-3 inline-flex rounded-full bg-blue-950 px-3 py-1 text-[10px] font-black text-blue-300">
            {group.group_number}
          </div>
        </div>

        {/* CURRENT ROUND */}

        <section className="rounded-3xl border border-blue-900/60 bg-[#071426] p-5 shadow-2xl">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Current Round
              </p>

              <h2 className="mt-1 text-xl font-black">
                Round 1 of {group.member_limit}
              </h2>
            </div>

            <div className="rounded-xl bg-blue-900/70 px-4 py-3 text-center">
              <p className="text-[9px] font-black text-blue-300">
                MEMBERS
              </p>

              <p className="mt-1 text-lg font-black">
                {memberCount}/{group.member_limit}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-[#020b18] p-4">

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Pool Collected
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-400">
                  KES 0
                </p>
              </div>

              <p className="text-xs font-black text-slate-400">
                / KES {target.toLocaleString()}
              </p>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: "0%" }}
              />
            </div>

            <p className="mt-2 text-[10px] text-slate-600">
              0 of {group.member_limit} members have paid
            </p>

          </div>
        </section>

        {/* YOUR CONTRIBUTION */}

        <section className="mt-4 rounded-3xl border border-blue-900/60 bg-[#071426] p-5">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-300">
                Your Contribution
              </p>

              <p className="mt-1 text-2xl font-black">
                KES{" "}
                {Number(
                  group.contribution_amount
                ).toLocaleString()}
              </p>
            </div>

            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[9px] font-black text-amber-400">
              DUE
            </span>
          </div>

          <p className="mt-3 text-[10px] leading-5 text-slate-500">
            Your contribution is required before this
            round can be fully settled.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/contributions/merry-go-round/group/pay?groupId=${encodeURIComponent(
                  group.id
                )}`
              )
            }
            className="mt-4 w-full rounded-xl bg-emerald-400 px-5 py-3 text-xs font-black text-[#03130d]"
          >
            PAY KES{" "}
            {Number(
              group.contribution_amount
            ).toLocaleString()}
          </button>
        </section>

        {/* CURRENT RECIPIENT */}

        <section className="mt-4 rounded-3xl border border-emerald-900/60 bg-[#03141b] p-5">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Current Recipient
              </p>

              <h2 className="mt-2 text-lg font-black">
                Waiting for members
              </h2>

              <p className="text-[10px] text-slate-500">
                Round 1 recipient
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-slate-500">
                PAYOUT
              </p>

              <p className="text-lg font-black">
                KES {target.toLocaleString()}
              </p>
            </div>

          </div>

          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">

            <p className="text-[10px] font-black text-amber-400">
              WAITING FOR CONTRIBUTIONS
            </p>

            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              B2C payout cannot start until every required
              contribution is confirmed.
            </p>

          </div>
        </section>

        {/* MEMBERS */}

        <section className="mt-4 rounded-3xl border border-blue-900/60 bg-[#071426] p-5">

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">
              Members
            </h2>

            <span className="text-[10px] font-black text-slate-500">
              {memberCount}/{group.member_limit}
            </span>
          </div>

          {members.map((member) => (
            <div
              key={member.id}
              className="mt-4 rounded-2xl bg-[#020b18] p-4"
            >
              <p className="text-[9px] font-black uppercase text-slate-600">
                Member #{member.member_number}
              </p>

<p className="mt-1 font-black">
  {member.mpesa_first_name ||
  member.mpesa_middle_name ||
  member.mpesa_last_name
    ? [
        member.mpesa_first_name,
        member.mpesa_middle_name,
        member.mpesa_last_name,
      ]
        .filter(Boolean)
        .join(" ")
    : member.display_name ||
      (member.user_id === currentUserId
        ? "You"
        : member.role === "organizer"
          ? "Organizer"
          : `Member #${member.member_number}`)}
</p>

{member.phone_number && (
  <p className="mt-1 text-[10px] text-slate-500">
    {member.phone_number.length >= 6
      ? `${member.phone_number.slice(0, 2)}••• •••${member.phone_number.slice(-3)}`
      : member.phone_number}
  </p>
)}

              <div className="mt-2 flex items-center justify-between">

                <span className="text-[9px] font-black text-blue-300">
                  {member.role === "organizer"
                    ? "ORGANIZER"
                    : "MEMBER"}
                </span>

                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[8px] font-black text-emerald-400">
                  ACTIVE
                </span>

              </div>
            </div>
          ))}

          {remainingSlots > 0 && (
            <div className="mt-3 rounded-2xl border border-dashed border-blue-900/60 bg-blue-950/10 p-4 text-center">

              <p className="text-sm font-black text-blue-300">
                {remainingSlots}{" "}
                {remainingSlots === 1
                  ? "slot"
                  : "slots"}{" "}
                remaining
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                Share this group number with the people
                you want to invite.
              </p>

              <div className="mt-4 rounded-xl bg-blue-950/70 px-3 py-3">

                <p className="text-[8px] font-black uppercase text-blue-400">
                  Group Number
                </p>

                <p className="mt-1 font-mono text-sm font-black tracking-wider">
                  {group.group_number}
                </p>

              </div>

            </div>
          )}

          {remainingSlots === 0 && (
            <div className="mt-3 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-4 text-center">

              <p className="text-sm font-black text-emerald-400">
                GROUP FULL
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                All member positions have been filled.
              </p>

            </div>
          )}

        </section>

        {/* ROUND HISTORY */}

        <section className="mt-4 rounded-3xl border border-blue-900/60 bg-[#071426] p-5">

          <h2 className="text-lg font-black">
            Round History
          </h2>

          <div className="mt-4 rounded-2xl bg-[#020b18] p-4">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-xs font-black">
                  Round 1
                </p>

                <p className="mt-1 text-[10px] text-slate-500">
                  Waiting for members
                </p>
              </div>

              <div className="text-right">

                <p className="text-sm font-black">
                  KES {target.toLocaleString()}
                </p>

                <p className="mt-1 text-[9px] font-black text-amber-400">
                  NOT STARTED
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* SECURITY */}

        <div className="mt-5 rounded-3xl border border-amber-900/40 bg-amber-950/20 p-5">

          <p className="text-sm font-black text-amber-300">
            StreetGO Security
          </p>

          <p className="mt-2 text-xs leading-5 text-amber-100/70">
            Contributions and payouts will be recorded
            by StreetGO. The group cannot begin payout
            until the required contributions are confirmed.
          </p>

        </div>

      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-6">
          <p className="text-xs font-black tracking-[0.2em] text-emerald-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-3 text-2xl font-black">
            Loading group...
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Please wait while StreetGO loads your Merry-Go-Round.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function MerryGoRoundGroupPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MerryGoRoundGroupContent />
    </Suspense>
  )
}