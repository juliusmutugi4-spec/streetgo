export default function ProfileSchema({
  username,
  bio,
  avatar,
}: {
  username: string
  bio?: string
  avatar?: string
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: username,
    url: `https://streetgo.app/profile/${username}`,
    image: avatar,
    description: bio,
    memberOf: {
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