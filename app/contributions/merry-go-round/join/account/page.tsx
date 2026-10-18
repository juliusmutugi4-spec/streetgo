"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function ContributionMemberAccountContent() {
  const router = useRouter()
const searchParams = useSearchParams()
const groupId = searchParams.get("groupId")
const groupNumber = searchParams.get("groupNumber")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  function normalizePhone(value: string) {
    const digits = value.replace(/\D/g, "")

    if (digits.startsWith("254")) return digits
    if (digits.startsWith("0")) return "254" + digits.slice(1)

    return digits
  }

  async function continueJoin() {
    const normalized = normalizePhone(phone)

    if (normalized.length !== 12 || !normalized.startsWith("254")) {
      alert("Enter a valid Safaricom number")
      return
    }

    setLoading(true)

    // Temporary: next step will connect this to StreetGO authentication
    console.log("Contribution member phone:", normalized)

    if (!groupId || !groupNumber) {
  alert("Contribution group information is missing")
  setLoading(false)
  return
}

router.push(
  `/contributions/merry-go-round/join/verify?groupId=${encodeURIComponent(
    groupId
  )}&groupNumber=${encodeURIComponent(groupNumber)}&phone=${encodeURIComponent(
    normalized
  )}`
)
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        <button
          onClick={() => router.back()}
          className="mb-8 text-sm font-bold text-blue-300"
        >
          ← BACK
        </button>

        <div className="mb-8">
          <p className="mb-2 text-xs font-black tracking-[0.2em] text-emerald-400">
            STREETGO CONTRIBUTIONS
          </p>

          <h1 className="text-3xl font-black">
            Join your group
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Your StreetGO account and Safaricom number will be connected
            to your contribution membership.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-5 shadow-2xl">

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">
            Safaricom Number
          </label>

          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XXXXXXXX"
            className="w-full rounded-2xl border border-blue-900 bg-[#020b18] px-4 py-4 text-lg font-bold text-white outline-none focus:border-emerald-400"
          />

          <p className="mt-3 text-xs leading-5 text-slate-500">
            This number will be used for contribution STK Push payments
            and, when it is your turn, your M-PESA payout.
          </p>

          <button
            type="button"
            disabled={loading}
            onClick={continueJoin}
            className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {loading ? "CONTINUING..." : "CONTINUE"}
          </button>

        </div>

        <div className="mt-5 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
          <p className="text-xs font-bold text-amber-300">
            SECURITY
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-100/70">
            Never share your M-PESA PIN with StreetGO or with another
            group member.
          </p>
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
            Preparing your contribution membership.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function ContributionMemberAccountPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ContributionMemberAccountContent />
    </Suspense>
  )
}