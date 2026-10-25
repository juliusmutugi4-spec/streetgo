import { ImageResponse } from "next/og"
import { createClient } from "@supabase/supabase-js"

export const runtime = "edge"

export const alt = "StreetGO Fundraiser"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // --------------------------------------------------
  // LOAD FUNDRAISER
  // --------------------------------------------------

  const { data: campaign } = await supabase
    .from("fundraising_campaigns")
    .select(
      "id, title, description, target_amount, raised_amount, cover_image_url"
    )
    .eq("slug", slug)
    .maybeSingle()

  const title =
    campaign?.title || "Support This Fundraiser"

  const description =
    campaign?.description ||
    "Help make a difference through StreetGO Fund."

  const target = Number(
    campaign?.target_amount || 0
  )

  const raised = Number(
    campaign?.raised_amount || 0
  )

  // --------------------------------------------------
  // CALCULATE PERCENTAGE
  // --------------------------------------------------

  const percentage =
    target > 0
      ? Math.min(
          Math.round((raised / target) * 100),
          100
        )
      : 0

  // --------------------------------------------------
  // COUNT SUCCESSFUL CONTRIBUTORS
  // --------------------------------------------------

  let contributorCount = 0

  if (campaign?.id) {
    const { count } = await supabase
      .from("fundraising_contributions")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("campaign_id", campaign.id)
      .eq("payment_status", "paid")

    contributorCount = count ?? 0
  }

  // --------------------------------------------------
  // FORMAT MONEY
  // --------------------------------------------------

  const raisedFormatted =
    raised.toLocaleString("en-KE")

  const targetFormatted =
    target.toLocaleString("en-KE")

  // --------------------------------------------------
  // COVER IMAGE
  // --------------------------------------------------

  let imageUrl: string | null = null

  if (campaign?.cover_image_url) {
    const { data } = await supabase.storage
      .from("fundraiser-images")
      .createSignedUrl(
        campaign.cover_image_url,
        60 * 60
      )

    imageUrl = data?.signedUrl || null
  }

  // --------------------------------------------------
  // GENERATE IMAGE
  // --------------------------------------------------

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#020617",
          color: "white",
          fontFamily: "Arial",
          overflow: "hidden",
        }}
      >
        {/* COVER IMAGE */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* DARK OVERLAY */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(2,6,23,0.97) 0%, rgba(2,6,23,0.86) 50%, rgba(2,6,23,0.42) 100%)",
          }}
        />

        {/* CONTENT */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            padding: "50px 70px",
          }}
        >
          {/* BRAND */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#60a5fa",
              marginBottom: 20,
            }}
          >
            STREETGO FUND
          </div>

          {/* TITLE */}
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.08,
              maxWidth: 850,
              marginBottom: 18,
            }}
          >
            {title}
          </div>

          {/* DESCRIPTION */}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              lineHeight: 1.3,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 820,
              marginBottom: 28,
            }}
          >
            {description.length > 125
              ? `${description.slice(0, 125)}...`
              : description}
          </div>

          {/* STATS ROW */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              marginBottom: 18,
              fontSize: 23,
              fontWeight: 700,
            }}
          >
            {/* PERCENTAGE */}
            <div
              style={{
                display: "flex",
                color: "#60a5fa",
              }}
            >
              📊 {percentage}% funded
            </div>

            {/* CONTRIBUTORS */}
            <div
              style={{
                display: "flex",
                color: "#e2e8f0",
              }}
            >
              👥 {contributorCount} contributor
              {contributorCount === 1 ? "" : "s"}
            </div>
          </div>

          {/* MONEY */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: 800,
              marginBottom: 12,
              fontSize: 23,
            }}
          >
            <div
              style={{
                display: "flex",
                fontWeight: 700,
              }}
            >
              💰 KES {raisedFormatted} raised
            </div>

            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.65)",
              }}
            >
              Goal KES {targetFormatted}
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div
            style={{
              display: "flex",
              width: 800,
              height: 20,
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                width: `${percentage}%`,
                height: "100%",
                borderRadius: 999,
                background: "#2563eb",
              }}
            />
          </div>

          {/* TARGET */}
          <div
            style={{
              display: "flex",
              marginTop: 10,
              fontSize: 18,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            KES {raisedFormatted} of KES {targetFormatted}
          </div>

          {/* BOTTOM CTA */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 28,
              fontSize: 21,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Tap to contribute securely with M-PESA
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}