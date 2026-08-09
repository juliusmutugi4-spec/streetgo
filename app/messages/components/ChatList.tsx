'use client'

type Conversation = {
  userId: string
  username: string
  avatar_url: string | null
  lastMessage: string
  created_at: string
  unreadCount: number
  isOnline: boolean
  lastSeen: string | null
}

type ChatListProps = {
  conversations: Conversation[]
  targetUserId: string | null
  userId: string
  onSelectChat: (conversation: Conversation) => void
  onStartChat: (userId: string) => void
}

export default function ChatList({
  conversations,
  targetUserId,
  userId,
  onSelectChat,
  onStartChat,
}: ChatListProps) {
  return (
    <div
      className="
        w-full
        lg:w-[360px]
        border-r
        border-white/[0.06]
        bg-[#0c131a]
        flex
        flex-col
        h-full
        select-none
      "
    >
      {/* Header Title Block */}
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">
          Messages
        </h2>
      </div>

      {/* Modern Inner Search Wrapper */}
      <div className="px-4 pb-4">
        <div className="relative flex items-center">
          <svg 
            xmlns="http://w3.org" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="absolute left-4 w-4 h-4 text-zinc-500 pointer-events-none"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
          </svg>
          <input
            placeholder="Search chats..."
            className="
              w-full
              bg-[#151f2a]
              rounded-xl
              pl-11
              pr-4
              py-2
              text-[13.5px]
              text-zinc-100
              outline-none
              border
              border-transparent
              placeholder:text-zinc-500
              focus:border-white/[0.08]
              focus:bg-[#1a2633]
              transition-all
            "
          />
        </div>
      </div>

      {/* Chat Row Scroll Space */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const isSelected = targetUserId === conv.userId;
          return (
            <button
              key={conv.userId}
              onClick={() => onSelectChat(conv)}
              className={`
                w-full
                flex
                items-center
                gap-3
                px-4
                py-3.5
                text-left
                transition-all
                duration-150
                border-b
                border-white/[0.02]
                ${isSelected ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'}
              `}
            >
              {/* Profile Picture Frame */}
              <div className="relative flex-shrink-0">
                {conv.avatar_url ? (
                  <img
                    src={conv.avatar_url}
                    alt={conv.username}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-300 uppercase">
                    {conv.username.charAt(0)}
                  </div>
                )}

                {/* Online Indicator Dot */}
                {conv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0c131a]" />
                )}
              </div>

              {/* Chat Text Details Area */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1 mb-0.5">
                  <h3 className="font-semibold text-[14px] text-zinc-200 truncate">
                    {conv.username}
                  </h3>
                  <span className="text-[11px] text-zinc-500 flex-shrink-0 font-medium">
                    {new Date(conv.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className={`text-[13px] truncate flex-1 ${conv.unreadCount > 0 ? 'text-zinc-300 font-medium' : 'text-zinc-500'}`}>
                    {conv.lastMessage}
                  </p>

                  {/* High Contrast Unread Badge Counter */}
                  {conv.unreadCount > 0 && (
                    <div className="h-[18px] min-w-[18px] px-1 rounded-full bg-emerald-500 text-zinc-950 text-[10.5px] font-bold flex items-center justify-center flex-shrink-0 select-none scale-95">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  )
}
