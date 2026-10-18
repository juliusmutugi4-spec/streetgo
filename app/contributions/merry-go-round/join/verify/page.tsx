"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function VerifySafaricomContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const groupId = searchParams.get("groupId")
  const groupNumber = searchParams.get("groupNumber")
  const phone = searchParams.get("phone")

  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)

  function verifyNumber() {
    if (code.length !== 6) {
      alert("Enter the 6-digit verification code")
      return
    }

    setLoading(true)

    // Temporary verification.
    // Real OTP verification will be connected later.
    console.log("Verification code:", code)

    setTimeout(() => {
      if (!groupId || !groupNumber || !phone) {
        alert("Contribution group information is missing")
        setLoading(false)
        return
      }

      router.push(
        `/contributions/merry-go-round/join/success?groupId=${encodeURIComponent(
          groupId
        )}&groupNumber=${encodeURIComponent(
          groupNumber
        )}&phone=${encodeURIComponent(phone)}`
      )
    }, 700)
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto max-w-md">

        <button
          type="button"
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
            Verify your number
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            We need to verify that this Safaricom number belongs to you
            before adding you to the contribution group.
          </p>
        </div>

        <div className="rounded-3xl border border-blue-900/60 bg-[#071426] p-5 shadow-2xl">

          <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/20 p-4">
            <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Verification
            </p>

            <p className="mt-2 text-sm text-slate-300">
              Enter the 6-digit verification code sent to your
              Safaricom number.
            </p>
          </div>

          <label className="mt-6 mb-2 block text-xs font-black uppercase tracking-wider text-slate-300">
            Verification Code
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, ""))
            }
            placeholder="000000"
            className="w-full rounded-2xl border border-blue-900 bg-[#020b18] px-4 py-5 text-center text-2xl font-black tracking-[0.4em] text-white outline-none focus:border-emerald-400"
          />

          <button
            type="button"
            disabled={loading}
            onClick={verifyNumber}
            className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-sm font-black text-[#03130d] transition hover:bg-emerald-300 disabled:opacity-50"
          >
            {loading ? "VERIFYING..." : "VERIFY NUMBER"}
          </button>

          <button
            type="button"
            className="mt-4 w-full py-3 text-xs font-bold text-blue-300"
            onClick={() =>
              alert("A new code will be requested later.")
            }
          >
            RESEND CODE
          </button>

        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs leading-5 text-slate-500">
            StreetGO will never ask you for your M-PESA PIN.
            Never share your M-PESA PIN with anyone.
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
            Preparing number verification.
          </p>

        </div>
      </div>
    </main>
  )
}

export default function VerifySafaricomPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifySafaricomContent />
    </Suspense>
  )
}