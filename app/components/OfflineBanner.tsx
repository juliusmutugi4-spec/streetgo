'use client'

import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [showBackOnline, setShowBackOnline] = useState(false)

useEffect(() => {
  let backOnlineTimer: ReturnType<typeof setTimeout> | null = null

  const updateStatus = () => {
    const offline = !navigator.onLine

    setIsOffline(offline)

    if (backOnlineTimer) {
      clearTimeout(backOnlineTimer)
      backOnlineTimer = null
    }

    if (offline) {
      setShowBackOnline(false)
      return
    }

    setShowBackOnline(true)

    backOnlineTimer = setTimeout(() => {
      setShowBackOnline(false)
      backOnlineTimer = null
    }, 3500)
  }

  updateStatus()

  window.addEventListener('online', updateStatus)
  window.addEventListener('offline', updateStatus)

  return () => {
    window.removeEventListener('online', updateStatus)
    window.removeEventListener('offline', updateStatus)

    if (backOnlineTimer) {
      clearTimeout(backOnlineTimer)
    }
  }
}, [])

  if (!isOffline && !showBackOnline) {
    return null
  }

  return (
    <div
      className={`fixed left-1/2 top-4 z-[9999] -translate-x-1/2 transition-all duration-500 ease-out ${
        isOffline 
          ? 'translate-y-0 opacity-100 scale-100' 
          : 'translate-y-0 opacity-100 scale-100 animate-fade-out-delayed'
      }`}
    >
      <div
        className={`flex items-center gap-3.5 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-colors duration-500 ${
          isOffline
            ? 'border-red-500/20 bg-zinc-950/90 text-zinc-100 shadow-red-950/20'
            : 'border-purple-500/20 bg-zinc-950/90 text-zinc-100 shadow-purple-950/20'
        }`}
      >
        {/* Status Indicator Icon */}
        <div className="relative flex h-2 w-2 items-center justify-center">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 duration-1000 ${
              isOffline ? 'bg-red-400' : 'bg-purple-400'
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isOffline ? 'bg-red-500' : 'bg-purple-500'
            }`}
          />
        </div>

        {/* Text Details */}
        <div className="flex flex-col gap-0.5 leading-none">
          <span className="text-xs font-medium tracking-wide">
            {isOffline ? 'Connection Lost' : 'Connection Restored'}
          </span>
          <span className="text-[10px] font-normal text-zinc-400 tracking-normal">
            {isOffline ? 'Operating in offline mode' : 'Syncing changes with server'}
          </span>
        </div>
      </div>
    </div>
  )
}
