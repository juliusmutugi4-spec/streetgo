import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://streetgo.app";

  const fallbackTitle = "Support This Fundraiser";
  const fallbackDescription =
    "Support this fundraiser securely through StreetGO.";

  // --------------------------------------------------
  // 1. LOAD FUNDRAISER
  // --------------------------------------------------

  const { data: campaign } = await supabase
    .from("fundraising_campaigns")
    .select(
      "id, title, description, target_amount, raised_amount"
    )
    .eq("slug", slug)
    .maybeSingle();

  // --------------------------------------------------
  // 2. COUNT SUCCESSFUL CONTRIBUTORS
  // --------------------------------------------------

  let contributorCount = 0;

  if (campaign?.id) {
    const { count } = await supabase
      .from("fundraising_contributions")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("campaign_id", campaign.id)
      .eq("payment_status", "paid");

    contributorCount = count ?? 0;
  }

  // --------------------------------------------------
  // 3. CLEAN TITLE
  // --------------------------------------------------

  const rawTitle = campaign?.title || fallbackTitle;

  const cleanTitle = rawTitle
    .replace(/^(❤️|%EF%B8%8F|❤️%EF%B8%8F)\s*/u, "")
    .trim();

  const description =
    campaign?.description || fallbackDescription;

  // --------------------------------------------------
  // 4. CALCULATE FUNDRAISING PROGRESS
  // --------------------------------------------------

  const targetAmount = Number(
    campaign?.target_amount ?? 0
  );

  const raisedAmount = Number(
    campaign?.raised_amount ?? 0
  );

  const percentage =
    targetAmount > 0
      ? Math.min(
          100,
          Math.round(
            (raisedAmount / targetAmount) * 100
          )
        )
      : 0;

  // --------------------------------------------------
  // 5. SOCIAL PREVIEW DESCRIPTION
  // --------------------------------------------------

  const progressDescription =
    `📊 ${percentage}% funded • ` +
    `💰 KES ${raisedAmount.toLocaleString("en-KE")} / ` +
    `KES ${targetAmount.toLocaleString("en-KE")} • ` +
    `👥 ${contributorCount} contributor${
      contributorCount === 1 ? "" : "s"
    }`;
const displayDescription =
  `${progressDescription} • ${description}`;

  // --------------------------------------------------
  // 6. URLS
  // --------------------------------------------------

  const fundraiserUrl =
    `${baseUrl}/fund/${slug}`;

  const imageUrl =
    `${baseUrl}/fund/${slug}/opengraph-image`;

  const dynamicTitle =
    `❤️ ${cleanTitle}`;

  // --------------------------------------------------
  // 7. METADATA
  // --------------------------------------------------

  return {
    metadataBase: new URL(baseUrl),

    title: `${dynamicTitle} | StreetGO Fund`,

    description: displayDescription,

    alternates: {
      canonical: fundraiserUrl,
    },

    openGraph: {
      type: "website",

      url: fundraiserUrl,

      siteName: "StreetGO Fund",

      title: dynamicTitle,

      description: displayDescription,

      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Join us in supporting: ${cleanTitle}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: dynamicTitle,

      description: displayDescription,

      images: [imageUrl],
    },
  };
}

export default function FundraiserLayout({
  children,
}: Props) {
  return children;
}