'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

interface PostProps {
post: {
  id: string
  content: string
  image_url?: string | null
  video_url?: string | null
    user_id: string
    created_at: string
    username?: string
    avatar_url?: string | null
  }
  user: any
profile?: {
  username?: string
  avatar_url?: string | null
  reputation?: number
  predictions_correct?: number
  predictions_wrong?: number
} | null
}

export default function Post({
  post,
  user,
  profile,
}: PostProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
const [showComments, setShowComments] = useState(false)
  const username = post.username || 'Anonymous'
  const avatarUrl = post.avatar_url || '/avatar-placeholder.png'

  // Load likes & comments
  const loadPostData = async () => {
    // Likes count
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)
    setLikes(count || 0)

    if (user) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle()
      setLiked(!!data)
    }

    // Load comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
    setComments(commentsData || [])
  }

  useEffect(() => {
    loadPostData()
  }, [post.id, user])

  // Live comments subscription
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${post.id}`,
        },
        (payload) => {
          setComments((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [post.id])

  // Toggle like
  const toggleLike = async () => {
    if (!user) return alert('Login first')

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
      setLiked(false)
      setLikes((p) => Math.max(0, p - 1))
    } else {
      await supabase.from('likes').insert({
        post_id: post.id,
        user_id: user.id,
      })
      setLiked(true)
      setLikes((p) => p + 1)
    }
  }

  // Add comment
  const addComment = async () => {
    if (!commentText.trim()) return
    if (!user) return alert('Login first')

const { error } = await supabase
  .from('comments')
  .insert({
    post_id: post.id,
    user_id: user.id,
    content: commentText,
    username: profile?.username || 'Anonymous',
    avatar_url: profile?.avatar_url || null,
  })

console.log('COMMENT ERROR:', error)

if (error) {
  alert(error.message)
  return
}
    setCommentText('')
    loadPostData()
  }

  // Go to user profile
  const goToProfile = () => {
    if (!username) return
    router.push(`/profile/${username}`)
  }

  return (
    <div
  className="
    group
    relative
    overflow-hidden
    rounded-3xl
    border
    border-cyan-500/10
    bg-[#05070b]/80
    backdrop-blur-xl
    shadow-2xl
    transition-all
    duration-300
    hover:border-cyan-500/30
  "
>
  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
  <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/10 blur-[80px]" />
  <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-orange-500/10 blur-[80px]" />

  <div className="relative p-5">
      {/* Header */}
      

        
{/* PRO HEADER */}
<div className="mb-5 flex items-center justify-between">

  <div className="flex items-center gap-3">

    <div className="relative">
      <img
        src={avatarUrl}
        alt=""
        className="
          h-12
          w-12
          rounded-2xl
          object-cover
          border
          border-cyan-500/20
        "
      />

      <div
        className="
          absolute
          bottom-0
          right-0
          h-3
          w-3
          rounded-full
          bg-emerald-400
          border-2
          border-black
        "
      />
    </div>

    <div>

      <button
        onClick={goToProfile}
        className="
          flex
          items-center
          gap-2
          font-bold
          text-white
          hover:text-cyan-400
          transition
        "
      >
        {username}

      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">
          @{username.toLowerCase()}
        </span>

        <span className="text-zinc-700">•</span>

        <span className="text-xs text-zinc-600">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

    </div>

  </div>

  <button
    className="
      h-10
      w-10
      rounded-xl
      border
      border-white/5
      bg-white/[0.03]
      text-zinc-400
      hover:text-white
      hover:bg-white/[0.06]
      transition
    "
  >
    ⋯
  </button>

</div>



      {/* Content */}
      {/* Content */}
{post.content && (
  <p
    className="
      text-zinc-200
      leading-relaxed
      text-sm
      mb-4
    "
  >
    {post.content}
  </p>
)}

{/* Image */}
{post.image_url && (
  <div className="relative mt-3 overflow-hidden rounded-2xl group">

    {/* Glow */}
    <div
      className="
        absolute
        inset-0
        bg-gradient-to-r
        from-cyan-500/20
        via-blue-500/10
        to-orange-500/20
        blur-2xl
      "
    />

    <img
      src={post.image_url}
      alt="Post"
      className="
        relative
        w-full
        rounded-2xl
        max-h-[600px]
        object-cover
        border
        border-cyan-500/20
        transition-all
        duration-500
        group-hover:scale-[1.02]
      "
    />

    <div
      className="
        absolute
        inset-0
        bg-gradient-to-t
        from-black/50
        via-transparent
        to-transparent
      "
    />

    <div
      className="
        absolute
        top-3
        right-3
        px-3
        py-1
        rounded-full
        bg-cyan-500/20
        backdrop-blur-xl
        border
        border-cyan-500/30
        text-cyan-300
        text-[10px]
        font-bold
        uppercase
      "
    >
      Visual Signal
    </div>

  </div>
)}

{/* Video */}
{post.video_url && (
  <div
    className="
      mt-4
      overflow-hidden
      rounded-2xl
      border
      border-orange-500/20
      bg-zinc-950
    "
  >
    <video
      src={post.video_url}
      controls
      className="
        w-full
        max-h-[600px]
        object-cover
      "
    />

    <div
      className="
        px-4
        py-2
        text-[10px]
        uppercase
        tracking-widest
        text-orange-400
        border-t
        border-orange-500/20
      "
    >
      🎬 Video
    </div>
  </div>
)}

<div className="mt-4 flex items-center gap-4 text-sm text-zinc-500">
  <span>❤️ {likes} Likes</span>
  <span>💬 {comments.length} Comments</span>
</div>

{/* ACTION BAR */}
<div
  className="
    mt-5
    flex
    items-center
    gap-6
    border-t
    border-zinc-800/60
    bg-gradient-to-r
    from-zinc-950
    via-zinc-900/20
    to-transparent
    p-3.5
    backdrop-blur-md
    rounded-xl
  "
>

  {/* LIKE ENGINE */}
  <button
    onClick={toggleLike}
    className="
      group/like
      flex
      items-center
      gap-2.5
      rounded-lg
      px-3
      py-1.5
      text-zinc-400
      transition-all
      duration-300
      hover:text-pink-400
      hover:bg-pink-500/5
      active:scale-95
    "
  >
    <span
      className={`
        transition-all
        duration-300
        group-hover/like:scale-110
        ${
          liked
            ? 'text-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.7)]'
            : 'text-zinc-500'
        }
      `}
    >
      ❤️
    </span>

    <span
      className={`
        font-mono
        text-xs
        tracking-wider
        ${
          liked
            ? 'text-pink-400 font-bold'
            : ''
        }
      `}
    >
      {likes}
    </span>
  </button>

  {/* COMMENTS */}
<button
  onClick={() => setShowComments(!showComments)}
  className="
    group/comment
    flex
    items-center
    gap-2.5
    rounded-lg
    px-3
    py-1.5
    text-zinc-400
    hover:text-cyan-400
    hover:bg-cyan-500/5
    transition-all
    duration-300
  "
>
    <span
      className="
        group-hover/comment:scale-110
        transition-all
        duration-300
      "
    >
      💬
    </span>

    <span className="relative font-mono text-xs tracking-wider">
      {comments.length}

      {comments.length > 0 && (
        <span
          className="
            absolute
            -top-1
            -right-2
            h-2
            w-2
            rounded-full
            bg-cyan-400
            animate-pulse
          "
        />
      )}
    </span>
  </button>

  {/* TRANSMIT */}
  <button
    onClick={() =>
      navigator.share?.({
        title: 'CWV',
        text: post.content,
        url: window.location.href,
      })
    }
    className="
      ml-auto
      flex
      items-center
      gap-2
      rounded-lg
      border
      border-cyan-500/20
      bg-cyan-500/5
      px-4
      py-2
      text-[11px]
      font-mono
      tracking-[0.2em]
      text-cyan-400
      transition-all
      duration-300
      hover:border-cyan-400/50
      hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]
      hover:bg-cyan-500/10
      active:scale-95
    "
  >
    📤 Share
  </button>

</div>


{showComments && (
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
        maxLength={280}
        placeholder="Write a comment..."
        className="
          w-full
          bg-transparent
          px-4
          py-3
          text-sm
          text-zinc-200
          outline-none
          placeholder:text-zinc-500
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
        onClick={addComment}
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
          tracking-[0.2em]
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
  {comments.map((c) => (
    <div
      key={c.id}
      className="flex gap-3 rounded-2xl bg-zinc-900/60 p-3 hover:bg-zinc-800/60 transition"
    >
      {/* Avatar */}
      <img
        src={c.avatar_url || "/avatar-placeholder.png"}
        alt=""
        className="h-12 w-12 rounded-full object-cover"
      />

      {/* Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white">
            {c.username}
          </span>

          <span className="text-xs text-zinc-500">
            @{c.username?.replace(/\s+/g, "").toLowerCase()}
          </span>

          <span className="text-xs text-zinc-600">
            • {new Date(c.created_at).toLocaleString()}
          </span>
        </div>

        {/* Comment */}
        <p className="mt-1 text-sm text-zinc-200 leading-relaxed">
          {c.content}
        </p>

        {/* Actions */}
        <div className="mt-2 flex gap-5 text-xs">
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
)}




      </div>
</div>
  )
}