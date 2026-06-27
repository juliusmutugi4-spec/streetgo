export default function KnowledgeGraph() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://streetgo.app/#organization",
        name: "StreetGO",
        url: "https://streetgo.app",
        logo: {
          "@type": "ImageObject",
          url: "https://streetgo.app/icon-192.png"
        },
        image: "https://streetgo.app/og-image.png",
        description:
          "StreetGO is Kenya's all-in-one social platform for videos, maps, messaging, drivers, communities and local discovery.",
        foundingLocation: {
          "@type": "Country",
          name: "Kenya"
        },
        areaServed: "Kenya",
        knowsAbout: [
          "Social Media",
          "Messaging",
          "Navigation",
          "Maps",
          "Videos",
          "Drivers",
          "Communities",
          "Predictions"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://streetgo.app/#website",
        url: "https://streetgo.app",
        name: "StreetGO",
        publisher: {
          "@id": "https://streetgo.app/#organization"
        }
      }
    ]
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