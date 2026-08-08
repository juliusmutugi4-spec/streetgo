'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import TopMenu from './TopMenu'
import { Bell, Menu, X, Video } from 'lucide-react'

// Strict UI Types
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

  // Close context menu on outside interaction
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        
        {/* =====================================================
            LEFT AXIS — BRANDING & CORE INFRASTRUCTURE
        ====================================================== */}
        <div className="flex items-center gap-5">
          {/* LOGO MATRIX */}
          <div 
            onClick={() => router.push('/')}
            className="group relative cursor-pointer select-none active:scale-[0.98] transition-transform"
          >
            <h1 className="font-sans text-xl font-black uppercase tracking-widest text-zinc-100">
              street
              <span className="ml-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                go
              </span>
            </h1>
            {/* Ambient Sci-Fi Underline */}
            <div className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 group-hover:w-full" />
          </div>

          {/* TELEMETRY / MAP INTERFACE */}
          <button
            onClick={() => router.push('/map')}
            className="group relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 shadow-inner backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)] active:scale-95"
            aria-label="Initialize Map Matrix"
            title="Navigation Map"
          >
            <div className="relative h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
              <Image
                src="/map-icon.png" // Ensure your image asset is saved here in the /public directory
                alt="Map Navigation"
                fill
                className="object-contain"
                priority
              />
            </div>
          </button>
        </div>

        {/* =====================================================
            RIGHT AXIS — SUBSYSTEM CONTROLS & AUTH
        ====================================================== */}
        <div className="flex items-center gap-3 shrink-0">

          {/* HOLOGRAPHIC STREAM SHORTCUT */}
          <button
            onClick={() => router.push('/videos')}
            className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/40 px-3.5 py-1.5 text-xs font-medium tracking-wide text-zinc-300 backdrop-blur-md transition-all duration-200 hover:border-red-500/30 hover:text-zinc-100 active:scale-95"
          >
            {/* Tech background hover tint */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-red-500/0 to-red-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <Video size={14} className="text-zinc-500 transition-colors duration-200 group-hover:text-red-400" />
            <span>Feeds</span>

            {/* RADAR BEACON INDICATOR */}
            <span className="relative flex h-2 w-2 ml-1">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/60 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
            </span>
          </button>

          {/* =====================================================
              ALERTS PROTOCOL / USER IDENTITY
          ====================================================== */}
          {user ? (
            <button
              onClick={() => router.push('/notifications')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-all duration-200 hover:border-zinc-700 hover:text-zinc-100 active:scale-95"
              aria-label="System Notifications"
              title="System Notifications"
            >
              <Bell size={16} />
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="relative overflow-hidden rounded-lg bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all duration-200 hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] active:scale-95"
            >
              Access System
            </button>
          )}

          {/* =====================================================
              CORE UTILITY EXPANSION INTERFACE
          ====================================================== */}
          <div ref={navMenuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-200 active:scale-95 ${
                menuOpen
                  ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100'
              }`}
              aria-expanded={menuOpen}
              aria-label="Toggle main system array"
              title="System Menu"
            >
              {menuOpen ? <X size={16} className="animate-in fade-in zoom-in-75 duration-150" /> : <Menu size={16} />}
            </button>

            {/* OVERLAY MODULE DOWNLINK */}
            {menuOpen && (
              <div className="absolute right-0 top-12 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200 ease-out">
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/90 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl ring-1 ring-white/5">
                  <TopMenu onLogout={onLogout} onClose={() => setMenuOpen(false)} />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
