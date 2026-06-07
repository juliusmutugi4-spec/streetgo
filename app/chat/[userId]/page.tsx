'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function ChatPage() {
  const params = useParams()
  const otherUserId = String(params.userId)
const [otherProfile, setOtherProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

useEffect(() => {
  const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setUser(user)

const { data: profileData } = await supabase
  .from('profiles')
  .select('username, avatar_url')
  .eq('id', otherUserId)
  .single()

setOtherProfile(profileData)


      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', {
          ascending: true,
        })

      if (error) {
        console.error(error)
      }

      setMessages(data || [])
      setLoading(false)




    }

    load()

return () => {}
  }, [otherUserId])

  const sendMessage = async () => {
    if (!text.trim() || !user) return

    const messageText = text.trim()

    setText('')

const { data, error } = await supabase
  .from('chat_messages')
  .insert({
    sender_id: user.id,
    receiver_id: otherUserId,
    content: messageText,
  })
  .select()
  .single()

if (data) {
  setMessages((prev) => [...prev, data])
}

    if (error) {
      console.error(error)
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading chat...
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#0b141a] text-white">
      {/* HEADER */}
      {/* HEADER */}
<div className="h-16 border-b border-zinc-800 bg-[#202c33] px-4 flex items-center justify-between">

  <div className="flex items-center">
    <button
      onClick={() => window.history.back()}
      className="mr-4 text-zinc-300 hover:text-white transition"
    >
      ←
    </button>

    <div className="relative">
      {otherProfile?.avatar_url ? (
        <img
          src={otherProfile.avatar_url}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-emerald-500" />
      )}

      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#202c33]" />
    </div>

    <div className="ml-3">
      <h1 className="font-semibold text-white">
        {otherProfile?.username || 'User'}
      </h1>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />

        <span className="text-xs text-zinc-400">
          Active now
        </span>
      </div>
    </div>
  </div>

  <div className="flex items-center gap-3">
    <button className="p-2 rounded-full hover:bg-zinc-800 transition">
      📞
    </button>

    <button className="p-2 rounded-full hover:bg-zinc-800 transition">
      🎥
    </button>

    <button className="p-2 rounded-full hover:bg-zinc-800 transition">
      ⋮
    </button>
  </div>

</div>


      {/* CHAT AREA */}
<div
  className="flex-1 overflow-y-auto px-6 py-6 space-y-3"
  style={{
    backgroundColor: '#0b141a',
    backgroundImage:
      "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
  }}
>
        {messages.map((m) => {
          const mine =
            m.sender_id === user?.id

          return (
            <div
              key={m.id}
              className={
                mine
                  ? 'flex justify-end'
                  : 'flex justify-start'
              }
            >
              <div
                className={
                  mine
                    ? `
                    max-w-[420px]
                    bg-[#005c4b]
                    px-4
                    py-2
                    rounded-2xl
                    rounded-br-sm
                    shadow-lg
                  `
                    : `
                    max-w-[420px]
                    bg-[#202c33]
                    px-4
                    py-2
                    rounded-2xl
                    rounded-bl-sm
                    shadow-lg
                  `
                }
              >
                <p className="break-words">
                  {m.content}
                </p>

                <p className="text-[10px] text-zinc-400 mt-1 text-right">
                  {new Date(
                    m.created_at
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="bg-[#202c33] border-t border-zinc-800 p-3">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            className="
              flex-1
              bg-[#2a3942]
              rounded-full
              px-5
              py-3
              outline-none
              border
              border-transparent
              focus:border-emerald-500
            "
          />

<button
  onClick={sendMessage}
  className="
    group
    relative
    w-12
    h-12
    flex
    items-center
    justify-center
    rounded-xl
    border
    border-cyan-500/30
    bg-gradient-to-br
    from-cyan-950/40
    to-zinc-950/80
    backdrop-blur-md
    text-cyan-400
    hover:text-emerald-400
    hover:border-emerald-500/50
    transition-all
    duration-300
    ease-out
    shadow-[0_0_15px_rgba(6,182,212,0.15)]
    hover:shadow-[0_0_25px_rgba(16,185,129,0.3)]
    active:scale-95
  "
  aria-label="Transmit data"
>
  {/* Cybernetic Corner Accents */}
  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400 opacity-60 group-hover:border-emerald-400 transition-colors" />
  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400 opacity-60 group-hover:border-emerald-400 transition-colors" />

  {/* Ambient Pulse Glow Core */}
  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 pointer-events-none" />

  {/* High-Tech Vector Arrow Icon */}
  <svg 
    className="w-5 h-5 transform translate-x-[1px] -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-0.5 group-hover:scale-110 transition-all duration-300 ease-out" 
    fill="none" 
    viewBox="0 0 24 24" 
    stroke="currentColor" 
    strokeWidth={2.5}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
    />
  </svg>
</button>

        </div>
      </div>
    </div>
  )
}