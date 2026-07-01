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
    registerPushNotifications()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  )
}