"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/app/lib/supabase"

function OrganizerVerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const groupId = searchParams.get("groupId") || ""
  const groupNumber = searchParams.get("groupNumber") || ""
  const phone = searchParams.get("phone") || ""

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const verifyCode = async () => {
    setError("")

    if (!groupId) {
      setError("Group information is missing.")
      return
    }

    if (!phone) {
      setError("Safaricom phone number is missing.")
      return
    }

    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.")
      return
    }

    setLoading(true)

    try {
      // DEMO VERIFICATION FOR NOW
      // Real Safaricom verification will replace this later.

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

      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Organizer"

      const { data, error: verifyError } = await supabase.rpc(
        "verify_merry_go_round_member",
        {
          p_group_id: groupId,
          p_phone_number: phone,
          p_display_name: displayName,
        }
      )

      if (verifyError) {
        throw verifyError
      }

      if (data !== true) {
        throw new Error(
          "Number verification could not be completed."
        )
      }

      router.push(
        `/contributions/merry-go-round/created?groupId=${encodeURIComponent(
          groupId
        )}&groupNumber=${encodeURIComponent(
          groupNumber
        )}&verified=1`
      )
    } catch (err: any) {
      console.error(
        "ORGANIZER VERIFICATION ERROR:",
        JSON.stringify(
          err,
          Object.getOwnPropertyNames(err),
          2
        )
      )

      setError(
        err?.message ||
          "Verification failed. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-5 py-10">
      <div className="mx-auto max-w-md">

        <div className="mb-8">
          <p className="text-xs font-black tracking-[0.25em] text-cyan-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Verify your number
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Verify the Safaricom number belonging to the organizer of this
            Merry-Go-Round.
          </p>
        </div>

        <section className="rounded-3xl border border-cyan-500/20 bg-[#07111f] p-6 shadow-xl">

          <div className="rounded-2xl bg-[#020b16] p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Safaricom number
            </p>

            <p className="mt-2 text-xl font-black text-white">
              {phone || "07XXXXXXXX"}
            </p>
          </div>

          <div className="mt-6">
            <label className="text-sm font-bold text-slate-300">
              Verification code
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="000000"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-[#020617] px-5 py-4 text-center text-2xl font-black tracking-[0.5em] text-white outline-none focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-300">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
            className="mt-6 w-full rounded-2xl bg-cyan-400 px-5 py-4 font-black text-black transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "VERIFYING..."
              : "VERIFY NUMBER"}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Verification is currently in demo mode. Real Safaricom
            verification will be connected before production launch.
          </p>

        </section>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#050b14] p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Group
          </p>

          <p className="mt-2 font-black text-white">
            {groupNumber || "Merry-Go-Round"}
          </p>
        </div>

      </div>
    </main>
  )
}

function LoadingState() {
  return (
    <main className="min-h-screen bg-[#020617] text-white px-5 py-10">
      <div className="mx-auto max-w-md">

        <div className="rounded-3xl border border-cyan-500/20 bg-[#07111f] p-6 shadow-xl">

          <p className="text-xs font-black tracking-[0.25em] text-cyan-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="mt-3 text-2xl font-black">
            Loading...
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Preparing number verification.
          </p>

        </div>

      </div>
    </main>
  )
}

export default function OrganizerVerifyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrganizerVerifyContent />
    </Suspense>
  )
}