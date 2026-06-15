// File: app/messages/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'

type Conversation = {
  userId: string
  username: string
  avatar_url: string | null
  lastMessage: string
  created_at: string
  unreadCount: number
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
const targetUserId = searchParams.get('user')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
const [conversations, setConversations] = useState<Conversation[]>([])
const [messages, setMessages] = useState<any[]>([])
const [messageText, setMessageText] = useState('')

  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
const [notificationCount, setNotificationCount] = useState(0)
  // Fetch unread messages
  const fetchUnread = async (userId: string) => {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
    setUnreadCount(count || 0)
  }

const fetchNotifications = async (userId: string) => {
  const { count } = await supabase
    .from('notifications')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('user_id', userId)
    .eq('is_read', false)

  setNotificationCount(count || 0)
}


  // Initialize user and conversations
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', session.user.id)
          .single()
        setProfile(profileData)

        await fetchUnread(session.user.id)

        await fetchNotifications(session.user.id)
        console.log('LOGGED IN USER:', session.user.id)
        await fetchConversations(session.user.id)

        if (targetUserId) {
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', targetUserId)
    .single()

if (targetProfile) {
  const chat = {
    userId: targetUserId,
    username: targetProfile.username,
    avatar_url: targetProfile.avatar_url,
    lastMessage: 'Start chatting now',
    created_at: new Date().toISOString(),
    unreadCount: 0,
  }
  setConversations((prev) => {
    const filtered = prev.filter(
      (c) => c.userId !== targetUserId
    )

    return [chat, ...filtered]
  })
}
}
      }

      setLoading(false)
    }
    init()
  }, [])

  const fetchConversations = async (userId: string) => {
const { data, error } = await supabase
  .from('chat_messages')
  .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

console.log('CHAT DATA:', data)
console.log('TOTAL MESSAGES:', data?.length)

    if (error) return console.error(error)




    const uniqueUsers = new Map()
    for (const msg of data || []) {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
      if (!uniqueUsers.has(otherUserId)) {
        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', otherUserId)
          .single()
        uniqueUsers.set(otherUserId, {
          userId: otherUserId,
          username: otherProfile?.username || 'User',
          avatar_url: otherProfile?.avatar_url || null,
          lastMessage: msg.content,
          created_at: msg.created_at,
          
        })

const unreadCount = (data || []).filter(
  (m) =>
    m.sender_id === otherUserId &&
    m.receiver_id === userId
).length

uniqueUsers.set(otherUserId, {
  userId: otherUserId,
  username: otherProfile?.username || 'User',
  avatar_url: otherProfile?.avatar_url || null,
  lastMessage: msg.content,
  created_at: msg.created_at,
  unreadCount,
})


      }
    }
    setConversations(Array.from(uniqueUsers.values()))
console.log('CONVERSATIONS:')
console.log(Array.from(uniqueUsers.values()))
console.log("MESSAGES:", data?.length)
console.log("UNIQUE USERS:", uniqueUsers.size)
console.log(Array.from(uniqueUsers.values()))

  }
const fetchMessages = async (
  otherUserId: string,
  currentUserId?: string
) => {
  const uid = currentUserId || user?.id

  if (!uid) return

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(
      `and(sender_id.eq.${uid},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${uid})`
    )
    .order('created_at', { ascending: true })

  if (error) {
    console.error(error)
    return
  }

  const uniqueMessages = Array.from(
  new Map(
    (data || []).map((m) => [m.id, m])
  ).values()
)

setMessages(uniqueMessages)
}
const sendMessage = async () => {
  if (!messageText.trim() || !user || !selectedChat) return

  const text = messageText.trim()

  setMessageText('')

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      sender_id: user.id,
      receiver_id: selectedChat.userId,
      content: text,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return
  }

  setMessages((prev) => {
  const exists = prev.some(
    (m) => m.id === data.id
  )

  if (exists) return prev

  return [...prev, data]
})
}

