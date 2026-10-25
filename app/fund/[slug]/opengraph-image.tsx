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

  const { data: campaign } = await supabase
    .from("fundraising_campaigns")
    .select(
      "title, description, target_amount, raised_amount, cover_image_url"
    )
    .eq("slug", slug)
    .maybeSingle()

  const title = campaign?.title || "Support This Fundraiser"

  const description =
    campaign?.description ||
    "Help make a difference through StreetGO Fund."

  const target = Number(campaign?.target_amount || 0)
  const raised = Number(campaign?.raised_amount || 0)

  const percentage =
    target > 0
      ? Math.min(Math.round((raised / target) * 100), 100)
      : 0

  let imageUrl: string | null = null

  if (campaign?.cover_image_url) {
    const { data } = await supabase.storage
      .from("fundraiser-images")
      .createSignedUrl(campaign.cover_image_url, 60 * 60)

    imageUrl = data?.signedUrl || null
  }

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

        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.82) 48%, rgba(2,6,23,0.35) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "100%",
            padding: "55px 70px",
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 4,
              color: "#60a5fa",
              marginBottom: 24,
            }}
          >
            STREETGO FUND
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.08,
              maxWidth: 850,
              marginBottom: 20,
            }}
          >
            ❤️ {title}
          </div>

          {/* Description */}
          <div
            style={{
              display: "flex",
              fontSize: 25,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 780,
              marginBottom: 38,
            }}
          >
            {description.length > 150
              ? `${description.slice(0, 150)}...`
              : description}
          </div>

          {/* Progress */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 760,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                fontSize: 22,
              }}
            >
              <span>
                KES {raised.toLocaleString()} raised
              </span>

              <span style={{ color: "#cbd5e1" }}>
                {percentage}% funded
              </span>
            </div>

            <div
              style={{
                display: "flex",
                width: "100%",
                height: 18,
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

            <div
              style={{
                display: "flex",
                marginTop: 12,
                fontSize: 19,
                color: "rgba(255,255,255,0.55)",
              }}
            >
              Target: KES {target.toLocaleString()}
            </div>
          </div>

          {/* Bottom */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 38,
              fontSize: 21,
              color: "rgba(255,255,255,0.65)",
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