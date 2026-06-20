// File: app/messages/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
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
  isOnline: boolean
  lastSeen: string | null
}

export default function MessagesPage() {
  const router = useRouter()
const [targetUserId, setTargetUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
const [conversations, setConversations] = useState<Conversation[]>([])
const [messages, setMessages] = useState<any[]>([])
const [messageText, setMessageText] = useState('')
const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [mobileChatOpen, setMobileChatOpen] =useState(false)
  const [now, setNow] = useState(Date.now())
  const selectedChatRef =
  useRef<Conversation | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
const [notificationCount, setNotificationCount] = useState(0)

  // Fetch unread messages
const fetchUnread = async (userId: string) => {
  const { count } = await supabase
    .from('chat_messages')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('receiver_id', userId)
    .eq('is_read', false)

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
useEffect(() => {
  selectedChatRef.current = selectedChat
}, [selectedChat])

useEffect(() => {
  const refresh = async () => {
    if (!user?.id) return
console.log('MESSAGES READ EVENT FIRED')
    await fetchConversations(user.id)
    await fetchUnread(user.id)
  }

  window.addEventListener(
    'messages-read',
    refresh
  )

  return () => {
    window.removeEventListener(
      'messages-read',
      refresh
    )
  }
}, [user?.id])

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: 'smooth'
  })
}, [messages])
// Initialize user and conversations
useEffect(() => {
  const init = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
console.log("SESSION:", session)
    setUser(session?.user ?? null)

    if (session?.user) {
console.log("SETTING ONLINE", session.user.id)
const { data, error } = await supabase
  .from('profiles')
  .update({
    is_online: true,
    last_seen: new Date().toISOString()
  })
  .eq('id', session.user.id)
  .select()
alert("ONLINE UPDATE DONE")
console.log("UPDATED PROFILE:", data)
console.log("ONLINE UPDATE ERROR:", error)
const { data: me } = await supabase
  .from('profiles')
  .select('username, is_online')
  .eq('id', session.user.id)
  .single()

console.log("ME AFTER UPDATE:", me)
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
  username,
  avatar_url,
  is_online,
  last_seen
`)
        .eq('id', session.user.id)
        .single()

      setProfile(profileData)

      await fetchUnread(session.user.id)
      await fetchNotifications(session.user.id)
      await fetchConversations(session.user.id)

      const params = new URLSearchParams(
        window.location.search
      )

      const target = params.get('user')

      if (target) {
        setTargetUserId(target)

        const { data: targetProfile } = await supabase
          .from('profiles')
          .select(`
  username,
  avatar_url,
  is_online,
  last_seen
`)
          .eq('id', target)
          .single()

        if (targetProfile) {
const chat: Conversation = {
  userId: target,
  username: targetProfile.username,
  avatar_url: targetProfile.avatar_url,
  lastMessage: 'Start chatting now',
  created_at: new Date().toISOString(),
  unreadCount: 0,
  isOnline: targetProfile?.is_online ?? false,
  lastSeen: targetProfile?.last_seen ?? null,
}
          setConversations((prev) => {
            const filtered = prev.filter(
              (c) => c.userId !== target
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

useEffect(() => {
  if (!user?.id) return

  const setOffline = async () => {
    await supabase
      .from('profiles')
      .update({
        is_online: false,
        last_seen: new Date().toISOString()
      })
      .eq('id', user.id)
  }

  window.addEventListener('beforeunload', setOffline)

  return () => {
    setOffline()
    window.removeEventListener(
      'beforeunload',
      setOffline
    )
  }
}, [user?.id])

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
  .select(`
    username,
    avatar_url,
    is_online,
    last_seen
  `)
  .eq('id', otherUserId)
  .single()
console.log('PROFILE:', otherProfile)
console.log('OTHER USER ID:', otherUserId)


const unreadCount = (data || []).filter(
  (m) =>
    m.sender_id === otherUserId &&
    m.receiver_id === userId &&
    m.is_read === false
).length

uniqueUsers.set(otherUserId, {
  userId: otherUserId,
  username: otherProfile?.username || 'User',
  avatar_url: otherProfile?.avatar_url || null,
  lastMessage: msg.content,
  created_at: msg.created_at,
  unreadCount,
  
  isOnline: otherProfile?.is_online ?? false,
  lastSeen: otherProfile?.last_seen ?? null,
})



console.log("PROFILE FOUND:", otherProfile)

      }
    }
    const updatedConversations =
  Array.from(uniqueUsers.values())

setConversations(updatedConversations)

if (selectedChatRef.current) {
  const updatedChat =
    updatedConversations.find(
      c =>
        c.userId ===
        selectedChatRef.current?.userId
    )

  if (updatedChat) {
    setSelectedChat(updatedChat)
  }
}


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
  if (!user?.id) return

  console.log('SUBSCRIBING TO CHAT_MESSAGES')

  const channel = supabase
    .channel('message-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        console.log('REALTIME EVENT:', payload)
console.log('EVENT TYPE:', payload.eventType)
        fetchConversations(user.id)
        fetchUnread(user.id)
      }
    )
    .subscribe((status) => {
      console.log('REALTIME STATUS:', status)
    })

  return () => {
    supabase.removeChannel(channel)
  }
}, [user?.id])

useEffect(() => {
  if (!selectedChat || !user) return

  const channel = supabase
    .channel(`chat-${selectedChat.userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
      },
      (payload) => {
        const msg = payload.new as any

        const isMyConversation =
          (msg.sender_id === user.id &&
            msg.receiver_id === selectedChat.userId) ||
          (msg.sender_id === selectedChat.userId &&
            msg.receiver_id === user.id)

        if (!isMyConversation) return

        setMessages((prev) => {
          const exists = prev.some(
            (m) => m.id === msg.id
          )

          if (exists) return prev

          return [...prev, msg]
        })

        fetchConversations(user.id)
        fetchUnread(user.id)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [selectedChat, user])
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUnreadCount(0)
  }

useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now())
  }, 60000) // every 1 minute

  return () => clearInterval(interval)
}, [])

