'use client'

import { Home, MessageCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CreateButton from './CreateButton'

// Strict UI Types
interface UserProfile {
  username?: string
  avatar_url?: string | null
}

interface BottomNavProps {
  profile: UserProfile | null
  unreadCount: number
  onCreateSelect: (mode: 'post' | 'prediction') => void
}

export default function BottomNav({ profile, unreadCount, onCreateSelect }: BottomNavProps) {
  const router = useRouter()
  const navigate = (path: string) => router.push(path)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/70 backdrop-blur-xl text-zinc-400 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] select-none transition-all duration-300">
      {/* PERFECTLY BALANCED INTERFACE AXIS */}
      <div className="mx-auto h-14 max-w-xl grid grid-cols-4 items-center justify-items-center px-4">
        
        {/* SUBSYSTEM COMMLINK: FEED */}
        <button 
          onClick={() => navigate('/')} 
          className="group flex w-full flex-col items-center justify-center py-1 transition-all duration-200 hover:text-zinc-100 active:scale-95"
        >
          <Home size={18} className="transition-transform duration-200 group-hover:scale-110" />
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">
            Feed
          </span>
        </button>

        {/* CORE UTILITY: ACTION TRIGGER */}
        <div className="relative w-full flex items-center justify-center">
          <CreateButton onCreateSelect={onCreateSelect} />
        </div>

        {/* SUBSYSTEM COMMLINK: TELEMETRY ALERTS */}
        <button 
          onClick={() => navigate('/messages')} 
          className="group relative flex w-full flex-col items-center justify-center py-1 transition-all duration-200 hover:text-zinc-100 active:scale-95"
        >
          <div className="relative">
            <MessageCircle size={18} className="transition-transform duration-200 group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[14px] h-[14px] px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center border border-zinc-950 shadow-[0_0_8px_#ef4444] animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">
            Comms
          </span>
        </button>

        {/* SUBSYSTEM COMMLINK: USER IDENTITY */}
        <button 
          onClick={() => navigate(profile?.username ? `/profile/${profile.username}` : '/')} 
          className="group flex w-full flex-col items-center justify-center py-1 transition-all duration-200 hover:text-zinc-100 active:scale-95"
        >
          {profile?.avatar_url ? (
            <div className="relative w-5 h-5 rounded-md overflow-hidden border border-zinc-800 transition-all duration-200 group-hover:border-zinc-500 group-hover:scale-110">
              <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
            </div>
          ) : (
            <User size={18} className="transition-transform duration-200 group-hover:scale-110" />
          )}
          <span className="text-[10px] font-bold mt-1 uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300">
            User
          </span>
        </button>

      </div>
    </nav>
  )
}
