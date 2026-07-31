'use client'

import { useState } from 'react'

interface PostCommentsProps {
  post: any
  user: any
  profile: any

  comments: any[]
  setComments: React.Dispatch<React.SetStateAction<any[]>>

  commentText: string
  setCommentText: React.Dispatch<React.SetStateAction<string>>

  addComment: (message: string) => Promise<void>

  showComments: boolean
  setShowComments: React.Dispatch<React.SetStateAction<boolean>>

  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>
openRoom: boolean
setOpenRoom: React.Dispatch<React.SetStateAction<boolean>>



}

export default function PostComments({
  post,
  user,
  profile,

  comments,
  setComments,

  commentText,
  setCommentText,

  addComment,

  showComments,
  setShowComments,

  setShowLogin,

  openRoom,
  setOpenRoom,
}: PostCommentsProps) {

  return (
    <>


  <>
<div className="mt-4 flex gap-3">

  {/* USER AVATAR */}
  <img
    src={profile?.avatar_url || '/avatar-placeholder.png'}
    alt=""
    className="
      h-10
      w-10
      rounded-xl
      object-cover
      border
      border-cyan-500/20
    "
  />

  {/* INPUT AREA */}
  <div className="flex-1">

    <div
      className="
        relative
        overflow-hidden
        rounded-xl
        border
        border-cyan-500/20
        bg-zinc-950/80
        backdrop-blur-xl
      "
    >
<input
  value={commentText}
  onChange={(e) => setCommentText(e.target.value)}
  placeholder="Write a comment..."
  className="
    w-full
    rounded-xl
    bg-zinc-900
    px-4
    py-3
    text-white
    outline-none
  "
/>
      <div
        className="
          absolute
          top-0
          left-0
          right-0
          h-[1px]
          bg-gradient-to-r
          from-transparent
          via-cyan-400/40
          to-transparent
        "
      />
    </div>

    <div className="mt-2 flex items-center justify-between">

      <span className="text-[10px] font-mono text-zinc-600">
        SIGNAL LENGTH: {commentText.length}/280
      </span>
<button
  onClick={() => addComment(commentText)}
  disabled={!commentText.trim()}
        className="
          rounded-lg
          border
          border-cyan-500/20
          bg-cyan-500/10
          px-4
          py-2
          text-[11px]
          font-mono
          tracking-wide
          text-cyan-400
          transition-all
          duration-300
          hover:border-cyan-400/50
          hover:bg-cyan-500/20
          hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
      >
        💬 Post
      </button>





    </div>

  </div>

</div>




<div className="mt-4 space-y-3">
  {comments.slice(0, 2).map((c) => (
    <div
      key={c.id}
      className="flex gap-2.5 rounded-xl bg-zinc-900/60 p-2.5 hover:bg-zinc-800/60 transition"
    >
      {/* Avatar */}
<img
  src={c.avatar_url || "/avatar-placeholder.png"}
  loading="lazy"
  decoding="async"
        alt=""
        className="h-8 w-8 rounded-full object-cover"
      />

      {/* Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white">
            {c.username}
          </span>

          <span className="text-[11px] text-zinc-500">
            @{c.username?.replace(/\s+/g, "").toLowerCase()}
          </span>

          <span className="text-[11px] text-zinc-600">
            • {new Date(c.created_at).toLocaleString()}
          </span>
        </div>






        {/* Comment */}
        <p className="mt-1 text-[13px] text-zinc-200 leading-relaxed">
          {c.content}
        </p>

        {/* Actions */}
        <div className="mt-2 flex gap-4 text-[11px]">
          <button className="text-zinc-500 hover:text-pink-400 transition">
            ❤️ Like
          </button>

          <button className="text-zinc-500 hover:text-cyan-400 transition">
            💬 Reply
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
  </>



    </>

  )
}