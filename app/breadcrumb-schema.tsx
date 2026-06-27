export default function BreadcrumbSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://streetgo.app"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Videos",
        item: "https://streetgo.app/videos"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Drivers",
        item: "https://streetgo.app/drivers"
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Leaderboard",
        item: "https://streetgo.app/leaderboard"
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "History",
        item: "https://streetgo.app/history"
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