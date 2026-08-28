'use client'

import { useEffect, useState, useTransition } from 'react'

export default function OfflineBanner() {
  const [, startTransition] = useTransition()
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    // Safe SSR check: default to online during server render
    if (typeof window !== 'undefined') {
      return !navigator.onLine
    }
    return false
  })
  
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout> | null = null

    const handleOnline = () => {
      startTransition(() => {
        setIsOffline(false)
        setShowBackOnline(true)
      })

      // Auto-hide the "Back Online" banner after 3.5 seconds
      timerId = setTimeout(() => {
        startTransition(() => {
          setShowBackOnline(false)
        })
      }, 3500)
    }

    const handleOffline = () => {
      if (timerId) clearTimeout(timerId)
      
      startTransition(() => {
        setIsOffline(true)
        setShowBackOnline(false)
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (timerId) clearTimeout(timerId)
    }
  }, [])

  // Do not render anything if the user is online and the success message timed out
  if (!isOffline && !showBackOnline) return null

  return (
    <div 
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-4 z-[9999] -translate-x-1/2 transform transition-all duration-300 ease-out"
    >
      <div
        className={`flex items-center gap-3 rounded-xl border bg-zinc-950/90 px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isOffline
            ? 'border-red-500/20 text-zinc-100 shadow-red-950/20'
            : 'border-emerald-500/20 text-zinc-100 shadow-emerald-950/20'
        }`}
      >
        {/* Status Indicator Icon */}
        <div className="relative flex h-2 w-2 items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 [animation-duration:2s] ${
              isOffline ? 'bg-red-400' : 'bg-emerald-400'
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isOffline ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          />
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="text-xs font-semibold tracking-wide text-zinc-50">
            {isOffline ? 'Connection Lost' : 'Back Online'}
          </span>
          <span className="text-[10px] font-medium text-zinc-400">
            {isOffline ? 'Operating in offline mode' : 'Changes synced successfully'}
          </span>
        </div>
      </div>
    </div>
  )
}
