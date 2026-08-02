'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Send } from 'lucide-react'

interface ImageComment {
  id: string
  username: string
  avatar_url: string | null
  content: string
  created_at: string
}

interface ImageViewerCommentsProps {
  showImageComments: boolean
  setShowImageComments: (show: boolean) => void
  imageComments: ImageComment[]
  imageCommentText: string
  setImageCommentText: (text: string) => void
  addImageComment: () => void
}

export default function ImageViewerComments({
  showImageComments,
  setShowImageComments,
  imageComments,
  imageCommentText,
  setImageCommentText,
  addImageComment,
}: ImageViewerCommentsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the bottom when a new comment arrives
  useEffect(() => {
    if (showImageComments && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [imageComments.length, showImageComments])

  // Prevent parent scroll chaining when scrolling inside comments panel
  useEffect(() => {
    if (showImageComments) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showImageComments])

  if (!showImageComments) return null

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (imageCommentText.trim()) {
      addImageComment()
    }
  }

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      className="
        absolute
        bottom-0
        inset-x-0
        z-30
        flex
        h-[60vh]
        flex-col
        rounded-t-[2rem]
        border-t
        border-white/10
        bg-zinc-950/80
        backdrop-blur-xl
        shadow-2xl
        animate-in
        slide-in-from-bottom
        duration-300
        ease-out
      "
      aria-label="Image comments section"
    >
      {/* Panel Drag Indicator & Header */}
      <div className="flex flex-col items-center border-b border-white/5 px-6 pb-4 pt-3">
        <div className="h-1.5 w-12 rounded-full bg-zinc-700/60 mb-3" />
        <div className="flex w-full items-center justify-between">
          <h2 className="text-base font-semibold tracking-wide text-white">
            Comments 
            <span className="ml-2 rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-normal text-zinc-400">
              {imageComments.length}
            </span>
          </h2>
          <button
            onClick={() => setShowImageComments(false)}
            type="button"
            className="
              p-1.5
              text-zinc-400 
              hover:text-white 
              rounded-full 
              hover:bg-white/5 
              focus:outline-none 
              focus-visible:ring-2 
              focus-visible:ring-white/50
              transition-all
            "
            aria-label="Close comments"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Comments Main Scroll List */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {imageComments.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <p className="text-sm font-medium text-zinc-400">No comments yet</p>
            <p className="text-xs text-zinc-500 mt-1">Be the first to share your thoughts.</p>
          </div>
        ) : (
          imageComments.map((comment) => (
            <div
              key={comment.id}
              className="
                flex
                gap-3
                rounded-2xl
                bg-white/[0.03]
                border
                border-white/[0.02]
                p-3.5
                transition-all
                hover:bg-white/[0.05]
              "
            >
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
                <Image
                  src={comment.avatar_url || "/avatar-placeholder.png"}
                  alt={`${comment.username}'s avatar`}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-200 truncate">
                    {comment.username}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium shrink-0">
                    {new Date(comment.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Message Box Area */}
      <form 
        onSubmit={handleFormSubmit}
        className="border-t border-white/5 bg-zinc-950/40 p-4 pb-6 flex gap-3 items-center"
      >
        <div className="relative flex-1">
          <input
            value={imageCommentText}
            onChange={(e) => setImageCommentText(e.target.value)}
            placeholder="Write a professional comment..."
            maxLength={500}
            className="
              w-full
              rounded-xl
              bg-white/[0.04]
              focus:bg-white/[0.07]
              border
              border-white/5
              focus:border-cyan-500/50
              pl-4
              pr-12
              py-3
              text-sm
              text-white
              placeholder-zinc-500
              outline-none
              transition-all
              focus:ring-1
              focus:ring-cyan-500/50
            "
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-medium select-none">
            {imageCommentText.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={!imageCommentText.trim()}
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-cyan-500
            hover:bg-cyan-400
            text-zinc-950
            font-semibold
            disabled:opacity-20
            disabled:bg-zinc-800
            disabled:text-zinc-500
            transition-all
            duration-200
            shadow-lg
            shadow-cyan-500/10
          "
          aria-label="Post comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </aside>
  )
}
