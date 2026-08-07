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
    flex
    items-center
    justify-between
    border-b
    border-[#4A4038]
    bg-[#2B2521]
    px-5
    py-4
  "
>
          <div className="flex items-center gap-2">
            <h2 id="discussion-title" className="text-lg font-semibold text-[#F5EFE6]">
              Comments
            </h2>
            <span className="
inline-flex
items-center
justify-center
rounded-full
bg-[#3A312C]
border
border-[#4A4038]
px-2.5
py-1
text-xs
font-semibold
text-[#F5EFE6]
">
              {comments.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Segmented Controls */}
            <div className="inline-flex h-8 items-center rounded-lg bg-stone-100 p-1 border border-stone-200" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Comments
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'ai'}
                onClick={() => setActiveTab('ai')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Insights
              </button>
            </div>

            {/* Exit Control */}
            <button
              onClick={() => setOpenRoom(false)}
              className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content Stream View */}
<div
  ref={scrollContainerRef}
  className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-[#060608]"
          style={{ scrollbarWidth: 'thin' }}
          aria-live="polite"
        >
          {activeTab === 'ai' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="text-5xl font-extrabold tracking-tight text-stone-900">
                {positivePercentage}%
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mt-2">
                Positive Sentiment Rate
              </p>
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

{/* Bottom Composer */}
<form
  onSubmit={handleSubmit}
  className="sticky bottom-0 z-20 border-t border-stone-800 bg-[#161311]/90 px-5 py-4 backdrop-blur-md"
>
  <div className="flex items-end gap-3 max-w-3xl mx-auto">

    {/* Current User Avatar */}
    <div
      className="flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full border border-stone-800 bg-stone-900 text-sm font-semibold tracking-wide text-stone-200 shadow-sm"
      aria-hidden="true"
    >
      {userInitial}
    </div>

    {/* Composer Box */}
    <div
      className="flex flex-1 items-end gap-3 rounded-xl border border-stone-800 bg-stone-950 px-3.5 py-2.5 transition-all duration-200 ease-out focus-within:border-amber-500/60 focus-within:ring-1 focus-within:ring-amber-500/30 focus-within:shadow-[0_0_16px_rgba(245,158,11,0.06)]"
    >
      {/* Auto-growing Textarea Input Core Container */}
      <div 
        className="grid flex-1 after:whitespace-pre-wrap after:invisible after:content-[attr(data-replicated-value)] after:row-start-1 after:col-start-1 after:py-1 after:px-0.5 after:text-[15px] after:leading-6"
        data-replicated-value={newComment}
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          placeholder="Share your thoughts..."
          rows={1}
          className="row-start-1 col-start-1 resize-none bg-transparent py-1 px-0.5 text-[15px] leading-6 text-stone-100 placeholder:text-stone-500 outline-none max-h-36 min-h-[24px] transition-opacity disabled:opacity-50"
        />
      </div>

      {/* Action Submit Control */}
      <button
        type="submit"
        disabled={!newComment.trim() || isSubmitting}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-stone-950 transition-all duration-200 ease-in-out hover:bg-amber-400 active:scale-95 disabled:pointer-events-none disabled:scale-100 disabled:bg-stone-800 disabled:text-stone-600 shadow-xs cursor-pointer"
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
          className="h-4 w-4 transform translate-x-[0.5px] -translate-y-[0.5px]"
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
