'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import VideoSchema from './VideoSchema'
import PostSchema from './PostSchema'
import LoginModal from './LoginModal'
import { setCachedProfile } from "../lib/profileCache"
import VideoPortal from "./VideoPortal"
import {
  Heart,
  MessageCircle,
  Send,
  Coins,
  Mic,
  Users,
  MapPin,
} from "lucide-react"
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

function Post({
  post,
  user,
  profile,
}: PostProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(0)
  const [displayLikes, setDisplayLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
const [showComments, setShowComments] = useState(false)
  const username = post.username || 'Anonymous'
const [portalOpening, setPortalOpening] = useState(false)
const [portalStartTime, setPortalStartTime] = useState(0)
console.log(
  "POST",
  post.id,
  "USERNAME:",
  post.username
)

  const avatarUrl = post.avatar_url || '/avatar-placeholder.png'
const [showLogin, setShowLogin] = useState(false)
const [showMenu, setShowMenu] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)
const [currentImage, setCurrentImage] = useState(0)
const videoRef = useRef<HTMLVideoElement>(null)
const portalVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
const postRef = useRef<HTMLDivElement>(null)
const [showVideoPortal, setShowVideoPortal] = useState(false)
const [portalMode, setPortalMode] = useState(false)
const [portalVideos, setPortalVideos] = useState<any[]>([])
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


const loadPortalVideos = async () => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      content,
      video_url,
      avatar_url,
      created_at,
      user_id
    `)
    .not("video_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error(error)
    return
  }

  const validVideos = (data || []).filter(
    (v: any) =>
      v.video_url &&
      v.video_url.trim() !== ""
  )

  // Make sure the current video is first
  const currentVideo = {
    ...post,
    video_url: post.video_url,
  }

  const others = validVideos.filter(
    (v: any) => v.id !== post.id
  )

  setPortalVideos([
    currentVideo,
    ...others,
  ])
}


useEffect(() => {
  loadPostData()
}, [post.id, user?.id])

useEffect(() => {
  if (!post.username) return

  setCachedProfile(post.username.toLowerCase(), {
    username: post.username,
    avatar_url: post.avatar_url || null,
  })
}, [post.username, post.avatar_url])

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
  if (!portalMode) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement

        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      })
    },
    {
      threshold: 0.7,
    }
  )

  portalVideoRefs.current.forEach((video) => {
    if (video) observer.observe(video)
  })

  return () => observer.disconnect()
}, [portalMode, portalVideos])


useEffect(() => {
  if (!videoRef.current || !postRef.current) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      const video = videoRef.current

      if (!video) return

      if (entry.isIntersecting) {
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    },
    {
      threshold: 0.8,
    }
  )

  observer.observe(postRef.current)

  return () => observer.disconnect()
}, [])

useEffect(() => {
  let start = displayLikes
  const end = likes

  if (start === end) return

  const timer = setInterval(() => {
    start += start < end ? 1 : -1

    setDisplayLikes(start)

    if (start === end) {
      clearInterval(timer)
    }
  }, 25)

  return () => clearInterval(timer)
}, [likes])



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

const toggleLike = async () => {
  if (!user) {
    if (!showLogin) {
      setShowLogin(true)
    }
    return
  }

  // USER ALREADY LIKED -> REMOVE LIKE
  if (liked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", user.id)

    console.log("DELETE ERROR:", error)

    if (error) {
      alert(error.message)
      return
    }

    setLiked(false)
    console.log("LIKED STATE -> FALSE")
    setLikes((p) => Math.max(0, p - 1))
    return
  }

  // USER HAS NOT LIKED -> ADD LIKE
  const { data, error } = await supabase
    .from("likes")
    .insert({
      post_id: post.id,
      user_id: user.id,
    })

  console.log("LIKE DATA:", data)
  console.log("LIKE ERROR:", error)

  if (error) {
    alert(error.message)
    return
  }

  setLiked(true)
  console.log("LIKED STATE -> TRUE")
  setLikes((p) => p + 1)
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

  setCachedProfile(username.toLowerCase(), {
    username,
    avatar_url: avatarUrl,
  })

  router.prefetch(`/profile/${username}`)
  router.push(`/profile/${username}`)
}


const signalTheme =
  displayLikes < 100
    ? {
        border: "border-zinc-800",
        glow: "shadow-none",
        line: "via-zinc-700",
      }
    : displayLikes < 1000
    ? {
        border: "border-cyan-500/30",
        glow: "shadow-[0_0_25px_rgba(34,211,238,0.15)]",
        line: "via-cyan-400",
      }
    : displayLikes < 10000
    ? {
        border: "border-emerald-500/30",
        glow: "shadow-[0_0_35px_rgba(16,185,129,0.20)]",
        line: "via-emerald-400",
      }
    : displayLikes < 100000
    ? {
        border: "border-orange-500/30",
        glow: "shadow-[0_0_45px_rgba(249,115,22,0.25)]",
        line: "via-orange-400",
      }
    : {
        border: "border-pink-500/40",
        glow: "shadow-[0_0_60px_rgba(236,72,153,0.35)]",
        line: "via-pink-400",
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
  ref={postRef}
  className={`
    group
    relative
    overflow-hidden
    transition-all
    duration-500

    ${
      portalOpening
        ? "scale-110 opacity-0 blur-md"
        : "scale-100 opacity-100"
    }

    rounded-xl
    border
    ${signalTheme.border}
    ${signalTheme.glow}
    bg-[#05070b]/80
    backdrop-blur-xl
  `}
>
  <div
  className={`
    absolute
    top-0
    left-0
    right-0
    h-[1px]
    bg-gradient-to-r
    from-transparent
    ${signalTheme.line}
    to-transparent
  `}
/>
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
  loading="lazy"
  decoding="async"
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
  onMouseEnter={() => router.prefetch(`/profile/${username}`)}
  onTouchStart={() => router.prefetch(`/profile/${username}`)}
  onClick={goToProfile}
  className="
    flex
    items-center
    gap-2
    text-[15px]
    font-semibold
    text-white
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
ref={(el) => {
  if (el) {
    el.style.scrollSnapType = "x mandatory"
  }
}}

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
  loading="lazy"
  decoding="async"
className="
  flex-none
  w-full
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
    className={`
      mt-4
      overflow-hidden
      rounded-xl
      border
      border-orange-500/20
      bg-zinc-950
      transition-all
      duration-500

      ${
        portalOpening
          ? `
            fixed
            inset-0
            z-[99998]
            rounded-none
            border-0
            m-0
          `
          : ""
      }
    `}
  >
<video
  ref={videoRef}
  style={{
    transition: "all .45s ease",
  }}
  onTimeUpdate={(e) => {
  const video = e.currentTarget

  if (
    video.currentTime >= 10 &&
    !showVideoPortal
  ) {
    setShowVideoPortal(true)
  }
}}
  src={post.video_url}
  controls
  preload="metadata"
  playsInline
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
{/* SIGNAL PANEL */}
<div className="mt-6 rounded-2xl border border-zinc-900 bg-zinc-950/50 backdrop-blur-xl overflow-hidden">

  {/* TOP */}
  <div className="flex items-center justify-between px-5 py-4">

    {/* LIKES */}
    <button
      onClick={toggleLike}
      className="
        group
        flex
        items-center
        gap-3
        transition-all
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-amber-500/20
          bg-amber-500/5
          transition-all
          duration-300
          group-hover:border-amber-400
          group-hover:bg-amber-500/10
        "
      >
        <Heart
          size={20}
          fill={liked ? "currentColor" : "none"}
          className={liked ? "text-amber-400" : "text-zinc-500"}
        />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Resonance
        </p>

        <p className="text-xl font-bold text-white">
          {displayLikes}
        </p>
      </div>
    </button>

    {/* COMMENTS */}
    <button
      onClick={() => setShowComments(!showComments)}
      className="
        group
        flex
        items-center
        gap-3
        transition-all
      "
    >
      <div
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          border
          border-cyan-500/20
          bg-cyan-500/5
          transition-all
          duration-300
          group-hover:border-cyan-400
          group-hover:bg-cyan-500/10
        "
      >
        <MessageCircle
          size={20}
          className="text-cyan-400"
        />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Streams
        </p>

        <p className="text-xl font-bold text-white">
          {comments.length}
        </p>
      </div>
    </button>

  </div>

  {/* DIVIDER */}
  <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

  {/* SIGNAL */}
  <div className="px-5 py-4">

    <div className="flex items-center justify-between">

      <div>

        <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Signal Strength
        </p>

        <p className="mt-1 text-3xl font-black text-emerald-400">
          {(displayLikes * 0.01).toFixed(2)}%
        </p>

      </div>

<div
  className={`
    rounded-full
    px-3
    py-1
    text-[11px]
    font-bold
    border
    ${
      displayLikes < 100
        ? "border-zinc-700 bg-zinc-800 text-zinc-300"
      : displayLikes < 1000
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
      : displayLikes < 10000
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : displayLikes < 100000
        ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
      : "border-pink-500/30 bg-pink-500/10 text-pink-400"
    }
  `}
>
  {displayLikes < 100
    ? "NEW SIGNAL"
    : displayLikes < 1000
    ? "ACTIVE"
    : displayLikes < 10000
    ? "TRENDING"
    : displayLikes < 100000
    ? "VIRAL"
    : "LEGEND"}
</div>

    </div>

    {/* BAR */}
    <div className="mt-4">

      <div className="h-2 overflow-hidden rounded-full bg-zinc-900">

        <div
          className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-emerald-500
            via-cyan-400
            to-cyan-300
            transition-all
            duration-700
          "
          style={{
            width: `${Math.min(displayLikes * 0.01, 100)}%`,
          }}
        />

      </div>

    </div>

    {/* LEVELS */}

    <div className="mt-3 flex justify-between text-[10px] text-zinc-600">

      <span>NEW</span>

      <span>ACTIVE</span>

      <span>TRENDING</span>

      <span>LEGEND</span>

      <span>GLOBAL</span>

    </div>

  </div>

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
onClick={() => {
  console.log("clicked")
  toggleLike()
}}
  className="
    flex
    items-center
    gap-2
    px-4
    py-2
    rounded-xl
    transition-all
    hover:bg-pink-500/10
  "
>
<Heart
  size={20}
  fill={liked ? "currentColor" : "none"}
  strokeWidth={2}
  className={liked ? "text-pink-500" : "text-zinc-400"}
/>

  <span className="text-zinc-300">
    Like
  </span>

  <span className="text-zinc-500">
    {likes}
  </span>
</button>

  {/* COMMENTS */}
<button
  onClick={() => setShowComments(!showComments)}
  className="
    flex
    items-center
    gap-2
    px-4
    py-2
    rounded-xl
    transition-all
    hover:bg-cyan-500/10
  "
>
  <MessageCircle
  size={18}
  className="text-cyan-400"
/>

  <span className="text-zinc-300">
    Comment
  </span>

  <span className="text-zinc-500">
    {comments.length}
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
    flex
    items-center
    gap-2
    px-4
    py-2
    rounded-xl
    transition-all
    hover:bg-orange-500/10
  "
>
<Send
  size={18}
  className="text-orange-400"
/>
  <span className="text-zinc-300">
    Share
  </span>
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
  <Coins size={16} />
<span>Tip</span>
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
  <Mic size={16} />
<span>Voice</span>
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
  <Users size={16} />
<span>Here</span>
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
  <MapPin size={16} />
<span>Place</span>
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
)}


{showVideoPortal && (
  <div
    className="
      fixed
      bottom-6
      left-1/2
      z-[9999]
      w-[92%]
      max-w-md
      -translate-x-1/2
      rounded-2xl
      border
      border-cyan-500/30
      bg-[#070b12]/95
      backdrop-blur-2xl
      shadow-[0_20px_60px_rgba(0,0,0,0.6)]
      animate-[portalUp_.35s_ease]
      overflow-hidden
    "
  >

    <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

    <div className="px-5 py-4">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[10px] tracking-[0.3em] uppercase text-cyan-400">
            VIDEO PORTAL
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Continue Exploring
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Similar videos are ready.
          </p>

        </div>

        <button
onClick={async () => {
  if (videoRef.current) {
    setPortalStartTime(videoRef.current.currentTime)
  }

  setPortalOpening(true)

  await loadPortalVideos()

  setTimeout(() => {
    setPortalMode(true)
    setShowVideoPortal(false)
    setPortalOpening(false)
  }, 350)
}}
          className="
            rounded-xl
            bg-cyan-500
            px-4
            py-2
            text-sm
            font-bold
            text-black
            transition
            hover:scale-105
          "
        >
          ENTER
        </button>

      </div>

    </div>

  </div>
)}

{portalMode && (
<VideoPortal
  videos={portalVideos}
  startTime={portalStartTime}
  onClose={() => setPortalMode(false)}
/>
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

export default memo(Post)