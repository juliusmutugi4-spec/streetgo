"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

type Group = {
  id: string
  group_number: string
  name: string
  member_limit: number
  contribution_amount: number
  frequency: string
  status: string
}

type Member = {
  id: string
  member_code: string
  member_number: number
  phone_number: string | null
  phone_verified: boolean
  display_name: string | null
}

function ContributionPayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const groupId = searchParams.get("groupId")

  const [group, setGroup] = useState<Group | null>(null)
  const [member, setMember] = useState<Member | null>(null)

  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadPaymentDetails()
  }, [groupId])

  async function loadPaymentDetails() {
    try {
      setLoading(true)
      setError("")
      setMessage("")

      if (!groupId) {
        throw new Error("Contribution group was not specified.")
      }

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

      // Load the real group
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
          status
        `)
        .eq("id", groupId)
        .single()

      if (groupError) {
        throw new Error(
          groupError.message || "Unable to load contribution group."
        )
      }

      if (!groupData) {
        throw new Error("Contribution group was not found.")
      }

      setGroup(groupData)

      // Load the logged-in user's membership in this group
      const {
        data: memberData,
        error: memberError,
      } = await supabase
        .from("contribution_members")
        .select(`
          id,
          member_code,
          member_number,
          phone_number,
          phone_verified,
          display_name
        `)
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (memberError) {
        throw new Error(
          memberError.message ||
            "You are not an active member of this contribution group."
        )
      }

      if (!memberData) {
        throw new Error(
          "You are not an active member of this contribution group."
        )
      }

      setMember(memberData)
    } catch (err: any) {
      console.error("CONTRIBUTION PAYMENT LOAD ERROR:", err)

      setError(
        err?.message ||
          "Unable to load contribution payment details."
      )
    } finally {
      setLoading(false)
    }
  }

  async function requestMpesaPayment() {
    try {
      setPaying(true)
      setError("")
      setMessage("")

      if (!group) {
        throw new Error("Contribution group is not loaded.")
      }

      if (!member) {
        throw new Error("Your membership could not be found.")
      }

      if (!groupId) {
        throw new Error("Contribution group was not specified.")
      }

      if (!member.phone_number) {
        throw new Error(
          "Your Safaricom phone number is not available. Please verify your number first."
        )
      }

      if (!member.phone_verified) {
        throw new Error(
          "Your Safaricom number has not been verified yet."
        )
      }

      /*
       * Get the current authenticated session.
       * The STK API uses this token to securely identify
       * the logged-in StreetGO member.
       */
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error(
          "Your StreetGO session has expired. Please log in again."
        )
      }

      setMessage("Creating your contribution payment...")

      const response = await fetch(
        "/api/mpesa/stk/contribution",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            groupId,
            phone: member.phone_number,
          }),
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "StreetGO could not start the M-PESA payment."
        )
      }

      if (!data) {
        throw new Error(
          "StreetGO received an empty response from the payment service."
        )
      }

      console.log(
        "STREETGO CONTRIBUTION STK RESPONSE:",
        data
      )

      setMessage(
        "M-PESA request sent. Check your Safaricom phone and enter your M-PESA PIN to approve the contribution."
      )
    } catch (err: any) {
      console.error(
        "CONTRIBUTION STK PUSH ERROR:",
        err
      )

      setError(
        err?.message ||
          "Unable to start the M-PESA payment."
      )

      setMessage("")
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-6">
            <p className="text-xs font-black tracking-[0.2em] text-emerald-400">
              STREETGO CONTRIBUTIONS
            </p>

            <h1 className="mt-3 text-2xl font-black">
              Loading payment...
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Loading your contribution details.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (error && !group) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-md">

          <div className="rounded-3xl border border-red-500/30 bg-red-950/30 p-6">
            <p className="text-xs font-black tracking-[0.2em] text-red-400">
              PAYMENT ERROR
            </p>

            <h1 className="mt-3 text-2xl font-black">
              Unable to load payment
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-200/70">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/contributions/merry-go-round/group"
              )
            }
            className="mt-5 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d]"
          >
            BACK TO GROUP
          </button>

        </div>
      </main>
    )
  }

  if (!group || !member) {
    return null
  }

  const amount = Number(group.contribution_amount)

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.push(
              `/contributions/merry-go-round/group?groupId=${encodeURIComponent(
                group.id
              )}`
            )
          }
          className="mb-8 text-sm font-bold text-blue-300"
        >
          ← BACK TO GROUP
        </button>

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-xs font-black tracking-[0.2em] text-emerald-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Make Contribution
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Confirm your contribution before requesting
            M-PESA payment.
          </p>

        </div>

        {/* PAYMENT CARD */}

        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-5 shadow-2xl">

          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Contribution Group
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {group.name}
          </h2>

          <div className="mt-2 inline-flex rounded-full bg-blue-950 px-3 py-1">
            <span className="text-[10px] font-black tracking-wider text-blue-300">
              GROUP {group.group_number}
            </span>
          </div>

          {/* MEMBER */}

          <div className="mt-5 rounded-2xl border border-slate-800 bg-[#020b18] p-4">

            <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
              Your StreetGO Membership
            </p>

            <p className="mt-2 text-lg font-black">
              {member.display_name || "You"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Member #{member.member_number}
            </p>

            <div className="mt-3 flex items-center justify-between">

              <span className="font-mono text-xs font-black text-blue-300">
                {member.member_code}
              </span>

              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[8px] font-black text-emerald-400">
                {member.phone_verified
                  ? "NUMBER VERIFIED"
                  : "NOT VERIFIED"}
              </span>

            </div>

          </div>

          {/* AMOUNT */}

          <div className="mt-6 rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-5 text-center">

            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Amount Due
            </p>

            <p className="mt-2 text-4xl font-black text-white">
              KES {amount.toLocaleString()}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Current contribution
            </p>

          </div>

          {/* DETAILS */}

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">

              <span className="text-sm text-slate-400">
                Frequency
              </span>

              <span className="font-bold capitalize">
                {group.frequency}
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-sm text-slate-400">
                Group size
              </span>

              <span className="font-bold">
                {group.member_limit} members
              </span>

            </div>

          </div>

          {/* PAYMENT NOTICE */}

          <div className="mt-6 rounded-2xl border border-blue-900/50 bg-blue-950/20 p-4">

            <p className="text-xs font-black text-blue-300">
              M-PESA PAYMENT
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              StreetGO will send an M-PESA payment request
              to your verified Safaricom number.
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              You will approve the payment on your phone.
              StreetGO will never ask for your M-PESA PIN.
            </p>

          </div>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4">

              <p className="text-xs font-black text-emerald-400">
                M-PESA REQUEST
              </p>

              <p className="mt-2 text-xs leading-5 text-emerald-100/80">
                {message}
              </p>

            </div>
          )}

          {/* ERROR MESSAGE */}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-950/30 p-4">

              <p className="text-xs font-black text-red-400">
                PAYMENT ERROR
              </p>

              <p className="mt-2 text-xs leading-5 text-red-100/80">
                {error}
              </p>

            </div>
          )}

          {/* PAY BUTTON */}

          <button
            type="button"
            disabled={paying}
            onClick={requestMpesaPayment}
            className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paying
              ? "SENDING M-PESA REQUEST..."
              : `REQUEST M-PESA — KES ${amount.toLocaleString()}`}
          </button>

          {/* CANCEL */}

          <button
            type="button"
            disabled={paying}
            onClick={() =>
              router.push(
                `/contributions/merry-go-round/group?groupId=${encodeURIComponent(
                  group.id
                )}`
              )
            }
            className="mt-3 w-full rounded-2xl border border-slate-800 px-5 py-4 text-sm font-bold text-slate-400 hover:bg-white/[0.03] disabled:opacity-50"
          >
            CANCEL
          </button>

        </div>

        {/* SECURITY */}

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">

          <p className="text-xs font-black text-slate-300">
            SECURITY
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            StreetGO will never ask for your M-PESA PIN.
            Only approve a payment that you initiated yourself.
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
            Loading payment...
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Please wait while StreetGO loads your contribution.
          </p>

        </div>

      </div>
    </main>
  )
}

export default function ContributionPayPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ContributionPayContent />
    </Suspense>
  )
}