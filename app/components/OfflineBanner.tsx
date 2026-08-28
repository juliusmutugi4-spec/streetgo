'use client'

import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [showBackOnline, setShowBackOnline] = useState(false)

  useEffect(() => {
    const updateStatus = () => {
      const offline = !navigator.onLine

      setIsOffline(offline)

      if (!offline) {
        setShowBackOnline(true)

        const timer = setTimeout(() => {
          setShowBackOnline(false)
        }, 2500)

        return () => clearTimeout(timer)
      }

      setShowBackOnline(false)
    }

    updateStatus()

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (!isOffline && !showBackOnline) {
    return null
  }

  return (
    <div
      className={`
        fixed
        left-1/2
        top-3
        z-[9999]
        -translate-x-1/2
        transition-all
        duration-300
        ${
          isOffline
            ? 'translate-y-0 opacity-100'
            : '-translate-y-2 opacity-100'
        }
      `}
    >
      <div
        className={`
          flex
          items-center
          gap-3
          rounded-full
          border
          px-4
          py-2.5
          shadow-2xl
          backdrop-blur-xl
          ${
            isOffline
              ? 'border-white/10 bg-zinc-900/95 text-white'
              : 'border-white/10 bg-zinc-900/95 text-white'
          }
        `}
      >
        <span
          className={`
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            ${
              isOffline
                ? 'bg-amber-500/15'
                : 'bg-emerald-500/15'
            }
          `}
        >
          {isOffline ? '📡' : '✓'}
        </span>

        <div className="flex flex-col">
          <span className="text-xs font-semibold">
            {isOffline
              ? 'You’re offline'
              : 'Back online'}
          </span>

          <span className="text-[10px] text-white/50">
            {isOffline
              ? 'Some features may be unavailable'
              : 'Connection restored'}
          </span>
        </div>
      </div>
    </div>
  )
}