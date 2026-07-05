'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import VideoSchema from './VideoSchema'
import PostSchema from './PostSchema'
import LoginModal from './LoginModal'
interface PostProps {
post: {
  id: string
  content: string
  image_urls?: string[] | null
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
const [showLogin, setShowLogin] = useState(false)
const [showMenu, setShowMenu] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)
const [currentImage, setCurrentImage] = useState(0)
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

useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setShowMenu(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    )
  }
}, [])


  // Toggle like
  const toggleLike = async () => {
    if (!user) {
  if (!showLogin) {setShowLogin(true)}
  return
}

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
  if (!user) {
    if (!showLogin) {setShowLogin(true)}
    return
  }

  if (!commentText.trim()) return

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
  <>
    <PostSchema
      id={post.id}
      author={username}
      content={post.content}
      createdAt={post.created_at}
    />

    <div
  className="
    group
    relative
    overflow-hidden
    rounded-xl
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

  <div className="relative px-0 pb-4 pt-4">
      {/* Header */}
      

        
{/* PRO HEADER */}
<div className="relative mb-5 flex items-center justify-between px-4">

  <div className="flex items-center gap-3">

    <div className="relative">
      <img
        src={avatarUrl}
        alt=""
        className="
          h-12
          w-12
          rounded-xl
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
text-[15px] font-semibold text-white
          hover:text-cyan-400
          transition
        "
      >
        {username}

      </button>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-zinc-500">
          @{username.toLowerCase()}
        </span>

        <span className="text-zinc-700">•</span>

        <span className="text-[11px] text-zinc-600">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>

    </div>

  </div>

<button
  onClick={() => setShowMenu(!showMenu)}
  className="
    h-8
    w-8
    rounded-lg
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

{showMenu && (
  <div
    className="
      absolute
      right-4
      top-16
      z-50
      w-56
      overflow-hidden
      rounded-2xl
      border
      border-cyan-500/20
      bg-[#090b10]/95
      backdrop-blur-2xl
      shadow-[0_20px_60px_rgba(0,0,0,0.45)]
    "
  >
    <button
      className="w-full px-5 py-3 text-left text-sm text-white hover:bg-white/5 transition"
      onClick={async () => {
        await navigator.clipboard.writeText(
          `${window.location.origin}/post/${post.id}`
        )
        alert("✅ Link copied")
        setShowMenu(false)
      }}
    >
      📋 Copy Link
    </button>

    <button
      className="w-full px-5 py-3 text-left text-sm text-white hover:bg-white/5 transition"
      onClick={() => {
        setShowMenu(false)
      }}
    >
      🔖 Save Post
    </button>

    <button
      className="w-full px-5 py-3 text-left text-sm text-white hover:bg-white/5 transition"
      onClick={() => {
        setShowMenu(false)
      }}
    >
      🚩 Report
    </button>

    {user?.id === post.user_id && (
      <button
        className="w-full px-5 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition"
        onClick={() => {
          setShowMenu(false)
        }}
      >
        🗑 Delete Post
      </button>
    )}
  </div>
)}


</div>



      {/* Content */}
      {/* Content */}
<div className="px-4">
  <p
    className="
      text-zinc-200
      text-[14px]
      leading-6
      mb-3
    "
  >
    {post.content}
  </p>
</div>
{post.image_urls && post.image_urls.length > 0 && (
  <div className="-mx-4 mt-4 relative">

<div
  id={`gallery-${post.id}`}
  className="
    relative
    flex
    overflow-x-auto
    snap-x
    snap-mandatory
    scrollbar-hide
    scroll-smooth
  "
  onScroll={(e) => {
    const width = e.currentTarget.clientWidth
    const index = Math.round(e.currentTarget.scrollLeft / width)
    setCurrentImage(index)
  }}
>
      {post.image_urls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt=""
className="
  w-full
  min-w-full
  h-[65vh]
  shrink-0
  snap-center
  object-cover
"
        />
      ))}
    </div>




<div
  className="
    pointer-events-none
    absolute
    bottom-0
    left-0
    right-0
    h-32
    bg-gradient-to-t
    from-black/80
    via-black/20
    to-transparent
  "
/>


  </div>
)}

{/* Video SEO */}
{post.video_url && (
  <VideoSchema
    id={post.id}
    title={post.content || 'StreetGO Video'}
    description={post.content || 'Watch this video on StreetGO'}
    thumbnail="https://streetgo.app/og-image.png"
    videoUrl={post.video_url}
    uploadDate={post.created_at}
  />
)}

