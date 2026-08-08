import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://streetgo.app"),
  title: "StreetGO",
  description: "Discover and share posts on StreetGO.",
  openGraph: {
    title: "StreetGO",
    description: "Discover and share posts on StreetGO.",
    url: "https://streetgo.app",
    siteName: "StreetGO",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "StreetGO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "StreetGO",
    description: "Discover and share posts on StreetGO.",
    images: ["/og-image.png"],
  },
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return children
}
