'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import TopMenu from './TopMenu'
import { Bell, Menu, X, Video } from 'lucide-react'

type TopNavProps = {
  user: any
  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({ user, onLogin, onLogout }: TopNavProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const navMenuRef = useRef<HTMLDivElement>(null)

  // Close menu gracefully when clicking outside of the button or dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navMenuRef.current && !navMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#3e4042] bg-[#242526]/95 backdrop-blur-xl text-[#e4e6eb] shadow-[0_4px_12px_rgba(0,0,0,0.15)] select-none">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        
        {/* BRAND LOGO */}
        <div 
          onClick={() => router.push('/map')} 
          className="cursor-pointer active:scale-98 transition-transform"
        >
          <h1 className="font-sans text-2xl font-black tracking-tight text-white">
            street<span className="text-emerald-500 font-extrabold">go</span>
          </h1>
        </div>

        {/* NAVIGATION ACTIONS */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* VIDEOS SHORTCUT BUTTON */}
          <button 
            onClick={() => router.push('/videos')}
            className="group flex items-center gap-1.5 rounded-lg bg-[#3a3b3c] px-3 py-1.5 text-[13px] font-semibold text-[#e4e6eb] hover:bg-[#4e4f50] active:scale-95 transition-all duration-100"
          >
            <Video size={15} fill="currentColor" className="text-zinc-400 group-hover:text-red-500 transition-colors" />
            <span>Videos</span>
            <span className="relative flex h-2 w-2 ml-0.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          </button>

          {/* NOTIFICATIONS / SIGN IN */}
          {user ? (
            <button 
              onClick={() => router.push('/notifications')} 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4e4f50] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
          ) : (
            <button 
              onClick={onLogin} 
              className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-[13px] font-bold text-white hover:bg-blue-500 active:scale-95 transition-all"
            >
              Sign In
            </button>
          )}

          {/* PROFILE / SETTINGS DROPDOWN DROPDOWN ANCHOR */}
          <div ref={navMenuRef} className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-100 ${
                menuOpen 
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' 
                  : 'bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4e4f50]'
              }`}
              aria-expanded={menuOpen}
              aria-label="Toggle user menu"
            >
              {menuOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} />}
            </button>

            {/* NESTED TOP MENU */}
            {menuOpen && (
              <div className="absolute right-0 top-11 z-50">
                <TopMenu 
                  onLogout={onLogout} 
                  onClose={() => setMenuOpen(false)} 
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
