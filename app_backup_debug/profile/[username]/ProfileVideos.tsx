'use client'

import React, { useMemo, useRef } from "react"
import { Video, Film, Play } from "lucide-react"
import { supabase } from "../../lib/supabase"
interface Post {
  id: string
  video_url?: string | null
  views_count: number
}

interface ProfileVideosProps {
  posts: Post[]
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
}

export default function ProfileVideos({
  posts = [],
  setPosts,
}: ProfileVideosProps) {
  // Performance: Filter valid videos exactly once
  const videoPosts = useMemo(() => {
    return posts.filter((post) => post?.video_url)
  }, [posts])

  return (
    <section className="w-full max-w-4xl mx-auto px-1 py-6 md:px-4" aria-label="Video Feed Grid">
      {/* Header Section */}
<header className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
      <Film className="w-5 h-5 text-cyan-400" />
    </div>

    <div>
      <h2 className="text-lg font-black tracking-wide text-white">
        Video Vault
      </h2>

      <p className="text-xs text-zinc-500 font-mono">
        PERSONAL MEDIA ARCHIVE
      </p>
    </div>
  </div>

  <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2">
    <span className="font-mono text-xs font-bold text-cyan-300">
      {videoPosts.length} VIDEOS
    </span>
  </div>
</header>

      {/* Main Grid Content Area */}
      {videoPosts.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950/40 p-12 text-center backdrop-blur-sm mx-2">
          <Video size={28} className="text-zinc-700 mb-3 stroke-[1.5]" />
          <p className="text-xs text-zinc-500 font-medium tracking-wide">
            No media transmissions found.
          </p>
        </div>
      ) : (
        /* 3-Column TikTok Style Grid */
        <div className="grid grid-cols-3 gap-0.5 md:gap-2">
{videoPosts.map((post) => (
  <VideoGridItem
    key={post.id}
    post={post}
    setPosts={setPosts}
  />
))}
        </div>
      )}
    </section>
  )
}

// Extracted Sub-component for Hover Interaction Logic
function VideoGridItem({
  post,
  setPosts,
}: {
  post: Post
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
const hasCounted = useRef(false)
  // Hover to play preview behavior (Identical to desktop TikTok UI)
  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {})
    }
  }

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

const handlePlaying = () => {
  if (hasCounted.current) return

  setTimeout(async () => {
    if (hasCounted.current) return

    if (!videoRef.current || videoRef.current.paused) return

    hasCounted.current = true

    const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) return

const { error } = await supabase
  .from("post_views")
  .insert({
    post_id: post.id,
    user_id: user.id,
  })

if (error) {
  // Already counted or another error
  return
}

await supabase.rpc("increment_post_views", {
  post_id_input: post.id,
})
setPosts((currentPosts) =>
  currentPosts.map((currentPost) =>
    currentPost.id === post.id
      ? {
          ...currentPost,
          views_count: currentPost.views_count + 1,
        }
      : currentPost
  )
)
    // We'll save the view to Supabase next.
  }, 3000)
}


  return (
    <article 
      className="group relative aspect-[3/4] w-full bg-zinc-950 overflow-hidden cursor-pointer md:rounded-md border border-transparent hover:border-zinc-800 transition-all duration-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Content Element */}
      <video
        ref={videoRef}
        src={post.video_url || undefined}
        loop
        muted
        playsInline
        preload="metadata"
        onPlay={handlePlaying}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />

      {/* Dark Gradient Overlay & Metrics */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/20 flex flex-col justify-end p-2 md:p-3 transition-opacity duration-200 group-hover:from-black/90">
        
        {/* TikTok Style Lower Metric Overlay */}
        <div className="flex items-center gap-1 text-white font-semibold text-xs tracking-tight drop-shadow-md">
          <Play size={12} fill="white" className="stroke-[1]" />
          <span>{post.views_count.toLocaleString()}</span>
        </div>
      </div>
    </article>
  )
}
