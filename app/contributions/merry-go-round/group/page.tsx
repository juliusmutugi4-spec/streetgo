"use client"

import {
  useEffect,
  useMemo,
  useState,
  Suspense,
} from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { getSupabaseBrowser } from "@/app/lib/supabase-browser"

import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Wallet,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Copy,
  RefreshCw,
} from "lucide-react"

type Group = {
  id: string
  group_number: string
  name: string
  organizer_id: string
  member_limit: number
  contribution_amount: number
  frequency: "weekly" | "monthly"
  start_date: string
  status: string
  group_code?: string | null
}

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

type PaymentSummary = {
  pool_collected: number
  paid_members: number
  my_status: string
  my_receipt: string | null
}

type MemberPaymentStatus = {
  member_id: string
  member_number: number
  payment_status: string
  mpesa_receipt: string | null
  paid_at: string | null
}

function GroupDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowser()

  const groupIdFromUrl =
    searchParams.get("groupId")

  const groupNumberFromUrl =
    searchParams.get("groupNumber")

  const [group, setGroup] =
    useState<Group | null>(null)

  const [members, setMembers] =
    useState<Member[]>([])

  const [paymentSummary, setPaymentSummary] =
    useState<PaymentSummary>({
      pool_collected: 0,
      paid_members: 0,
      my_status: "due",
      my_receipt: null,
    })

  const [memberPaymentStatuses, setMemberPaymentStatuses] =
    useState<MemberPaymentStatus[]>([])

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState("")

  const [copied, setCopied] =
    useState(false)

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null)

  const loadGroup = async (
    showRefreshing = false
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError("")

      /*
       * ---------------------------------------------
       * Get logged-in user
       * ---------------------------------------------
       */

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser()

      if (userError || !user) {
        router.push("/login")
        return
      }

      setCurrentUserId(user.id)

      /*
       * ---------------------------------------------
       * Resolve group
       * ---------------------------------------------
       */

      let resolvedGroupId =
        groupIdFromUrl

      /*
       * If group ID was not supplied,
       * find the group using group number.
       */

      if (
        !resolvedGroupId &&
        groupNumberFromUrl
      ) {
        const {
          data: groupByNumber,
          error: groupNumberError,
        } = await supabase
          .from("contribution_groups")
          .select("*")
          .eq(
            "group_number",
            groupNumberFromUrl
          )
          .maybeSingle()

        if (groupNumberError) {
          throw groupNumberError
        }

        if (!groupByNumber) {
          throw new Error(
            "Merry-Go-Round group not found."
          )
        }

        resolvedGroupId =
          groupByNumber.id
      }

      /*
       * ---------------------------------------------
       * If there is still no group ID,
       * try the user's active membership.
       * ---------------------------------------------
       */

      if (!resolvedGroupId) {
        const {
          data: membership,
          error: membershipError,
        } = await supabase
          .from("contribution_members")
          .select("group_id")
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "status",
            "active"
          )
          .order(
            "joined_at",
            {
              ascending: false,
            }
          )
          .limit(1)
          .maybeSingle()

        if (membershipError) {
          throw membershipError
        }

        if (!membership) {
          throw new Error(
            "No active Merry-Go-Round group was found for your account."
          )
        }

        resolvedGroupId =
          membership.group_id
      }

      /*
       * ---------------------------------------------
       * Load group
       * ---------------------------------------------
       */

      const {
        data: groupData,
        error: groupError,
      } = await supabase
        .from("contribution_groups")
        .select("*")
        .eq(
          "id",
          resolvedGroupId
        )
        .maybeSingle()

      if (groupError) {
        throw groupError
      }

      if (!groupData) {
        throw new Error(
          "Merry-Go-Round group not found."
        )
      }

      /*
       * ---------------------------------------------
       * Load members
       * ---------------------------------------------
       */

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
          role,
          status,
          display_name,
          phone_number,
          phone_verified,
          joined_at,
          mpesa_first_name,
          mpesa_middle_name,
          mpesa_last_name
        `)
        .eq(
          "group_id",
          resolvedGroupId
        )
        .eq(
          "status",
          "active"
        )
        .order(
          "member_number",
          {
            ascending: true,
          }
        )

      if (memberError) {
        throw memberError
      }

      /*
       * ---------------------------------------------
       * Save group/member data
       * ---------------------------------------------
       */

      setGroup(groupData)
      setMembers(
        memberData || []
      )

      /*
       * ---------------------------------------------
       * Load secure payment summary
       * ---------------------------------------------
       */

      const {
        data: summaryData,
        error: summaryError,
      } = await supabase.rpc(
        "get_merry_go_round_payment_summary",
        {
          p_group_id:
            resolvedGroupId,
        }
      )

      if (summaryError) {
        throw summaryError
      }

      if (
        summaryData &&
        summaryData.length > 0
      ) {
        setPaymentSummary(
          summaryData[0]
        )
      } else {
        setPaymentSummary({
          pool_collected: 0,
          paid_members: 0,
          my_status: "due",
          my_receipt: null,
        })
      }

      /*
       * ---------------------------------------------
       * Load secure per-member payment statuses
       * ---------------------------------------------
       */

      const {
        data: memberPaymentData,
        error: memberPaymentError,
      } = await supabase.rpc(
        "get_merry_go_round_member_payment_status",
        {
          p_group_id:
            resolvedGroupId,
        }
      )

      if (memberPaymentError) {
        throw memberPaymentError
      }

      setMemberPaymentStatuses(
        memberPaymentData || []
      )
    } catch (err: any) {
      console.error(
        "GROUP DASHBOARD ERROR:",
        err
      )

      setError(
        err?.message ||
          "Unable to load Merry-Go-Round group."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  /*
   * ---------------------------------------------
   * Initial load
   * ---------------------------------------------
   */

  useEffect(() => {
    loadGroup()
  }, [
    groupIdFromUrl,
    groupNumberFromUrl,
  ])

  /*
   * ---------------------------------------------
   * Refresh
   * ---------------------------------------------
   */

  const handleRefresh = () => {
    loadGroup(true)
  }

  /*
   * ---------------------------------------------
   * Derived values
   * ---------------------------------------------
   */

  const contributionAmount =
    Number(
      group?.contribution_amount || 0
    )

  const memberLimit =
    Number(
      group?.member_limit || 0
    )

  const paidMembers =
    Number(
      paymentSummary.paid_members
    ) || 0

  const pool =
    Number(
      paymentSummary.pool_collected
    ) || 0

  const targetPool =
    contributionAmount *
    memberLimit

  const remaining =
    Math.max(
      targetPool - pool,
      0
    )

  const myPaymentStatus =
    paymentSummary.my_status ||
    "due"

  const slotsRemaining =
    Math.max(
      memberLimit -
        members.length,
      0
    )

  const progressPercent =
    targetPool > 0
      ? Math.min(
          (pool /
            targetPool) *
            100,
          100
        )
      : 0

  const myMember =
    members.find(
      (member) =>
        member.user_id ===
        currentUserId
    )

  const recipientMember =
    members.find(
      (member) =>
        member.member_number === 1
    )

  const recipientName =
    recipientMember
      ? [
          recipientMember.mpesa_first_name,
          recipientMember.mpesa_middle_name,
          recipientMember.mpesa_last_name,
        ]
          .filter(Boolean)
          .join(" ") ||
        recipientMember.display_name ||
        (recipientMember.role ===
        "organizer"
          ? "Organizer"
          : `Member #${recipientMember.member_number}`)
      : "Pending"

  const frequencyLabel =
    group?.frequency ===
    "weekly"
      ? "Weekly"
      : "Monthly"

  const formattedStartDate =
    group?.start_date
      ? new Date(
          `${group.start_date}T00:00:00`
        ).toLocaleDateString(
          "en-KE",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        )
      : "—"

  const copyGroupNumber =
    async () => {
      if (!group?.group_number) {
        return
      }

      try {
        await navigator.clipboard.writeText(
          group.group_number
        )

        setCopied(true)

        setTimeout(() => {
          setCopied(false)
        }, 1500)
      } catch {
        console.error(
          "Unable to copy group number"
        )
      }
    }

  const statusLabel =
    myPaymentStatus === "paid"
      ? "PAID"
      : myPaymentStatus ===
        "processing"
        ? "PROCESSING"
        : "DUE"

  const statusClass =
    myPaymentStatus === "paid"
      ? "bg-emerald-950 text-emerald-400"
      : myPaymentStatus ===
        "processing"
        ? "bg-blue-950 text-blue-400"
        : "bg-amber-950 text-amber-400"

  /*
   * ---------------------------------------------
   * Loading
   * ---------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-64 rounded-xl bg-white/10" />
            <div className="h-40 rounded-3xl bg-white/5" />
            <div className="h-64 rounded-3xl bg-white/5" />
          </div>
        </div>
      </main>
    )
  }

  /*
   * ---------------------------------------------
   * Error
   * ---------------------------------------------
   */

  if (error || !group) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
        <div className="mx-auto max-w-2xl">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="mb-6 flex items-center gap-2 text-sm font-bold text-white/60 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 text-red-400"
                size={22}
              />

              <div>
                <h1 className="text-lg font-black">
                  Unable to load group
                </h1>

                <p className="mt-2 text-sm text-red-200/80">
                  {error ||
                    "Merry-Go-Round group not found."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                loadGroup()
              }
              className="mt-5 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-900"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        {/* ----------------------------------------- */}
        {/* HEADER */}
        {/* ----------------------------------------- */}

        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <button
            type="button"
            onClick={
              handleRefresh
            }
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "REFRESHING"
              : "REFRESH"}
          </button>
        </div>

        {/* ----------------------------------------- */}
        {/* GROUP HERO */}
        {/* ----------------------------------------- */}

        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 p-6 shadow-2xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black tracking-widest text-emerald-300">
                MERRY-GO-ROUND
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {group.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white/50">
                  Group
                </span>

                <button
                  type="button"
                  onClick={
                    copyGroupNumber
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-xs font-black text-emerald-300 transition hover:bg-white/10"
                >
                  {group.group_number}

                  <Copy
                    size={13}
                  />
                </button>

                {copied && (
                  <span className="text-[10px] font-black text-emerald-400">
                    COPIED
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
              <div className="text-[10px] font-black tracking-widest text-white/40">
                CONTRIBUTION
              </div>

              <div className="mt-1 text-2xl font-black">
                KES{" "}
                {contributionAmount.toLocaleString()}
              </div>

              <div className="mt-1 text-xs font-bold text-white/40">
                {frequencyLabel}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------- */}
        {/* PAYMENT SUMMARY */}
        {/* ----------------------------------------- */}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-400/10 p-3">
                <Wallet
                  size={20}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest text-white/40">
                  POOL COLLECTED
                </div>

                <div className="mt-1 text-2xl font-black">
                  KES{" "}
                  {pool.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{
                  width: `${progressPercent}%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] font-bold text-white/40">
              <span>
                KES{" "}
                {pool.toLocaleString()}
              </span>

              <span>
                KES{" "}
                {targetPool.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-400/10 p-3">
                <Users
                  size={20}
                  className="text-blue-400"
                />
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest text-white/40">
                  MEMBERS PAID
                </div>

                <div className="mt-1 text-2xl font-black">
                  {paidMembers}
                  {" / "}
                  {memberLimit}
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs font-bold text-white/40">
              {slotsRemaining}{" "}
              {slotsRemaining === 1
                ? "member"
                : "members"}{" "}
              still needed to fill the group.
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-400/10 p-3">
                {myPaymentStatus ===
                "paid" ? (
                  <CheckCircle2
                    size={20}
                    className="text-emerald-400"
                  />
                ) : (
                  <Clock3
                    size={20}
                    className="text-amber-400"
                  />
                )}
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest text-white/40">
                  YOUR CONTRIBUTION
                </div>

                <div className="mt-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            {paymentSummary.my_receipt && (
              <div className="mt-4 text-xs font-bold text-white/40">
                Receipt:{" "}
                <span className="font-mono text-white/70">
                  {
                    paymentSummary.my_receipt
                  }
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ----------------------------------------- */}
        {/* YOUR PAYMENT MESSAGE */}
        {/* ----------------------------------------- */}

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-start gap-3">
            {myPaymentStatus ===
            "paid" ? (
              <CheckCircle2
                className="mt-0.5 text-emerald-400"
                size={21}
              />
            ) : myPaymentStatus ===
              "processing" ? (
              <Clock3
                className="mt-0.5 text-blue-400"
                size={21}
              />
            ) : (
              <AlertCircle
                className="mt-0.5 text-amber-400"
                size={21}
              />
            )}

            <div>
              <div className="text-sm font-black">
                {myPaymentStatus ===
                "paid"
                  ? "Contribution confirmed"
                  : myPaymentStatus ===
                    "processing"
                    ? "Payment processing"
                    : "Contribution required"}
              </div>

              <p className="mt-1 text-xs font-medium leading-5 text-white/50">
                {myPaymentStatus ===
                "paid"
                  ? `Payment confirmed${
                      paymentSummary.my_receipt
                        ? ` • Receipt ${paymentSummary.my_receipt}`
                        : ""
                    }.`
                  : myPaymentStatus ===
                    "processing"
                    ? "Your M-PESA payment is being confirmed."
                    : "Your contribution is required before this round can be fully settled."}
              </p>
            </div>
          </div>

          {/* --------------------------------------- */}
          {/* PAY BUTTON */}
          {/* --------------------------------------- */}

          {myPaymentStatus !==
            "paid" && (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/contributions/merry-go-round/group/pay?groupId=${encodeURIComponent(
                    group.id
                  )}`
                )
              }
              disabled={
                myPaymentStatus ===
                "processing"
              }
              className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {myPaymentStatus ===
              "processing"
                ? "PAYMENT PROCESSING..."
                : `PAY KES ${contributionAmount.toLocaleString()}`}
            </button>
          )}
        </section>

        {/* ----------------------------------------- */}
        {/* GROUP INFORMATION */}
        {/* ----------------------------------------- */}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <CalendarDays
              size={20}
              className="text-emerald-400"
            />

            <div className="mt-4 text-[10px] font-black tracking-widest text-white/40">
              START DATE
            </div>

            <div className="mt-1 text-sm font-black">
              {formattedStartDate}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <Users
              size={20}
              className="text-blue-400"
            />

            <div className="mt-4 text-[10px] font-black tracking-widest text-white/40">
              GROUP SIZE
            </div>

            <div className="mt-1 text-sm font-black">
              {members.length} /{" "}
              {memberLimit} members
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <ShieldCheck
              size={20}
              className="text-purple-400"
            />

            <div className="mt-4 text-[10px] font-black tracking-widest text-white/40">
              SECURITY
            </div>

            <div className="mt-1 text-sm font-black">
              Verified contribution ledger
            </div>
          </div>
        </section>

        {/* ----------------------------------------- */}
        {/* MEMBERS */}
        {/* ----------------------------------------- */}

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black">
                Members
              </h2>

              <p className="mt-1 text-xs font-medium text-white/40">
                Active members in this Merry-Go-Round
              </p>
            </div>

            <div className="rounded-xl bg-white/5 px-3 py-2 text-xs font-black text-white/60">
              {members.length} /{" "}
              {memberLimit}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {members.map(
              (member) => {
                const memberName =
                  [
                    member.mpesa_first_name,
                    member.mpesa_middle_name,
                    member.mpesa_last_name,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                  member.display_name ||
                  (member.user_id ===
                  currentUserId
                    ? "You"
                    : member.role ===
                      "organizer"
                      ? "Organizer"
                      : `Member #${member.member_number}`)

                const phone =
                  member.phone_number

                const maskedPhone =
                  phone
                    ? `${phone.slice(
                        0,
                        4
                      )}****${phone.slice(
                        -2
                      )}`
                    : null

                const isMe =
                  member.user_id ===
                  currentUserId

                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
                      isMe
                        ? "border-emerald-400/20 bg-emerald-400/5"
                        : "border-white/5 bg-black/10"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xs font-black text-white/60">
                        #
                        {
                          member.member_number
                        }
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-black">
                          {memberName}

                          {isMe && (
                            <span className="ml-2 text-[10px] font-black text-emerald-400">
                              YOU
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] font-bold text-white/40">
                          <span>
                            Member code:{" "}
                            {member.member_code ||
                              "Pending"}
                          </span>

                          {member.role ===
                            "organizer" && (
                            <span className="rounded-full bg-purple-400/10 px-2 py-0.5 text-purple-300">
                              ORGANIZER
                            </span>
                          )}

                          {member.phone_verified && (
                            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-emerald-300">
                              PHONE VERIFIED
                            </span>
                          )}
                        </div>

                        {maskedPhone && (
                          <div className="mt-1 text-[10px] font-bold text-white/30">
                            {maskedPhone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {(() => {
                        const memberPayment =
                          memberPaymentStatuses.find(
                            (payment) =>
                              payment.member_id ===
                              member.id
                          )

                        const memberPaymentStatus =
                          memberPayment?.payment_status ||
                          "due"

                        if (
                          memberPaymentStatus ===
                          "paid"
                        ) {
                          return (
                            <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                              <CheckCircle2
                                size={14}
                              />
                              PAID
                            </div>
                          )
                        }

                        if (
                          memberPaymentStatus ===
                          "processing"
                        ) {
                          return (
                            <div className="flex items-center gap-1 text-[10px] font-black text-blue-400">
                              <Clock3
                                size={14}
                              />
                              PROCESSING
                            </div>
                          )
                        }

                        return (
                          <div className="text-[10px] font-black text-white/30">
                            DUE
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )
              }
            )}
          </div>

          {slotsRemaining > 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-center">
              <div className="text-xs font-black text-white/50">
                {slotsRemaining}{" "}
                {slotsRemaining === 1
                  ? "slot"
                  : "slots"}{" "}
                remaining
              </div>

              <div className="mt-1 text-[10px] font-medium text-white/30">
                Invite members using the group number.
              </div>
            </div>
          )}
        </section>

        {/* ----------------------------------------- */}
        {/* CURRENT MEMBER */}
        {/* ----------------------------------------- */}

        {myMember && (
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
                      #
                      {
                        myMember.member_number
                      }
                    </span>
                  </div>

                  <div>
                    Member code:{" "}
                    <span className="font-mono font-black text-emerald-300">
                      {myMember.member_code ||
                        "Pending"}
                    </span>
                  </div>

                  <div>
                    Phone:{" "}
                    <span className="font-black text-white/80">
                      {myMember.phone_number ||
                        "Not provided"}
                    </span>
                  </div>

                  <div>
                    Verification:{" "}
                    <span
                      className={
                        myMember.phone_verified
                          ? "font-black text-emerald-400"
                          : "font-black text-amber-400"
                      }
                    >
                      {myMember.phone_verified
                        ? "VERIFIED"
                        : "NOT VERIFIED"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ----------------------------------------- */}
        {/* ROUND INFORMATION */}
        {/* ----------------------------------------- */}

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-black">
            Round overview
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-[10px] font-black tracking-widest text-white/30">
                TARGET
              </div>

              <div className="mt-1 text-lg font-black">
                KES{" "}
                {targetPool.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-widest text-white/30">
                COLLECTED
              </div>

              <div className="mt-1 text-lg font-black text-emerald-400">
                KES{" "}
                {pool.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-widest text-white/30">
                REMAINING
              </div>

              <div className="mt-1 text-lg font-black">
                KES{" "}
                {remaining.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-widest text-white/30">
                RECIPIENT
              </div>

              <div className="mt-1 truncate text-lg font-black">
                {recipientName}
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------- */}
        {/* SECURITY */}
        {/* ----------------------------------------- */}

        <section className="mt-5 rounded-3xl border border-emerald-400/10 bg-emerald-400/[0.03] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-emerald-400"
            />

            <div>
              <div className="text-sm font-black">
                Contribution security
              </div>

              <p className="mt-1 text-xs font-medium leading-5 text-white/40">
                Payments are recorded through the StreetGO
                contribution ledger. The collected amount is
                calculated from confirmed M-PESA transactions.
                Members cannot manually edit the contribution
                balance.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

/*
 * ---------------------------------------------
 * LOADING STATE FOR SUSPENSE
 * ---------------------------------------------
 */

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="animate-pulse space-y-5">
          <div className="h-8 w-64 rounded-xl bg-white/10" />
          <div className="h-40 rounded-3xl bg-white/5" />
          <div className="h-64 rounded-3xl bg-white/5" />
        </div>
      </div>
    </main>
  )
}

/*
 * ---------------------------------------------
 * PAGE
 * ---------------------------------------------
 */

export default function GroupDashboardPage() {
  return (
    <Suspense
      fallback={
        <LoadingState />
      }
    >
      <GroupDashboardContent />
    </Suspense>
  )
}