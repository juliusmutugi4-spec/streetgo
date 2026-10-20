"use client"

import { useEffect, useState } from "react"
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
}

export default function FundraiserDashboard() {
  const supabase = getSupabaseBrowser()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("Please log in to view your fundraiser dashboard.")
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("fundraising_campaigns")
          .select(
            `
              id,
              title,
              slug,
              target_amount,
              raised_amount,
              destination_type,
              status,
              created_at
            `
          )
          .eq("organizer_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("FUNDRAISER CAMPAIGNS ERROR:", error)
          setError("Unable to load your campaigns.")
          setLoading(false)
          return
        }

        setCampaigns(data || [])
      } catch (err) {
        console.error("FUNDRAISER DASHBOARD ERROR:", err)
        setError("Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    loadCampaigns()
  }, [supabase])

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Fundraiser Dashboard
        </h1>

        <p className="mt-2 text-white/60">
          Manage your campaigns, contributors, payouts and sharing links.
        </p>

        {loading && (
          <div className="mt-8 text-white/60">
            Loading your campaigns...
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">
              No campaigns yet
            </h2>

            <p className="mt-2 text-white/60">
              Create your first fundraiser to get started.
            </p>
          </div>
        )}

        {!loading && !error && campaigns.length > 0 && (
          <div className="mt-8 grid gap-4">
            {campaigns.map((campaign) => {
              const target = Number(campaign.target_amount)
              const raised = Number(campaign.raised_amount)

              const progress =
                target > 0
                  ? Math.min((raised / target) * 100, 100)
                  : 0

              return (
                <div
                  key={campaign.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {campaign.title}
                      </h2>

                      <p className="mt-1 text-sm text-white/50">
                        /fund/{campaign.slug}
                      </p>
                    </div>

                    <div className="text-sm text-white/60">
                      {campaign.status}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm">
                      <span>
                        KSh {raised.toLocaleString()}
                      </span>

                      <span className="text-white/50">
                        KSh {target.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="mt-2 text-sm text-white/50">
                      {progress.toFixed(1)}% raised
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}