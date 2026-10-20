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
  cover_image_url: string | null
  current_video_url: string | null
  media_caption: string | null
  media_updated_at: string | null
}

interface MediaUpdate {
  id: string
  campaign_id: string
  organizer_id: string
  media_type: "image" | "video"
  media_url: string
  caption: string | null
  created_at: string
  signedUrl?: string | null
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)
  const [mediaUpdates, setMediaUpdates] = useState<MediaUpdate[]>([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [mediaError, setMediaError] = useState("")
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
            setMediaUpdates([])
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
            setMediaUpdates([])
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
            organizer_id,
            cover_image_url,
            current_video_url,
            media_caption,
            media_updated_at
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

        let signedCoverUrl: string | null = null

        if (campaignData.cover_image_url) {
          const { data: signedImageData, error: signedImageError } =
            await supabase.storage
              .from("fundraiser-images")
              .createSignedUrl(
                campaignData.cover_image_url,
                60 * 60 * 24
              )

          if (signedImageError) {
            console.error(
              "FUNDRAISER COVER IMAGE URL ERROR:",
              signedImageError
            )
          } else {
            signedCoverUrl = signedImageData?.signedUrl || null
          }
        }

        const { data: mediaData, error: mediaLoadError } =
          await supabase
            .from("fundraising_updates")
            .select("id,campaign_id,organizer_id,media_type,media_url,caption,created_at")
            .eq("campaign_id", campaignData.id)
            .eq("organizer_id", user.id)
            .order("created_at", { ascending: false })

        if (mediaLoadError) {
          console.error("FUNDRAISER MEDIA LOAD ERROR:", mediaLoadError)
        }

        const signedMedia = await Promise.all(
          ((mediaData || []) as MediaUpdate[]).map(async (item) => {
            const bucket = item.media_type === "video"
              ? "fundraiser-videos"
              : "fundraiser-images"

            const { data: signedData, error: signedError } =
              await supabase.storage
                .from(bucket)
                .createSignedUrl(item.media_url, 60 * 60 * 24)

            if (signedError) {
              console.error("FUNDRAISER MEDIA URL ERROR:", signedError)
            }

            return {
              ...item,
              signedUrl: signedData?.signedUrl || null,
            }
          })
        )

        if (mounted) {
          setCampaign(
            campaignData as Campaign
          )

          setCoverImageUrl(signedCoverUrl)

          setMediaUpdates(signedMedia)

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

  async function handleCoverImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file || !campaign) {
      return
    }

    setImageError("")

    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file.")
      event.target.value = ""
      return
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      setImageError("Image must be smaller than 10 MB.")
      event.target.value = ""
      return
    }

    try {
      setUploadingImage(true)

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg"

      const filePath =
        `${campaign.id}/cover-${Date.now()}.${extension}`

      const { error: uploadError } =
        await supabase.storage
          .from("fundraiser-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

      if (uploadError) {
        console.error(
          "FUNDRAISER IMAGE UPLOAD ERROR:",
          uploadError
        )
        throw uploadError
      }

      const { error: updateError } =
        await supabase
          .from("fundraising_campaigns")
          .update({
            cover_image_url: filePath,
            media_updated_at: new Date().toISOString(),
          })
          .eq("id", campaign.id)
          .eq("organizer_id", campaign.organizer_id)

      if (updateError) {
        console.error(
          "FUNDRAISER IMAGE DATABASE UPDATE ERROR:",
          updateError
        )
        throw updateError
      }

      const { data: signedImageData, error: signedImageError } =
        await supabase.storage
          .from("fundraiser-images")
          .createSignedUrl(filePath, 60 * 60 * 24)

      if (signedImageError || !signedImageData?.signedUrl) {
        throw signedImageError ||
          new Error("Unable to create image preview.")
      }

      setCoverImageUrl(signedImageData.signedUrl)

      setCampaign({
        ...campaign,
        cover_image_url: filePath,
        media_updated_at: new Date().toISOString(),
      })
    } catch (uploadError) {
      console.error(
        "COVER IMAGE ERROR:",
        uploadError
      )

      setImageError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload the cover image."
      )
    } finally {
      setUploadingImage(false)
      event.target.value = ""
    }
  }

  async function handleMediaUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || [])

    if (!campaign || files.length === 0) return

    setMediaError("")

    const imageCount = mediaUpdates.filter((item) => item.media_type === "image").length
    const videoCount = mediaUpdates.filter((item) => item.media_type === "video").length

    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    const videoFiles = files.filter((file) => file.type.startsWith("video/"))

    if (imageCount + imageFiles.length > 6) {
      setMediaError("You can upload up to 6 gallery images for this fundraiser.")
      event.target.value = ""
      return
    }

    if (videoCount + videoFiles.length > 10) {
      setMediaError("You can upload up to 10 fundraiser videos.")
      event.target.value = ""
      return
    }

    for (const file of files) {
      const maxSize = file.type.startsWith("video/")
        ? 100 * 1024 * 1024
        : 10 * 1024 * 1024

      if (file.size > maxSize) {
        setMediaError(
          file.type.startsWith("video/")
            ? `${file.name} is larger than 100 MB.`
            : `${file.name} is larger than 10 MB.`
        )
        event.target.value = ""
        return
      }

      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setMediaError(`${file.name} is not a supported image or video.`)
        event.target.value = ""
        return
      }
    }

    try {
      setUploadingMedia(true)

      const newItems: MediaUpdate[] = []

      for (const file of files) {
        const isVideo = file.type.startsWith("video/")
        const bucket = isVideo ? "fundraiser-videos" : "fundraiser-images"
        const extension = file.name.split(".").pop()?.toLowerCase() || (isVideo ? "mp4" : "jpg")
        const filePath = `${campaign.id}/update-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, { cacheControl: "3600", upsert: false })

        if (uploadError) throw uploadError

        const { data: inserted, error: insertError } = await supabase
          .from("fundraising_updates")
          .insert({
            campaign_id: campaign.id,
            organizer_id: campaign.organizer_id,
            media_type: isVideo ? "video" : "image",
            media_url: filePath,
          })
          .select("id,campaign_id,organizer_id,media_type,media_url,caption,created_at")
          .single()

        if (insertError) throw insertError

        const { data: signedData } = await supabase.storage
          .from(bucket)
          .createSignedUrl(filePath, 60 * 60 * 24)

        newItems.push({
          ...(inserted as MediaUpdate),
          signedUrl: signedData?.signedUrl || null,
        })
      }

      setMediaUpdates((current) => [...newItems, ...current])
      setCampaign({
        ...campaign,
        media_updated_at: new Date().toISOString(),
      })
    } catch (uploadError) {
      console.error("FUNDRAISER MEDIA UPLOAD ERROR:", uploadError)
      setMediaError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload fundraiser media."
      )
    } finally {
      setUploadingMedia(false)
      event.target.value = ""
    }
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
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      {/* FULL-PAGE CAMPAIGN BACKGROUND */}
      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt=""
          aria-hidden="true"
          className="fixed inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="fixed inset-0 bg-[#020617]" />
      )}

      {/* READABILITY OVERLAY */}
      <div className="fixed inset-0 bg-black/65" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/50 via-black/65 to-[#020617]/90" />

      {/* DASHBOARD CONTENT */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-8">
        {/* HEADER */}
        <header className="border-b border-white/15 pb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <Link
                href="/fund"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 hover:text-blue-300"
              >
                StreetGO Fund
              </Link>

              <h1 className="mt-3 truncate text-3xl font-semibold drop-shadow-lg sm:text-4xl">
                {campaign.title}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/65">
                <span>Created {formatDate(campaign.created_at)}</span>
                <span>
                  {campaign.status === "active"
                    ? "Open"
                    : campaign.status}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3">
              <Link
                href="/fund"
                className="text-sm text-white/60 hover:text-white"
              >
                My Fundraisers
              </Link>

              <label className="inline-flex cursor-pointer items-center border border-white/25 bg-black/25 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/10">
                {uploadingImage ? "Uploading..." : "Change Image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

          {imageError && (
            <p className="mt-4 text-sm text-red-300">
              {imageError}
            </p>
          )}
        </header>

        {/* FUNDRAISING PROGRESS — OVER THE IMAGE */}
        <section className="border-b border-white/15 py-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
              Fundraising Progress
            </h2>

            <span className="text-sm font-semibold text-blue-300">
              {progress.toFixed(1)}%
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden bg-white/20">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 flex items-end justify-between text-sm">
            <div>
              <span className="text-white/55">Raised</span>
              <p className="mt-1 text-lg font-semibold drop-shadow">
                {formatMoney(raised)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-white/55">Target</span>
              <p className="mt-1 text-lg font-semibold drop-shadow">
                {formatMoney(target)}
              </p>
            </div>
          </div>
        </section>

        {/* FUNDRAISER MEDIA */}
        <section className="border-b border-white/15 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                Fundraiser Media
              </h2>
              <p className="mt-1 text-xs text-white/45">
                Add up to 6 images and videos for contributors to explore.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center border border-white/25 bg-black/25 px-4 py-2 text-sm font-medium backdrop-blur-sm transition hover:bg-white/10">
              {uploadingMedia ? "Uploading..." : "Add Media"}
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleMediaUpload}
                disabled={uploadingMedia}
              />
            </label>
          </div>

          {mediaError && (
            <p className="mt-4 text-sm text-red-300">{mediaError}</p>
          )}

          {mediaUpdates.length === 0 ? (
            <div className="mt-5 border border-dashed border-white/15 bg-black/20 px-5 py-8 text-center text-sm text-white/40">
              No additional media yet.
            </div>
          ) : (
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {mediaUpdates.map((item) => (
                <div key={item.id} className="relative h-24 w-24 shrink-0 overflow-hidden border border-white/15 bg-black/40">
                  {item.media_type === "video" ? (
                    <video
                      src={item.signedUrl || undefined}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.signedUrl || undefined}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  {item.media_type === "video" && (
                    <span className="absolute bottom-1 left-1 bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold">
                      VIDEO
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CONTRIBUTION SUMMARY */}
        <section className="border-b border-white/15 py-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
            Contribution Summary
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">
                Confirmed
              </p>
              <p className="mt-2 text-2xl font-semibold drop-shadow">
                {paidContributions.length}
              </p>
              <p className="mt-1 text-xs text-white/45">Contributions</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">
                Confirmed Amount
              </p>
              <p className="mt-2 text-2xl font-semibold drop-shadow">
                {formatMoney(raised)}
              </p>
              <p className="mt-1 text-xs text-white/45">Received</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">
                Processing
              </p>
              <p className="mt-2 text-2xl font-semibold text-yellow-300 drop-shadow">
                {formatMoney(pendingAmount)}
              </p>
              <p className="mt-1 text-xs text-white/45">
                Awaiting confirmation
              </p>
            </div>
          </div>
        </section>

        {/* RECENT CONTRIBUTIONS */}
        <section className="border-b border-white/15 py-8">
          <div className="flex items-center justify-between gap-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                Recent Contributions
              </h2>
              <p className="mt-1 text-xs text-white/45">
                Latest activity for this fundraiser
              </p>
            </div>

            <span className="text-xs text-white/45">
              {contributions.length} total
            </span>
          </div>

          {contributions.length === 0 ? (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-sm text-white/50">
                No contributions have been recorded yet.
              </p>
            </div>
          ) : (
            <div className="mt-5">
              {contributions.slice(0, 10).map((contribution) => {
                const isPaid = contribution.payment_status === "paid"
                const isProcessing =
                  contribution.payment_status === "processing"

                return (
                  <div
                    key={contribution.id}
                    className="flex flex-col gap-3 border-t border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium drop-shadow">
                        {contributorName(contribution)}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {formatDateTime(
                          contribution.paid_at,
                          contribution.created_at
                        )}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-semibold">
                        {formatMoney(Number(contribution.amount || 0))}
                      </p>
                      <p
                        className={`mt-1 text-xs font-medium ${
                          isPaid
                            ? "text-green-300"
                            : isProcessing
                            ? "text-yellow-300"
                            : "text-white/50"
                        }`}
                      >
                        {isPaid
                          ? "Confirmed"
                          : isProcessing
                          ? "Processing"
                          : contribution.payment_status}
                      </p>

                      {isPaid && contribution.mpesa_receipt && (
                        <p className="mt-1 text-[11px] text-white/35">
                          Receipt {contribution.mpesa_receipt}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* PUBLIC FUNDRAISER */}
        <section className="border-b border-white/15 py-8">
          <div className="flex items-center justify-between gap-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                Public Fundraiser
              </h2>
              <p className="mt-1 text-xs text-white/45">
                Share this fundraiser with contributors.
              </p>
            </div>

            <div className="flex shrink-0 gap-4">
              <Link
                href={`/fund/${campaign.slug}`}
                target="_blank"
                className="text-sm font-medium text-blue-300 hover:text-blue-200"
              >
                View Public Page →
              </Link>

              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/fund/${campaign.slug}`

                  navigator.clipboard
                    .writeText(url)
                    .then(() => {
                      alert("Fundraiser link copied.")
                    })
                    .catch(() => {
                      alert("Unable to copy the fundraiser link.")
                    })
                }}
                className="text-sm font-medium text-white/55 hover:text-white"
              >
                Copy Link
              </button>
            </div>
          </div>
        </section>

        {/* CAMPAIGN MANAGEMENT */}
        <section className="py-8">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">
                Campaign Management
              </h2>
              <p className="mt-1 text-xs text-white/45">
                Manage settings and fundraiser activity.
              </p>
            </div>

            <Link
              href={`/fund/dashboard?campaign=${campaign.id}`}
              className="text-sm font-medium text-blue-300 hover:text-blue-200"
            >
              Manage Campaign →
            </Link>
          </div>

          {campaign.media_updated_at && (
            <p className="mt-6 text-xs text-white/30">
              Cover updated {formatDateTime(
                campaign.media_updated_at,
                campaign.media_updated_at
              )}
            </p>
          )}
        </section>
      </div>
    </main>
  )
}
