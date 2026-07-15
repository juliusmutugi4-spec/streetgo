'use client'

import { useEffect, useRef } from "react"

interface VideoPortalProps {
  videos: any[]
  startTime: number
  onClose: () => void
}

export default function VideoPortal({
  videos,
  startTime,
  onClose,
}: VideoPortalProps) {
console.log("VideoPortal videos:", videos)
const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

useEffect(() => {
  const video = videoRefs.current[0]

  if (!video) return

  video.currentTime = startTime

  video.play().catch(() => {})
}, [startTime, videos])



useEffect(() => {
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
      threshold: 0.8,
    }
  )

  videoRefs.current.forEach((video) => {
    if (video) {
      observer.observe(video)
    }
  })

  return () => {
    observer.disconnect()
  }
}, [videos])
  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        bg-black
      "
    >
      {/* CLOSE */}
      <button
        onClick={onClose}
        className="
          fixed
          top-5
          right-5
          z-50
          h-10
          w-10
          rounded-full
          bg-black/70
          text-white
        "
      >
        ✕
      </button>

      <div
        className="
          h-screen
          overflow-y-auto
          snap-y
          snap-mandatory
          scroll-smooth
        "
      >
        {videos
  .filter((video: any) => video.video_url)
  .map((video: any, index: number) => (
          <section
            key={video.id}
            className="
              h-screen
              snap-start
              bg-black
              relative
            "
          >
{video.video_url && (
<video
ref={(el) => {
  videoRefs.current[index] = el
}}
  src={video.video_url}
  controls
  playsInline
  preload="metadata"
    className="
      h-full
      w-full
      object-cover
    "
  />
)}


            <div
              className="
                absolute
                bottom-0
                left-0
                right-0
                bg-gradient-to-t
                from-black/90
                to-transparent
                p-6
              "
            >
              <h2 className="text-white text-xl font-bold">
                {video.content}
              </h2>

              <p className="text-zinc-400 mt-2">
                @{video.username}
              </p>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}