'use client'

import { useState, useEffect, useRef } from 'react'
import VideoPortalButton from './VideoPortalButton'

interface PostVideoProps {
  post: any
}

export default function PostVideo({ post }: PostVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Intelligence Engine States
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [showPortal, setShowPortal] = useState(false)
  const [showSimilar, setShowSimilar] = useState(false)
  const [portalVideos, setPortalVideos] = useState<any[]>([])

  // Smart Telemetry: Auto-play when 60% of video is visible inside viewport
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => null)
          setIsPlaying(true)
        } else {
          video.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.6 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  // Analytical Stream: Dynamic matrix background & time synchronization
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const pct = (video.currentTime / video.duration) * 100
      setProgress(pct || 0)
      
      // Auto-unlock AI Portal recommendations during the final 30% of playback
      if (pct > 70 && !showPortal) {
        setShowPortal(true)
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [showPortal])

  if (!post?.video_url) return null

  // Quantum Async Core: Simulate lightning-fast AI vector matching
  const handleLoadPortalVideos = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    setPortalVideos([
      { id: 'v1', title: 'Neural Streams Alpha', thumbnail: '/thumb1.jpg' },
      { id: 'v2', title: 'Quantum Synthesis Node', thumbnail: '/thumb2.jpg' },
    ])
  }

  const handleTogglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => null)
    }
    setIsPlaying(!isPlaying)
  }

  return (
  <div
    ref={containerRef}
    className="
      group/player
      relative
      mt-6
      overflow-hidden
      bg-black
      w-full
      max-w-[854px]
      aspect-video
      select-none
      font-sans
    "
  >
    {/* Video Surface Container */}
    <div onClick={handleTogglePlay} className="relative w-full h-full cursor-pointer flex items-center justify-center">
      <video
        ref={videoRef}
        src={post.video_url}
        preload="metadata"
        playsInline
        muted={isMuted}
        loop
        className="w-full h-full object-contain"
      />

      {/* Micro Netflix Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 pointer-events-none z-10" />

      {/* Top Bar Action Layer */}
      <div 
        className="absolute top-0 inset-x-0 p-2 flex justify-end opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <VideoPortalButton
          showVideoPortal={showPortal || true}
          portalVideos={portalVideos}
          loadPortalVideos={handleLoadPortalVideos}
          showSimilarVideos={showSimilar}
          setShowSimilarVideos={setShowSimilar}
          onSelect={(video) => console.log('Routing Target:', video)}
        />
      </div>

      {/* Micro Center Action Icon */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="p-2 rounded-full border border-white/30 bg-black/40 text-white opacity-0 scale-75 group-hover/player:opacity-100 group-hover/player:scale-100 transition-all duration-200 backdrop-blur-xs">
          {isPlaying ? (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </div>
      </div>

      {/* Micro Floating Control Deck Overlay */}
      <div 
        className="absolute bottom-0 inset-x-0 px-3 pb-2 pt-6 flex flex-col gap-1.5 opacity-0 group-hover/player:opacity-100 transition-opacity duration-200 z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Micro Timeline Rail */}
        <div className="group/rail flex items-center h-2 w-full cursor-pointer">
          <div 
            onClick={(e) => {
              if (!videoRef.current) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.min(Math.max(0, clickX / rect.width), 1);
              videoRef.current.currentTime = pct * videoRef.current.duration;
            }}
            className="relative h-[2px] w-full bg-white/20 transition-all duration-150 group-hover/rail:h-[3px]"
          >
            {/* Netflix Red Progress Bar */}
            <div 
              style={{ width: `${progress}%` }}
              className="absolute inset-y-0 left-0 bg-[#E50914]"
            />
            {/* Micro Scrubber Knob */}
            <div 
              style={{ left: `${progress}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#E50914] scale-100 transition-transform duration-150 group-hover/rail:scale-[1.4]"
            />
          </div>
        </div>

        {/* Media Interaction Buttons Group */}
        <div className="flex items-center justify-between text-white font-medium">
          <div className="flex items-center gap-3">
            {/* Micro Play/Pause Button */}
            <button 
              onClick={handleTogglePlay}
              className="text-white hover:scale-105 transition-transform duration-150"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            {/* Micro Mute/Volume Toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:scale-105 transition-transform duration-150"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M4.34 2.93L2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.35-.33 2.58-.99 3.61-1.89l2.05 2.05 1.41-1.41L4.34 2.93zM10 15.17L7.83 13H5v-2h2.83l.17-.17V15.17zM19 12c0-1.88-1.02-3.51-2.55-4.38v2.84l2.43 2.43c.07-.28.12-.58.12-.89zM16.45 4.72v2.06c2.51.93 4.3 3.32 4.3 6.14 0 1.02-.23 1.99-.64 2.86l1.5 1.5c.73-1.3 1.14-2.79 1.14-4.36 0-4.9-3.6-8.96-8.3-10.2zM12 4L9.91 6.09 12 8.18V4z"/></svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
              )}
            </button>
          </div>

          {/* Right Side Options & Control Indicators */}
          <div className="flex items-center text-[10px] tracking-wide text-gray-400">
            <button 
              onClick={() => setShowSimilar(!showSimilar)}
              className="hover:text-white transition-colors duration-150"
            >
              {showSimilar ? 'Autoplay On' : 'Autoplay Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

}
