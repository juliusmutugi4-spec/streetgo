export default function WebApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",

    "@id": "https://streetgo.app/#webapp",

    name: "StreetGO",
    alternateName: "StreetGO Kenya",

    url: "https://streetgo.app",

    applicationCategory: "SocialNetworkingApplication",

    applicationSubCategory: "Community Platform",

    operatingSystem: "Any",

    browserRequirements: "Requires JavaScript. Works in modern web browsers.",

    inLanguage: "en-KE",

    isAccessibleForFree: true,

    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KES"
    },

    image: [
      "https://streetgo.app/og-image.png",
      "https://streetgo.app/icon-512.png",
      "https://streetgo.app/screenshot-desktop.png",
      "https://streetgo.app/screenshot-mobile.png"
    ],

    screenshot: [
      "https://streetgo.app/screenshot-desktop.png",
      "https://streetgo.app/screenshot-mobile.png"
    ],

    thumbnailUrl: "https://streetgo.app/icon-512.png",

    description:
      "StreetGO is Kenya's social platform for communities, messaging, videos, maps, predictions, local discovery, and connecting people with services.",

    publisher: {
      "@id": "https://streetgo.app/#organization"
    },

    creator: {
      "@id": "https://streetgo.app/#organization"
    },

    featureList: [
      "Social feed",
      "Communities",
      "Real-time messaging",
      "Video sharing",
      "Maps",
      "Predictions",
      "User profiles",
      "Comments",
      "Notifications",
      "Local discovery"
    ],

    audience: {
      "@type": "Audience",
      audienceType: "General Public"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  )
}