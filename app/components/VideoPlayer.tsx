'use client'

import React, {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface VideoPlayerProps {
  post: {
    video_url: string
    thumbnail_url?: string | null
  }

  isMuted: boolean

  setIsPlaying: (
    playing: boolean
  ) => void

  onError?: () => void
}

export const VideoPlayer: React.FC<
  VideoPlayerProps
> = ({
  post,
  isMuted,
  setIsPlaying,
  onError,
}) => {
  const videoRef =
    useRef<HTMLVideoElement>(null)

  const mountedRef =
    useRef(true)

  const [videoLoading, setVideoLoading] =
    useState(true)

  const [videoError, setVideoError] =
    useState(false)

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  /*
   * =====================================================
   * ONLINE RECOVERY
   * =====================================================
   */

  useEffect(() => {
    const handleOnline = () => {
      if (!mountedRef.current) {
        return
      }

      setVideoError(false)
      setVideoLoading(true)
      setIsPlaying(false)

      const video =
        videoRef.current

      if (!video) {
        return
      }

      video.load()
    }

    window.addEventListener(
      'online',
      handleOnline
    )

    return () => {
      window.removeEventListener(
        'online',
        handleOnline
      )
    }
  }, [setIsPlaying])

  /*
   * =====================================================
   * CONTEXT MENU
   * =====================================================
   */

  const handleContextMenu = (
    event: React.MouseEvent<HTMLVideoElement>
  ) => {
    event.preventDefault()
  }

  /*
   * =====================================================
   * VIDEO EVENTS
   * =====================================================
   */

  const handleLoadStart = () => {
    if (!mountedRef.current) {
      return
    }

    setVideoLoading(true)
    setVideoError(false)
  }

  const handleWaiting = () => {
    if (!mountedRef.current) {
      return
    }

    setVideoLoading(true)
  }

  const handleCanPlay = () => {
    if (!mountedRef.current) {
      return
    }

    setVideoLoading(false)
  }

  const handlePlaying = () => {
    if (!mountedRef.current) {
      return
    }

    setVideoLoading(false)
    setVideoError(false)
  }

  const handleError = () => {
    if (!mountedRef.current) {
      return
    }

    setVideoLoading(false)
    setVideoError(true)
    setIsPlaying(false)

    onError?.()
  }

  /*
   * =====================================================
   * OFFLINE / ERROR FALLBACK
   * =====================================================
   */

  if (videoError) {
    if (post.thumbnail_url) {
      return (
        <div
          className="
            relative
            h-full
            w-full
            select-none
            overflow-hidden
            bg-black
          "
        >
          <img
            src={post.thumbnail_url}
            alt="Video thumbnail"
            draggable={false}
            className="
              block
              h-full
              w-full
              object-cover
              select-none
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              left-3
              top-3
              z-30
              flex
              items-center
              gap-1.5
              rounded-full
              border
              border-white/10
              bg-black/65
              px-3
              py-1.5
              text-[10px]
              font-semibold
              tracking-wide
              text-white
              shadow-lg
              backdrop-blur-md
            "
          >
            <AlertCircle
              className="
                h-3
                w-3
                text-white/70
              "
            />

            <span>
              Offline
            </span>
          </div>
        </div>
      )
    }

    return (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center
          bg-zinc-950
          select-none
        "
      >
        <span
          className="
            text-xs
            font-medium
            tracking-wide
            text-zinc-500
          "
        >
          Video unavailable
        </span>
      </div>
    )
  }

  /*
   * =====================================================
   * NORMAL VIDEO
   * =====================================================
   */

  return (
    <div
      className="
        relative
        h-full
        w-full
        overflow-hidden
        select-none
        bg-black
      "
    >
      <video
        ref={videoRef}
        src={post.video_url}
        poster={
          post.thumbnail_url ||
          undefined
        }
        preload="metadata"
        playsInline
        muted={isMuted}
        loop
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={
          handleContextMenu
        }
        onLoadStart={
          handleLoadStart
        }
        onWaiting={
          handleWaiting
        }
        onCanPlay={
          handleCanPlay
        }
        onPlaying={
          handlePlaying
        }
        onError={
          handleError
        }
        className="
          block
          h-full
          w-full
          pointer-events-auto
          touch-manipulation
          object-cover
          select-none
        "
        style={{
          WebkitTouchCallout:
            'none',
          WebkitUserSelect:
            'none',
          userSelect:
            'none',
        }}
      />

      {/* ================================================= */}
      {/* PROFESSIONAL LOADING INDICATOR */}
      {/* ================================================= */}

      {videoLoading && (
        <div
          className="
            pointer-events-none
            absolute
            bottom-3
            right-3
            z-30
            flex
            items-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-black/65
            px-3
            py-2
            shadow-lg
            backdrop-blur-md
          "
        >
          <Loader2
            className="
              h-3.5
              w-3.5
              animate-spin
              text-white/80
            "
          />

          <span
            className="
              text-[10px]
              font-medium
              tracking-wide
              text-white/75
            "
          >
            Loading
          </span>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer