import './globals.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import Providers from './providers'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata = {
  title: 'StreetGO',
  description: 'Connect • Share • Grow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StreetGO',
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}