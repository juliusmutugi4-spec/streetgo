'use client'

import React, { useMemo } from 'react'
import type { Comment } from './DiscussionRoom'
import { Heart, Reply } from 'lucide-react'

interface CommentCardProps {
  comment: Comment
}

function CommentCard({ comment }: CommentCardProps) {
  const formattedTime = useMemo(() => {
    try {
      const date =
        comment.created_at instanceof Date
          ? comment.created_at
          : new Date(comment.created_at)

      if (isNaN(date.getTime())) return ''

      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }, [comment.created_at])

  return (
    <div className="group flex gap-3.5">

      {/* Avatar */}
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[#4A4038] bg-[#2B2521]">
        <img
          src={comment.avatar_url || '/avatar-placeholder.png'}
          alt={comment.username}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* Right Side */}
      <div className="flex-1">

        {/* Bubble */}
        <div
          className="
            rounded-[22px]
            border
            border-[#D8CCBE]
            bg-[#E7DDCF]
            px-4
            py-3
            transition-all
            duration-200
            group-hover:-translate-y-0.5
            group-hover:shadow-md
          "
        >

          {/* Username + Time */}
          <div className="flex items-center gap-2">

            <span className="text-[15px] font-semibold text-[#2B2521]">
              {comment.username}
            </span>

            {comment.sentiment === 'positive' && (
              <span className="text-[#C28D56] text-xs">
                ✔
              </span>
            )}

            <span className="text-xs text-[#8A7C6D]">
              •
            </span>

            <time
              className="text-xs text-[#8A7C6D]"
              dateTime={comment.created_at.toString()}
            >
              {formattedTime}
            </time>

          </div>

          {/* Comment */}
          <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-6 text-[#2B2521]">
            {comment.content}
          </p>

        </div>

        {/* Actions */}
        <div className="mt-2 ml-2 flex items-center gap-5">

          <button className="flex items-center gap-1 text-xs font-medium text-[#7B6F62] transition hover:text-[#C28D56]">

            <Heart size={14} />

            <span>Like</span>

          </button>

          <button className="flex items-center gap-1 text-xs font-medium text-[#7B6F62] transition hover:text-[#C28D56]">

            <Reply size={14} />

            <span>Reply</span>

          </button>

        </div>

      </div>

    </div>
  )
}

export default React.memo(CommentCard)