return (
  <main className="h-screen overflow-hidden flex flex-col bg-[#050b12] text-white">

    {/* TOP NAV */}
{!mobileChatOpen && (
  <TopNav
    user={user}
    onLogin={() => {}}
    onLogout={handleLogout}
  />
)}

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
${
mobileChatOpen
? 'hidden lg:flex'
: 'flex'
}
w-full
lg:w-[380px]
border-r
border-zinc-800
bg-[#08131d]
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
            className="
w-full
bg-[#111c28]
rounded-2xl
px-5
py-3
outline-none
border
border-cyan-500/10
focus:border-cyan-400"
          />
        </div>

        <div
className="
flex-1
overflow-y-auto
pb-28
"
>
          {conversations.map((conv) => (
            <button
              key={conv.userId}
onClick={async () => {
  setSelectedChat(conv)
  setTargetUserId(conv.userId)

await supabase
  .from('chat_messages')
  .update({ is_read: true })
  .eq('sender_id', conv.userId)
  .eq('receiver_id', user.id)
  .eq('is_read', false)


  await fetchMessages(conv.userId)
await fetchConversations(user.id)
  setMobileChatOpen(true)


}}







className={`
group
w-full
flex
items-center
gap-4
px-4
py-4
text-left
transition-all
duration-300
border-b
border-white/[0.03]

${
targetUserId === conv.userId
? `
bg-gradient-to-r
from-cyan-500/10
to-emerald-500/10
border-l-4
border-cyan-400
shadow-[0_0_30px_rgba(0,229,255,.1)]
`
: `
hover:bg-[#111c28]
`
}
`}
            >
<div className="relative">

  {conv.avatar_url ? (
<img
src={conv.avatar_url}
className="
w-14
h-14
rounded-2xl
object-cover
border
border-cyan-500/20
shadow-[0_0_20px_rgba(0,229,255,.1)]
"
/>
  ) : (
   <div
className="
w-14
h-14
rounded-2xl
bg-gradient-to-br
from-cyan-400
to-emerald-500
flex
items-center
justify-center
font-bold
text-black
text-lg
shadow-[0_0_20px_rgba(0,229,255,.2)]
"
>
      {conv.username.charAt(0)}
    </div>
  )}

{conv.isOnline && (
  <div className="absolute bottom-0 right-0">

    <span
      className="
      absolute
      inline-flex
      h-3
      w-3
      rounded-full
      bg-emerald-400
      opacity-75
      animate-ping
      "
    ></span>

    <span
      className="
      relative
      inline-flex
      rounded-full
      h-3
      w-3
      bg-emerald-500
      border
      border-[#111b21]
      "
    ></span>

  </div>
)}

</div>

  <div className="flex-1 min-w-0">

  <div className="flex items-center justify-between">

    <h3
className="
font-bold
text-white
truncate
group-hover:text-cyan-300
transition
"
>
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
  <p
className="
text-sm
text-zinc-500
truncate
group-hover:text-zinc-300
transition
"
>
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
    bg-gradient-to-r
from-cyan-400
to-emerald-400
    text-black
    text-[11px]
    flex
    items-center
    justify-center
animate-pulse
shadow-[0_0_20px_rgba(0,229,255,.5)]

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




<div
className={`
flex-1
flex-col
bg-[#0b141a]

${
mobileChatOpen
  ? 'flex'
  : 'hidden lg:flex'
}
`}
>
  {selectedChat ? (
    <>
<div
  className="
  h-20
  px-6
  flex
  items-center
  justify-between
  border-b
  border-cyan-500/10
  bg-[#08131d]
  backdrop-blur-xl
  shadow-[0_0_30px_rgba(0,229,255,0.05)]
"
>
  <div className="flex items-center gap-4">

    <div className="relative">
{selectedChat.avatar_url ? (
  <img
    src={selectedChat.avatar_url}
    alt={selectedChat.username}
    className="
    w-12
    h-12
    rounded-full
    object-cover
    border
    border-cyan-500/20
    "
  />
) : (
  <div
    className="
    w-12
    h-12
    rounded-full
    bg-gradient-to-br
    from-cyan-400
    to-emerald-500
    flex
    items-center
    justify-center
    font-bold
    text-black
    "
  >
    {selectedChat.username.charAt(0).toUpperCase()}
  </div>
)}

{selectedChat.isOnline && (
  <span
    className="
    absolute
    bottom-0
    right-0
    w-3
    h-3
    rounded-full
    bg-emerald-400
    border-2
    border-[#08131d]
    "
  />
)}
    </div>

    <div>


      <h1 className="font-bold text-lg text-white">


        <button
  onClick={() => {
    setMobileChatOpen(false)
    setSelectedChat(null)
  }}
  className="
  lg:hidden
  mr-4
  text-cyan-400
  text-2xl
  "
>
  ←
</button>

        {selectedChat.username}
      </h1>
      

{selectedChat?.isOnline ? (
  <p className="text-emerald-400 text-sm">
    ● Active now
  </p>
) : selectedChat?.lastSeen ? (
  (() => {
    const diff =
      Math.floor(
        (now - new Date(selectedChat.lastSeen).getTime())
        / 1000
      )

    if (diff < 60)
      return (
        <p className="text-zinc-400 text-sm">
          Last seen just now
        </p>
      )

    
      


    return (
      <p className="text-zinc-400 text-sm">
        Last seen {Math.floor(diff / 86400)} day ago
      </p>
    )
  })()
) : (
  <p className="text-zinc-500 text-sm">
    Offline
  </p>
)}




    </div>
  </div>

<div className="flex items-center gap-4">

  <button
    className="
    w-10
    h-10
    rounded-xl
    bg-[#101821]
    border
    border-cyan-500/10
    hover:border-cyan-400/40
    hover:bg-cyan-500/10
    transition
    "
  >
    📞
  </button>

  <button
    className="
    w-10
    h-10
    rounded-xl
    bg-[#101821]
    border
    border-cyan-500/10
    hover:border-emerald-400/40
    hover:bg-emerald-500/10
    transition
    "
  >
    🎥
  </button>

  <button
    className="
    w-10
    h-10
    rounded-xl
    bg-[#101821]
    border
    border-cyan-500/10
    hover:border-cyan-400/40
    hover:bg-cyan-500/10
    transition
    "
  >
    ⋮
  </button>

</div>
</div>

      {/* Messages */}
<div
className="
flex-1
overflow-y-auto
p-8
space-y-4
bg-[#050b12]
"



style={{
background: `
radial-gradient(circle at top left,
rgba(0,229,255,.05),
transparent 30%),

radial-gradient(circle at bottom right,
rgba(16,185,129,.05),
transparent 30%),

#050b12
`
}}
>
{messages.map((m) => {
  const mine = m.sender_id === user?.id

  return (
<div
key={m.id}
className={`
flex
items-end
gap-2
mb-3

${mine
  ? 'justify-end'
  : 'justify-start'}
`}
>

{!mine && selectedChat.avatar_url && (
  <img
    src={selectedChat.avatar_url}
    className="
    w-8
    h-8
    rounded-full
    object-cover
    "
  />
)}

              <div
                className={
mine
? `
bg-gradient-to-br
from-cyan-500/20
to-emerald-500/20
border
border-cyan-400/20
px-4
py-3
rounded-3xl
rounded-br-md
max-w-[75%]
whitespace-pre-wrap
break-words
break-words
overflow-hidden
backdrop-blur-xl
hover:scale-[1.02]
transition-all
duration-300
shadow-[0_0_20px_rgba(0,229,255,0.08)]
`
: `
bg-[#101821]
border
border-white/5
px-4
py-3
rounded-3xl
rounded-bl-md
max-w-[75%]
break-words
overflow-hidden
`

                }
              >
                <div>
<p className="leading-relaxed break-all">
  {m.content}
</p>

  <div
    className="
    flex
    justify-end
    items-center
    gap-1
    mt-2
    text-[10px]
    text-zinc-500
    "
  >
    {new Date(m.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}
<div ref={messagesEndRef}></div>
{mine && (
  m.is_read ? (
    <span className="text-sky-400">✓✓</span>
  ) : selectedChat?.isOnline ? (
    <span className="text-cyan-400">✓✓</span>
  ) : (
    <span className="text-zinc-500">✓</span>
  )
)}
  </div>
</div>
              </div>
            </div>
          )
        })}
      </div>

{/* Input */}
<div
className="
border-t
border-cyan-500/10
p-4
bg-[#08131d]
backdrop-blur-xl
"
>
<div
className="
flex
gap-3
items-end
bg-[#0d1822]
border
border-cyan-500/10
rounded-3xl
p-2
shadow-[0_0_30px_rgba(0,229,255,.05)]
"
>
<textarea
  rows={1}
  value={messageText}
  onChange={(e) => {
    setMessageText(e.target.value)

    e.target.style.height = 'auto'
    e.target.style.height =
      e.target.scrollHeight + 'px'
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }}
  placeholder="Type a message..."
  className="
flex-1
bg-[#101821]
border
border-cyan-500/10
rounded-3xl
px-5
py-3
outline-none
resize-none
overflow-y-auto
min-h-[55px]
max-h-[140px]
focus:border-cyan-400
transition
"
/>

    <button
      onClick={sendMessage}
className="
w-14
h-14
rounded-2xl
flex
items-center
justify-center
font-bold
text-black
bg-gradient-to-r
from-cyan-400
to-emerald-400
shadow-[0_0_25px_rgba(0,229,255,.3)]
hover:scale-110
transition-all
duration-300
"
    >
      ➤
    </button>
  </div>
</div>


    </>
  ) : (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
       <div className="text-center">

  <div
    className="
    w-28
    h-28
    mx-auto
    rounded-3xl
    bg-gradient-to-br
    from-cyan-500/20
    to-emerald-500/20
    border
    border-cyan-500/20
    flex
    items-center
    justify-center
    text-5xl
    mb-6
    "
  >
    💬
  </div>

  <h1 className="text-4xl font-bold">
    StreetGO Messages
  </h1>

  <p className="text-zinc-400 mt-3">
    Select a conversation to start chatting
  </p>

</div>
        <p>Select a conversation to start chatting</p>
      </div>
    </div>
  )}
</div>







    </div>

{!mobileChatOpen && (
  <div className="lg:hidden">
    <BottomNav
      user={user}
      profile={profile}
      unreadCount={unreadCount}
    />
  </div>
)}
  </main>
)
}