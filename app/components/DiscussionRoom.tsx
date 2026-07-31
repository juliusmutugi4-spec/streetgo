'use client'

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import LiveCommentCard from './LiveCommentCard'



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
  className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent"
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
  const words =
    c.content?.trim().split(/\s+/).filter(Boolean).length || 0

  const isBig = words >= 25
const effectiveVisible =
  visibleIds.length > 0
    ? visibleIds
    : comments.slice(0, 2).map(c => String(c.id))

const liveIndex = effectiveVisible.indexOf(String(c.id))

const isLive = liveIndex >= 0 && liveIndex < 2

  if (isLive) {
    return (
      <div
        key={c.id}
        data-comment-id={String(c.id)}
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
      data-comment-id={String(c.id)}
      className={`group relative overflow-hidden rounded-xl bg-transparent transition-all ${
        isBig
          ? 'border border-white/20 bg-white/[0.01] p-5'
          : 'border border-white/5 p-4 hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={c.avatar_url || "/avatar-placeholder.png"}
            alt=""
            className="h-8 w-8 rounded-lg object-cover border border-white/10 filter grayscale"
          />

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              {c.username}

              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase bg-transparent text-white/60 border border-white/10">
                {isBig ? 'Abstract' : 'Signal'}
              </span>
            </div>

            <div className="text-[10px] text-white/40 font-mono">
              {new Date(c.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono text-white/40 border border-white/10 rounded px-1.5 py-0.5">
          {isBig
            ? `${Math.max(1, Math.ceil(words / 200))}m read`
            : `${words}w`}
        </span>
      </div>

      {isBig ? (
        <div className="mt-3 pl-11 space-y-2">
          <div className="rounded-lg border border-white/10 p-2.5 text-[11px] font-mono text-white/60">
            <span className="text-white font-semibold">
              [ Abstract ]:
            </span>{" "}
            Multi-sentence density trace verified.
          </div>

          <p className="text-sm text-white/80 leading-relaxed">
            {c.content}
          </p>
        </div>
      ) : (
        <p className="mt-2 pl-11 text-sm text-white/80 font-mono tracking-wide">
          {c.content}
        </p>
      )}
    </div>
  )
})}
            </>
          )}
        </div>

        {/* Input Interface */}
        <form onSubmit={handleSubmit} className="border-t border-white/10 p-4 bg-transparent">
          <div className="flex gap-2 rounded-xl border border-white/20 bg-transparent px-3.5 py-2.5 focus-within:border-white/40 transition-all backdrop-blur-sm">
            <input 
              type="text" 
              value={newComment} 
              onChange={(e) => setNewComment(e.target.value)} 
              placeholder="Append telemetry log..." 
              className="flex-1 bg-transparent text-xs font-mono text-white placeholder-white/30 outline-none" 
            />
            <button 
              type="submit" 
              disabled={!newComment.trim()} 
              className="rounded-lg bg-white px-3.5 py-1 text-xs font-medium text-black hover:bg-white/90 disabled:opacity-20 transition shadow-sm font-mono uppercase tracking-wider"
            >
              Execute
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
