'use client'

type ChatHeaderProps = {
  username: string
  avatarUrl: string | null
  isOnline: boolean
  lastSeen: string | null
  now: number
  onBack: () => void
}

export default function ChatHeader({
  username,
  avatarUrl,
  isOnline,
  lastSeen,
  now,
  onBack,
}: ChatHeaderProps) {
  const getLastSeenText = () => {
    if (isOnline) return 'Active now'
    if (!lastSeen) return 'Offline'

    const diff = Math.floor((now - new Date(lastSeen).getTime()) / 1000)

    if (diff < 60) return 'Last seen just now'
    if (diff < 3600) {
      const mins = Math.floor(diff / 60)
      return `Last seen ${mins} ${mins === 1 ? 'min' : 'mins'} ago`
    }
    if (diff < 86400) {
      const hrs = Math.floor(diff / 3600)
      return `Last seen ${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ago`
    }
    const days = Math.floor(diff / 86400)
    return `Last seen ${days} ${days === 1 ? 'day' : 'days'} ago`
  }

  return (
    <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0c131a]/90 backdrop-blur-md shadow-sm sticky top-0 z-50 select-none">
      <div className="flex items-center gap-3">
        {/* Back Arrow Button */}
        <button
          onClick={onBack}
          className="lg:hidden p-1.5 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          aria-label="Back"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Profile Avatar with Ring Indicators */}
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs text-white uppercase tracking-wider">
              {username.charAt(0)}
            </div>
          )}

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c131a]" />
          )}
        </div>

        {/* User Status Profile Metadata */}
        <div>
          <h1 className="font-semibold text-[14.5px] leading-tight text-zinc-100 tracking-tight">
            {username}
          </h1>
          <p className={`text-[11.5px] mt-0.5 font-medium transition-colors ${isOnline ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {getLastSeenText()}
          </p>
        </div>
      </div>

      {/* Modern Control Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
          aria-label="Voice call"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-1.514 2.022a13.565 13.565 0 0 1-4.715-4.715l2.022-1.514c.362-.272.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
          </svg>
        </button>

        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
          aria-label="Video call"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" className="hidden" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" />
          </svg>
        </button>

        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-all"
          aria-label="Chat menu"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
