'use client'
import { sendPostReax } from "../lib/reaxEngine"
import { memo, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import VideoSchema from './VideoSchema'
import PostSchema from './PostSchema'
import LoginModal from './LoginModal'
import { setCachedProfile } from "../lib/profileCache"
import VideoPortal from "./VideoPortal"
import ReactionButton from "./ReactionButton"
import { formatRelativeTime } from "../lib/time"
import StreetAI from "./StreetAI"
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
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


isActive?: boolean
setActivePostId?: React.Dispatch<React.SetStateAction<string | null>>

}

function Post({
  post,
  user,
  profile,
  isActive,
  setActivePostId,
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
const [imageLikes, setImageLikes] = useState<number[]>([])
const [showImageComments, setShowImageComments] = useState(false)
const [imageComments, setImageComments] = useState<any[]>([])
const [imageCommentText, setImageCommentText] = useState("")
const [imageCommentCounts, setImageCommentCounts] = useState<number[]>([])
const [imageLiked, setImageLiked] = useState<boolean[]>([])
const [reaxCount, setReaxCount] = useState(0)
const [showAIBubble, setShowAIBubble] = useState(false)
const [aiTimerFinished, setAiTimerFinished] = useState(false)


const [viewerCount, setViewerCount] = useState(0)
const [showSurprisePopup, setShowSurprisePopup] = useState(false)
const [isActivePost, setIsActivePost] = useState(false)
const [showVideoPortal, setShowVideoPortal] = useState(false)

useEffect(() => {
  setImageLikes(imageUrls.map(() => 0))
  setImageLiked(imageUrls.map(() => false))
}, [post.id])
const imageUrls = post.image_urls ?? []


useEffect(() => {
  if (!postRef.current) return

  const observer = new IntersectionObserver(
    ([entry]) => {
if (entry.isIntersecting) {
  setActivePostId?.(post.id)
}
    },
    {
      threshold: 0.8,
    }
  )

  observer.observe(postRef.current)

  return () => observer.disconnect()
}, [post.id, setActivePostId])

useEffect(() => {
  loadViewerCount()

  const channel = supabase
    .channel(`viewers-${post.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "post_viewers",
        filter: `post_id=eq.${post.id}`,
      },
      () => {
        loadViewerCount()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [post.id])


useEffect(() => {
  if (!isActive || !user) {
    setShowAIBubble(false)
    return
  }

  const registerViewer = async () => {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("AUTH USER:", authUser)
    console.log("AUTH ERROR:", authError)
    console.log("PROP USER:", user)

    if (!authUser) {
      console.error("❌ No authenticated user found.")
      return
    }

const { data, error } = await supabase
  .from("post_viewers")
  .upsert(
    {
      post_id: post.id,
      user_id: authUser.id,
      last_seen: new Date().toISOString(),
    },
    {
      onConflict: "post_id,user_id",
      ignoreDuplicates: true,
    }
  )
  .select()

console.log("UPSERT DATA:", data)
console.log("UPSERT ERROR:", error)
  }

  registerViewer()



  return () => {
    if (user) {
      supabase
        .from("post_viewers")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", user.id)
    }
  }
}, [isActive, user, post.id])

useEffect(() => {
  if (!isActive || !user) return

  const heartbeat = setInterval(async () => {
    await supabase
      .from("post_viewers")
      .update({
        last_seen: new Date().toISOString(),
      })
      .eq("post_id", post.id)
      .eq("user_id", user.id)
  }, 30000)

  return () => clearInterval(heartbeat)
}, [isActive, user, post.id])


useEffect(() => {
  if (!isActive || viewerCount < 2) {
    setAiTimerFinished(false)
    setShowAIBubble(false)
    return
  }

  const timer = setTimeout(() => {
    setAiTimerFinished(true)
  }, 60000)

  return () => clearTimeout(timer)
}, [isActive, viewerCount, post.id])


useEffect(() => {
  if (aiTimerFinished && viewerCount >= 2) {
    setShowAIBubble(true)
  } else {
    setShowAIBubble(false)
  }
}, [aiTimerFinished, viewerCount])

useEffect(() => {
  setImageLikes(
    imageUrls.map(() => 0)
  )
}, [post.id])
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
const [showImageViewer, setShowImageViewer] = useState(false)
const videoRef = useRef<HTMLVideoElement>(null)
const portalVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
const postRef = useRef<HTMLDivElement>(null)

const [portalMode, setPortalMode] = useState(false)
const [portalVideos, setPortalVideos] = useState<any[]>([])
  // Load likes & comments

const toggleImageLike = async () => {
  if (!user) {
    setShowLogin(true)
    return
  }




  const liked = imageLiked[currentImage]
console.log("LIKED:", liked)
  if (liked) {
    const { error } = await supabase
      .from("image_likes")
      .delete()
      .eq("post_id", post.id)
      .eq("image_index", currentImage)
      .eq("user_id", user.id)
console.log("ABOUT TO INSERT")
console.log("INSERT ERROR:", error)

if (error) {
  alert(error.message)
  return
}

console.log("IMAGE LIKE SAVED")

    setImageLiked((prev) => {
      const copy = [...prev]
      copy[currentImage] = false
      return copy
    })

    setImageLikes((prev) => {
      const copy = [...prev]
      copy[currentImage] = Math.max(0, copy[currentImage] - 1)
      return copy
    })

    return
  }

console.log("ABOUT TO INSERT")

const { data, error } = await supabase
  .from("image_likes")
  .insert({
    post_id: post.id,
    image_index: currentImage,
    user_id: user.id,
  })
  .select()

console.log("INSERT DATA:", data)
console.log("INSERT ERROR:", error)

if (error) {
  alert(error.message)
  return
}

console.log("IMAGE LIKE SAVED")

  setImageLiked((prev) => {
    const copy = [...prev]
    copy[currentImage] = true
    return copy
  })

  setImageLikes((prev) => {
    const copy = [...prev]
    copy[currentImage]++
    return copy
  })
}


const loadViewerCount = async () => {
  const activeSince = new Date(Date.now() - 60000).toISOString()

  const { count, error } = await supabase
    .from("post_viewers")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("post_id", post.id)
    .gte("last_seen", activeSince)

  if (error) {
    console.error(error)
    return
  }

  setViewerCount(count || 0)
}

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

const addImageComment = async () => {
  if (!user) {
    setShowLogin(true)
    return
  }

  if (!imageCommentText.trim()) return

  const { error } = await supabase
    .from("image_comments")
    .insert({
      post_id: post.id,
      image_index: currentImage,
      user_id: user.id,
      content: imageCommentText,
      username: profile?.username || "Anonymous",
      avatar_url: profile?.avatar_url || null,
    })

  console.log("IMAGE COMMENT DATA:", {
  post_id: post.id,
  image_index: currentImage,
  user_id: user.id,
  content: imageCommentText,
  username: profile?.username,
  avatar_url: profile?.avatar_url,
})

console.log("IMAGE COMMENT ERROR:", error)

  if (error) {
    alert(error.message)
    return
  }

setImageCommentText("")
await loadImageComments()
await loadImageCommentCounts()
}

const loadImageComments = async () => {
  const { data, error } = await supabase
    .from("image_comments")
    .select("*")
    .eq("post_id", post.id)
    .eq("image_index", currentImage)
    .order("created_at", {
      ascending: false,
    })

  if (error) {
    console.log("IMAGE COMMENTS ERROR:", JSON.stringify(error, null, 2))
console.log(error)
    return
  }

  setImageComments(data || [])
}

useEffect(() => {
  if (!showImageComments) return

  loadImageComments()
}, [showImageComments, currentImage])



const loadImageCommentCounts = async () => {
  const counts = await Promise.all(
    imageUrls.map(async (_, index) => {
      const { count } = await supabase
        .from("image_comments")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("post_id", post.id)
        .eq("image_index", index)

      return count || 0
    })
  )

  setImageCommentCounts(counts)
}


const loadImageLikes = async () => {
  const likes: number[] = []
  const liked: boolean[] = []

  for (let index = 0; index < imageUrls.length; index++) {
    // Count likes
    const { count } = await supabase
      .from("image_likes")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("post_id", post.id)
      .eq("image_index", index)

    likes.push(count || 0)

    // Has current user liked?
    if (user) {
      const { data } = await supabase
        .from("image_likes")
        .select("id")
        .eq("post_id", post.id)
        .eq("image_index", index)
        .eq("user_id", user.id)
        .maybeSingle()

      liked.push(!!data)
    } else {
      liked.push(false)
    }
  }

  setImageLikes(likes)
  setImageLiked(liked)
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

const handleSendReax = async () => {
  if (!user) {
    setShowLogin(true)
    return
  }
console.log("CURRENT USER ID:", user.id)
console.log("POST OWNER ID:", post.user_id)
  await sendPostReax({
    senderId: user.id,
    receiverId: post.user_id,

    onSuccess: () => {
      setReaxCount(prev => prev + 1)
    },

    onRollback: () => {
      setReaxCount(prev => Math.max(0, prev - 1))
    }
  })
}
useEffect(() => {
  loadPostData()
}, [post.id, user?.id])

useEffect(() => {
  loadImageCommentCounts()
}, [post.id])

useEffect(() => {
  loadImageLikes()
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
<div className="relative mb-3 flex items-center justify-between px-3">

  <div className="flex items-center gap-3">

    <div className="relative">

{(() => {
  const colorThemes = [
    {
      text: "text-cyan-300",
      border: "from-cyan-500/80 via-cyan-300/20 to-cyan-500/80",
      glow: "shadow-[0_0_18px_rgba(34,211,238,0.25)]",
      accent: "bg-cyan-400",
      bg: "from-cyan-500/10 to-cyan-900/20"
    },
    {
      text: "text-violet-300",
      border: "from-violet-500/80 via-violet-300/20 to-violet-500/80",
      glow: "shadow-[0_0_18px_rgba(168,85,247,0.25)]",
      accent: "bg-violet-400",
      bg: "from-violet-500/10 to-violet-900/20"
    },
    {
      text: "text-emerald-300",
      border: "from-emerald-500/80 via-emerald-300/20 to-emerald-500/80",
      glow: "shadow-[0_0_18px_rgba(16,185,129,0.25)]",
      accent: "bg-emerald-400",
      bg: "from-emerald-500/10 to-emerald-900/20"
    },
    {
      text: "text-rose-300",
      border: "from-rose-500/80 via-rose-300/20 to-rose-500/80",
      glow: "shadow-[0_0_18px_rgba(244,63,94,0.25)]",
      accent: "bg-rose-400",
      bg: "from-rose-500/10 to-rose-900/20"
    },
    {
      text: "text-amber-300",
      border: "from-amber-500/80 via-amber-300/20 to-amber-500/80",
      glow: "shadow-[0_0_18px_rgba(251,191,36,0.25)]",
      accent: "bg-amber-400",
      bg: "from-amber-500/10 to-amber-900/20"
    }
  ];

  const nameString = username || "StreetGO";

  let hash = 0;
  for (let i = 0; i < nameString.length; i++) {
    hash = nameString.charCodeAt(i) + ((hash << 5) - hash);
  }

  const theme = colorThemes[Math.abs(hash) % colorThemes.length];

  const initial = nameString.charAt(0).toUpperCase();

  return (
    <div className="relative group shrink-0">

      {/* Neon animated border */}
      <div
        className={`
          relative h-10 w-10 rounded-full p-[1px]
          bg-gradient-to-br ${theme.border}
          ${theme.glow}
          transition-all duration-500
          group-hover:scale-105
        `}
      >
        {/* Glass body */}
        <div className="
          relative h-full w-full
          overflow-hidden
       rounded-full
          bg-zinc-950/90
          backdrop-blur-xl
          border border-white/5
        ">

          {/* Scanner animation */}
          <div className="
            absolute inset-y-0
            -left-8
            w-6
            rotate-12
            bg-white/10
            blur-md
            group-hover:translate-x-20
            transition-transform
            duration-1000
          " />

          {post.avatar_url ? (
            <img
              src={post.avatar_url}
              alt={nameString}
              loading="lazy"
              decoding="async"
              className="
                h-full
                w-full
                object-cover
                transition-all
                duration-500
                group-hover:scale-110
                group-hover:brightness-110
              "
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
          ) : null}

          {/* Initial */}
          <div
            className={`
              absolute inset-0
              ${post.avatar_url ? "hidden" : ""}
              flex items-center justify-center
              bg-gradient-to-br ${theme.bg}
              ${theme.text}
              font-black
              text-sm
              tracking-tight
              font-mono
            `}
          >
            {initial}

            {/* Corner accents */}
            <div className={`absolute top-1 right-1 h-[2px] w-2 ${theme.accent}`} />
            <div className={`absolute bottom-1 left-1 w-[2px] h-2 ${theme.accent}`} />
          </div>

          {/* Inner glow */}
          <div className="
            absolute
            inset-0
            rounded-[11px]
            ring-1
            ring-white/5
            pointer-events-none
          " />
        </div>
      </div>


    </div>
  );
})()}

<StreetAI
  visible={showAIBubble}
  username={username}
  viewerCount={viewerCount}
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
    text-sm font-bold
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
         {formatRelativeTime(post.created_at)}
        </span>
      </div>

    </div>

  </div>

<button
  onClick={() => setShowMenu(!showMenu)}
  className="
    h-9
    w-9
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



{imageUrls.length > 0 && (
  <div className="-mx-4 mt-4 relative">

<div
className={`
  overflow-hidden
  rounded-xl
  bg-black

  ${
    imageUrls.length === 2
      ? "grid grid-cols-2 gap-[3px]"
      : ""
  }
`}
>


{imageUrls.length === 3 && (
  <div className="grid grid-cols-2 gap-[3px] h-[500px]">
<img
  src={imageUrls[0]}
  alt=""
  onClick={() => {
  setCurrentImage(0)
  setShowImageViewer(true)
}}
  className="
    w-full
    h-full
    object-cover
    cursor-pointer
    hover:brightness-90
    transition
  "
/>

    <div className="grid grid-rows-2 gap-[3px]">
<img
  src={imageUrls[1]}
  alt=""
  onClick={() => {
  setCurrentImage(1)
  setShowImageViewer(true)
}}
  className="
    w-full
    h-full
    object-cover
    cursor-pointer
    hover:brightness-90
    transition
  "
/>

<img
  src={imageUrls[2]}
  alt=""
  onClick={() => {
  setCurrentImage(2)
  setShowImageViewer(true)
}}
  className="
    w-full
    h-full
    object-cover
    cursor-pointer
    hover:brightness-90
    transition
  "
/>
    </div>
  </div>
)}

{imageUrls.length === 4 && (
  <div className="grid grid-cols-2 gap-[3px] h-[500px]">
    {imageUrls.map((url, index) => (
<img
  key={index}
  src={url}
  onClick={() => {
    setCurrentImage(index)
    setShowImageViewer(true)
  }}
  className="
    w-full
    h-full
    object-cover
    cursor-pointer
    hover:brightness-90
    transition
  "
/>
    ))}
  </div>
)}



{imageUrls.length > 4 && (
  <div className="grid grid-cols-2 gap-[3px] h-[500px]">
    {imageUrls.slice(0, 4).map((url, index) => (
      <div key={index} className="relative">
<img
  key={index}
  src={url}
  alt=""
  onClick={() => {
    setCurrentImage(index)
    setShowImageViewer(true)
  }}
          className="w-full h-full object-cover"
        />

        {index === 3 && (
          <div
            className="
              absolute
              inset-0
            bg-[#0b6b4b]
              flex
              items-center
              justify-center
              text-white
              text-3xl
              font-bold
            "
          >
            +{imageUrls.length - 4}
          </div>
        )}
      </div>
    ))}
  </div>
)}



{imageUrls.length <= 2 &&
 imageUrls.map((url, index) => (
 <img
  key={index}
  src={url}
  alt=""
  loading="lazy"
  decoding="async"
  onClick={() => {
    setCurrentImage(index)
    setShowImageViewer(true)
  }}
    className={`
      w-full
      cursor-pointer
      transition-all
      duration-300
      hover:brightness-95

      ${
        imageUrls.length === 1
          ? `
            max-h-[700px]
            object-contain
            rounded-xl
            bg-black
          `
          : imageUrls.length === 2
          ? `
            h-[420px]
            object-cover
          `
          : `
            h-64
            object-cover
          `
      }
    `}
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
      
    </div>
  </div>
)}




{/* SIGNAL PANEL */}
<div className="mt-6 rounded-2xl border border-zinc-900 bg-zinc-950/50 backdrop-blur-xl overflow-hidden">


  {/* DIVIDER */}
  <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
{/* SIGNAL */}
<div className="px-5 py-4">

  <div className="flex flex-wrap items-center gap-2">

    <div className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold text-orange-400">
      🔥 {
        displayLikes < 100
          ? "New"
          : displayLikes < 1000
          ? "Active"
          : displayLikes < 10000
          ? "Trending"
          : displayLikes < 100000
          ? "Viral"
          : "Legend"
      }
    </div>

    <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-400">
      ⚡ {(displayLikes * 0.01).toFixed(0)}%
    </div>

    <div className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1 text-[11px] font-semibold text-pink-400">
      ❤️ {displayLikes}
    </div>

    <div className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-400">
      💬 {comments.length}
    </div>

  </div>



  </div>

</div>



<div
  className="
    mt-2
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

{/* LIKE */}
<button
  onClick={toggleLike}
  className="
    flex
    items-center
    gap-1.5
    rounded-full
    px-3
    py-2
    transition-all
    duration-200
    hover:bg-pink-500/10
    hover:scale-105
    active:scale-95
  "
>
  <Heart
    size={18}
    fill={liked ? "currentColor" : "none"}
    className={liked ? "text-pink-500" : "text-zinc-400"}
  />

  <span className="text-sm font-medium text-zinc-300">
    {likes}
  </span>
</button>

  {/* COMMENTS */}
<button
  onClick={() => setShowComments(!showComments)}
  className="
    flex
    items-center
    gap-1.5
    rounded-full
    px-3
    py-2
    transition-all
    duration-200
    hover:bg-cyan-500/10
    hover:scale-105
    active:scale-95
  "
>
  <MessageCircle
    size={18}
    className="text-cyan-400"
  />

  <span className="text-sm font-medium text-zinc-300">
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
    justify-center
    rounded-full
    p-2.5
    transition-all
    duration-200
    hover:bg-orange-500/10
    hover:scale-105
    active:scale-95
  "
>
  <Send
    size={18}
    className="text-orange-400"
  />
</button>

{/* TIP */}
<ReactionButton
  handleSendReax={handleSendReax}
  reaxCount={reaxCount}
/>




{/* VOICE */}
<button
  className="
    flex
    items-center
    gap-1.5
    rounded-full
    border
    border-purple-500/20
    bg-purple-500/10
    px-3
    py-1.5
    text-[11px]
    font-semibold
    text-purple-400
    transition-all
    duration-200
    hover:bg-purple-500/20
    hover:scale-105
    active:scale-95
  "
>
  <Mic size={14} />
  Voice
</button>
{/* HERE */}
<button
  className="
    flex
    items-center
    gap-1.5
    rounded-full
    border
    border-orange-500/20
    bg-orange-500/10
    px-3
    py-1.5
    text-[11px]
    font-semibold
    text-orange-400
    transition-all
    duration-200
    hover:bg-orange-500/20
    hover:scale-105
    active:scale-95
  "
>
  <Users size={14} />
  {viewerCount} Here
</button>

{/* PLACE */}
<button
  className="
    flex
    items-center
    gap-1.5
    rounded-full
    border
    border-blue-500/20
    bg-blue-500/10
    px-3
    py-1.5
    text-[11px]
    font-semibold
    text-blue-400
    transition-all
    duration-200
    hover:bg-blue-500/20
    hover:scale-105
    active:scale-95
  "
>
  <MapPin size={14} />
  Place
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
  <div className="absolute top-8 left-1/2 z-50 -translate-x-1/2 pointer-events-auto">
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
      className="h-3 w-3 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition duration-200 hover:scale-150"
      aria-label="Enter"
    />
  </div>
)}


{portalMode && (
<VideoPortal
  videos={portalVideos}
  startTime={portalStartTime}
  onClose={() => setPortalMode(false)}
/>
)}



{showImageViewer && (
<div
  onClick={() => {
  setShowImageComments(false)
  setShowImageViewer(false)
}}
  className="
    fixed
    inset-0
    z-[99999]
    bg-black/95
    flex
    items-center
    justify-center
  "
>
<div
  className="
    absolute
    top-0
    left-0
    right-0
    z-20
    flex
    items-center
    justify-between
    px-6
    py-4
    bg-gradient-to-b
    from-black/80
    to-transparent
  "
>
  <button
onClick={(e) => {
  e.stopPropagation()

  setShowImageComments(false)
  setShowImageViewer(false)
}}
    className="
      text-white
      text-3xl
      hover:text-red-400
      transition
    "
  >
    ✕
  </button>

 <div className="flex items-center gap-3">

  <img
    src={avatarUrl}
    alt=""
    className="
      h-10
      w-10
      rounded-full
      object-cover
      border
      border-white/20
    "
  />
<div>
  <div className="font-semibold text-white">
    {username}
  </div>

  {imageUrls.length > 1 && (
    <div className="text-xs text-zinc-400">
      Image {currentImage + 1} of {imageUrls.length}
    </div>
  )}
</div>

</div>

  <button
    className="
      text-white
      text-2xl
      hover:text-cyan-400
    "
  >
    ⋯
  </button>
</div>
{imageUrls.length > 1 && (
<button
  onClick={(e) => {
    e.stopPropagation()

    setCurrentImage(
      (currentImage - 1 + imageUrls.length) %
      imageUrls.length
    )
  }}
  className="
    absolute
    left-6
    text-white
    text-5xl
    px-4
    py-2
    hover:bg-white/10
    rounded-full
    transition
  "
>
  ‹
</button>

)}
<img
  src={imageUrls[currentImage]}
  alt=""
  onClick={(e) => e.stopPropagation()}
className="
  max-w-[95vw]
  max-h-[75vh]
  object-contain
  select-none
"
/>

{imageUrls.length > 1 && (
<button
  onClick={(e) => {
    e.stopPropagation()
    setCurrentImage(
      (currentImage + 1) % imageUrls.length
    )
  }}
  className="
    absolute
    right-6
    text-white
    text-5xl
    px-4
    py-2
    hover:bg-white/10
    rounded-full
    transition
  "
>
  ›
</button>
)}

{imageUrls.length > 1 && (
<div
  className="
    absolute
    bottom-0
    left-0
    right-0
    z-20
    flex
    items-center
    justify-center
    gap-8
    px-6
    py-4
    bg-gradient-to-t
    from-black/90
    to-transparent
  "
>
<button
onClick={(e) => {
  e.stopPropagation()
  console.log("HEART CLICKED")
  toggleImageLike()
}}
  className="
    flex
    items-center
    gap-2
    text-zinc-300
    hover:text-pink-500
    transition
  "
>
  <Heart size={22} />

  <span>
    {imageLikes[currentImage] || 0}
  </span>
</button>

<button
  onClick={(e) => {
    e.stopPropagation()
    setShowImageComments(true)
  }}
  className="
    flex
    items-center
    gap-2
    text-zinc-300
    hover:text-cyan-400
    transition
  "
>
  <MessageCircle size={22} />

<span>
  {imageCommentCounts[currentImage] || 0}
</span>
</button>

<button
  className="
    flex
    items-center
    gap-2
    text-zinc-300
    hover:text-emerald-400
    transition
  "
>
  <Bookmark size={22} />
  <span>Save</span>
</button>


</div>
)}
{showImageComments && (
  <div
    onClick={(e) => e.stopPropagation()}
    className="
      absolute
      bottom-0
      left-0
      right-0
      h-[55vh]
      rounded-t-3xl
      bg-zinc-950
      border-t
      border-zinc-700
      z-30
      flex
      flex-col
    "
  >
    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">

      <h2 className="text-white font-semibold">
        Comments
      </h2>

      <button
        onClick={() => setShowImageComments(false)}
        className="text-zinc-400 text-2xl hover:text-white"
      >
        ✕
      </button>

    </div>

<div className="flex-1 overflow-y-auto p-4 space-y-4">

  {imageComments.length === 0 && (
    <div className="text-center text-zinc-500 py-8">
      No comments yet.
    </div>
  )}

  {imageComments.map((comment) => (
    <div
      key={comment.id}
      className="
        flex
        gap-3
        rounded-xl
        bg-zinc-900/70
        p-3
      "
    >
      <img
        src={comment.avatar_url || "/avatar-placeholder.png"}
        alt=""
        className="
          h-10
          w-10
          rounded-full
          object-cover
        "
      />

      <div className="flex-1">

        <div className="flex items-center gap-2">

          <span className="font-semibold text-white">
            {comment.username}
          </span>

          <span className="text-xs text-zinc-500">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>

        </div>

        <p className="mt-1 text-sm text-zinc-300">
          {comment.content}
        </p>

      </div>
    </div>
  ))}

</div>

  <div className="border-t border-zinc-800 p-4 flex gap-3">
  <input
    value={imageCommentText}
    onChange={(e) => setImageCommentText(e.target.value)}
    placeholder="Write a comment..."
    className="
      flex-1
      rounded-xl
      bg-zinc-900
      px-4
      py-3
      text-white
      outline-none
    "
  />

<button
  onClick={addImageComment}
  disabled={!imageCommentText.trim()}
  className="
    px-5
    rounded-xl
    bg-cyan-500
    text-white
    font-semibold
    disabled:opacity-50
  "
>
  Post
</button>
</div>

    
  </div>
)}

  </div>




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