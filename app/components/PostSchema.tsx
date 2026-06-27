type Props = {
  id: string
  author: string
  content: string
  createdAt: string
}

export default function PostSchema({
  id,
  author,
  content,
  createdAt,
}: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    "@id": `https://streetgo.app/post/${id}`,
    headline: content.slice(0, 80),
    articleBody: content,
    datePublished: createdAt,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "StreetGO",
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