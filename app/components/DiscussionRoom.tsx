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
        <header className="flex items-center justify-between border-b border-stone-200/80 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 id="discussion-title" className="text-sm font-bold text-stone-900 tracking-tight">
              Comments
            </h2>
            <span className="inline-flex items-center justify-center rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-600 border border-stone-200">
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

        {/* Bottom Submission Form Tray */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-stone-200 bg-white px-4 py-3"
        >
          <div className="flex items-start gap-3">
            {/* User Profile Frame */}
            <div className="h-8 w-8 shrink-0 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-700 border border-stone-200 shadow-xs">
              {userInitial}
            </div>

            {/* Input System Box */}
            <div className="flex flex-1 items-end gap-2 rounded-xl bg-stone-50 p-1.5 transition-all focus-within:bg-white border border-stone-200 focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-400">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isSubmitting}
                placeholder="Write a comment..."
                className="flex-1 resize-none bg-transparent px-2.5 py-1 text-sm leading-5 text-stone-900 outline-none placeholder:text-stone-400 font-medium max-h-24 min-h-[28px] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-stone-50 transition-all hover:bg-stone-950 disabled:opacity-20 disabled:hover:bg-stone-900 cursor-pointer disabled:cursor-not-allowed shadow-xs"
                aria-label="Send comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transform rotate-45 relative -left-px -top-px" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l7-7-7-7M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
