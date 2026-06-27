export default function Schema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StreetGO",
    url: "https://streetgo.app",
    logo: "https://streetgo.app/icon-192.png",
    image: "https://streetgo.app/og-image.png",
    description:
      "Kenya's all-in-one social platform for videos, maps, messaging, drivers, communities and local discovery.",
    sameAs: [],
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