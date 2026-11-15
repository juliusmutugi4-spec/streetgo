
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react"

export default function CyberRegisterPage() {
  const router = useRouter()

  const [businessName, setBusinessName] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/cyber/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_name: businessName,
          business_phone: businessPhone,
          business_email: businessEmail,
          registration_number: registrationNumber,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Registration failed.")

        if (response.status === 409 && result.merchant) {
          setError(
            `You already have a registration: ${result.merchant.business_name} (${result.merchant.status}).`
          )
        }

        return
      }

      setSubmitted(true)
    } catch {
      setError("Unable to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#080d18] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-emerald-500/20 bg-[#101a2b] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 size={34} className="text-emerald-400" />
          </div>

          <h1 className="text-2xl font-bold">
            Registration submitted!
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Your StreetGO Cyber business registration has been received.
            Our team will review your information before activating your
            business account.
          </p>

          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-300">
              Pending approval
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Your business is not active yet.
            </p>
          </div>

          <button
            onClick={() => router.push("/cyber")}
            className="mt-7 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black hover:bg-emerald-400"
          >
            Continue to StreetGO Cyber
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">

        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Building2 size={28} className="text-emerald-400" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            StreetGO Business
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Register your cyber café
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Connect your cyber café to StreetGO Cyber. Manage branches,
            computers, customer sessions and payments from one platform.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-[#101a2b] p-5 shadow-2xl sm:p-8"
        >
          <div className="mb-7">
            <h2 className="text-lg font-bold">
              Business information
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter your official business contact details.
            </p>
          </div>

          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Business name *
              </label>
              <input
                required
                minLength={2}
                maxLength={120}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Tunda Cyber Solutions"
                className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Business phone
              </label>
              <input
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Business email
              </label>
              <input
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="business@example.com"
                className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Business registration number
                <span className="ml-2 text-xs text-slate-500">
                  Optional
                </span>
              </label>
              <input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Enter registration number"
                maxLength={80}
                className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 outline-none focus:border-emerald-500"
              />
            </div>

          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-7 flex items-start gap-3 rounded-xl bg-white/[0.03] p-4">
            <ShieldCheck
              size={21}
              className="mt-0.5 shrink-0 text-emerald-400"
            />
            <p className="text-xs leading-5 text-slate-400">
              Your business registration will be reviewed by StreetGO.
              Your business will remain inactive until approval.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit business registration"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Powered by StreetGO
        </p>
      </div>
    </main>
  )
}
