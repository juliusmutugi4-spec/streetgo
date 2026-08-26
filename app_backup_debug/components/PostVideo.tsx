'use client'

import {
  useState,
  useEffect,
  useRef,
} from 'react'

import VideoPortalButton from './VideoPortalButton'
import VideoTimeline from './VideoTimeline'

interface PostVideoProps {
  post: any
}

export default function PostVideo({
  post,
}: PostVideoProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null)

  const containerRef =
    useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] =
    useState(false)

  const [progress, setProgress] =
    useState(0)

  const [currentTime, setCurrentTime] =
    useState(0)

  const [duration, setDuration] =
    useState(0)

  const [isMuted, setIsMuted] =
    useState(true)

  const [showPortal, setShowPortal] =
    useState(false)

  const [showSimilar, setShowSimilar] =
    useState(false)

  const [portalVideos, setPortalVideos] =
    useState<any[]>([])

  const [showControls, setShowControls] =
    useState(false)

  const [isMobile, setIsMobile] =
    useState(false)

  // ==================================================
  // MOBILE DETECTION
  // ==================================================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()

    window.addEventListener(
      'resize',
      checkMobile
    )

    return () => {
      window.removeEventListener(
        'resize',
        checkMobile
      )
    }
  }, [])

  // ==================================================
  // AUTO PLAY WHEN VIDEO IS VISIBLE
  // ==================================================

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            video
              .play()
              .then(() => {
                setIsPlaying(true)
              })
              .catch(() => {
                setIsPlaying(false)
              })
          } else {
            video.pause()
            setIsPlaying(false)
          }
        },
        {
          threshold: 0.6,
        }
      )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [])

  // ==================================================
  // VIDEO TIME / PROGRESS
  // ==================================================

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    const handleTimeUpdate = () => {
      const percentage =
        video.duration > 0
          ? (video.currentTime /
              video.duration) *
            100
          : 0

      setProgress(percentage)

      setCurrentTime(
        video.currentTime
      )

      setDuration(
        video.duration || 0
      )

      // Open portal after 70% playback
      if (
        percentage > 70 &&
        !showPortal
      ) {
        setShowPortal(true)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(
        video.duration || 0
      )
    }

    video.addEventListener(
      'timeupdate',
      handleTimeUpdate
    )

    video.addEventListener(
      'loadedmetadata',
      handleLoadedMetadata
    )

    return () => {
      video.removeEventListener(
        'timeupdate',
        handleTimeUpdate
      )

      video.removeEventListener(
        'loadedmetadata',
        handleLoadedMetadata
      )
    }
  }, [showPortal])

  // ==================================================
  // STOP IF NO VIDEO
  // ==================================================

  if (!post?.video_url) {
    return null
  }

  // ==================================================
  // PORTAL VIDEOS
  // ==================================================

  const handleLoadPortalVideos =
    async () => {
      await new Promise(
        (resolve) =>
          setTimeout(resolve, 800)
      )

      setPortalVideos([
        {
          id: 'v1',
          title:
            'Neural Streams Alpha',
          thumbnail:
            '/thumb1.jpg',
        },
        {
          id: 'v2',
          title:
            'Quantum Synthesis Node',
          thumbnail:
            '/thumb2.jpg',
        },
      ])
    }

  // ==================================================
  // PLAY / PAUSE
  // ==================================================

  const handleTogglePlay = () => {
    const video =
      videoRef.current

    if (!video) return

    if (video.paused) {
      video
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => null)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  // ==================================================
  // VIDEO CLICK
  // ==================================================

  const handleVideoClick = () => {
    handleTogglePlay()

    if (isMobile) {
      setShowControls(true)

      setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  // ==================================================
  // CONTROL VISIBILITY
  // ==================================================

  const controlVisibility = isMobile
    ? showControls
      ? 'opacity-100'
      : 'opacity-0'
    : 'opacity-0 group-hover/player:opacity-100'

  return (
    <div
      ref={containerRef}
      className="
        group/player
        relative
        mt-4
        w-full
        aspect-video
        md:max-w-[854px]
        overflow-hidden
        bg-black
        rounded-none
        md:rounded-xl
        select-none
        touch-manipulation
        font-sans
      "
    >

      {/* ==================================================
          VIDEO SURFACE
      ================================================== */}

      <div
        onClick={handleVideoClick}
        className="
          relative
          flex
          h-full
          w-full
          items-center
          justify-center
          cursor-pointer
        "
      >

        <video
          ref={videoRef}
          src={post.video_url}
          preload="metadata"
          playsInline
          muted={isMuted}
          loop
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) =>
            e.preventDefault()
          }
          style={{
            WebkitTouchCallout:
              'none',
            userSelect: 'none',
          }}
          className="
            block
            h-full
            w-full
            object-cover
            select-none
          "
        />

        {/* ==================================================
            VIGNETTE
        ================================================== */}

        <div
          className={`
            pointer-events-none
            absolute
            inset-0
            z-10
            bg-gradient-to-t
            from-black/60
            via-transparent
            to-black/30
            transition-opacity
            duration-200
            ${controlVisibility}
          `}
        />

        {/* ==================================================
            TOP PORTAL
        ================================================== */}

        <div
          className={`
            absolute
            inset-x-0
            top-0
            z-20
            flex
            justify-end
            p-2
            transition-opacity
            duration-200
            ${controlVisibility}
          `}
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <VideoPortalButton
            showVideoPortal={
              isMobile
                ? true
                : showPortal
            }
            portalVideos={
              portalVideos
            }
            loadPortalVideos={
              handleLoadPortalVideos
            }
            showSimilarVideos={
              showSimilar
            }
            setShowSimilarVideos={
              setShowSimilar
            }
            onSelect={(video) =>
              console.log(
                'Routing Target:',
                video
              )
            }
          />
        </div>

        {/* ==================================================
            CENTER PLAY / PAUSE
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            flex
            items-center
            justify-center
          "
        >
          <div
            className={`
              rounded-full
              border
              border-white/20
              bg-neutral-900/60
              p-2.5
              text-white
              backdrop-blur-md
              transition-all
              duration-300
              ease-out

              ${
                isMobile
                  ? showControls
                    ? `
                      visible
                      scale-100
                      opacity-100
                    `
                    : `
                      invisible
                      scale-95
                      opacity-0
                    `
                  : `
                    invisible
                    scale-95
                    opacity-0
                    group-hover/player:visible
                    group-hover/player:scale-100
                    group-hover/player:opacity-100
                  `
              }
            `}
          >
            {isPlaying ? (
              <svg
                className="
                  h-4
                  w-4
                  fill-current
                "
                viewBox="0 0 24 24"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="
                  h-4
                  w-4
                  fill-current
                "
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* ==================================================
            BOTTOM CONTROL DECK
        ================================================== */}

        <div
          className={`
            pointer-events-auto
            absolute
            inset-x-0
            bottom-0
            z-20
            flex
            flex-col
            gap-1.5
            px-3
            pb-2
            pt-6
            transition-opacity
            duration-200
            ${controlVisibility}
          `}
          onClick={(e) =>
            e.stopPropagation()
          }
        >

          {/* TIMELINE */}

          <VideoTimeline
            videoRef={videoRef}
            progress={progress}
            currentTime={currentTime}
            duration={duration}
          />

          {/* ==================================================
              CONTROL ROW
          ================================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              font-medium
              text-white
            "
          >

            {/* LEFT CONTROLS */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              {/* PLAY */}

              <button
                type="button"
                onClick={handleTogglePlay}
                className="
                  text-white
                  transition-transform
                  duration-150
                  hover:scale-105
                "
                title={
                  isPlaying
                    ? 'Pause'
                    : 'Play'
                }
              >
                {isPlaying ? (
                  <svg
                    className="
                      h-4
                      w-4
                      fill-current
                    "
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg
                    className="
                      h-4
                      w-4
                      fill-current
                    "
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* MUTE */}

              <button
                type="button"
                onClick={() =>
                  setIsMuted(
                    (prev) => !prev
                  )
                }
                className="
                  text-white
                  transition-transform
                  duration-150
                  hover:scale-105
                "
                title={
                  isMuted
                    ? 'Unmute'
                    : 'Mute'
                }
              >
                {isMuted ? (
                  <svg
                    className="
                      h-4
                      w-4
                      fill-current
                    "
                    viewBox="0 0 24 24"
                  >
                    <path d="M4.34 2.93L2.93 4.34 7.29 8.7 7 9H3v6h4l5 5v-6.59l4.18 4.18c-.65.49-1.38.88-2.18 1.11v2.06c1.35-.33 2.58-.99 3.61-1.89l2.05 2.05 1.41-1.41L4.34 2.93zM10 15.17L7.83 13H5v-2h2.83l.17-.17V15.17zM19 12c0-1.88-1.02-3.51-2.55-4.38v2.84l2.43 2.43c.07-.28.12-.58.12-.89zM16.45 4.72v2.06c2.51.93 4.3 3.32 4.3 6.14 0 1.02-.23 1.99-.64 2.86l1.5 1.5c.73-1.3 1.14-2.79 1.14-4.36 0-4.9-3.6-8.96-8.3-10.2zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : (
                  <svg
                    className="
                      h-4
                      w-4
                      fill-current
                    "
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-3.54-7-8.77s2.99-7.86 7-8.77z" />
                  </svg>
                )}
              </button>

            </div>

            {/* RIGHT CONTROL */}

            <div
              className="
                flex
                items-center
                text-[10px]
                tracking-wide
                text-gray-400
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowSimilar(
                    (prev) => !prev
                  )
                }
                className="
                  transition-colors
                  duration-150
                  hover:text-white
                "
              >
                {showSimilar
                  ? 'Autoplay On'
                  : 'Autoplay Off'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}