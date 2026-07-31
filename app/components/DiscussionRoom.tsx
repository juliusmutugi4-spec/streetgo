'use client'

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import LiveCommentCard from './LiveCommentCard'
import CommentCard from "./CommentCard"


export interface Comment {
  id: string | number
  username: string
  avatar_url?: string
  created_at: string | Date
  content: string
  sentiment?: 'positive' | 'neutral'
}

interface DiscussionRoomProps {
  openRoom: boolean
  setOpenRoom: (open: boolean) => void
  comments: Comment[]
  onSendMessage?: (msg: string) => void
}

export default function DiscussionRoom({ openRoom, setOpenRoom, comments = [], onSendMessage }: DiscussionRoomProps) {
  const [newComment, setNewComment] = useState('')
  const [tab, setTab] = useState<'chat' | 'ai'>('chat')
  const [roomHeight, setRoomHeight] = useState(65)
const scrollRef = useRef<HTMLDivElement>(null)

const [visibleIds, setVisibleIds] = useState<(string | number)[]>([])
  const positivePct = useMemo(() => {


    if (!comments.length) return 0
    const pos = comments.filter(c => c.sentiment === 'positive').length
    return Math.round((pos / comments.length) * 100)
  }, [comments])


useEffect(() => {
  const container = scrollRef.current

if (!openRoom || !container) return

  if (!container) return

  const visible = new Map<string, HTMLElement>()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute("data-comment-id")
        if (!id) return

if (entry.isIntersecting) {
  visible.set(id, entry.target as HTMLElement)
} else {
  visible.delete(id)
}
      })

const ids = Array.from(visible.values())
  .sort(
    (a, b) =>
      a.getBoundingClientRect().top -
      b.getBoundingClientRect().top
  )
  .map(
    (el) => el.dataset.commentId!
  )

      setVisibleIds(ids)
    },
    {
      root: container,
      threshold: 0.6,
    }
  )

  const nodes = container.querySelectorAll("[data-comment-id]")

  nodes.forEach((node) => observer.observe(node))

  return () => observer.disconnect()
}, [comments, openRoom])

const visibleSet = useMemo(() => {
  const ids =
    visibleIds.length > 0
      ? visibleIds
      : comments.slice(0, 2).map(c => String(c.id))

  return new Set(ids)
}, [visibleIds, comments])

  if (!openRoom) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    await onSendMessage?.(newComment)
    setNewComment("")
  }

  return (
    <div onClick={() => setOpenRoom(false)} className="fixed inset-0 z-[99999] flex items-end justify-center bg-transparent backdrop-blur-sm pt-24">
      
      {/* Main Transparent Sheet */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ height: `${roomHeight}vh` }} 
        className="relative flex w-full max-w-4xl flex-col rounded-t-2xl border-t border-x border-white/20 bg-transparent backdrop-blur-md shadow-[0_-12px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-2.5 pb-0.5">
          <div className="h-1 w-12 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5 bg-transparent">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-[ping_0.6s_linear_infinite] rounded-full bg-white/40 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <div>
              <h2 className="text-sm font-semibold tracking-wider text-white uppercase">Discussion Workspace</h2>
              <p className="text-[11px] font-mono text-white/50">{comments.length} streams</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex border border-white/10 rounded-lg bg-transparent p-0.5 text-[10px] font-mono">
              <button onClick={() => setRoomHeight(h => Math.min(h + 10, 95))} className="px-2 py-0.5 text-white/60 hover:text-white">MAX</button>
              <button onClick={() => setRoomHeight(h => Math.max(h - 10, 40))} className="px-2 py-0.5 text-white/60 hover:text-white border-l border-white/10">MIN</button>
            </div>

            <div className="flex rounded-lg bg-transparent border border-white/10 p-0.5 text-[11px]">
              <button onClick={() => setTab('chat')} className={`rounded-md px-3 py-1 font-mono text-xs transition ${tab === 'chat' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}>Feed</button>
              <button onClick={() => setTab('ai')} className={`rounded-md px-3 py-1 font-mono text-xs transition ${tab === 'ai' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}>Analytics</button>
            </div>
            <button onClick={() => setOpenRoom(false)} className="text-white/40 hover:text-white text-xs p-1">✕</button>
          </div>
        </div>

        {/* Content Stream Matrix */}
<div
  ref={scrollRef}
  className="flex-1 overflow-y-auto p-6 pb-32 space-y-4 bg-transparent"
>
          {tab === 'ai' ? (
            <div className="rounded-xl border border-white/10 bg-transparent p-8 text-center max-w-sm mx-auto mt-6 backdrop-blur-sm">
              <div className="text-3xl font-light text-white">{positivePct}%</div>
              <div className="text-[10px] font-mono uppercase text-white/60 tracking-wider mt-1">Sentiment Index</div>
            </div>
          ) : (
            <>
              {comments.length === 0 && <div className="text-center font-mono text-white/40 text-xs pt-16 animate-pulse">[ Inbound Stream Empty ]</div>}
{comments.map((c) => {



const id = String(c.id)

const liveIndex = visibleIds.indexOf(id)

const isLive =
  visibleSet.has(id) &&
  liveIndex >= 0 &&
  liveIndex < 2

if (isLive) {
  return (
   <div
  key={c.id}
  data-comment-id={id}
>
      <LiveCommentCard
        comment={c}
        priority={liveIndex}
      />
    </div>
  )
}

return (
  <div
    key={c.id}
    data-comment-id={id}
  >
    <CommentCard comment={c} />
  </div>
)
})}
            </>
          )}
        </div>

        {/* Input Interface */}

<form
  onSubmit={handleSubmit}
  className="border-t border-white/10 bg-gradient-to-t from-black/30 to-transparent p-4 backdrop-blur-xl"
>
  <div
  className="
    relative
    flex
    w-full
    items-end
    gap-2
    rounded-2xl
    border
    border-white/10
    bg-white/[0.03]
    p-2
    backdrop-blur-xl
    transition-all
    duration-300
    focus-within:border-cyan-400/40
    focus-within:shadow-[0_0_25px_rgba(34,211,238,0.12)]
  "
>

    {/* Message Input */}
    <textarea
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
      rows={1}
      placeholder="Share your thoughts..."
className="
  flex-1
  resize-none
  overflow-y-auto
  bg-transparent
  px-4
  py-3
  text-[15px]
  leading-6
  text-white
  placeholder:text-white/30
  outline-none
  max-h-36
  min-h-[48px]
"
    />

    {/* Send Button */}
    <button
      type="submit"
      disabled={!newComment.trim()}
      className="
        ml-2
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-xl
        bg-cyan-500
        text-white
        transition-all
        duration-300
        hover:scale-105
        hover:bg-cyan-400
        disabled:scale-100
        disabled:cursor-not-allowed
        disabled:bg-white/10
        disabled:text-white/30
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 2L11 13"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M22 2L15 22L11 13L2 9L22 2Z"
        />
      </svg>
    </button>

  </div>
</form>
        
      </div>
    </div>
  )
}
