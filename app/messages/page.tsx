// File: app/messages/page.tsx
'use client'

import { useEffect, useState } from 'react'
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
}

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
const [conversations, setConversations] = useState<Conversation[]>([])
const [messages, setMessages] = useState<any[]>([])
const [messageText, setMessageText] = useState('')

  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch unread messages
  const fetchUnread = async (userId: string) => {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
    setUnreadCount(count || 0)
  }
useEffect(() => {
  if (
    conversations.length > 0 &&
    user?.id &&
    !selectedChat
  ) {
    const firstChat = conversations[0]

    setSelectedChat(firstChat)
    fetchMessages(firstChat.userId)
  }
}, [conversations, user])
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
        console.log('LOGGED IN USER:', session.user.id)
        await fetchConversations(session.user.id)
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
      }
    }
    setConversations(Array.from(uniqueUsers.values()))
console.log('CONVERSATIONS:')
console.log(Array.from(uniqueUsers.values()))
console.log("MESSAGES:", data?.length)
console.log("UNIQUE USERS:", uniqueUsers.size)
console.log(Array.from(uniqueUsers.values()))

  }
const fetchMessages = async (otherUserId: string) => {
  if (!user?.id) return

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
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

  setMessages((prev) => [...prev, data])
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
      <div className="w-[380px] border-r border-zinc-800 bg-[#111b21] flex flex-col">

        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-xl font-semibold">
            Chats
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
                setSelectedChat(conv)
                fetchMessages(conv.userId)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                selectedChat?.userId === conv.userId
                  ? 'bg-[#202c33]'
                  : 'hover:bg-[#1b2730]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center font-bold">
                {conv.username.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">
                  {conv.username}
                </h3>

                <p className="text-sm text-zinc-400 truncate">
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {selectedChat ? (
          <>
            {/* HEADER */}
            <div className="h-16 shrink-0 bg-[#202c33] border-b border-zinc-800 flex items-center justify-between px-5">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center font-bold">
                  {selectedChat.username.charAt(0)}
                </div>

                <div>
                  <h2 className="font-semibold">
                    {selectedChat.username}
                  </h2>

                  <p className="text-xs text-emerald-400">
                    Online
                  </p>
                </div>
              </div>

              <div className="flex gap-4 text-zinc-400">
                <button>📞</button>
                <button>📹</button>
                <button>⋮</button>
              </div>
            </div>

            {/* MESSAGES */}
            <div
  className="flex-1 min-h-0 overflow-y-auto p-6 space-y-3"
              style={{
                backgroundImage:
                  "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
              }}
            >
              {messages.map((msg) => {
                const mine = msg.sender_id === user?.id

                return (
                  <div
                    key={msg.id}
                    className={
                      mine
                        ? 'flex justify-end'
                        : 'flex justify-start'
                    }
                  >
                    <div
                      className={`max-w-[420px] px-4 py-2 rounded-xl ${
                        mine
                          ? 'bg-[#005c4b]'
                          : 'bg-[#202c33]'
                      }`}
                    >
                      <p>{msg.content}</p>

                      <p className="text-[11px] text-zinc-400 mt-1 text-right">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* INPUT */}
            <div className="shrink-0 bg-[#202c33] border-t border-zinc-800 p-3 flex items-center gap-3">

              <button>😊</button>

              <button>📎</button>

              <input
                value={messageText}
                onChange={(e) =>
                  setMessageText(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    sendMessage()
                }}
                placeholder="Type a message..."
                className="flex-1 bg-[#2a3942] rounded-lg px-4 py-3 outline-none"
              />

              <button
                onClick={sendMessage}
                className="w-12 h-12 rounded-full bg-emerald-500 text-black font-bold"
              >
                ➤
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            Select a chat
          </div>
        )}
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