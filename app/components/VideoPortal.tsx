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
  console.log("Refs:", videoRefs.current)

  const video = videoRefs.current[0]

  if (!video) {
    console.log("FIRST VIDEO REF IS NULL")
    return
  }

  console.log("FOUND VIDEO:", video)

  video.currentTime = startTime

  video.play().catch((err) => {
    console.log("PLAY ERROR:", err)
  })
}, [startTime, videos])



useEffect(() => {
  let observer: IntersectionObserver | null = null

  const timer = setTimeout(() => {
    observer = new IntersectionObserver(
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
        observer!.observe(video)
      }
    })
  }, 500)

  return () => {
    clearTimeout(timer)

    if (observer) {
      observer.disconnect()
    }
  }
}, [videos])
  return (
<div
  className="
    fixed
    inset-0
    z-[2147483647]
    h-screen
    w-screen
    bg-black
    overflow-hidden
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

<p className="absolute top-5 left-5 z-50 bg-red-600 px-2 py-1 text-white">
  {video.video_url ? "VIDEO OK" : "NO VIDEO"}
</p>

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