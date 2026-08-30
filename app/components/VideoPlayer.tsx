'use client'

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'

import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface VideoPlayerProps {
  post: {
    video_url: string
    thumbnail_url?: string | null
  }

  isMuted: boolean
  setIsPlaying: (playing: boolean) => void

  onMuteChange?: (muted: boolean) => void

  onProgressChange?: (
    currentTime: number,
    duration: number,
    progress: number
  ) => void

  onError?: () => void

  onAspectRatioChange?: (ratio: number) => void
}

export default function VideoPlayer({
  post,
  isMuted,
  setIsPlaying,
  onMuteChange,
  onProgressChange,
  onError,
  onAspectRatioChange,
}: VideoPlayerProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null)

  const containerRef =
    useRef<HTMLDivElement>(null)

  const hideTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null)

  const mountedRef =
    useRef(true)

  const [showControls, setShowControls] =
    useState(true)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(false)

  const [currentTime, setCurrentTime] =
    useState(0)

  const [duration, setDuration] =
    useState(0)

  /*
   * =====================================================
   * REAL VIDEO ASPECT RATIO
   *
   * 16:9  = 1.777...
   * 9:16  = 0.5625
   * 1:1   = 1
   * 4:5   = 0.8
   * =====================================================
   */

  const [aspectRatio, setAspectRatio] =
    useState<number | null>(null)

  /*
   * =====================================================
   * CLEAR CONTROL TIMER
   * =====================================================
   */

  const clearHideTimer =
    useCallback(() => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }, [])

  /*
   * =====================================================
   * SHOW CONTROLS
   * =====================================================
   */

  const revealControls =
    useCallback(() => {
      setShowControls(true)

      clearHideTimer()

      hideTimerRef.current =
        setTimeout(() => {
          if (!videoRef.current?.paused) {
            setShowControls(false)
          }
        }, 3000)
    }, [clearHideTimer])

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      clearHideTimer()
    }
  }, [clearHideTimer])

  /*
   * =====================================================
   * MUTED STATE
   * =====================================================
   */

  useEffect(() => {
    const video =
      videoRef.current

    if (!video) return

    video.muted = isMuted
  }, [isMuted])

  /*
   * =====================================================
   * PLAY / PAUSE
   * =====================================================
   */

  const togglePlay =
    useCallback(
      async (
        event?: React.MouseEvent
      ) => {
        event?.stopPropagation()

        const video =
          videoRef.current

        if (!video) return

        try {
          if (video.paused) {
            await video.play()

            setIsPlaying(true)
          } else {
            video.pause()

            setIsPlaying(false)

            setShowControls(true)
          }

          revealControls()
        } catch {
          setIsPlaying(false)
        }
      },
      [
        revealControls,
        setIsPlaying,
      ]
    )

  /*
   * =====================================================
   * MUTE
   * =====================================================
   */

  const toggleMute =
    useCallback(
      (
        event: React.MouseEvent
      ) => {
        event.stopPropagation()

        const video =
          videoRef.current

        if (!video) return

        const nextMuted =
          !video.muted

        video.muted =
          nextMuted

        if (
          !nextMuted &&
          video.volume === 0
        ) {
          video.volume = 1
        }

        onMuteChange?.(
          nextMuted
        )

        revealControls()
      },
      [
        onMuteChange,
        revealControls,
      ]
    )

  /*
   * =====================================================
   * FULLSCREEN
   * =====================================================
   */

  const toggleFullscreen =
    useCallback(
      async (
        event: React.MouseEvent
      ) => {
        event.stopPropagation()

        const container =
          containerRef.current

        if (!container) return

        try {
          if (
            document.fullscreenElement
          ) {
            await document.exitFullscreen()
          } else {
            await container.requestFullscreen()
          }
        } catch {
          // Fullscreen unavailable.
        }

        revealControls()
      },
      [revealControls]
    )

  /*
   * =====================================================
   * SEEK
   * =====================================================
   */

  const seek =
    useCallback(
      (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        event.stopPropagation()

        const video =
          videoRef.current

        if (!video || !duration) {
          return
        }

        const nextTime =
          Number(event.target.value)

        video.currentTime =
          nextTime

        setCurrentTime(
          nextTime
        )

        const progress =
          (nextTime / duration) * 100

        onProgressChange?.(
          nextTime,
          duration,
          progress
        )

        revealControls()
      },
      [
        duration,
        onProgressChange,
        revealControls,
      ]
    )

  /*
   * =====================================================
   * TIME UPDATE
   * =====================================================
   */

  const handleTimeUpdate =
    () => {
      const video =
        videoRef.current

      if (!video) return

      const nextCurrent =
        video.currentTime

      const nextDuration =
        Number.isFinite(
          video.duration
        )
          ? video.duration
          : 0

      setCurrentTime(
        nextCurrent
      )

      if (nextDuration > 0) {
        onProgressChange?.(
          nextCurrent,
          nextDuration,
          (nextCurrent /
            nextDuration) *
            100
        )
      }
    }

  /*
   * =====================================================
   * LOADED METADATA
   *
   * THIS IS THE IMPORTANT PART.
   * We read the REAL dimensions of the uploaded video.
   * =====================================================
   */

  const handleLoadedMetadata =
    () => {
      const video =
        videoRef.current

      if (!video) return

      const width =
        video.videoWidth

      const height =
        video.videoHeight

      /*
       * REAL ASPECT RATIO
       */

      if (
        width > 0 &&
        height > 0
      ) {
        const ratio =
          width / height

        setAspectRatio(ratio)

        onAspectRatioChange?.(
          ratio
        )
      }

      /*
       * REAL DURATION
       */

      const nextDuration =
        Number.isFinite(
          video.duration
        )
          ? video.duration
          : 0

      setDuration(
        nextDuration
      )

      setLoading(false)
    }

  /*
   * =====================================================
   * PLAY
   * =====================================================
   */

  const handlePlay =
    () => {
      setIsPlaying(true)
      setLoading(false)
      revealControls()
    }

  /*
   * =====================================================
   * PAUSE
   * =====================================================
   */

  const handlePause =
    () => {
      setIsPlaying(false)
      setShowControls(true)
      clearHideTimer()
    }

  /*
   * =====================================================
   * WAITING
   * =====================================================
   */

  const handleWaiting =
    () => {
      setLoading(true)
    }

  /*
   * =====================================================
   * CAN PLAY
   * =====================================================
   */

  const handleCanPlay =
    () => {
      setLoading(false)
    }

  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  const handleError =
    () => {
      setLoading(false)
      setError(true)
      setIsPlaying(false)

      onError?.()
    }

  /*
   * =====================================================
   * FORMAT TIME
   * =====================================================
   */

  const formatTime =
    (value: number) => {
      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return '0:00'
      }

      const minutes =
        Math.floor(
          value / 60
        )

      const seconds =
        Math.floor(
          value % 60
        )

      return `${minutes}:${seconds
        .toString()
        .padStart(2, '0')}`
    }

  /*
   * =====================================================
   * NO VIDEO
   * =====================================================
   */

  if (!post?.video_url) {
    return null
  }

  /*
   * =====================================================
   * VIDEO PLAYER
   *
   * IMPORTANT:
   *
   * The container now follows the ACTUAL video ratio.
   *
   * No permanent 16:9.
   * =====================================================
   */

  return (
    <div
      ref={containerRef}
      className="
        group
        relative
        w-full
        overflow-hidden
        bg-black
        select-none
      "
      style={{
        aspectRatio:
          aspectRatio
            ? `${aspectRatio}`
            : '16 / 9',
      }}
      onMouseMove={
        revealControls
      }
      onTouchStart={
        revealControls
      }
      onClick={
        togglePlay
      }
    >

      {/* =================================================
          ACTUAL VIDEO
          ================================================= */}

      <video
        ref={videoRef}
        src={post.video_url}
        poster={
          post.thumbnail_url ||
          undefined
        }
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onTimeUpdate={
          handleTimeUpdate
        }
        onLoadedMetadata={
          handleLoadedMetadata
        }
        onPlay={
          handlePlay
        }
        onPause={
          handlePause
        }
        onWaiting={
          handleWaiting
        }
        onCanPlay={
          handleCanPlay
        }
        onError={
          handleError
        }
        className="
          block
          h-full
          w-full
          object-cover
          bg-black
          select-none
        "
      />

      {/* =================================================
          LOADING
          ================================================= */}

      {loading && !error && (
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            flex
            items-center
            justify-center
          "
        >
          <Loader2
            className="
              h-8
              w-8
              animate-spin
              text-white/80
            "
          />
        </div>
      )}

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div
          className="
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            bg-black
          "
        >
          <AlertCircle
            className="
              mb-2
              h-7
              w-7
              text-white/60
            "
          />

          <span
            className="
              text-sm
              text-white/60
            "
          >
            Video unavailable
          </span>
        </div>
      )}

      {/* =================================================
          CONTROLS
          ================================================= */}

      {!error && (
        <div
          className={`
            absolute
            inset-0
            flex
            flex-col
            justify-between
            transition-opacity
            duration-200

            ${
              showControls
                ? 'opacity-100'
                : 'pointer-events-none opacity-0'
            }
          `}
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          {/* TOP GRADIENT */}

          <div
            className="
              h-20
              bg-gradient-to-b
              from-black/55
              to-transparent
            "
          />

          {/* CENTER PLAY */}

          <div
            className="
              pointer-events-none
              flex
              flex-1
              items-center
              justify-center
            "
          >
            {videoRef.current?.paused && (
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-black/60
                  backdrop-blur-sm
                "
              >
                <Play
                  className="
                    ml-1
                    h-8
                    w-8
                    fill-white
                    text-white
                  "
                />
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS */}

          <div
            className="
              bg-gradient-to-t
              from-black/75
              via-black/35
              to-transparent
              px-3
              pb-3
              pt-12
            "
          >

            <div
              className="
                mb-2
                flex
                items-center
                gap-2
              "
            >

              <span
                className="
                  text-[11px]
                  tabular-nums
                  text-white
                "
              >
                {formatTime(
                  currentTime
                )}
              </span>

              <input
                type="range"
                min={0}
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={seek}
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="
                  h-1
                  flex-1
                  cursor-pointer
                  accent-white
                "
                aria-label="Video progress"
              />

              <span
                className="
                  text-[11px]
                  tabular-nums
                  text-white/80
                "
              >
                {formatTime(
                  duration
                )}
              </span>

            </div>

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <button
                type="button"
                onClick={togglePlay}
                className="
                  rounded-full
                  p-2
                  text-white
                  hover:bg-white/10
                "
                aria-label="Play or pause"
              >
                {videoRef.current?.paused ? (
                  <Play
                    className="
                      h-5
                      w-5
                      fill-current
                    "
                  />
                ) : (
                  <Pause
                    className="
                      h-5
                      w-5
                    "
                  />
                )}
              </button>

              <div
                className="
                  flex
                  items-center
                  gap-1
                "
              >

                <button
                  type="button"
                  onClick={toggleMute}
                  className="
                    rounded-full
                    p-2
                    text-white
                    hover:bg-white/10
                  "
                  aria-label={
                    isMuted
                      ? 'Unmute video'
                      : 'Mute video'
                  }
                >
                  {isMuted ? (
                    <VolumeX
                      className="
                        h-5
                        w-5
                      "
                    />
                  ) : (
                    <Volume2
                      className="
                        h-5
                        w-5
                      "
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={
                    toggleFullscreen
                  }
                  className="
                    rounded-full
                    p-2
                    text-white
                    hover:bg-white/10
                  "
                  aria-label="Fullscreen"
                >
                  <Maximize
                    className="
                      h-5
                      w-5
                    "
                  />
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}