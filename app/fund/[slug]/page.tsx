"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSupabaseBrowser } from "@/app/lib/supabase-browser"

type FundMedia = {
  id: string
  campaign_id: string
  organizer_id: string
  media_type: "image" | "video"
  media_url: string
  caption: string | null
  created_at: string
  signedUrl: string | null
}

type Campaign = {
  id: string
  title: string
  description: string | null
  target_amount: number
  raised_amount: number
  destination_type: string
  status: string
  slug: string
  cover_image_url: string | null
}

export default function PublicFundraiserPage() {
  const params = useParams()
  const slug = String(params.slug ?? "").trim()
  const supabase = getSupabaseBrowser()

  const [campaign, setCampaign] = useState<Campaign | null>(null)
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
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [media, setMedia] = useState<FundMedia[]>([])
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0)
  useEffect(() => {
    if (!slug) return

    loadCampaign()
  }, [slug])

  async function loadCampaign() {
    setLoading(true)
    setError("")

    const result = await supabase
      .from("fundraising_campaigns")
      .select(
        "id, title, description, target_amount, raised_amount, destination_type, status, slug, cover_image_url"
      )
      .eq("slug", slug)

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

    const campaignData = Array.isArray(result.data)
      ? result.data[0] ?? null
      : result.data

    if (!campaignData) {
      setError("Fundraiser not found.")
      setLoading(false)
      return
    }

    setCampaign(campaignData)

    // Build the contributor media story. The cover is the first item,
    // followed by the fundraiser's uploaded images and videos.
    const loadedMedia: FundMedia[] = []

    if (campaignData.cover_image_url) {
      const { data: signedImage, error: signedImageError } =
        await supabase.storage
          .from("fundraiser-images")
          .createSignedUrl(campaignData.cover_image_url, 60 * 60)

      if (signedImageError) {
        console.error("FUNDRAISER COVER IMAGE ERROR:", signedImageError)
        setCoverImageUrl(null)
      } else {
        const signedUrl = signedImage?.signedUrl ?? null
        setCoverImageUrl(signedUrl)
        loadedMedia.push({
          id: `cover-${campaignData.id}`,
          campaign_id: campaignData.id,
          organizer_id: "",
          media_type: "image",
          media_url: campaignData.cover_image_url,
          caption: null,
          created_at: "",
          signedUrl,
        })
      }
    } else {
      setCoverImageUrl(null)
    }

    const { data: updateData, error: updateError } = await supabase
      .from("fundraising_updates")
      .select("id,campaign_id,organizer_id,media_type,media_url,caption,created_at")
      .eq("campaign_id", campaignData.id)
      .order("created_at", { ascending: true })

    if (updateError) {
      console.error("FUNDRAISER MEDIA ERROR:", updateError)
    }

    const signedUpdates = await Promise.all(
      ((updateData || []) as Omit<FundMedia, "signedUrl">[]).map(async (item) => {
        const bucket = item.media_type === "video"
          ? "fundraiser-videos"
          : "fundraiser-images"

        const { data: signedData, error: signedError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(item.media_url, 60 * 60)

        if (signedError) {
          console.error("FUNDRAISER MEDIA SIGNED URL ERROR:", signedError)
        }

        return {
          ...item,
          signedUrl: signedData?.signedUrl ?? null,
        }
      })
    )

    loadedMedia.push(...signedUpdates)
    setMedia(loadedMedia)
    setSelectedMediaIndex(0)

    setLoading(false)
  }

  function normalizePhone(value: string) {
    const cleaned = value.replace(/\s+/g, "").replace(/-/g, "")

    if (cleaned.startsWith("07") && cleaned.length === 10) {
      return `254${cleaned.slice(1)}`
    }

    if (cleaned.startsWith("01") && cleaned.length === 10) {
      return `254${cleaned.slice(1)}`
    }

    if (cleaned.startsWith("254") && cleaned.length === 12) {
      return cleaned
    }

    return null
  }

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

  console.log("CONTRIBUTION AMOUNT:", value)
  console.log("CONTRIBUTOR PHONE:", normalizedPhone)
  console.log("CONTRIBUTOR NAME:", contributorName)
  console.log("CONTRIBUTION MESSAGE:", message)

  // Move to the next contribution stage.
  setShowPayment(true)
}


  async function startPayment() {
    if (!campaign?.id) return

    setPaymentLoading(true)
    setPaymentError("")

    try {
      const response = await fetch("/api/mpesa/stk/fundraising", {
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
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
          data.ResponseDescription ||
          "Could not start M-PESA payment"
        )
      }

      console.log("FUNDRAISING STK STARTED:", data)

      setPaymentStarted(true)
    } catch (error: any) {
      console.error("FUNDRAISING PAYMENT ERROR:", error)

      setPaymentError(
        error.message || "Could not start M-PESA payment"
      )
    } finally {
      setPaymentLoading(false)
    }
  }
  const selectedMedia = media[selectedMediaIndex] || null

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <p className="text-white/60">
          Loading fundraiser...
        </p>
      </main>
    )
  }