useEffect(() => {
  const channel = supabase
    .channel('chat-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        const msg = payload.new as any

        if (
          msg.sender_id === selectedChat?.userId ||
          msg.receiver_id === selectedChat?.userId
        ) {
          setMessages((prev) => {
  const exists = prev.some((m) => m.id === msg.id)

  if (exists) return prev

  return [...prev, msg]
})
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [selectedChat])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUnreadCount(0)
  }

return (
  <main className="h-screen overflow-hidden flex flex-col bg-[#060608] text-white">

    {/* TOP NAV */}
    <TopNav
      user={user}
      onLogin={() => {}}
      onLogout={handleLogout}
    />

{/* CONTENT */}
<div className="flex-1 flex overflow-hidden min-h-0">

  {/* DESKTOP SIDEBAR */}
  <div className="hidden lg:flex w-60 bg-zinc-950 border-r border-zinc-800 flex-col">

    {/* Profile Card */}
    <div className="p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">

        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center font-bold text-xl">
          {profile?.username?.charAt(0) || 'T'}
        </div>

        <h2 className="mt-3 font-semibold">
          {profile?.username || 'Tunda User'}
        </h2>

        <p className="text-xs text-emerald-400">
          Online
        </p>

      </div>
    </div>

    {/* MENU */}
    <div className="px-3 space-y-2">

      <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-900">
        🏠 Feed
      </button>

      <button className="w-full text-left px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
        💬 Messages
      </button>

      <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-900">
        👤 Profile
      </button>

      <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-900">
        ⚙️ Settings
      </button>

    </div>

  </div>

      {/* CHAT LIST */}
      <div
  className={`
    ${selectedChat ? 'hidden lg:flex' : 'flex'}
    w-full lg:w-[380px]
    border-r border-zinc-800
    bg-[#111b21]
    flex-col
  `}
>

<div className="px-4 py-4 border-b border-zinc-800 flex items-center gap-3">

  <button
    onClick={() => router.push('/')}
    className="lg:hidden text-xl text-cyan-400"
  >
    ←
  </button>

  <h2 className="text-xl font-bold">
    Messages
  </h2>

</div>

        <div className="p-3 border-b border-zinc-800">
          <input
            placeholder="Search chats..."
            className="w-full bg-[#202c33] rounded-lg px-4 py-2 outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.userId}
onClick={() => {
  router.push(`/chat/${conv.userId}`)
}}
className={`

w-full
flex
items-center
gap-3
px-4
py-3
text-left
transition-all
duration-300

${
  targetUserId === conv.userId
    ? `
      bg-cyan-500/10
      border-l-4
      border-cyan-400
      shadow-[0_0_20px_rgba(6,182,212,0.15)]
      `
    : `
      hover:bg-[#1b2730]
      `
}

`}
            >
<div className="relative">

  {conv.avatar_url ? (
    <img
      src={conv.avatar_url}
      className="w-12 h-12 rounded-full object-cover"
    />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center font-bold">
      {conv.username.charAt(0)}
    </div>
  )}

  <div className="absolute bottom-0 right-0">

    <span className="absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75 animate-ping"></span>

    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#111b21]"></span>

  </div>

</div>

  <div className="flex-1 min-w-0">

  <div className="flex items-center justify-between">

    <h3 className="font-semibold truncate">
      {conv.username}
    </h3>

<span className="text-xs text-zinc-400">
  {new Date(conv.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}
</span>

  </div>

  <div className="flex items-center justify-between">

{conv.lastMessage === 'Start chatting now' ? (
  <p className="text-sm text-cyan-400 font-medium truncate">
    ✨ Start chatting now
  </p>
) : (
  <p className="text-sm text-zinc-400 truncate">
    {conv.lastMessage}
  </p>
)}

{conv.unreadCount > 0 && (
  <div
    className="
    min-w-[22px]
    h-[22px]
    px-1
    rounded-full
    bg-emerald-500
    text-black
    text-[11px]
    flex
    items-center
    justify-center
    font-bold
    shadow-[0_0_10px_rgba(16,185,129,0.5)]
  "
  >
    {conv.unreadCount}
  </div>
)}

  </div>

</div>
            </button>
          ))}
        </div>
      </div>


<div className="hidden lg:flex flex-1 items-center justify-center bg-[#0b141a]">

  <div className="text-center">

    <div className="text-7xl mb-4">
      💬
    </div>

    <h2 className="text-2xl font-bold text-white">
      StreetGO Messages
    </h2>

    <p className="text-zinc-500 mt-2">
      Select a conversation to start chatting
    </p>

  </div>

</div>



    </div>

<div className="lg:hidden">
  <BottomNav
    user={user}
    profile={profile}
    unreadCount={unreadCount}
  />
</div>
  </main>
)
}