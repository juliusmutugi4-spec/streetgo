'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { registerPushNotifications } from './lib/pushNotifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import OfflineBanner from './components/OfflineBanner'
export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {


  useEffect(() => {
  registerPushNotifications()

  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator
  ) {
navigator.serviceWorker.register(
  '/sw.js',
  {
    updateViaCache: 'none',
  }
)
      .then((registration) => {
        console.log(
          'StreetGO Service Worker registered:',
          registration.scope
        )
      })
      .catch((error) => {
        console.error(
          'StreetGO Service Worker registration failed:',
          error
        )
      })
  }
}, [])


const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          gcTime: 1000 * 60 * 30,
          refetchOnWindowFocus: false,
          retry: 1,
        },
      },
    })
)

return (
  <QueryClientProvider client={queryClient}>
    <OfflineBanner />
    {children}
  </QueryClientProvider>
)
}