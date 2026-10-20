"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
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

interface Contribution {
  id: string
  campaign_id: string
  amount: number
  contributor_name: string | null
  contributor_phone: string | null
  payment_status: string
  mpesa_receipt: string | null
  paid_at: string | null
  created_at: string
}

interface CampaignStats {
  contributors: number
  recentContributions: Contribution[]
  pendingAmount: number
}

export default function FundraiserDashboard() {
  const supabase = getSupabaseBrowser()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError("")

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError(
            "Please log in to view your fundraiser dashboard."
          )
          return
        }

        /*
         * Load campaigns belonging to this organizer.
         */
        const {
          data: campaignData,
          error: campaignError,
        } = await supabase
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

        if (campaignError) {
          console.error(
            "FUNDRAISER CAMPAIGNS ERROR:",
            campaignError
          )

          setError("Unable to load your campaigns.")
          return
        }

        const loadedCampaigns: Campaign[] =
          campaignData || []

        setCampaigns(loadedCampaigns)

        /*
         * No campaigns means there is nothing else to load.
         */
        if (loadedCampaigns.length === 0) {
          setContributions([])
          return
        }

        /*
         * Get campaign IDs belonging to this organizer.
         */
        const campaignIds = loadedCampaigns.map(
          (campaign: Campaign) => campaign.id
        )

        /*
         * Load contributions belonging only to the
         * organizer's campaigns.
         */
        const {
          data: contributionData,
          error: contributionError,
        } = await supabase
          .from("fundraising_contributions")
          .select(
            `
              id,
              campaign_id,
              amount,
              contributor_name,
              contributor_phone,
              payment_status,
              mpesa_receipt,
              paid_at,
              created_at
            `
          )
          .in("campaign_id", campaignIds)
          .order("created_at", { ascending: false })

        if (contributionError) {
          console.error(
            "FUNDRAISER CONTRIBUTIONS ERROR:",
            contributionError
          )

          setError(
            "Campaigns loaded, but contributions could not be loaded."
          )

          return
        }

        const loadedContributions: Contribution[] =
          contributionData || []

        setContributions(loadedContributions)
      } catch (err) {
        console.error(
          "FUNDRAISER DASHBOARD ERROR:",
          err
        )

        setError("Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [supabase])

  /*
   * Build statistics for each campaign.
   */
  const campaignStats = useMemo(() => {
    const stats: Record<string, CampaignStats> = {}

    for (const campaign of campaigns) {
      const campaignContributions =
        contributions.filter(
          (contribution: Contribution) =>
            contribution.campaign_id === campaign.id
        )

      /*
       * PAID CONTRIBUTIONS
       *
       * Only confirmed M-PESA payments count as
       * actual contributors.
       */
      const paidContributions =
        campaignContributions.filter(
          (contribution: Contribution) =>
            contribution.payment_status === "paid"
        )

      /*
       * PROCESSING CONTRIBUTIONS
       *
       * These payments have been initiated but
       * Safaricom has not yet confirmed them.
       */
      const processingContributions =
        campaignContributions.filter(
          (contribution: Contribution) =>
            contribution.payment_status === "processing"
        )

      /*
       * Total money currently waiting for
       * M-PESA confirmation.
       */
      const pendingAmount =
        processingContributions.reduce(
          (
            total: number,
            contribution: Contribution
          ) =>
            total +
            Number(contribution.amount || 0),
          0
        )

      /*
       * Show BOTH paid and processing contributions
       * in the recent-contributions section.
       *
       * Newest contribution appears first.
       */
      const recentContributions =
        [...campaignContributions]
          .filter(
            (contribution: Contribution) =>
              contribution.payment_status === "paid" ||
              contribution.payment_status === "processing"
          )
          .sort(
            (
              a: Contribution,
              b: Contribution
            ) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 5)

      stats[campaign.id] = {
        /*
         * IMPORTANT:
         * Only PAID contributions count as contributors.
         */
        contributors: paidContributions.length,

        /*
         * Recent list contains both PAID and PROCESSING.
         */
        recentContributions,

        /*
         * Processing money is displayed separately.
         */
        pendingAmount,
      }
    }

    return stats
  }, [campaigns, contributions])

  function formatMoney(value: number) {
    return `KSh ${value.toLocaleString("en-KE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`
  }

  function formatContributionTime(
    paidAt: string | null,
    createdAt: string
  ) {
    /*
     * For PAID:
     * use paid_at.
     *
     * For PROCESSING:
     * paid_at is normally null,
     * so created_at is used.
     */
    const date = new Date(
      paidAt || createdAt
    )

    if (Number.isNaN(date.getTime())) {
      return "Unknown time"
    }

    return date.toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  function getContributorName(
    contribution: Contribution
  ) {
    if (
      contribution.contributor_name &&
      contribution.contributor_name.trim()
    ) {
      return contribution.contributor_name.trim()
    }

    return "StreetGO Contributor"
  }

  return (
    <main className="min-h-screen bg-[#020617] p-6 text-white">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
              StreetGO Fund
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Fundraiser Dashboard
            </h1>

            <p className="mt-2 text-white/60">
              Manage your campaigns, contributions,
              payouts and public pages.
            </p>
          </div>

          <Link
            href="/fund"
            className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold transition hover:bg-blue-500"
          >
            + Create Fundraiser
          </Link>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
            Loading your fundraiser dashboard...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          campaigns.length === 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">

              <div className="text-5xl">
                ❤️
              </div>

              <h2 className="mt-4 text-xl font-semibold">
                No campaigns yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-white/60">
                Create your first fundraiser and
                start receiving contributions.
              </p>

              <Link
                href="/fund"
                className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
              >
                Create Fundraiser
              </Link>
            </div>
          )}

        {/* CAMPAIGNS */}
        {!loading &&
          !error &&
          campaigns.length > 0 && (
            <div className="mt-8 space-y-6">

              {campaigns.map(
                (campaign: Campaign) => {
                  const target = Number(
                    campaign.target_amount || 0
                  )

                  const raised = Number(
                    campaign.raised_amount || 0
                  )

                  const progress =
                    target > 0
                      ? Math.min(
                          (raised / target) * 100,
                          100
                        )
                      : 0

                  const stats =
                    campaignStats[campaign.id] || {
                      contributors: 0,
                      recentContributions: [],
                      pendingAmount: 0,
                    }

                  return (
                    <section
                      key={campaign.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                    >

                      {/* CAMPAIGN HEADER */}
                      <div className="border-b border-white/10 p-6">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                          <div>

                            <div className="flex flex-wrap items-center gap-3">

                              <h2 className="text-2xl font-bold">
                                {campaign.title}
                              </h2>

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  campaign.status ===
                                  "active"
                                    ? "bg-green-500/10 text-green-300"
                                    : "bg-white/10 text-white/60"
                                }`}
                              >
                                {campaign.status}
                              </span>

                            </div>

                            <p className="mt-2 text-sm text-white/40">
                              /fund/{campaign.slug}
                            </p>

                          </div>

                          <div className="flex flex-wrap gap-2">

                            <Link
                              href={`/fund/${campaign.slug}`}
                              target="_blank"
                              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
                            >
                              View Public Page
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                const url =
                                  `${window.location.origin}/fund/${campaign.slug}`

                                navigator.clipboard
                                  .writeText(url)
                                  .then(() => {
                                    alert(
                                      "Public fundraiser link copied."
                                    )
                                  })
                                  .catch(() => {
                                    alert(
                                      "Could not copy the link."
                                    )
                                  })
                              }}
                              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
                            >
                              Copy Link
                            </button>

                          </div>

                        </div>

                      </div>

                      {/* FINANCIAL SUMMARY */}
                      <div className="grid gap-px border-b border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">

                        {/* RAISED */}
                        <div className="bg-[#020617] p-5">

                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Raised
                          </p>

                          <p className="mt-2 text-2xl font-bold">
                            {formatMoney(raised)}
                          </p>

                        </div>

                        {/* TARGET */}
                        <div className="bg-[#020617] p-5">

                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Target
                          </p>

                          <p className="mt-2 text-2xl font-bold">
                            {formatMoney(target)}
                          </p>

                        </div>

                        {/* CONTRIBUTORS */}
                        <div className="bg-[#020617] p-5">

                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Contributors
                          </p>

                          <p className="mt-2 text-2xl font-bold">
                            {stats.contributors}
                          </p>

                          <p className="mt-1 text-xs text-white/40">
                            Paid contributions
                          </p>

                        </div>

                        {/* PROCESSING */}
                        <div className="bg-[#020617] p-5">

                          <p className="text-xs uppercase tracking-wide text-white/40">
                            Processing
                          </p>

                          <p className="mt-2 text-2xl font-bold text-yellow-300">
                            {formatMoney(
                              stats.pendingAmount
                            )}
                          </p>

                          <p className="mt-1 text-xs text-white/40">
                            Waiting for M-PESA confirmation
                          </p>

                        </div>

                      </div>

                      {/* PROGRESS */}
                      <div className="p-6">

                        <div className="flex items-center justify-between text-sm">

                          <span className="font-medium">
                            Fundraising progress
                          </span>

                          <span className="font-semibold text-blue-400">
                            {progress.toFixed(1)}%
                          </span>

                        </div>

                        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">

                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />

                        </div>

                        <div className="mt-2 flex justify-between text-xs text-white/40">

                          <span>
                            {formatMoney(
                              raised
                            )}{" "}
                            raised
                          </span>

                          <span>
                            {formatMoney(
                              target
                            )}{" "}
                            target
                          </span>

                        </div>

                      </div>

                      {/* RECENT CONTRIBUTORS */}
                      <div className="border-t border-white/10">

                        <div className="flex items-center justify-between p-6">

                          <div>

                            <h3 className="text-lg font-semibold">
                              Recent Contributions
                            </h3>

                            <p className="mt-1 text-sm text-white/40">
                              Latest contributions and payment status
                            </p>

                          </div>

                          <button
                            type="button"
                            className="text-sm font-medium text-blue-400 hover:text-blue-300"
                          >
                            View All
                          </button>

                        </div>

                        {stats.recentContributions.length ===
                        0 ? (
                          <div className="border-t border-white/10 p-6 text-sm text-white/50">
                            No contributions yet.
                          </div>
                        ) : (
                          <div className="divide-y divide-white/10 border-t border-white/10">

                            {stats.recentContributions.map(
                              (
                                contribution: Contribution
                              ) => {

                                const isPaid =
                                  contribution.payment_status ===
                                  "paid"

                                const isProcessing =
                                  contribution.payment_status ===
                                  "processing"

                                return (
                                  <div
                                    key={contribution.id}
                                    className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                                  >

                                    {/* CONTRIBUTOR */}
                                    <div className="flex items-center gap-3">

                                      <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                                          isPaid
                                            ? "bg-green-500/10 text-green-300"
                                            : "bg-yellow-500/10 text-yellow-300"
                                        }`}
                                      >
                                        {getContributorName(
                                          contribution
                                        )
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>

                                      <div>

                                        <p className="font-medium">
                                          {getContributorName(
                                            contribution
                                          )}
                                        </p>

                                        <p className="text-xs text-white/40">
                                          {formatContributionTime(
                                            contribution.paid_at,
                                            contribution.created_at
                                          )}
                                        </p>

                                      </div>

                                    </div>

                                    {/* AMOUNT + STATUS */}
                                    <div className="text-left sm:text-right">

                                      <p className="font-semibold">
                                        {formatMoney(
                                          Number(
                                            contribution.amount ||
                                              0
                                          )
                                        )}
                                      </p>

                                      <p
                                        className={`text-xs font-semibold ${
                                          isPaid
                                            ? "text-green-400"
                                            : isProcessing
                                            ? "text-yellow-400"
                                            : "text-white/40"
                                        }`}
                                      >
                                        {isPaid
                                          ? "Paid"
                                          : isProcessing
                                          ? "Processing"
                                          : contribution.payment_status}
                                      </p>

                                      {/* M-PESA RECEIPT FOR PAID PAYMENTS */}
                                      {isPaid &&
                                        contribution.mpesa_receipt && (
                                          <p className="mt-1 text-[11px] text-white/30">
                                            Receipt:{" "}
                                            {
                                              contribution.mpesa_receipt
                                            }
                                          </p>
                                        )}

                                      {/* PROCESSING MESSAGE */}
                                      {isProcessing && (
                                        <p className="mt-1 text-[11px] text-yellow-400/60">
                                          Waiting for M-PESA confirmation
                                        </p>
                                      )}

                                    </div>

                                  </div>
                                )
                              }
                            )}

                          </div>
                        )}

                      </div>

                      {/* ACTIONS */}
                      <div className="grid gap-3 border-t border-white/10 p-6 sm:grid-cols-2 lg:grid-cols-4">

                        <Link
                          href={`/fund/${campaign.slug}`}
                          target="_blank"
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium hover:bg-white/10"
                        >
                          Public Page
                        </Link>

                        <button
                          type="button"
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
                        >
                          Contributors
                        </button>

                        <button
                          type="button"
                          className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10"
                        >
                          Media
                        </button>

                        <button
                          type="button"
                          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold hover:bg-blue-500"
                        >
                          Manage Campaign
                        </button>

                      </div>

                    </section>
                  )
                }
              )}

            </div>
          )}

      </div>
    </main>
  )
}