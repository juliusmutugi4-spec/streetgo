'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { registerPushNotifications } from './lib/pushNotifications'

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

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  )
}