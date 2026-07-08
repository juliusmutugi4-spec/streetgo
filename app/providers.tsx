'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { registerPushNotifications } from './lib/pushNotifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    alert('1. Providers started')

    registerPushNotifications()

    alert('2. registerPushNotifications() called')
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
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  </QueryClientProvider>
)
}