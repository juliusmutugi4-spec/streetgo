"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/app/lib/supabase-browser"

interface Campaign {
  id: string
  title: string
  slug: string
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
            created_at,
            organizer_id
          `)
          .eq("organizer_id", user.id)
          .order("created_at", { ascending: false })

        if (campaignError) {
          console.error("MY FUNDRAISERS ERROR:", campaignError)

          if (mounted) {
            setError("Unable to load your fundraisers.")
          }

          return
        }

        // Extra frontend ownership check
        const ownCampaigns = ((data || []) as Campaign[]).filter(
          (campaign) => campaign.organizer_id === user.id
        )

        if (mounted) {
          setCampaigns(ownCampaigns)
        }
      } catch (err) {
        console.error("MY FUNDRAISERS ERROR:", err)

        if (mounted) {
          setError("Something went wrong.")
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadCampaigns()

    return () => {
      mounted = false
    }
  }, [router, supabase])

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-3xl">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              STREETGO FUND
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              My Fundraisers
            </h1>
          </div>

          <Link
            href="/fund/create"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500"
          >
            + Create
          </Link>
        </div>

        {/* BACK */}
        <div className="mt-4">
          <Link
            href="/contributions"
            className="text-sm text-white/50 hover:text-white"
          >
            ← Back
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-8 text-sm text-white/50">
            Loading your fundraisers...
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mt-8 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && campaigns.length === 0 && (
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-white/50">
              You have not created any fundraisers yet.
            </p>

            <Link
              href="/fund/create"
              className="mt-4 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              + Create New Fundraiser
            </Link>
          </div>
        )}

        {/* FUNDRAISER LIST */}
        {!loading && !error && campaigns.length > 0 && (
          <div className="mt-8 border-t border-white/10">

            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/fund/dashboard?campaign=${campaign.id}`}
                className="group flex items-center justify-between border-b border-white/10 py-5 transition hover:bg-white/[0.03]"
              >
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-white group-hover:text-blue-400">
                    {campaign.title}
                  </h2>

                  <p className="mt-1 text-xs text-white/40">
                    Created {formatDate(campaign.created_at)}
                  </p>
                </div>

                <span className="ml-4 text-lg text-white/30 transition group-hover:translate-x-1 group-hover:text-blue-400">
                  →
                </span>
              </Link>
            ))}

          </div>
        )}

      </div>
    </main>
  )
}