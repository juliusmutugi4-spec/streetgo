import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ShareRedirect from "./ShareRedirect";

type Props = {
  params: Promise<{ slug: string }>;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function cleanTitle(title: string) {
  return title
    .replace(/^(❤️|%EF%B8%8F|❤️%EF%B8%8F)\s*/u, "")
    .trim();
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://streetgo.app";

  const shareUrl = `${baseUrl}/fund/${slug}/share`;

  const imageUrl =
    `${baseUrl}/fund/${slug}/opengraph-image`;

  const { data: campaign } = await supabase
    .from("fundraising_campaigns")
    .select(
      "id, title, description, target_amount, raised_amount"
    )
    .eq("slug", slug)
    .maybeSingle();

  const fallbackTitle = "Support This Fundraiser";
  const fallbackDescription =
    "Support this fundraiser securely through StreetGO.";

  const rawTitle =
    campaign?.title || fallbackTitle;

  const title = cleanTitle(rawTitle);

  const description =
    campaign?.description || fallbackDescription;

  const targetAmount = Number(
    campaign?.target_amount || 0
  );

  const raisedAmount = Number(
    campaign?.raised_amount || 0
  );

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

  const percentage =
    targetAmount > 0
      ? Math.min(
          100,
          Math.round(
            (raisedAmount / targetAmount) * 100
          )
        )
      : 0;

  const raisedFormatted =
    raisedAmount.toLocaleString("en-KE");

  const targetFormatted =
    targetAmount.toLocaleString("en-KE");

  /*
   * IMPORTANT:
   * Put the statistics FIRST.
   *
   * WhatsApp may truncate the description,
   * so the most important information must come first.
   */
  const socialDescription =
    `📊 ${percentage}% funded • ` +
    `💰 KES ${raisedFormatted} / KES ${targetFormatted} • ` +
    `👥 ${contributorCount} contributor${
      contributorCount === 1 ? "" : "s"
    } • ` +
    `${description}`;

  const displayTitle =
    `❤️ ${title}`;

  return {
    metadataBase: new URL(baseUrl),

    title: `${displayTitle} | StreetGO Fund`,

    description: socialDescription,

    alternates: {
      canonical: `${baseUrl}/fund/${slug}`,
    },

    openGraph: {
      type: "website",

      /*
       * VERY IMPORTANT:
       * Use /share as the OG URL.
       * Do not point WhatsApp back to /fund/[slug].
       */
      url: shareUrl,

      siteName: "StreetGO Fund",

      title: displayTitle,

      description: socialDescription,

      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Support ${title} through StreetGO Fund`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title: displayTitle,

      description: socialDescription,

      images: [imageUrl],
    },
  };
}

export default async function SharePage({
  params,
}: Props) {
  const { slug } = await params;

  return (
    <ShareRedirect slug={slug} />
  );
}