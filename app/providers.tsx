'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    document.body.style.background = 'red'
    alert('PROVIDERS IS RUNNING')
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      {children}
    </ThemeProvider>
  )
}