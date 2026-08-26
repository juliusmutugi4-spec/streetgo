type Props = {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  uploadDate: string
}

export default function VideoSchema({
  id,
  title,
  description,
  thumbnail,
  videoUrl,
  uploadDate,
}: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": `https://streetgo.app/video/${id}`,
    name: title,
    description,
    thumbnailUrl: [thumbnail],
    uploadDate,
    contentUrl: videoUrl,
    embedUrl: videoUrl,
    publisher: {
      "@type": "Organization",
      name: "StreetGO",
      logo: {
        "@type": "ImageObject",
        url: "https://streetgo.app/icon-512.png",
      },
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