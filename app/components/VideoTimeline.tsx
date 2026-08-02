'use client'

import React, { useRef, useCallback, useEffect, useState } from "react"

interface VideoTimelineProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  progress: number
  currentTime: number
  duration: number
}

// Extracted utility for performance; avoids re-creation on every render
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function VideoTimeline({
  videoRef,
  progress,
  currentTime,
  duration,
}: VideoTimelineProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Centralized time updates
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

  // Handles clicking on the track
  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return // Only left click
    setIsDragging(true)
    updateTime(e.clientX)
  }

  // Handles active scrubbing/dragging
  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      updateTime(e.clientX)
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [isDragging, updateTime])

  // Accessibility keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !Number.isFinite(duration)) return

    let newTime = video.currentTime

    switch (e.key) {
      case "ArrowRight":
        newTime = Math.min(duration, newTime + 5)
        break
      case "ArrowLeft":
        newTime = Math.max(0, newTime - 5)
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

  // Safe boundaries for UI calculations
  const safeProgress = Math.min(Math.max(0, progress), 100)
  const ariaValueNow = Number.isFinite(duration) && duration > 0 
    ? Math.round((currentTime / duration) * 100) 
    : 0

  return (
    <div className="w-full space-y-1 select-none">
      {/* Time Display */}
      <div className="flex items-center justify-between text-[11px] font-medium tracking-wider text-white/70 tabular-nums">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Hitbox/Interactive Rail Container */}
      <div
        ref={railRef}
        onMouseDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label="Video progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaValueNow}
        tabIndex={0}
        className="group/rail relative flex h-5 w-full cursor-pointer touch-none items-center outline-none focus-visible:ring-1 focus-visible:ring-[#E50914] rounded"
      >
        {/* Track Progress Base */}
        <div
          className="relative h-[3px] w-full rounded-full bg-white/20 transition-all duration-200 group-hover/rail:h-1"
        >
          {/* Active Colored Fill Bar */}
          <div
            style={{ width: `${safeProgress}%` }}
            className="absolute bottom-0 left-0 top-0 rounded-full bg-[#E50914]"
          />

          {/* Slider Handle (Thumb) */}
          <div
            style={{ left: `${safeProgress}%` }}
            className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E50914] shadow-md transition-transform duration-150 will-change-transform ${
              isDragging ? "scale-125" : "scale-0 group-hover/rail:scale-125"
            }`}
          />
        </div>
      </div>
    </div>
  )
}
