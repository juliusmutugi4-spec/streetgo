
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Merchant {
  id: string
  business_name: string
  business_phone: string | null
  business_email: string | null
  payout_phone: string | null
  status: string
  created_at: string
}

interface DashboardData {
  registered: boolean
  merchant: Merchant | null
  permissions?: {
    canManageBranches: boolean
    canManageComputers: boolean
    canManagePricing: boolean
    canManagePayments: boolean
  }
}

export default function CyberDashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [payoutPhone, setPayoutPhone] = useState("")
  const [savingPayout, setSavingPayout] = useState(false)
  const [payoutMessage, setPayoutMessage] = useState("")
  const [payoutError, setPayoutError] = useState("")

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/cyber/dashboard", {
          cache: "no-store",
        })

        const result = await response.json()

        if (response.status === 401) {
          router.replace("/login?next=/cyber/dashboard")
          return
        }

        if (!response.ok) {
          throw new Error(result.error || "Unable to load dashboard.")
        }

        setData(result)

        if (result.merchant?.payout_phone) {
          setPayoutPhone(result.merchant.payout_phone)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  async function savePayoutPhone(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingPayout(true)
    setPayoutMessage("")
    setPayoutError("")

    try {
      const response = await fetch("/api/cyber/dashboard", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payout_phone: payoutPhone }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Unable to save payout number.")
      }

      setPayoutPhone(result.merchant.payout_phone)

      setData((current) =>
        current?.merchant
          ? {
              ...current,
              merchant: {
                ...current.merchant,
                payout_phone: result.merchant.payout_phone,
              },
            }
          : current
      )

      setPayoutMessage("Your M-Pesa payout number has been saved.")
    } catch (err) {
      setPayoutError(
        err instanceof Error ? err.message : "Something went wrong."
      )
    } finally {
      setSavingPayout(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#080d18] p-8 text-white">
        Loading StreetGO Cyber dashboard...
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#080d18] p-8 text-white">
        <h1 className="text-xl font-bold">Dashboard error</h1>
        <p className="mt-3 text-red-400">{error}</p>
      </main>
    )
  }

  if (!data?.registered || !data.merchant) {
    return (
      <main className="min-h-screen bg-[#080d18] p-8 text-white">
        <h1 className="text-3xl font-bold">StreetGO Cyber</h1>
        <p className="mt-3 text-slate-400">
          Register your cyber business to get started.
        </p>
        <Link
          href="/cyber/register"
          className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black"
        >
          Register your business
        </Link>
      </main>
    )
  }

  const merchant = data.merchant
  const active = merchant.status === "active"

  const sections = [
    { title: "Branches", description: "Manage your cyber locations", href: "/cyber/branches" },
    { title: "Computers", description: "Manage computers and devices", href: "/cyber/computers" },
    { title: "Pricing", description: "Configure hourly rates and packages", href: "/cyber/pricing" },
    { title: "Payments", description: "View customer payments and sessions", href: null },
  ]

  return (
    <main className="min-h-screen bg-[#080d18] p-5 text-white sm:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">
            StreetGO Cyber
          </p>
          <h1 className="mt-3 text-3xl font-bold">Business dashboard</h1>
          <p className="mt-2 text-slate-400">
            Manage your cyber business from one place.
          </p>
        </header>

        <section className="rounded-2xl border border-white/10 bg-[#101a2b] p-6">
          <h2 className="text-xl font-bold">{merchant.business_name}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {merchant.business_phone || "No business phone provided"}
          </p>
          <div className="mt-5">
            <span className={`rounded-full px-4 py-2 text-sm font-bold ${
              active
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-amber-500/15 text-amber-400"
            }`}>
              {merchant.status.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#101a2b] p-6">
          <div>
            <h2 className="text-xl font-bold">Payout settings</h2>
            <p className="mt-2 text-sm text-slate-400">
              Set the M-Pesa number where your cyber business earnings
              will be sent.
            </p>
          </div>

          <form onSubmit={savePayoutPhone} className="mt-6 max-w-xl">
            <label
              htmlFor="payout-phone"
              className="mb-2 block text-sm font-semibold text-slate-300"
            >
              Owner's M-Pesa phone number
            </label>

            <input
              id="payout-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={payoutPhone}
              onChange={(event) => setPayoutPhone(event.target.value)}
              placeholder="0712345678"
              required
              className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 text-white outline-none focus:border-emerald-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Enter a Kenyan M-Pesa number, for example 0712345678
              or 254712345678.
            </p>

            {payoutMessage && (
              <p className="mt-4 text-sm text-emerald-400">
                {payoutMessage}
              </p>
            )}

            {payoutError && (
              <p className="mt-4 text-sm text-red-400">
                {payoutError}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPayout || !payoutPhone.trim()}
              className="mt-5 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingPayout ? "Saving..." : "Save payout number"}
            </button>
          </form>

          <p className="mt-5 text-xs text-amber-300">
            Payouts are not automatic yet. This setting only saves
            your preferred destination.
          </p>
        </section>

        {!active && (
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-5">
            <h3 className="font-bold text-amber-400">
              Registration awaiting approval
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              StreetGO is reviewing your business registration.
              Branch, computer and pricing management will become
              available after approval.
            </p>
          </div>
        )}

        <h2 className="mb-5 mt-10 text-xl font-bold">
          Business management
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {sections.map((section) => {
            const enabled = active && Boolean(section.href)

            const content = (
              <>
                <h3 className="text-lg font-bold">{section.title}</h3>
                <p className="mt-2 text-sm text-slate-400">
                  {section.description}
                </p>
                <p className="mt-5 text-xs text-emerald-400">
                  {enabled
                    ? "Open management →"
                    : section.href === null
                      ? "Coming soon"
                      : "Available after approval"}
                </p>
              </>
            )

            return enabled ? (
              <Link
                key={section.title}
                href={section.href!}
                className="block rounded-2xl border border-white/10 bg-[#101a2b] p-6 transition hover:border-blue-500 hover:bg-[#17243a]"
              >
                {content}
              </Link>
            ) : (
              <div
                key={section.title}
                className="rounded-2xl border border-white/10 bg-[#101a2b] p-6 opacity-70"
              >
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
