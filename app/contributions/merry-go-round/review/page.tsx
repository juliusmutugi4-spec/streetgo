"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

function ReviewMerryGoRoundContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")

  const groupName =
    searchParams.get("groupName") || "My Merry-Go-Round"

  const phone =
    searchParams.get("phone") || ""

  const members =
    Number(searchParams.get("members")) || 5

  const amount =
    Number(searchParams.get("amount")) || 1000

  const frequency =
    searchParams.get("frequency") || "monthly"

  const startDate =
    searchParams.get("startDate") ||
    new Date().toISOString().split("T")[0]

  const pool = useMemo(
    () => members * amount,
    [members, amount]
  )

  const createGroup = async () => {
    if (creating) return

    setCreating(true)
    setError("")

    try {
      // 1. Validate organizer Safaricom number
      if (!phone || !/^07\d{8}$/.test(phone)) {
        setError("Please provide a valid Safaricom number.")
        setCreating(false)
        return
      }

      // 2. Make sure the user is logged in
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

      // 3. Generate a unique StreetGO group number
      const groupNumber =
        `SG-MGR-${Math.floor(100000 + Math.random() * 900000)}`

      // 4. Create the group
      const {
        data: group,
        error: insertError,
      } = await supabase
        .from("contribution_groups")
        .insert({
          group_number: groupNumber,
          name: groupName.trim(),
          organizer_id: user.id,
          member_limit: members,
          contribution_amount: amount,
          frequency,
          start_date: startDate,
          status: "forming",
        })
        .select("id, group_number")
        .single()

      if (insertError) {
        throw insertError
      }

      // 5. Automatically make the organizer Member #1
      const { error: memberError } = await supabase
        .from("contribution_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
          member_number: 1,
          role: "organizer",
          status: "active",

          // Organizer identity
          phone_number: phone,
          phone_verified: false,

          // Use the name available on the StreetGO account
          display_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "Organizer",
        })

      if (memberError) {
        // If member creation fails, remove the group
        // so we don't leave an incomplete group behind.
        await supabase
          .from("contribution_groups")
          .delete()
          .eq("id", group.id)

        throw memberError
      }

      // 6. Open the created screen
      router.push(
        `/contributions/merry-go-round/created?groupNumber=${encodeURIComponent(
          groupNumber
        )}&groupId=${encodeURIComponent(
          group.id
        )}&phone=${encodeURIComponent(phone)}`
      )
    } catch (err: any) {
      console.error(
        "CREATE MERRY-GO-ROUND ERROR:",
        JSON.stringify(
          err,
          Object.getOwnPropertyNames(err),
          2
        )
      )

      console.error("ERROR MESSAGE:", err?.message)
      console.error("ERROR CODE:", err?.code)
      console.error("ERROR DETAILS:", err?.details)
      console.error("ERROR HINT:", err?.hint)

      setError(
        err?.message ||
          err?.details ||
          err?.hint ||
          "Unable to create the group."
      )

      setCreating(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            router.push("/contributions/merry-go-round")
          }
          className="mb-8 text-sm font-bold text-blue-300"
        >
          ← EDIT GROUP
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.2em] text-emerald-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-2 text-3xl font-black">
            Review Group
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Check everything before creating your Merry-Go-Round.
          </p>
        </div>

        {/* Group Details */}
        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-5 shadow-2xl">

          <p className="text-xs font-black uppercase tracking-wider text-slate-500">
            Group Name
          </p>

          <h2 className="mt-2 text-2xl font-black">
            {groupName}
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Total Members
              </span>

              <span className="font-black">
                {members}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Starting Members
              </span>

              <span className="font-black text-emerald-400">
                1
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Organizer Safaricom
              </span>

              <span className="font-black">
                {phone || "Not provided"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Contribution
              </span>

              <span className="font-black">
                KES {amount.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Frequency
              </span>

              <span className="font-black capitalize">
                {frequency}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Start date
              </span>

              <span className="font-black">
                {startDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Pool per round
              </span>

              <span className="font-black text-emerald-400">
                KES {pool.toLocaleString()}
              </span>
            </div>

          </div>
        </div>

        {/* Rules */}
        <div className="mt-5 rounded-3xl border border-blue-900/50 bg-blue-950/20 p-5">

          <p className="text-sm font-black text-blue-300">
            Merry-Go-Round Rules
          </p>

          <div className="mt-4 space-y-3 text-xs leading-5 text-slate-400">

            <p>
              • The organizer automatically becomes Member #1.
            </p>

            <p>
              • Every member contributes the same amount.
            </p>

            <p>
              • The group must have exactly 5 or 6 members.
            </p>

            <p>
              • The full pool must be collected before the recipient payout is initiated.
            </p>

            <p>
              • Each member has their own StreetGO account.
            </p>

            <p>
              • Each member verifies their own Safaricom number.
            </p>

            <p>
              • The group receives a unique number that members can use to join.
            </p>

          </div>
        </div>

        {/* Organizer */}
        <div className="mt-5 rounded-3xl border border-amber-900/40 bg-amber-950/20 p-5">

          <p className="text-sm font-black text-amber-300">
            You are Member #1
          </p>

          <p className="mt-2 text-xs leading-5 text-amber-100/70">
            When you create this group, StreetGO will automatically
            register you as the first active member and save your
            Safaricom number for verification.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">

            <p className="text-sm font-bold text-red-300">
              Could not create group
            </p>

            <p className="mt-1 break-words text-xs leading-5 text-red-200/80">
              {error}
            </p>

          </div>
        )}

        {/* Create */}
        <button
          type="button"
          disabled={creating}
          onClick={createGroup}
          className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating
            ? "CREATING GROUP..."
            : "CREATE MERRY-GO-ROUND"}
        </button>

        {/* Edit */}
        <button
          type="button"
          disabled={creating}
          onClick={() =>
            router.push("/contributions/merry-go-round")
          }
          className="mt-3 w-full rounded-2xl border border-slate-800 px-5 py-4 text-sm font-bold text-slate-400 hover:bg-white/[0.03]"
        >
          GO BACK AND EDIT
        </button>

        <p className="mt-6 text-center text-[11px] leading-5 text-slate-600">
          Your group will be saved securely to StreetGO.
          Payment integration will be connected separately.
        </p>

      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-6">

          <p className="text-xs font-black tracking-[0.2em] text-emerald-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-3 text-2xl font-black">
            Loading...
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Preparing your Merry-Go-Round review.
          </p>

        </div>
      </div>
    </main>
  )
}

export default function ReviewMerryGoRoundPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReviewMerryGoRoundContent />
    </Suspense>
  )
}