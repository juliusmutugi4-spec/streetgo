"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/app/lib/supabase-browser"

interface Campaign {
  id: string
  title: string
  slug: string
  target_amount: number
  raised_amount: number
  destination_type: string
  status: string
  created_at: string
  organizer_id: string
}

export default function MyFundraisersPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadCampaigns() {
      try {
        setLoading(true)
        setError("")

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        const { data, error: campaignError } = await supabase
          .from("fundraising_campaigns")
          .select(`
            id,
            title,
            slug,
            target_amount,
            raised_amount,
            destination_type,
            status,
            created_at,
            organizer_id
          `)
          .eq("organizer_id", user.id)
          .order("created_at", { ascending: false })

        if (campaignError) {
          console.error("MY FUNDRAISERS ERROR:", campaignError)
          if (mounted) setError("Unable to load your fundraisers.")
          return
        }

        // Extra frontend ownership check.
        const ownCampaigns = ((data || []) as Campaign[]).filter(
          (campaign) => campaign.organizer_id === user.id
        )

        if (mounted) setCampaigns(ownCampaigns)
      } catch (err) {
        console.error("MY FUNDRAISERS ERROR:", err)
        if (mounted) setError("Something went wrong.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCampaigns()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  function formatMoney(value: number) {
    return `KSh ${Number(value || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              STREETGO FUND
            </p>
            <h1 className="mt-2 text-3xl font-bold">My Fundraisers</h1>
            <p className="mt-2 text-white/60">
              View and manage the fundraisers you have created.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/contributions"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
            >
              Back
            </Link>
            <Link
              href="/fund/create"
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500"
            >
              + Create New Fundraiser
            </Link>
          </div>
        </div>

        {loading && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
            Loading your fundraisers...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <div className="text-5xl">❤️</div>
            <h2 className="mt-4 text-xl font-semibold">No fundraisers yet</h2>
            <p className="mx-auto mt-2 max-w-md text-white/60">
              Create your first fundraiser and it will appear here. You will not
              need to create it again to view it.
            </p>
            <Link
              href="/fund/create"
              className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
            >
              Create New Fundraiser
            </Link>
          </div>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <div className="mt-8 space-y-4">
            {campaigns.map((campaign) => {
              const target = Number(campaign.target_amount || 0)
              const raised = Number(campaign.raised_amount || 0)
              const progress =
                target > 0 ? Math.min((raised / target) * 100, 100) : 0

              return (
                <section
                  key={campaign.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="truncate text-xl font-bold">
                          {campaign.title}
                        </h2>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            campaign.status === "active"
                              ? "bg-green-500/10 text-green-300"
                              : "bg-white/10 text-white/60"
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-white/40">
                        {formatMoney(raised)} raised of {formatMoney(target)}
                      </p>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-white/40">
                        {progress.toFixed(1)}% funded
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/fund/${campaign.slug}`}
                        target="_blank"
                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
                      >
                        Public Page
                      </Link>
                      <Link
                        href="/fund/dashboard"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
