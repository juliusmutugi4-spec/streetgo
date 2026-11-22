
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
  financials?: {
    totalEarnings: number
    availableBalance: number
    pendingPayouts: number
    totalWithdrawn: number
  }
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
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawing, setWithdrawing] = useState(false)
  const [withdrawMessage, setWithdrawMessage] = useState("")
  const [withdrawError, setWithdrawError] = useState("")

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

  async function requestWithdrawal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data?.merchant?.id) {
      setWithdrawError("Merchant account not found.")
      return
    }
    setWithdrawing(true)
    setWithdrawMessage("")
    setWithdrawError("")

    try {
      const response = await fetch("/api/cyber/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchant_id: data.merchant.id, amount_kes: Number(withdrawAmount) }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Withdrawal request failed.")
      }

      setWithdrawMessage("Withdrawal request submitted successfully.")
      setWithdrawAmount("")
    } catch (error) {
      setWithdrawError(error instanceof Error ? error.message : "Withdrawal failed.")
    } finally {
      setWithdrawing(false)
    }
  }
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

  const financials = data.financials

const formatKES = (amount: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(amount)

const financialCards = [
  {
    title: "Total earnings",
    value: formatKES(financials?.totalEarnings ?? 0),
    description: "Earnings overview",
  },
  {
    title: "Available balance",
    value: formatKES(financials?.availableBalance ?? 0),
    description: "Ready for withdrawal",
  },
  {
    title: "Pending payouts",
    value: formatKES(financials?.pendingPayouts ?? 0),
    description: "Awaiting processing",
  },
  {
    title: "Total withdrawn",
    value: formatKES(financials?.totalWithdrawn ?? 0),
    description: "Paid to your account",
  },
]

  return (
    <main className="min-h-screen bg-[#080d18] p-5 text-white sm:p-10">
      <div className="mx-auto w-full max-w-[1600px]">

        {/* Dashboard header */}
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              STREETGO CYBER
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Business overview
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Monitor your cyber business and manage your earnings.
            </p>
          </div>

          {/* Profile area */}
          <button
            type="button"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#101a2b] px-3 py-2 transition hover:border-white/20 hover:bg-[#162238]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-black">
              {merchant.business_name?.charAt(0).toUpperCase() || "S"}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-[180px] truncate text-sm font-semibold text-white">
                {merchant.business_name}
              </p>

              <p className={`mt-1 text-xs ${
                active ? "text-emerald-400" : "text-amber-400"
              }`}>
                {active ? "Active account" : "Pending approval"}
              </p>
            </div>

            <span className="text-xs text-slate-500">⌄</span>
          </button>
        </header>

        {/* Business profile */}
        <section className="rounded-2xl border border-white/10 bg-[#101a2b] p-6 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Business account
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {merchant.business_name}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {merchant.business_phone || "Business phone not provided"}
              </p>

              {merchant.business_email && (
                <p className="mt-1 text-sm text-slate-500">
                  {merchant.business_email}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-white/5 bg-[#080d18] px-4 py-3">
              <p className="text-xs text-slate-500">Account status</p>
              <p className={`mt-1 font-semibold ${
                active ? "text-emerald-400" : "text-amber-400"
              }`}>
                {active ? "Active business" : "Pending approval"}
              </p>
            </div>
          </div>
        </section>

        {/* Financial overview */}
        <section className="mt-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Financial overview</h2>
            <p className="mt-1 text-sm text-slate-400">
              Your business revenue and payout summary.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {financialCards.map((card) => (
              <div
                key={card.title}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#142238] via-[#101a2b] to-[#0b1220] p-6 shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-xl"
              >
                <p className="text-sm font-medium tracking-wide text-slate-400">
                  {card.title}
                </p>

                <p className="mt-5 text-4xl font-extrabold tracking-tight text-white">
                  {card.value}
                </p>

                <p className="mt-4 text-sm text-slate-500">
                  {card.description}
                </p>



                {card.title === "Available balance" && (
                  <a
                    href="#payout-account"
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400"
                  >
                    Withdraw money
                    <span>→</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Payout settings */}
        <section id="payout-account" className="mt-8 rounded-2xl border border-white/10 bg-[#101a2b] p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <span className="text-lg font-bold">M</span>
            </div>

            <div>
              <h2 className="text-xl font-bold">Payout account</h2>
              <p className="mt-2 text-sm text-slate-400">
                Manage the M-Pesa number that will receive your business payouts.
              </p>
            </div>
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
              className="w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 text-white outline-none transition focus:border-emerald-500"
            />

            <p className="mt-2 text-xs text-slate-500">
              Enter a Kenyan M-Pesa number, for example 0712345678 or 254712345678.
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

          <form onSubmit={requestWithdrawal} className="mt-8 max-w-xl rounded-xl border border-white/10 bg-[#080d18] p-5">
            <h3 className="text-lg font-bold text-white">Withdraw funds</h3>
            <p className="mt-2 text-sm text-slate-400">Withdraw from your available Cyber earnings. Minimum withdrawal is KES 10.</p>
            <label htmlFor="withdraw-amount" className="mt-5 mb-2 block text-sm font-semibold text-slate-300">Amount (KES)</label>
            <input
              id="withdraw-amount"
              type="number"
              min="10"
              step="1"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              placeholder="Enter amount"
              required
              className="w-full rounded-xl border border-white/10 bg-[#101a2b] px-4 py-3 text-white outline-none focus:border-emerald-500"
            />
            {withdrawMessage && <p className="mt-4 text-sm text-emerald-400">{withdrawMessage}</p>}
            {withdrawError && <p className="mt-4 text-sm text-red-400">{withdrawError}</p>}
            <button
              type="submit"
              disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) < 10}
              className="mt-5 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {withdrawing ? "Submitting..." : "Request withdrawal"}
            </button>
          </form>

            <p className="text-sm font-semibold text-amber-300">
              Payout automation
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Your payout destination is saved. Automated payouts will become
              available once the payout system is connected.
            </p>
        </section>

        {/* Account approval */}
        {!active && (
          <section className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                !
              </div>

              <div>
                <h2 className="font-bold text-amber-400">
                  Registration awaiting approval
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-300">
                  StreetGO is reviewing your business registration. Business
                  management features will become available after your account
                  is approved.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Dashboard information */}
        <section className="mt-8 rounded-2xl border border-white/5 bg-[#0b1322] p-5">
          <p className="text-sm font-medium tracking-wide text-slate-400">
            Dashboard information
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Your business overview is ready. Earnings, transactions, computer
            sessions and payouts will appear here as the financial system
            becomes connected.
          </p>
        </section>

      </div>
    </main>
  )
}

















