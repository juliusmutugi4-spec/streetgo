import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  metadataBase: new URL("https://streetgo.app"),

  title: {
    default: "StreetGO — Discover & Share",
    template: "%s | StreetGO",
  },

  description:
    "Immersive community tracking. Discover, document, and dispatch authentic posts instantly on the StreetGO network.",

  keywords: [
    "streetgo",
    "social network",
    "dispatch posts",
    "community feeds",
    "real-time updates",
  ],

  authors: [{ name: "StreetGO Core Team" }],
  creator: "StreetGO",
  publisher: "StreetGO",

  robots: {
    index: true,
    follow: true,
    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },

  openGraph: {
    title: "StreetGO — Discover & Share",

    description:
      "Immersive community tracking. Discover, document, and dispatch authentic posts instantly on the StreetGO network.",

    siteName: "StreetGO",

    url: "https://streetgo.app",

    type: "website",

    locale: "en_US",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StreetGO Network Interface Preview",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "StreetGO — Discover & Share",

    description:
      "Immersive community tracking. Discover, document, and dispatch authentic posts instantly on the StreetGO network.",

    creator: "@StreetGOApp",

    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",
}

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

interface PostLayoutProps {
  children: React.ReactNode
}

export default function PostLayout({ children }: PostLayoutProps) {
  return <>{children}</>
}