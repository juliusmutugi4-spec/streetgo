'use client'

import { Home, MessageCircle, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CreateButton from './CreateButton'

type BottomNavProps = {
  profile: { username?: string; avatar_url?: string | null } | null
  unreadCount: number
  onCreateSelect: (mode: 'post' | 'prediction') => void
}

export default function BottomNav({ profile, unreadCount, onCreateSelect }: BottomNavProps) {
  const router = useRouter()
  const navigate = (path: string) => router.push(path)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#3e4042] bg-[#242526]/95 backdrop-blur-xl text-[#e4e6eb] shadow-[0_-4px_12px_rgba(0,0,0,0.15)] select-none">
      {/* PERFECTLY BALANCED COLUMNS MATCHING THE TOP NAV GEOMETRY */}
      <div className="mx-auto h-14 max-w-xl grid grid-cols-4 items-center justify-items-center">
        
        {/* FEED */}
        <button 
          onClick={() => navigate('/')} 
          className="flex w-full flex-col items-center py-1 text-zinc-400 hover:text-white transition-colors duration-100 active:scale-95"
        >
          <Home size={20} />
          <span className="text-[10px] font-semibold mt-0.5 tracking-wide">Feed</span>
        </button>

        {/* CREATE CONTAINER WITH CORRECT VERTICAL ALIGNMENT ANCHOR */}
        <div className="relative w-full flex items-center justify-center">
          <CreateButton onCreateSelect={onCreateSelect} />
        </div>

        {/* MESSAGES */}
        <button 
          onClick={() => navigate('/messages')} 
          className="relative flex w-full flex-col items-center py-1 text-zinc-400 hover:text-white transition-colors duration-100 active:scale-95"
        >
          <div className="relative">
            <MessageCircle size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center border border-[#242526] shadow-sm">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold mt-0.5 tracking-wide">Messages</span>
        </button>

        {/* PROFILE */}
        <button 
          onClick={() => navigate(profile?.username ? `/profile/${profile.username}` : '/')} 
          className="flex w-full flex-col items-center py-1 text-zinc-400 hover:text-white transition-colors duration-100 active:scale-95"
        >
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.username ?? 'Profile'} 
              className="w-5 h-5 rounded-full object-cover border border-[#3e4042]" 
            />
          ) : (
            <User size={20} />
          )}
          <span className="text-[10px] font-semibold mt-0.5 tracking-wide">Profile</span>
        </button>

      </div>
    </nav>
  )
}
