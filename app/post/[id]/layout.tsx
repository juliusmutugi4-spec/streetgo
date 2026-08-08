import type { Metadata, Viewport } from "next"

// Centralized configuration for easier maintenance
const APP_URL = "https://streetgo.app"
const APP_NAME = "StreetGO"
const DEFAULT_TITLE = "StreetGO — Discover & Share"
const DEFAULT_DESC = "Immersive community tracking. Discover, document, and dispatch authentic posts instantly on the StreetGO network."

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${APP_NAME}`,
  },

  description: DEFAULT_DESC,

  keywords: [
    "streetgo",
    "social network",
    "dispatch posts",
    "community feeds",
    "real-time updates",
    "hyperlocal tracking",
    "community mapping",
  ],

  authors: [{ name: `${APP_NAME} Core Team` }],
  creator: APP_NAME,
  publisher: APP_NAME,

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    siteName: APP_NAME,
    url: APP_URL,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${APP_URL}/og-image.png`, // Absolute path required by many platforms
        width: 1200,
        height: 630,
        alt: `${APP_NAME} Network Interface Preview`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
    creator: "@StreetGOApp",
    images: [`${APP_URL}/og-image.png`], // Absolute path required
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },

  manifest: `${APP_URL}/site.webmanifest`,
}

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Note: Accessibility best practices recommend allowing user scaling.
  // maximumScale: 1, userScalable: false are omitted unless explicitly required.
}

interface PostLayoutProps {
  children: React.ReactNode
}

// Wrapped in a semantic HTML tag to improve layout structure and SEO scrapers
export default function PostLayout({ children }: PostLayoutProps) {
  return <section className="w-full min-h-screen">{children}</section>
}
