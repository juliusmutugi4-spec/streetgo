"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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

export default function DashboardContent() {
  const supabase = getSupabaseBrowser()
  const searchParams = useSearchParams()

  const selectedCampaignId =
    searchParams.get("campaign")

  const [campaign, setCampaign] =
    useState<Campaign | null>(null)

  const [contributions, setContributions] =
    useState<Contribution[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  useEffect(() => {
    let mounted = true

    async function loadDashboard() {
      try {
        setLoading(true)
        setError("")

        /*
         * ---------------------------------------------------------
         * AUTHENTICATED USER
         * ---------------------------------------------------------
         */

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (mounted) {
            setCampaign(null)
            setContributions([])
            setError(
              "Please sign in to access your fundraiser."
            )
          }

          return
        }

        /*
         * ---------------------------------------------------------
         * REQUIRE A SELECTED CAMPAIGN
         * ---------------------------------------------------------
         */

        if (!selectedCampaignId) {
          if (mounted) {
            setCampaign(null)
            setContributions([])
            setError(
              "Select a fundraiser to continue."
            )
          }

          return
        }

        /*
         * ---------------------------------------------------------
         * LOAD ONLY THE SELECTED CAMPAIGN
         *
         * IMPORTANT:
         *
         * organizer_id = current user
         * id            = selected campaign
         * status        = active
         *
         * This prevents another user's campaign from
         * being displayed even if its ID is manually supplied.
         * ---------------------------------------------------------
         */

        const {
          data: campaignData,
          error: campaignError,
        } = await supabase
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
          .eq("id", selectedCampaignId)
          .eq("organizer_id", user.id)
          .eq("status", "active")
          .maybeSingle()

        if (campaignError) {
          console.error(
            "SELECTED FUNDRAISER ERROR:",
            campaignError
          )

          if (mounted) {
            setCampaign(null)
            setContributions([])
            setError(
              "Unable to load the selected fundraiser."
            )
          }

          return
        }

        if (!campaignData) {
          if (mounted) {
            setCampaign(null)
            setContributions([])
            setError(
              "The selected fundraiser is unavailable or no longer open."
            )
          }

          return
        }

        /*
         * Extra frontend ownership verification.
         */

        if (
          campaignData.organizer_id !== user.id
        ) {
          if (mounted) {
            setCampaign(null)
            setContributions([])
            setError(
              "You do not have access to this fundraiser."
            )
          }

          return
        }

        /*
         * ---------------------------------------------------------
         * LOAD CONTRIBUTIONS FOR THIS CAMPAIGN ONLY
         * ---------------------------------------------------------
         */

        const {
          data: contributionData,
          error: contributionError,
        } = await supabase
          .from("fundraising_contributions")
          .select(`
            id,
            campaign_id,
            amount,
            contributor_name,
            contributor_phone,
            payment_status,
            mpesa_receipt,
            paid_at,
            created_at
          `)
          .eq(
            "campaign_id",
            campaignData.id
          )
          .order(
            "created_at",
            { ascending: false }
          )

        if (contributionError) {
          console.error(
            "SELECTED FUNDRAISER CONTRIBUTIONS ERROR:",
            contributionError
          )

          if (mounted) {
            setCampaign(campaignData as Campaign)
            setContributions([])
            setError(
              "The fundraiser loaded, but its contributions could not be retrieved."
            )
          }

          return
        }

        /*
         * Final safety check.
         */

        const safeContributions =
          ((contributionData || []) as Contribution[])
            .filter(
              (contribution) =>
                contribution.campaign_id ===
                campaignData.id
            )

        if (mounted) {
          setCampaign(
            campaignData as Campaign
          )

          setContributions(
            safeContributions
          )
        }
      } catch (err) {
        console.error(
          "FUNDRAISER DASHBOARD ERROR:",
          err
        )

        if (mounted) {
          setCampaign(null)
          setContributions([])
          setError(
            "Something went wrong while loading the fundraiser."
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      mounted = false
    }
  }, [supabase, selectedCampaignId])

  /*
   * ---------------------------------------------------------
   * CALCULATIONS
   * ---------------------------------------------------------
   */

  const paidContributions = useMemo(() => {
    return contributions.filter(
      (contribution) =>
        contribution.payment_status ===
        "paid"
    )
  }, [contributions])

  const processingContributions = useMemo(() => {
    return contributions.filter(
      (contribution) =>
        contribution.payment_status ===
        "processing"
    )
  }, [contributions])

  const pendingAmount = useMemo(() => {
    return processingContributions.reduce(
      (total, contribution) =>
        total +
        Number(
          contribution.amount || 0
        ),
      0
    )
  }, [processingContributions])

  const target = Number(
    campaign?.target_amount || 0
  )

  const raised = Number(
    campaign?.raised_amount || 0
  )

  const progress =
    target > 0
      ? Math.min(
          (raised / target) * 100,
          100
        )
      : 0

  /*
   * ---------------------------------------------------------
   * FORMATTING
   * ---------------------------------------------------------
   */

  function formatMoney(
    value: number
  ) {
    return `KSh ${value.toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`
  }

  function formatDate(
    value: string
  ) {
    const date = new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown date"
    }

    return date.toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    )
  }

  function formatDateTime(
    paidAt: string | null,
    createdAt: string
  ) {
    const date = new Date(
      paidAt || createdAt
    )

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Unknown time"
    }

    return date.toLocaleString(
      "en-KE",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    )
  }

  function contributorName(
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

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white">
        <div className="mx-auto max-w-5xl px-5 py-10">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            STREETGO FUND
          </p>

          <h1 className="mt-2 text-2xl font-semibold">
            Fundraiser Overview
          </h1>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-sm text-white/50">
              Loading fundraiser...
            </p>
          </div>

        </div>
      </main>
    )
  }

  /*
   * ---------------------------------------------------------
   * ERROR / NO CAMPAIGN
   * ---------------------------------------------------------
   */

  if (error || !campaign) {
    return (
      <main className="min-h-screen bg-[#020617] text-white">
        <div className="mx-auto max-w-5xl px-5 py-10">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                STREETGO FUND
              </p>

              <h1 className="mt-2 text-2xl font-semibold">
                Fundraiser Overview
              </h1>
            </div>

            <Link
              href="/fund"
              className="text-sm text-white/50 transition hover:text-white"
            >
              My Fundraisers
            </Link>

          </div>

          <div className="mt-8 border-y border-white/10 py-8">

            <p className="text-sm text-red-300">
              {error ||
                "The selected fundraiser could not be found."}
            </p>

            <Link
              href="/fund"
              className="mt-5 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              ← Return to My Fundraisers
            </Link>

          </div>

        </div>
      </main>
    )
  }

  /*
   * ---------------------------------------------------------
   * MAIN DASHBOARD
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      <div className="mx-auto max-w-5xl px-5 py-8">

        {/* HEADER */}

        <header className="border-b border-white/10 pb-6">

          <div className="flex items-start justify-between gap-6">

            <div className="min-w-0">

              <Link
                href="/fund"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300"
              >
                StreetGO Fund
              </Link>

              <h1 className="mt-3 truncate text-2xl font-semibold">
                {campaign.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/40">

                <span>
                  Created{" "}
                  {formatDate(
                    campaign.created_at
                  )}
                </span>

                <span>
                  {campaign.status ===
                  "active"
                    ? "Open"
                    : campaign.status}
                </span>

              </div>

            </div>

            <Link
              href="/fund"
              className="shrink-0 text-sm text-white/50 hover:text-white"
            >
              My Fundraisers
            </Link>

          </div>

        </header>

        {/* OVERVIEW */}

        <section className="border-b border-white/10 py-7">

          <div className="flex items-center justify-between">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
              Fundraising Progress
            </h2>

            <span className="text-sm font-semibold text-blue-400">
              {progress.toFixed(1)}%
            </span>

          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">

            <div>
              <span className="text-white/40">
                Raised
              </span>

              <p className="mt-1 font-semibold">
                {formatMoney(raised)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-white/40">
                Target
              </span>

              <p className="mt-1 font-semibold">
                {formatMoney(target)}
              </p>
            </div>

          </div>

        </section>

        {/* CONTRIBUTION SUMMARY */}

        <section className="border-b border-white/10 py-7">

          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
            Contribution Summary
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3">

            <div>
              <p className="text-xs uppercase tracking-wide text-white/35">
                Confirmed
              </p>

              <p className="mt-2 text-xl font-semibold">
                {paidContributions.length}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Contributions
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/35">
                Confirmed Amount
              </p>

              <p className="mt-2 text-xl font-semibold">
                {formatMoney(raised)}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Received
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/35">
                Processing
              </p>

              <p className="mt-2 text-xl font-semibold text-yellow-300">
                {formatMoney(
                  pendingAmount
                )}
              </p>

              <p className="mt-1 text-xs text-white/35">
                Awaiting confirmation
              </p>
            </div>

          </div>

        </section>

        {/* RECENT CONTRIBUTIONS */}

        <section className="border-b border-white/10 py-7">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Recent Contributions
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Latest activity for this fundraiser
              </p>
            </div>

            <span className="text-xs text-white/30">
              {contributions.length} total
            </span>

          </div>

          {contributions.length === 0 ? (

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-sm text-white/40">
                No contributions have been recorded yet.
              </p>
            </div>

          ) : (

            <div className="mt-5">

              {contributions
                .slice(0, 10)
                .map(
                  (contribution) => {

                    const isPaid =
                      contribution.payment_status ===
                      "paid"

                    const isProcessing =
                      contribution.payment_status ===
                      "processing"

                    return (
                      <div
                        key={
                          contribution.id
                        }
                        className="flex flex-col gap-3 border-t border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="min-w-0">

                          <p className="font-medium">
                            {contributorName(
                              contribution
                            )}
                          </p>

                          <p className="mt-1 text-xs text-white/35">
                            {formatDateTime(
                              contribution.paid_at,
                              contribution.created_at
                            )}
                          </p>

                        </div>

                        <div className="sm:text-right">

                          <p className="font-semibold">
                            {formatMoney(
                              Number(
                                contribution.amount ||
                                0
                              )
                            )}
                          </p>

                          <p
                            className={`mt-1 text-xs font-medium ${
                              isPaid
                                ? "text-green-400"
                                : isProcessing
                                ? "text-yellow-400"
                                : "text-white/40"
                            }`}
                          >
                            {isPaid
                              ? "Confirmed"
                              : isProcessing
                              ? "Processing"
                              : contribution.payment_status}
                          </p>

                          {isPaid &&
                            contribution.mpesa_receipt && (
                              <p className="mt-1 text-[11px] text-white/25">
                                Receipt{" "}
                                {
                                  contribution.mpesa_receipt
                                }
                              </p>
                            )}

                        </div>

                      </div>
                    )
                  }
                )}

            </div>

          )}

        </section>

        {/* PUBLIC FUNDRAISER */}

        <section className="border-b border-white/10 py-7">

          <div className="flex items-center justify-between gap-5">

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Public Fundraiser
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Share this fundraiser with contributors.
              </p>
            </div>

            <div className="flex shrink-0 gap-4">

              <Link
                href={`/fund/${campaign.slug}`}
                target="_blank"
                className="text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                View Public Page →
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
                        "Fundraiser link copied."
                      )
                    })
                    .catch(() => {
                      alert(
                        "Unable to copy the fundraiser link."
                      )
                    })
                }}
                className="text-sm font-medium text-white/50 hover:text-white"
              >
                Copy Link
              </button>

            </div>

          </div>

        </section>

        {/* MANAGEMENT */}

        <section className="py-7">

          <div className="flex flex-wrap items-center justify-between gap-5">

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
                Campaign Management
              </h2>

              <p className="mt-1 text-xs text-white/35">
                Manage settings and fundraiser activity.
              </p>
            </div>

            <Link
              href={`/fund/dashboard?campaign=${campaign.id}`}
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Manage Campaign →
            </Link>

          </div>

        </section>

      </div>

    </main>
  )
}
