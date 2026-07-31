'use client'

import React from 'react'
import type { Comment } from './DiscussionRoom'

interface CommentCardProps {
  comment: Comment
}

function CommentCard({ comment }: CommentCardProps) {
const words =
  comment.content?.trim().split(/\s+/).filter(Boolean).length || 0

const isBig = words >= 25

return (
  <div
    className={`group relative overflow-hidden rounded-xl bg-transparent transition-all ${
      isBig
        ? 'border border-white/20 bg-white/[0.01] p-5'
        : 'border border-white/5 p-4 hover:border-white/20'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <img
          src={comment.avatar_url || "/avatar-placeholder.png"}
          alt=""
          className="h-8 w-8 rounded-lg object-cover border border-white/10 filter grayscale"
        />

        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            {comment.username}

            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase bg-transparent text-white/60 border border-white/10">
              {isBig ? "Abstract" : "Signal"}
            </span>
          </div>

          <div className="text-[10px] text-white/40 font-mono">
            {new Date(comment.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
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
          {comment.content}
        </p>
      </div>
    ) : (
      <p className="mt-2 pl-11 text-sm text-white/80 font-mono tracking-wide">
        {comment.content}
      </p>
    )}
  </div>
)
}

export default React.memo(CommentCard)