// File: app/messages/page.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import TopNav from '../components/TopNav'
import BottomNav from '../components/BottomNav'
import MessageBubble from './components/MessageBubble'
import ChatHeader from './components/ChatHeader'
import DesktopChatList from './desktop/DesktopChatList'
import MobileChatList from './mobile/MobileChatList'
import MessageComposer from './components/MessageComposer'
import EmptyChat from './components/EmptyChat'
import MessagesSidebar from './components/MessagesSidebar'
import ChatWindow from './components/ChatWindow'
import { useMessages } from './hooks/useMessages'
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
const selectedChatRef = useRef<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [mobileChatOpen, setMobileChatOpen] =useState(false)
  const [now, setNow] = useState(Date.now())
  const [unreadCount, setUnreadCount] = useState(0)
const [notificationCount, setNotificationCount] = useState(0)
const {
  sendMessage: sendMessageHook,
} = useMessages()
  // Fetch unread messages
const fetchUnread = async (userId: string) => {
  const { count } = await supabase
    .from('messages')
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
  .from('messages')
  .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

console.log('CHAT DATA:', data)
console.log('TOTAL MESSAGES:', data?.length)

 if (error) {
  alert(JSON.stringify(error, null, 2))
  console.error("DELETE ERROR:", error)
  return
}




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
  (m: any) =>
    m.sender_id === otherUserId &&
    m.receiver_id === userId &&
    m.is_read === false
)

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
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${uid},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${uid})`
    )
    .order('created_at', { ascending: true })

if (error) {
  alert(JSON.stringify(error, null, 2))
  console.error("DELETE ERROR:", error)
  return
}

const uniqueMessages = Array.from(
  new Map(
    (data || []).map((m: any) => [m.id, m])
  ).values()
)

setMessages(uniqueMessages)
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
        table: 'messages',
      },
(payload: any) => {
  console.log('REALTIME EVENT:', payload)
console.log('EVENT TYPE:', payload.eventType)
        fetchConversations(user.id)
        fetchUnread(user.id)
      }
    )
.subscribe((status: any) => {
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
    event: '*',
        schema: 'public',
        table: 'messages',
      },
(payload: any) => {

  // Handle delete
  if (payload.eventType === 'DELETE') {
    const deleted = payload.old as any

    setMessages(prev =>
      prev.filter(m => m.id !== deleted.id)
    )

    return
  }

  // Handle new message
  const msg = payload.new as any

  const isMyConversation =
    (msg.sender_id === user.id &&
      msg.receiver_id === selectedChat.userId) ||
    (msg.sender_id === selectedChat.userId &&
      msg.receiver_id === user.id)

  if (!isMyConversation) return

  setMessages(prev => {
    const exists = prev.some(m => m.id === msg.id)

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

const deleteMessage = async (messageId: string) => {
  const confirmed = window.confirm(
    "Delete this message?"
  )

  if (!confirmed) return

  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', user.id)

if (error) {
  alert(JSON.stringify(error, null, 2))
  console.error("DELETE ERROR:", error)
  return
}

  setMessages((prev) =>
    prev.filter((m) => m.id !== messageId)
  )

  if (user?.id) {
    fetchConversations(user.id)
  }
}



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
<MessagesSidebar
  username={profile?.username || 'Tunda User'}
/>

{/* PHONE */}
{!mobileChatOpen && (
  <div className="lg:hidden flex-1">
    <MobileChatList
      conversations={conversations}
      selectedId={selectedChat?.userId || null}
      onSelect={(conv) => {
        setSelectedChat(conv)
        setTargetUserId(conv.userId)
        fetchMessages(conv.userId)
        setMobileChatOpen(true)
      }}
    />
  </div>
)}


{/* PC */}
<div className="hidden lg:flex">
  <DesktopChatList
    conversations={conversations}
    targetUserId={targetUserId}
    userId={user?.id || ''}
    onSelectChat={async (conv) => {
      setSelectedChat(conv)
      setTargetUserId(conv.userId)

      await fetchMessages(conv.userId)
      await fetchConversations(user.id)
    }}
    onStartChat={(userId) => {
      setTargetUserId(userId)
    }}
  />
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
<ChatWindow
  selectedChat={selectedChat}
  user={user}
  messages={messages}
  messageText={messageText}
  setMessageText={setMessageText}
  sendMessage={() =>
    sendMessageHook(
      messageText,
      user,
      selectedChat,
      setMessageText
    )
  }
  deleteMessage={deleteMessage}
  messagesEndRef={messagesEndRef}
  now={now}
  onBack={() => {
    setMobileChatOpen(false)
    setSelectedChat(null)
  }}
/>
) : (
  <EmptyChat />
)}
</div>







    </div>

{!mobileChatOpen && (
  <div className="lg:hidden">
<BottomNav
  profile={profile}
  unreadCount={unreadCount}
  onCreateSelect={() => {}}
/>
  </div>
)}
  </main>
)
}