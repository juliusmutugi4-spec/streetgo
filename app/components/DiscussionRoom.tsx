'use client'

import React, { useState, useRef, useEffect, FormEvent, KeyboardEvent, useMemo } from 'react'
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
  post: {
    username?: string
    content?: string
    avatar_url?: string | null
  } | null
  comments: Comment[]
  onSendMessage?: (msg: string) => Promise<void> | void
}

type TabType = 'chat' | 'ai'

export default function DiscussionRoom({
  openRoom,
  setOpenRoom,
  comments = [],
  onSendMessage,
  post
}: DiscussionRoomProps) {
  const [newComment, setNewComment] = useState<string>('')
  const [activeTab, setActiveTab] = useState<TabType>('chat')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll comment container to the bottom when comments refresh or active tabs change
  useEffect(() => {
    if (openRoom && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [comments, openRoom, activeTab])

  // Optimize performance: Memoize sentiment calculation
  const positivePercentage = useMemo(() => {
    if (!comments.length) return 0
    const positiveCount = comments.filter(c => c.sentiment === 'positive').length
    return Math.round((positiveCount / comments.length) * 100)
  }, [comments])

  if (!openRoom) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const cleanComment = newComment.trim()
    if (!cleanComment || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSendMessage?.(cleanComment)
      setNewComment('')
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit(e)
    }
  }

  const userInitial = post?.username ? post.username.charAt(0).toUpperCase() : 'U'

  return (
<div
  className="
    fixed
    inset-0
    z-[99999]
    bg-[#060608]
  "
      role="dialog"
      aria-modal="true"
      aria-labelledby="discussion-title"
    >
      <div
  className="
    flex
    h-full
    w-full
    flex-col
    bg-[#060608]
    text-white
  "
>
        
        {/* Header Block */}
<header
  className="
    sticky
    top-0
    z-20
    border-b
    border-[#4A4038]
    bg-[#2B2521]/95
    px-5
    py-3.5
    backdrop-blur-md
  "
>
  <div className="flex items-center justify-between max-w-3xl mx-auto w-full">
    {/* Discussion Title & Meta Counter */}
    <div className="flex items-center gap-2.5 select-none">
      <h2 id="discussion-title" className="text-[15px] font-bold tracking-tight text-[#F5EFE6]">
        Comments
      </h2>
      <span className="
        inline-flex
        h-5
        min-w-5
        items-center
        justify-center
        rounded-full
        border
        border-[#4A4038]
        bg-[#1F1A17]
        px-1.5
        text-[11px]
        font-bold
        tabular-nums
        text-[#D4A574]
        shadow-xs
      ">
        {comments.length}
      </span>
    </div>

    {/* Header Actions Panel */}
    <div className="flex items-center gap-4">
      {/* Premium Segmented Tab Bar */}
      <div 
        className="inline-flex h-8 items-center rounded-lg bg-[#1F1A17] p-1 border border-[#4A4038]" 
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'chat'}
          onClick={() => setActiveTab('chat')}
          className={`rounded-md px-3 py-1 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-[#D4A574] text-[#1F1A17] shadow-xs'
              : 'text-[#A89B8F] hover:text-[#F5EFE6]'
          }`}
        >
          All Comments
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'ai'}
          onClick={() => setActiveTab('ai')}
          className={`rounded-md px-3 py-1 text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-[#D4A574] text-[#1F1A17] shadow-xs'
              : 'text-[#A89B8F] hover:text-[#F5EFE6]'
          }`}
        >
          Insights
        </button>
      </div>

      {/* Elegant Dismiss Control */}
      <button
        onClick={() => setOpenRoom(false)}
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          border
          border-transparent
          text-[#A89B8F]
          transition-all
          duration-200
          hover:scale-105
          hover:border-[#4A4038]
          hover:bg-[#3A312C]
          hover:text-[#F5EFE6]
          active:scale-95
          cursor-pointer
          outline-none
          focus-visible:border-[#D4A574]
        "
        aria-label="Close dialog"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</header>


        {/* Content Stream View */}
<div
  ref={scrollContainerRef}
  className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-[#060608]"
          style={{ scrollbarWidth: 'thin' }}
          aria-live="polite"
        >


{post && (
  <article 
    className="
      group 
      relative 
      mb-4 
      w-full 
      max-w-3xl 
      mx-auto 
      overflow-hidden 
      rounded-xl 
      border 
      border-[#EAE4D7] 
      border-t-2 
      border-t-[#D4A574] 
      bg-[#FAF8F5] 
      shadow-xs
    "
    role="article"
  >
    {/* Compact Header Profiler Area */}
    <div className="relative flex items-center justify-between border-b border-[#EAE4D7] bg-[#F1EDE4]/50 px-3.5 py-2.5 select-none">
      <div className="flex items-center gap-2.5">
        
        {/* Streamlined Profile Avatar Frame */}
        <div className="relative h-9 w-9 shrink-0 rounded-full border border-[#D4A574]/30 bg-[#FAF8F5] p-0.5 shadow-xs">
          <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-[#F1EDE4]">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt={`${post.username || 'Author'}'s avatar`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-[10px] font-black tracking-wider text-[#C28D56] tabular-nums">
                {userInitial}
              </span>
            )}
          </div>
          {/* Flat Online Status Node */}
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 border border-[#FAF8F5]" />
        </div>

        {/* Minimalist Identity Details Stack */}
        <div className="flex flex-col">
          <h3 className="text-xs font-bold tracking-tight text-[#2B2521] truncate max-w-[140px] sm:max-w-xs">
            {post.username || 'Anonymous User'}
          </h3>
          <span className="text-[10px] font-bold text-[#A89B8F] mt-0.5">
            Original Post
          </span>
        </div>
      </div>

      {/* Lightweight Contextual Mini Badge */}
      <span className="inline-flex h-4 items-center justify-center rounded bg-[#D4A574]/15 border border-[#D4A574]/20 px-1.5 text-[9px] font-black uppercase tracking-widest text-[#C28D56]">
        OP
      </span>
    </div>

    {/* Primary Responsive Structural Content Body */}
    {post.content && (
      <div className="relative p-3.5 selection:bg-[#D4A574]/20 selection:text-[#2B2521]">
        <p className="text-[14px] leading-5 text-[#2B2521] whitespace-pre-wrap break-words font-medium tracking-wide">
          {post.content}
        </p>
      </div>
    )}

  </article>
)}





          {activeTab === 'ai' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="text-5xl font-extrabold tracking-tight text-stone-900">
                {positivePercentage}%
              </div>

            </div>
          ) : (
            <>
              {comments.length === 0 ? (
                <div className="flex h-44 flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold text-stone-800">No comments yet</p>
                  <p className="text-xs text-stone-500 mt-1">Be the first to share your thoughts.</p>
                </div>
              ) : (
              comments.map((comment) => (
                  <div key={comment.id} className="w-full">
                    <CommentCard comment={comment} />
                  </div>
                ))
              )}
            </>
          )}  
        </div>

{/* Bottom Composer Element */}
<form
  onSubmit={handleSubmit}
  className="sticky bottom-0 z-20 border-t border-[#4A4038] bg-[#2B2521]/95 px-5 py-4 backdrop-blur-md"
>
  <div className="flex items-end gap-3.5 max-w-3xl mx-auto w-full">

    {/* Current User Profile Token */}
    <div
      className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full border border-[#4A4038] bg-[#1F1A17] text-sm font-bold tracking-wide text-[#F5EFE6] shadow-inner"
      aria-hidden="true"
    >
      {userInitial}
    </div>

    {/* Input Matrix Shield */}
    <div
      className="
        flex 
        flex-1 
        items-end 
        gap-3 
        rounded-xl 
        border 
        border-[#4A4038] 
        bg-[#1F1A17] 
        px-4 
        py-2.5 
        transition-all 
        duration-300 
        ease-[cubic-bezier(0.16,1,0.3,1)] 
        focus-within:border-[#D4A574]/70 
        focus-within:ring-1 
        focus-within:ring-[#D4A574]/40 
        focus-within:shadow-[0_0_24px_rgba(212,165,116,0.08)]
      "
    >
      {/* Precision Dynamic Expansion Layer */}
      <div 
        className="
          grid 
          flex-1 
          break-words 
          m-0 
          p-0
          after:whitespace-pre-wrap 
          after:invisible 
          after:content-[attr(data-replicated-value)]_'_'] 
          after:row-start-1 
          after:col-start-1 
          after:py-1 
          after:text-[15px] 
          after:leading-6
        "
        data-replicated-value={newComment}
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          placeholder="Share your thoughts..."
          rows={1}
          className="
            row-start-1 
            col-start-1 
            m-0 
            p-0 
            resize-none 
            bg-transparent 
            py-1 
            text-[15px] 
            leading-6 
            text-[#F5EFE6] 
            placeholder:text-[#A89B8F] 
            outline-none 
            max-h-36 
            min-h-[24px] 
            transition-opacity 
            duration-200
            disabled:opacity-40
          "
        />
      </div>

      {/* Action Submit Control */}
      <button
        type="submit"
        disabled={!newComment.trim() || isSubmitting}
        className="
          flex 
          h-8 
          w-8 
          shrink-0 
          items-center 
          justify-center 
          rounded-lg 
          bg-[#D4A574] 
          text-[#1F1A17] 
          transition-all 
          duration-300 
          ease-[cubic-bezier(0.16,1,0.3,1)] 
          hover:scale-105 
          hover:bg-[#E2B886] 
          active:scale-95 
          disabled:pointer-events-none 
          disabled:scale-100 
          disabled:bg-[#3A312C] 
          disabled:text-[#4A4038] 
          shadow-md 
          cursor-pointer
        "
        aria-label="Send comment"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 transform translate-x-[0.5px] -translate-y-[0.5px] transition-transform duration-200"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>

    </div>
  </div>
</form>


      </div>
    </div>
  )
}
