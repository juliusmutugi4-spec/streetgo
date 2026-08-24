'use client'
import { sendPostReax } from "../lib/reaxEngine"
import { memo, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import VideoSchema from './VideoSchema'
import PostSchema from './PostSchema'

import { setCachedProfile } from "../lib/profileCache"
import VideoPortal from "./VideoPortal"
import ReactionButton from "./ReactionButton"
import { formatRelativeTime } from "../lib/time"
import StreetAI from "./StreetAI"
import SmartImageGallery from "./SmartImageGallery"
import PostActions from "./PostActions"
import SimilarVideosMenu from "./SimilarVideosMenu"
import PostTextVisual from "./PostTextVisual"
import VideoPortalButton from "./VideoPortalButton"
import PostVideo from "./PostVideo"
import ImageViewer from "./ImageViewer"
import PostCardHeader from './PostCardHeader'
import PostCardContent from './PostCardContent'
import PostCardMedia from './PostCardMedia'
import PostCardMeta from './PostCardMeta'
import PostCardViewer from './PostCardViewer'
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

  onOpenDiscussion?: (post: any, comments: any[]) => void
onOpenDispatch: (post: any) => void

onRequireAuth?: () => void
onOpenImageViewer?: (
  imageUrls: string[],
  imageIndex: number,
  username: string,
  avatarUrl: string
) => void


}

function Post({
  post,
  user,
  profile,
  isActive,
  setActivePostId,
  onOpenDiscussion,
  onOpenImageViewer,
  onOpenDispatch,
  onRequireAuth,
}: PostProps) {

  const router = useRouter()
  const [likes, setLikes] = useState(0)
  const [displayLikes, setDisplayLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])

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

const [showSimilarVideos, setShowSimilarVideos] = useState(false)


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
if (!user) {
  console.error("❌ No authenticated user found.")
  return
}
const { data, error } = await supabase
  .from("post_viewers")
  .upsert(
    {
      post_id: post.id,
    user_id: user.id,
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

console.log("POST AVATAR:", post.avatar_url)
console.log("POST USERNAME:", post.username)


const [showMenu, setShowMenu] = useState(false)
const menuRef = useRef<HTMLDivElement>(null)
const [currentImage, setCurrentImage] = useState(0)
const [showImageViewer, setShowImageViewer] = useState(false)
const videoRef = useRef<HTMLVideoElement>(null)


const portalVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
const postRef = useRef<HTMLDivElement>(null)

const [portalMode, setPortalMode] = useState(false)
const [portalVideos, setPortalVideos] = useState<any[]>([])
const [currentVideo, setCurrentVideo] = useState(post)
useEffect(() => {
  if (!videoRef.current) return

  videoRef.current.load()

  videoRef.current.play().catch(() => {})
}, [currentVideo])

  // Load likes & comments

const toggleImageLike = async () => {
if (!user) {
  onRequireAuth?.()
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
  console.log("VIEWER ERROR:", JSON.stringify(error, null, 2))
  console.log(error)
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
  onRequireAuth?.()
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
  onRequireAuth?.()
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
(payload: any) => {
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
  onRequireAuth?.()
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
const addComment = async (message: string) => {
if (!user) {
  onRequireAuth?.()
  return
}

  if (!message.trim()) return

const { error } = await supabase
  .from('comments')
  .insert({
    post_id: post.id,
    user_id: user.id,
    content: message,
    username: profile?.username || 'Anonymous',
    avatar_url: profile?.avatar_url || null,
  })

console.log('COMMENT ERROR:', error)

if (error) {
  alert(error.message)
  return
}
   
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
{/* <PostSchema
  id={post.id}
  author={username}
  content={post.content}
  createdAt={post.created_at}
/> */}
<div 
  ref={postRef} 
  className={`group relative overflow-visible backdrop-blur-xl transition-all duration-500 rounded-xl bg-[var(--surface)] border border-[var(--border)] ${
    portalOpening ? "scale-110 opacity-0 blur-md" : "scale-100 opacity-100"
  }`} 
>




  <div className="relative px-0 pb-4 pt-4">
      {/* Header */}
      

        <PostCardHeader
  post={post}
  username={username}
  user={user}
  showAIBubble={showAIBubble}
  viewerCount={viewerCount}
  goToProfile={goToProfile}
/>


<PostCardContent
  content={post.content || ''}
  hasMedia={imageUrls.length > 0 || !!post.video_url}
/>

<PostCardMedia
  imageUrls={imageUrls}
  currentImage={currentImage}
  setCurrentImage={setCurrentImage}
  setShowImageViewer={setShowImageViewer}
  onOpenImageViewer={(index) => {
    onOpenImageViewer?.(
      imageUrls,
      index,
      username,
      avatarUrl
    )
  }}
  post={post}
/>


{/*
<div className="mt-4 rounded-xl border border-[#3e4042] bg-[#1c1d1e] overflow-hidden shadow-sm">
  <div className="px-4 py-3">
    <div className="flex flex-wrap items-center gap-2">

      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3a3b3c] px-3 py-1 text-[13px] font-semibold text-[#e4e6eb] hover:bg-[#4e4f50] transition-colors cursor-default">
        <span className="text-[14px]">🔥</span>
        <span>
          {displayLikes < 100
            ? "New"
            : displayLikes < 1000
            ? "Active"
            : displayLikes < 10000
            ? "Trending"
            : displayLikes < 100000
            ? "Viral"
            : "Legend"}
        </span>
      </span>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1877f2]/10 border border-[#1877f2]/20 px-3 py-1 text-[13px] font-semibold text-[#4599ff]">
        <span className="text-[14px]">⚡</span>
        <span>{(displayLikes * 0.01).toFixed(0)}% Boost</span>
      </span>

    </div>
  </div>
</div>
*/}


<PostCardMeta
  likes={likes}
  reaxCount={reaxCount}
  commentsCount={comments.length}
/>
 

<PostActions
  liked={liked}
  likes={likes}
  comments={comments}
  reaxCount={reaxCount}
  toggleLike={toggleLike}
  handleSendReax={handleSendReax}
  setOpenRoom={() => {
    onOpenDiscussion?.(post, comments)
  }}
  post={post}
  onOpenDispatch={onOpenDispatch}
  onRequireAuth={onRequireAuth}
/>


{/* 
{portalMode && (
  <VideoPortal
    videos={portalVideos}
    startTime={portalStartTime}
    onClose={() => setPortalMode(false)}
  />
)}
*/}
<PostCardViewer
  showImageViewer={showImageViewer}
  imageUrls={imageUrls}
  currentImage={currentImage}
  setCurrentImage={setCurrentImage}
  username={username}
  avatarUrl={avatarUrl}
  onClose={() => setShowImageViewer(false)}
  showImageComments={showImageComments}
  setShowImageComments={setShowImageComments}
  imageLikes={imageLikes}
  imageCommentCounts={imageCommentCounts}
  toggleImageLike={toggleImageLike}
  isImageLiked={imageLiked[currentImage]}
  imageComments={imageComments}
  imageCommentText={imageCommentText}
  setImageCommentText={setImageCommentText}
  addImageComment={addImageComment}
/>



      </div>
    </div>
  </>
)
}

export default memo(Post)