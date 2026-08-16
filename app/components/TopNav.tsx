'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import TopMenu from './TopMenu'
import { Bell, Menu, X, Video } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface TopNavProps {
  user: UserProfile | null
  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({ user, onLogin, onLogout }: TopNavProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const navMenuRef = useRef<HTMLDivElement | null>(null)

  // Close menu on outside click safely
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleClickOutside = (event: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        
        {/* LEFT AXIS: BRANDING & NAVIGATION */}
        <div className="flex items-center gap-6">
          {/* LOGO */}
          <button 
            type="button"
            onClick={() => router.push('/')} 
            className="group flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 rounded-md"
            aria-label="Street Go Home"
          >
            <h1 className="font-sans text-lg font-black uppercase tracking-wider text-zinc-100 transition-colors group-hover:text-white">
              street <span className="text-emerald-400">go</span>
            </h1>
          </button>

          {/* MAP SHORTCUT */}
          <button 
            type="button"
            onClick={() => router.push('/map')} 
            className="group flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/30 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700"
            aria-label="View Navigation Map"
            title="Navigation Map"
          >
            <div className="relative h-5 w-5 transition-transform duration-200 group-hover:scale-105">
              <Image 
                src="/map-icon.png" 
                alt="" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          </button>
        </div>

        {/* RIGHT AXIS: CONTROLS & AUTHENTICATION */}
        <div className="flex items-center gap-3 shrink-0">
          {/* FEEDS STREAM */}
          <button 
            type="button"
            onClick={() => router.push('/videos')} 
            className="group relative flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/30 px-3 py-1.5 text-xs font-medium tracking-wide text-zinc-300 transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700"
          >
            <Video size={14} className="text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            <span>Feeds</span>
            
            {/* LIVE INDICATOR */}
            <span className="relative flex h-1.5 w-1.5 ml-0.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
          </button>

          {/* ALERTS / LOGIN */}
          {user ? (
            <button 
              type="button"
              onClick={() => router.push('/notifications')} 
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-400 transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700"
              aria-label="View System Notifications"
              title="System Notifications"
            >
              <Bell size={15} />
            </button>
          ) : (
            <button 
              type="button"
              onClick={onLogin} 
              className="rounded-lg bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition-all duration-200 hover:bg-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-zinc-100"
            >
              Sign In
            </button>
          )}

          {/* MENU INTERFACE */}
          <div ref={navMenuRef} className="relative">
            <button 
              type="button"
              onClick={() => setMenuOpen(!menuOpen)} 
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-700 ${
                menuOpen 
                  ? 'border-zinc-700 bg-zinc-900/80 text-zinc-100' 
                  : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-900/60'
              }`}
              aria-expanded={menuOpen}
              aria-label="Toggle main system menu"
              title="System Menu"
            >
              {menuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>

            {/* OVERLAY DROPDOWN */}
            {menuOpen && (
              <div className="absolute right-0 top-[44px] z-50 w-56 origin-top-right rounded-xl border border-zinc-800 bg-zinc-950 p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
                <TopMenu onLogout={onLogout} onClose={() => setMenuOpen(false)} />
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  )
}