if (showPayment) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {selectedMedia?.signedUrl && selectedMedia.media_type === "video" ? (
        <video
          key={selectedMedia.id}
          src={selectedMedia.signedUrl}
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 h-full w-full object-cover"
        />
      ) : selectedMedia?.signedUrl ? (
        <img
          src={selectedMedia.signedUrl}
          alt=""
          className="fixed inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="fixed inset-0 bg-black/70" />
      <div className="relative z-10 min-h-screen px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">

        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-400">
            STREETGO FUND
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Confirm your contribution
          </h1>

          <p className="mt-3 text-white/60">
            Review your contribution before starting the M-PESA payment.
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
              KES {Number(amount).toLocaleString()}
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

          <button
              type="button"
              onClick={startPayment}
              disabled={paymentLoading || paymentStarted}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
            Pay KES {Number(amount).toLocaleString()}
          </button>

          <button
            type="button"
            onClick={() => setShowPayment(false)}
            className="mt-3 w-full rounded-xl border border-white/10 px-5 py-3 text-sm text-white/60 hover:bg-white/5"
          >
            Back
          </button>

        </div>
      </div>
    </div>
    </main>
  )
}


  if (error || !campaign) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-2xl font-bold">
            Fundraiser error
          </h1>

          <p className="mt-3 text-red-300 break-words">
            {error || "Fundraiser not found."}
          </p>
        </div>
      </main>
    )
  }

  const target = Number(campaign.target_amount)
  const raised = Number(campaign.raised_amount)

  const percentage =
    target > 0
      ? Math.min((raised / target) * 100, 100)
      : 0

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* CONTRIBUTOR VIEW: selected fundraiser media is the full-page background */}
      {selectedMedia?.signedUrl && selectedMedia.media_type === "video" ? (
        <video
          key={selectedMedia.id}
          src={selectedMedia.signedUrl}
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 h-full w-full object-cover"
        />
      ) : selectedMedia?.signedUrl ? (
        <img
          src={selectedMedia.signedUrl}
          alt=""
          className="fixed inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="fixed inset-0 bg-[#020617]" />
      )}

      {/* Readability layer above the media */}
      <div className="fixed inset-0 bg-black/60" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/75" />

      <div className="relative z-10 min-h-screen px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8">
            <p className="text-sm font-semibold tracking-[0.2em] text-blue-300">
              STREETGO FUND
            </p>

            <h1 className="mt-3 text-4xl font-bold drop-shadow-lg">
              {campaign.title}
            </h1>

            {campaign.description && (
              <p className="mt-3 max-w-xl leading-7 text-white/80">
                {campaign.description}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-white/20 bg-black/35 p-6 backdrop-blur-sm">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-white/60">Raised</p>
                <p className="mt-1 text-3xl font-bold">
                  KES {raised.toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-white/60">Target</p>
                <p className="mt-1 font-semibold">
                  KES {target.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-sm text-white/70">
              <span>{percentage.toFixed(0)}% funded</span>
              <span>
                KES {Math.max(target - raised, 0).toLocaleString()} remaining
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/20 bg-black/35 p-6 backdrop-blur-sm">
            {!showContribution ? (
              <>
                <h2 className="text-xl font-bold">Support this fundraiser</h2>
                <p className="mt-2 text-sm text-white/70">
                  Enter the amount you would like to contribute.
                </p>
                <button
                  type="button"
                  onClick={() => setShowContribution(true)}
                  className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500"
                >
                  Contribute
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">Your contribution</h2>
                <p className="mt-2 text-sm text-white/70">
                  Enter your contribution details.
                </p>

                <div className="mt-5">
                  <label className="mb-2 block text-sm text-white/70">Amount</label>
                  <div className="flex items-center rounded-xl border border-white/20 bg-black/40 px-4">
                    <span className="text-white/60">KES</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="500"
                      className="w-full bg-transparent px-3 py-3 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm text-white/70">M-PESA phone number</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value)
                      setPhoneError("")
                    }}
                    placeholder="0712345678"
                    className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                  {phoneError && (
                    <p className="mt-2 text-sm text-red-300">{phoneError}</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm text-white/70">
                    Your name <span className="text-white/40">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm text-white/70">
                    Message <span className="text-white/40">(optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a message..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-white outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!amount || Number(amount) <= 0 || !phone}
                  className="mt-5 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>

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
                  className="mt-3 w-full rounded-xl border border-white/20 px-5 py-3 text-sm text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>
              </>
            )}
          </div>

          {media.length > 0 && (
            <div className="mt-5 flex items-center gap-2 overflow-x-auto rounded-xl border border-white/15 bg-black/35 p-2 backdrop-blur-sm">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedMediaIndex(index)}
                  aria-label={`View fundraiser ${item.media_type} ${index + 1}`}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden border transition ${
                    selectedMediaIndex === index
                      ? "border-blue-400 ring-1 ring-blue-400/70"
                      : "border-white/15 opacity-75 hover:opacity-100"
                  }`}
                >
                  {item.media_type === "video" ? (
                    <video
                      src={item.signedUrl || undefined}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.signedUrl || undefined}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}

                  {item.media_type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-xs font-bold">
                      ▶
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
