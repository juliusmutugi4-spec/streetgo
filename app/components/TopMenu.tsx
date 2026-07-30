'use client'

import { Trophy, Settings, LogOut, Sun, Moon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

type TopMenuProps = {
  onLogout: () => void
  onClose?: () => void
}

export default function TopMenu({ onLogout, onClose }: TopMenuProps) {
  const router = useRouter()
  const [lightMode, setLightMode] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (onClose) onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleNavigation = (path: string) => {
    router.push(path)
    if (onClose) onClose()
  }

  return (
    <div 
      ref={menuRef}
      className="absolute top-full right-0 mt-2 z-50 w-52 rounded-xl border border-[#3e4042] bg-[#242526] text-[#e4e6eb] shadow-[0_8px_24px_rgba(0,0,0,0.3)] overflow-hidden select-none animate-in fade-in slide-in-from-top-1 duration-150 ease-out"
    >
      <div className="p-1.5 space-y-0.5">
        
        {/* SETTINGS */}
        <button 
          onClick={() => handleNavigation('/settings')} 
          className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] font-medium transition-colors duration-100 hover:bg-[#3a3b3c] active:bg-[#4e4f50]"
        >
          <Settings size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
          <span className="flex-1">Settings</span>
        </button>

        {/* LEADERBOARD */}
        <button 
          onClick={() => handleNavigation('/leaderboard')} 
          className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] font-medium transition-colors duration-100 hover:bg-[#3a3b3c] active:bg-[#4e4f50]"
        >
          <Trophy size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
          <span className="flex-1">Leaderboard</span>
        </button>

        {/* THEME TOGGLE (INLINE) */}
        <button 
          onClick={() => setLightMode(!lightMode)} 
          className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] font-medium transition-colors duration-100 hover:bg-[#3a3b3c] active:bg-[#4e4f50]"
        >
          {lightMode ? (
            <>
              <Moon size={16} className="text-zinc-400 group-hover:text-white transition-colors" />
              <span className="flex-1">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun size={16} className="text-amber-500 transition-colors" />
              <span className="flex-1">Light Mode</span>
            </>
          )}
        </button>

        {/* SEPARATOR */}
        <div className="h-px bg-[#3e4042] my-1 mx-1" />

        {/* LOGOUT */}
        <button 
          onClick={onLogout} 
          className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[14px] font-medium transition-colors duration-100 text-red-400 hover:bg-red-500/10 active:bg-red-500/20"
        >
          <LogOut size={16} strokeWidth={2} />
          <span className="flex-1">Log Out</span>
        </button>

      </div>
    </div>
  )
}
