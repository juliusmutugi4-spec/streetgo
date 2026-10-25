import type { Metadata } from "next"
import { createClient } from "@supabase/supabase-js"

type Props = {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: campaign } = await supabase
    .from("fundraising_campaigns")
    .select("title, description, slug")
    .eq("slug", slug)
    .maybeSingle()

  const title = campaign?.title || "Support This Fundraiser"

  const description =
    campaign?.description ||
    "Support this fundraiser securely through StreetGO."

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://streetgo.app"

  const fundraiserUrl = `${baseUrl}/fund/${slug}`
  const imageUrl = `${baseUrl}/fund/${slug}/opengraph-image`

  return {
    metadataBase: new URL(baseUrl),

    title: `❤️ ${title} | StreetGO Fund`,

    description,

    alternates: {
      canonical: fundraiserUrl,
    },

    openGraph: {
      type: "website",
      url: fundraiserUrl,
      siteName: "StreetGO Fund",
      title: `❤️ ${title}`,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `❤️ ${title}`,
      description,
      images: [imageUrl],
    },
  }
}

export default function FundraiserLayout({
  children,
}: Props) {
  return children
}