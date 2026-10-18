"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

function JoinSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const groupId = searchParams.get("groupId")
  const groupNumber = searchParams.get("groupNumber")
  const phone = searchParams.get("phone")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function joinGroup() {
    if (!groupId || !groupNumber || !phone) {
      setError("Contribution group information is missing.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error: joinError } = await supabase.rpc(
        "join_merry_go_round",
        {
          p_group_number: groupNumber,
        }
      )

      if (joinError) {
        console.error(
          "JOIN MERRY-GO-ROUND ERROR:",
          joinError
        )
        throw joinError
      }

      const result = Array.isArray(data) ? data[0] : data

      if (!result?.group_id || !result?.member_number) {
        throw new Error(
          "The group membership could not be created."
        )
      }

      router.push(
        `/contributions/merry-go-round/group?groupId=${encodeURIComponent(
          result.group_id
        )}`
      )
    } catch (err: any) {
      console.error(
        "JOIN GROUP ERROR:",
        JSON.stringify(
          err,
          Object.getOwnPropertyNames(err),
          2
        )
      )

      setError(
        err?.message ||
          err?.details ||
          "Unable to join this Merry-Go-Round."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-4xl">
            ✓
          </div>

          <p className="mt-6 text-xs font-black tracking-[0.2em] text-emerald-400">
            NUMBER VERIFIED
          </p>

          <h1 className="mt-2 text-3xl font-black">
            You're ready to join
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your Safaricom number has been verified.
            Review the group details before joining.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-5 shadow-2xl">

          <p className="text-xs font-black uppercase tracking-wider text-blue-300">
            Contribution Group
          </p>

          <h2 className="mt-2 text-2xl font-black">
            Merry-Go-Round
          </h2>

          <div className="mt-5 space-y-3">

            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Group Number
              </span>

              <span className="font-mono text-sm font-bold">
                {groupNumber || "—"}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-sm text-slate-400">
                Safaricom Number
              </span>

              <span className="font-bold">
                {phone || "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-400">
                Membership
              </span>

              <span className="font-bold text-emerald-400">
                Ready to join
              </span>
            </div>

          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-xs font-black text-red-300">
                JOIN FAILED
              </p>

              <p className="mt-2 text-xs leading-5 text-red-200/80">
                {error}
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
            <p className="text-xs font-black text-amber-300">
              IMPORTANT
            </p>

            <p className="mt-2 text-xs leading-5 text-amber-100/70">
              Once you join, your membership will be recorded
              for this contribution group.
            </p>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={joinGroup}
            className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "JOINING GROUP..."
              : "JOIN GROUP"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => router.back()}
            className="mt-3 w-full py-3 text-xs font-bold text-slate-400"
          >
            CANCEL
          </button>

        </div>

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
            Preparing your contribution group.
          </p>

        </div>
      </div>
    </main>
  )
}

export default function JoinSuccessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <JoinSuccessContent />
    </Suspense>
  )
}