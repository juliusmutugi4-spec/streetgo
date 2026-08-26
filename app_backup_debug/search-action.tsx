export default function SearchAction() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://streetgo.app",
    name: "StreetGO",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://streetgo.app/search?q={search_term_string}",
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