'use client'

import React, { useRef, useCallback, useEffect, useState } from "react"

interface VideoTimelineProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  progress: number // Percentage of current playback (0 to 100)
  bufferedProgress?: number // Percentage of video buffered/loaded (0 to 100)
  currentTime: number
  duration: number
}

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  const paddedSecs = secs.toString().padStart(2, "0")
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${paddedSecs}`
  }
  return `${mins}:${paddedSecs}`
}

export default function YouTubeVideoTimeline({
  videoRef,
  progress,
  bufferedProgress = 0,
  currentTime,
  duration,
}: VideoTimelineProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverPosition, setHoverPosition] = useState<number | null>(null)

  // Track dragging or jumping coordinates
  const updateTime = useCallback((clientX: number) => {
    const video = videoRef.current
    const rail = railRef.current
    if (!video || !rail) return

    const rect = rail.getBoundingClientRect()
    const clickX = clientX - rect.left
    const percentage = Math.min(Math.max(0, clickX / rect.width), 1)
    const totalDuration = video.duration

    if (Number.isFinite(totalDuration) && totalDuration > 0) {
      video.currentTime = percentage * totalDuration
    }
  }, [videoRef])

  // Track hover coordinate for the preview bar
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current
    if (!rail) return

    const rect = rail.getBoundingClientRect()
    const hoverX = e.clientX - rect.left
    const percentage = Math.min(Math.max(0, hoverX / rect.width), 1)
    setHoverPosition(percentage * 100)
  }

  const handlePointerLeave = () => {
    setHoverPosition(null)
  }

  // Handle active scrubbing across the window screen
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMove = (e: PointerEvent) => {
      updateTime(e.clientX)
    }

    const handleGlobalUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("pointermove", handleGlobalMove)
    window.addEventListener("pointerup", handleGlobalUp)

    return () => {
      window.removeEventListener("pointermove", handleGlobalMove)
      window.removeEventListener("pointerup", handleGlobalUp)
    }
  }, [isDragging, updateTime])

  // Accessibility keyboard navigation matching YouTube overrides
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(duration)) return

    let newTime = video.currentTime

    switch (e.key) {
      case "ArrowRight":
        newTime = Math.min(duration, newTime + 5) // Skip 5s
        break
      case "ArrowLeft":
        newTime = Math.max(0, newTime - 5) // Rewind 5s
        break
      case "j":
      case "J":
        newTime = Math.max(0, newTime - 10) // YouTube 10s Rewind shortcut
        break
      case "l":
      case "L":
        newTime = Math.min(duration, newTime + 10) // YouTube 10s Skip shortcut
        break
      case "Home":
        newTime = 0
        break
      case "End":
        newTime = duration
        break
      default:
        return
    }

    e.preventDefault()
    video.currentTime = newTime
  }

  const safeProgress = Math.min(Math.max(0, progress), 100)
  const safeBuffered = Math.min(Math.max(0, bufferedProgress), 100)
  
  const ariaValueNow = Number.isFinite(duration) && duration > 0 
    ? Math.round((currentTime / duration) * 100) 
    : 0

  return (
    <div className="w-full space-y-1.5 select-none font-sans">
      
      {/* Hitbox/Interactive Rail Container */}
      <div
        ref={railRef}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return
          setIsDragging(true)
          updateTime(e.clientX)
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Video timeline slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaValueNow}
        tabIndex={0}
        className="group/rail relative flex h-3 w-full cursor-pointer touch-none items-center outline-none"
      >
        {/* Track Base Layer (YouTube Dark Grey Gray) */}
        <div
          className="relative h-[3px] w-full rounded-none bg-white/20 transition-all duration-700 ease-out group-hover/rail:h-[5px]"
        >
          {/* Layer 1: Hover Target Bar Overlay */}
          {hoverPosition !== null && (
            <div
              style={{ width: `${hoverPosition}%` }}
              className="absolute bottom-0 left-0 top-0 bg-white/25 pointer-events-none"
            />
          )}

          {/* Layer 2: Buffered Progress Bar (Semi-Transparent Light Grey) */}
          <div
            style={{ width: `${safeBuffered}%` }}
            className="absolute bottom-0 left-0 top-0 bg-white/40 transition-all duration-150 pointer-events-none"
          />

          {/* Layer 3: Playback Active Progress Bar (YouTube Classic Red) */}
          <div
            style={{ width: `${safeProgress}%` }}
            className="absolute bottom-0 left-0 top-0 bg-[#FF0000] pointer-events-none"
          />

          {/* Layer 4: Slider Handle Thumb (Perfect Round Red Handle) */}
          <div
            style={{ left: `${safeProgress}%` }}
            className={`absolute top-1/2 h-[13px] w-[13px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF0000] shadow transition-transform duration-75 will-change-transform ${
              isDragging ? "scale-100" : "scale-0 group-hover/rail:scale-100"
            }`}
          />
        </div>
      </div>

      {/* Modern Compact Time Indicators */}
      <div className="flex items-center text-xs font-normal text-[#EAEAEA] tabular-nums tracking-normal">
        <span>{formatTime(currentTime)}</span>
        <span className="mx-1 text-white/50">/</span>
        <span className="text-white/70">{formatTime(duration)}</span>
      </div>

    </div>
  )
}
