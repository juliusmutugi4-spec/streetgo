"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Merchant {
  id: string
  business_name: string
  business_phone: string | null
  business_email: string | null
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

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("/api/cyber/dashboard", {
          cache: "no-store",
        })

        const result = await response.json()

        if (response.status === 401) {
          router.replace('/login?next=/cyber/dashboard')
          return
        }

        if (!response.ok) {
          throw new Error(result.error || "Unable to load dashboard.")
        }

        setData(result)
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
                  {enabled ? "Open management →" :
                    section.href === null
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



