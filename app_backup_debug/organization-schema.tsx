export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",

    "@id": "https://streetgo.app/#organization",

    name: "StreetGO",

    url: "https://streetgo.app",

    logo: "https://streetgo.app/icon-512.png",

    image: [
      "https://streetgo.app/icon-512.png",
      "https://streetgo.app/og-image.png"
    ],

    description:
      "StreetGO is Kenya's all-in-one social platform for videos, messaging, maps, communities, drivers, predictions, and local discovery.",
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