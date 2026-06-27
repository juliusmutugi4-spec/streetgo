import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://streetgo.app'),

  title: {
    default: 'StreetGO',
    template: '%s | StreetGO',
  },

  description:
    "StreetGO is Kenya's all-in-one social platform for videos, maps, messaging, drivers, communities, and local discovery.",

  keywords: [
    'StreetGO',
    'Kenya social network',
    'Kenya social media',
    'Kenya videos',
    'Kenya maps',
    'drivers',
    'community',
    'chat',
    'leaderboard',
    'predictions',
    'local discovery',
  ],

  authors: [
    {
      name: 'StreetGO',
    },
  ],

  creator: 'StreetGO',

  publisher: 'StreetGO',

  alternates: {
    canonical: '/',
  },

openGraph: {
  title: 'StreetGO',
  description:
    "StreetGO is Kenya's all-in-one social platform for videos, maps, messaging, drivers, communities, and local discovery.",
  url: 'https://streetgo.app',
  siteName: 'StreetGO',
  images: [
    {
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'StreetGO',
    },
  ],
  locale: 'en_US',
  type: 'website',
},

twitter: {
  card: 'summary_large_image',
  title: 'StreetGO',
  description:
    "StreetGO is Kenya's all-in-one social platform for videos, maps, messaging, drivers, communities, and local discovery.",
  images: ['/og-image.png'],
},

  manifest: '/manifest.json',

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StreetGO',
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
}