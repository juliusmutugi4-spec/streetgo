import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import Providers from './providers'
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

  description: 'Connect • Share • Grow',

  manifest: '/manifest.json',

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'StreetGO',
    description: 'Connect • Share • Grow',
    url: 'https://streetgo.app',
    siteName: 'StreetGO',
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'StreetGO',
    description: 'Connect • Share • Grow',
  },

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}