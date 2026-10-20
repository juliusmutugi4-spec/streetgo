"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseBrowser } from "@/app/lib/supabase-browser"

type Campaign = {
  id: string
  title: string
  description: string | null
  target_amount: number
  raised_amount: number
  destination_type: string
  status: string
  slug: string
}

type Contribution = {
  id: string
  amount: number
  contributor_name: string | null
  payment_status: string
  paid_at: string | null
  created_at: string
}

export default function PublicFundraiserPage() {
  const params = useParams()
  const slug = String(params.slug ?? "").trim()
  const supabase = getSupabaseBrowser()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showContribution, setShowContribution] = useState(false)
  const [amount, setAmount] = useState("")
  const [phone, setPhone] = useState("")
  const [contributorName, setContributorName] = useState("")
  const [message, setMessage] = useState("")
  const [phoneError, setPhoneError] = useState("")

  const [showPayment, setShowPayment] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState("")
  const [paymentStarted, setPaymentStarted] = useState(false)

  useEffect(() => {
    if (!slug) return

    loadCampaign()
  }, [slug])

  async function loadCampaign() {
    setLoading(true)
    setError("")

    try {
      // ==================================================
      // LOAD CAMPAIGN
      // ==================================================

      const result = await supabase
        .from("fundraising_campaigns")
        .select(
          "id, title, description, target_amount, raised_amount, destination_type, status, slug"
        )
        .eq("slug", slug)
        .maybeSingle()

      console.log("FUND SLUG:", slug)
      console.log("FUND DATA:", result.data)
      console.log("FUND ERROR:", result.error)

      if (result.error) {
        const errorMessage =
          result.error.message ||
          result.error.details ||
          result.error.hint ||
          `Supabase error code: ${result.error.code || "unknown"}`

        setError(errorMessage)
        setLoading(false)
        return
      }

      const campaignData = result.data

      if (!campaignData) {
        setError("Fundraiser not found.")
        setLoading(false)
        return
      }

      setCampaign(campaignData)

      // ==================================================
      // LOAD PAID PUBLIC CONTRIBUTIONS
      // ==================================================

      const {
        data: contributionData,
        error: contributionError,
      } = await supabase
        .from("fundraising_contributions")
        .select(
          `
            id,
            amount,
            contributor_name,
            payment_status,
            paid_at,
            created_at
          `
        )
        .eq("campaign_id", campaignData.id)
        .eq("payment_status", "paid")
        .order("paid_at", {
          ascending: false,
        })

      if (contributionError) {
console.error(
  "PUBLIC CONTRIBUTIONS ERROR:",
  JSON.stringify(contributionError, null, 2)
)

        /*
         * We do not fail the whole fundraiser page
         * if contributors cannot be loaded.
         */
        setContributions([])
      } else {
        setContributions(
          contributionData || []
        )
      }

      setLoading(false)
    } catch (error: any) {
      console.error(
        "PUBLIC FUNDRAISER LOAD ERROR:",
        error
      )

      setError(
        error?.message ||
          "Could not load fundraiser."
      )

      setLoading(false)
    }
  }

  // ==================================================
  // PHONE NORMALIZATION
  // ==================================================

  function normalizePhone(value: string) {
    const cleaned = value
      .replace(/\s+/g, "")
      .replace(/-/g, "")

    if (
      cleaned.startsWith("07") &&
      cleaned.length === 10
    ) {
      return `254${cleaned.slice(1)}`
    }

    if (
      cleaned.startsWith("01") &&
      cleaned.length === 10
    ) {
      return `254${cleaned.slice(1)}`
    }

    if (
      cleaned.startsWith("254") &&
      cleaned.length === 12
    ) {
      return cleaned
    }

    return null
  }

  // ==================================================
  // CONTRIBUTION FORM
  // ==================================================

  function handleContinue() {
    setPhoneError("")

    const value = Number(amount)

    if (!value || value <= 0) {
      return
    }

    const normalizedPhone = normalizePhone(phone)

    if (!normalizedPhone) {
      setPhoneError(
        "Enter a valid Kenyan phone number, for example 0712345678."
      )
      return
    }

    console.log(
      "CONTRIBUTION AMOUNT:",
      value
    )

    console.log(
      "CONTRIBUTOR PHONE:",
      normalizedPhone
    )

    console.log(
      "CONTRIBUTOR NAME:",
      contributorName
    )

    console.log(
      "CONTRIBUTION MESSAGE:",
      message
    )

    setShowPayment(true)
  }

  // ==================================================
  // START M-PESA PAYMENT
  // ==================================================

  async function startPayment() {
    if (!campaign?.id) return

    setPaymentLoading(true)
    setPaymentError("")

    try {
      const response = await fetch(
        "/api/mpesa/stk/fundraising",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaignId: campaign.id,
            amount: Number(amount),
            phone,
            contributorName,
            message,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            data.ResponseDescription ||
            "Could not start M-PESA payment"
        )
      }

      console.log(
        "FUNDRAISING STK STARTED:",
        data
      )

      setPaymentStarted(true)
    } catch (error: any) {
      console.error(
        "FUNDRAISING PAYMENT ERROR:",
        error
      )

      setPaymentError(
        error.message ||
          "Could not start M-PESA payment"
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  // ==================================================
  // PUBLIC CONTRIBUTOR NAME
  // ==================================================

  function getPublicContributorName(
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

  // ==================================================
  // PUBLIC CONTRIBUTION TIME
  // ==================================================

  function formatContributionTime(
    contribution: Contribution
  ) {
    const date = new Date(
      contribution.paid_at ||
        contribution.created_at
    )

    if (Number.isNaN(date.getTime())) {
      return "Unknown time"
    }

    return date.toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <p className="text-white/60">
          Loading fundraiser...
        </p>
      </main>
    )
  }

  // ==================================================
  // PAYMENT CONFIRMATION SCREEN
  // ==================================================

  if (showPayment) {
    return (
      <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-400">
              STREETGO FUND
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Confirm your contribution
            </h1>

            <p className="mt-3 text-white/60">
              Review your contribution before
              starting the M-PESA payment.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-white/50">
                Fundraiser
              </span>

              <span className="font-semibold">
                {campaign?.title}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-white/50">
                Contribution
              </span>

              <span className="text-2xl font-bold">
                KES{" "}
                {Number(amount).toLocaleString()}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-white/50">
                M-PESA number
              </span>

              <span className="font-semibold">
                {phone}
              </span>
            </div>

            {contributorName && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-white/50">
                  Name
                </span>

                <span>
                  {contributorName}
                </span>
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-xl bg-white/5 p-4">
                <p className="text-xs text-white/40">
                  Message
                </p>

                <p className="mt-1 text-sm text-white/80">
                  {message}
                </p>
              </div>
            )}

            {paymentError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                {paymentError}
              </div>
            )}

            {paymentStarted ? (
              <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-5">
                <p className="font-semibold text-green-300">
                  M-PESA payment request sent.
                </p>

                <p className="mt-2 text-sm text-white/60">
                  Check your phone and complete
                  the M-PESA payment.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setShowPayment(false)
                    setPaymentStarted(false)
                    setShowContribution(false)
                    setAmount("")
                    setPhone("")
                    setContributorName("")
                    setMessage("")
                    loadCampaign()
                  }}
                  className="mt-4 w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70 hover:bg-white/5"
                >
                  Back to fundraiser
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startPayment}
                  disabled={paymentLoading}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paymentLoading
                    ? "Starting M-PESA..."
                    : `Pay KES ${Number(
                        amount
                      ).toLocaleString()}`}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowPayment(false)
                  }
                  className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 hover:bg-white/5"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    )
  }

  // ==================================================
  // CAMPAIGN ERROR
  // ==================================================

  if (error || !campaign) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
        <div className="max-w-lg text-center">
          <h1 className="text-2xl font-bold">
            Fundraiser error
          </h1>

          <p className="mt-3 break-words text-red-300">
            {error ||
              "Fundraiser not found."}
          </p>
        </div>
      </main>
    )
  }

  // ==================================================
  // CAMPAIGN CALCULATIONS
  // ==================================================

  const target = Number(
    campaign.target_amount || 0
  )

  const raised = Number(
    campaign.raised_amount || 0
  )

  const percentage =
    target > 0
      ? Math.min(
          (raised / target) * 100,
          100
        )
      : 0

  // ==================================================
  // PUBLIC FUNDRAISER PAGE
  // ==================================================

  return (
    <main className="min-h-screen bg-[#020617] px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-2xl">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            STREETGO FUND
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {campaign.title}
          </h1>

          {campaign.description && (
            <p className="mt-3 leading-7 text-white/60">
              {campaign.description}
            </p>
          )}
        </div>

        {/* PROGRESS */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-white/50">
                Raised
              </p>

              <p className="mt-1 text-3xl font-bold">
                KES {raised.toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-white/50">
                Target
              </p>

              <p className="mt-1 font-semibold">
                KES {target.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-sm text-white/50">
            <span>
              {percentage.toFixed(0)}% funded
            </span>

            <span>
              KES{" "}
              {Math.max(
                target - raised,
                0
              ).toLocaleString()}{" "}
              remaining
            </span>
          </div>
        </div>

        {/* RECENT CONTRIBUTORS */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 p-6">
            <h2 className="text-xl font-bold">
              Recent Contributors
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Thank you to everyone supporting
              this fundraiser.
            </p>
          </div>

          {contributions.length === 0 ? (
            <div className="p-6 text-sm text-white/50">
              No contributions yet.
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {contributions.map(
                (contribution) => (
                  <div
                    key={contribution.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 font-bold text-blue-300">
                        {getPublicContributorName(
                          contribution
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {getPublicContributorName(
                            contribution
                          )}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {formatContributionTime(
                            contribution
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold">
                        KES{" "}
                        {Number(
                          contribution.amount
                        ).toLocaleString(
                          "en-KE"
                        )}
                      </p>

                      <p className="mt-1 text-xs text-green-400">
                        Contributed
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* CONTRIBUTION CARD */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          {!showContribution ? (
            <>
              <h2 className="text-xl font-bold">
                Support this fundraiser
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Enter the amount you would like
                to contribute.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowContribution(true)
                }
                className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
              >
                Contribute
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">
                Your contribution
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Enter your contribution details.
              </p>

              {/* AMOUNT */}
              <div className="mt-5">
                <label className="mb-2 block text-sm text-white/60">
                  Amount
                </label>

                <div className="flex items-center rounded-xl border border-white/10 bg-black/20 px-4">
                  <span className="text-white/50">
                    KES
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) =>
                      setAmount(e.target.value)
                    }
                    placeholder="500"
                    className="w-full bg-transparent px-3 py-3 text-white outline-none"
                  />
                </div>
              </div>

              {/* PHONE */}
              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/60">
                  M-PESA phone number
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setPhoneError("")
                  }}
                  placeholder="0712345678"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />

                {phoneError && (
                  <p className="mt-2 text-sm text-red-400">
                    {phoneError}
                  </p>
                )}
              </div>

              {/* NAME */}
              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/60">
                  Your name
                  <span className="ml-1 text-white/30">
                    (optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={contributorName}
                  onChange={(e) =>
                    setContributorName(
                      e.target.value
                    )
                  }
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </div>

              {/* MESSAGE */}
              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/60">
                  Message
                  <span className="ml-1 text-white/30">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Leave a message..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                />
              </div>

              {/* CONTINUE */}
              <button
                type="button"
                onClick={handleContinue}
                disabled={
                  !amount ||
                  Number(amount) <= 0 ||
                  !phone
                }
                className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>

              {/* CANCEL */}
              <button
                type="button"
                onClick={() => {
                  setShowContribution(false)
                  setAmount("")
                  setPhone("")
                  setContributorName("")
                  setMessage("")
                  setPhoneError("")
                }}
                className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 hover:bg-white/5"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}