export default function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",

    "@id": "https://streetgo.app/#website",

    name: "StreetGO",
    url: "https://streetgo.app",

    inLanguage: "en-KE",

    description:
      "Kenya's all-in-one social platform for videos, maps, messaging, drivers, communities, and local discovery.",

image: [
  "https://streetgo.app/og-image.png",
  "https://streetgo.app/icon-512.png",
  "https://streetgo.app/screenshot-desktop.png",
  "https://streetgo.app/screenshot-mobile.png",
],

thumbnailUrl: "https://streetgo.app/icon-512.png",


    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate:
          "https://streetgo.app/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
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