{/* Video */}
{post.video_url && (
  <div
    className="
      mt-4
      overflow-hidden
      rounded-xl
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
  px-3
py-1.5
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

<div
  className="
    mt-3
    flex
    items-center
    gap-2
    overflow-x-auto
    scrollbar-hide
    whitespace-nowrap
    border-t
    border-white/5
    pt-2
    px-2
    scroll-smooth
  "
>

  {/* LIKE ENGINE */}
  <button
    onClick={toggleLike}
  className="
  group/like
  shrink-0
  w-20
  h-16
  flex
  flex-col
  items-center
  justify-center
  rounded-2xl
  border
  border-white/10
  bg-white/[0.03]
  backdrop-blur-xl
  transition-all
  duration-300
  hover:border-pink-400/50
  hover:bg-pink-500/10
  hover:-translate-y-1
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
        text-[11px]
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
  shrink-0
  w-20
  h-16
  flex
  flex-col
  items-center
  justify-center
  rounded-2xl
  border
  border-white/10
  bg-white/[0.03]
  backdrop-blur-xl
  transition-all
  duration-300
  hover:border-cyan-400/50
  hover:bg-cyan-500/10
  hover:-translate-y-1
  active:scale-95
"
>
<>
  <span className="text-xl">💬</span>

  <span className="text-[10px] font-bold uppercase tracking-widest">
    Comment
  </span>
</>

    <span className="relative font-mono text-[11px] tracking-wider">
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
onClick={async () => {
  const url = `${window.location.origin}/post/${post.id}`

  if (navigator.share) {
    await navigator.share({
      title: "StreetGO",
      text: post.content,
      url,
    })
  } else {
    await navigator.clipboard.writeText(url)
    alert("Post link copied!")
  }
}}
className="
  shrink-0
  w-20
  h-16
  flex
  flex-col
  items-center
  justify-center
  rounded-2xl
  border
  border-white/10
  bg-white/[0.03]
  backdrop-blur-xl
  transition-all
  duration-300
  hover:border-cyan-400/50
  hover:bg-cyan-500/10
  hover:-translate-y-1
  active:scale-95
"
  >
    <>
  <span className="text-xl">📤</span>

  <span className="text-[10px] font-bold uppercase tracking-widest">
    Share
  </span>
</>
  </button>

{/* TIP */}
<button
  className="
    ml-2
    flex
    items-center
    gap-2
    rounded-lg
    border
    border-emerald-500/20
    bg-emerald-500/5
    px-3
    py-1.5
    text-[11px]
    font-mono
    tracking-wide
    text-emerald-400
    transition-all
    hover:border-emerald-400/50
    hover:bg-emerald-500/10
  "
>
  💰 Tip
</button>

{/* VOICE */}
<button
  className="
    ml-2
    flex
    items-center
    gap-2
    rounded-lg
    border
    border-purple-500/20
    bg-purple-500/5
    px-3
    py-1.5
    text-[11px]
    font-mono
    tracking-wide
    text-purple-400
    transition-all
    hover:border-purple-400/50
    hover:bg-purple-500/10
  "
>
  🎤 Voice
</button>

{/* HERE */}
<button
  className="
    ml-2
    flex
    items-center
    gap-2
    rounded-lg
    border
    border-orange-500/20
    bg-orange-500/5
    px-3
    py-1.5
    text-[11px]
    font-mono
    tracking-wide
    text-orange-400
    transition-all
    hover:border-orange-400/50
    hover:bg-orange-500/10
  "
>
  👥 Here
</button>

{/* PLACE */}
<button
  className="
    ml-2
    flex
    items-center
    gap-2
    rounded-lg
    border
    border-blue-500/20
    bg-blue-500/5
    px-3
    py-1.5
    text-[11px]
    font-mono
    tracking-wide
    text-blue-400
    transition-all
    hover:border-blue-400/50
    hover:bg-blue-500/10
  "
>
  📍 Place
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
          py-2.5
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
  {comments.map((c) => (
    <div
      key={c.id}
      className="flex gap-2.5 rounded-xl bg-zinc-900/60 p-2.5 hover:bg-zinc-800/60 transition"
    >
      {/* Avatar */}
      <img
        src={c.avatar_url || "/avatar-placeholder.png"}
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
)}

{showLogin ? (
  <LoginModal
    onClose={() => setShowLogin(false)}
    onLogin={() => {
      setShowLogin(false)
      loadPostData()
    }}
  />
) : null}

      </div>
    </div>
  </>
)
}