'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import VideoPortalButton from './VideoPortalButton'
import VideoTimeline from './VideoTimeline'

interface PostVideoProps {
  post: any
}

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const CONTROL_TIMEOUT = 40_000

const TAP_DELAY = 350

const MOBILE_BREAKPOINT = 768

/* ========================================================================== */
/* COMPONENT                                                                  */
/* ========================================================================== */

export default function PostVideo({
  post,
}: PostVideoProps) {
  /* ------------------------------------------------------------------------ */
  /* REFS                                                                     */
  /* ------------------------------------------------------------------------ */

  const videoRef =
    useRef<HTMLVideoElement>(null)

  const containerRef =
    useRef<HTMLDivElement>(null)

  const controlsTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null)

  const tapTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null)

  const tapCountRef =
    useRef(0)

  const pendingPlayToggleRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null)

  const mountedRef =
    useRef(true)

  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [isPlaying, setIsPlaying] =
    useState(false)

  const [progress, setProgress] =
    useState(0)

  const [currentTime, setCurrentTime] =
    useState(0)

  const [duration, setDuration] =
    useState(0)

  const [bufferedProgress, setBufferedProgress] =
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

  /* ======================================================================== */
  /* CLEANUP                                                                  */
  /* ======================================================================== */

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      if (
        controlsTimerRef.current
      ) {
        clearTimeout(
          controlsTimerRef.current,
        )

        controlsTimerRef.current =
          null
      }

      if (
        tapTimerRef.current
      ) {
        clearTimeout(
          tapTimerRef.current,
        )

        tapTimerRef.current =
          null
      }

      if (
        pendingPlayToggleRef.current
      ) {
        clearTimeout(
          pendingPlayToggleRef.current,
        )

        pendingPlayToggleRef.current =
          null
      }
    }
  }, [])

  /* ======================================================================== */
  /* MOBILE DETECTION                                                         */
  /* ======================================================================== */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth <
          MOBILE_BREAKPOINT,
      )
    }

    checkMobile()

    window.addEventListener(
      'resize',
      checkMobile,
    )

    return () => {
      window.removeEventListener(
        'resize',
        checkMobile,
      )
    }
  }, [])

  /* ======================================================================== */
  /* CONTROL TIMER                                                            */
  /* ======================================================================== */

  const clearControlTimer =
    useCallback(() => {
      if (
        controlsTimerRef.current
      ) {
        clearTimeout(
          controlsTimerRef.current,
        )

        controlsTimerRef.current =
          null
      }
    }, [])

  const hideControls =
    useCallback(() => {
      clearControlTimer()

      if (!mountedRef.current) {
        return
      }

      setShowControls(false)
    }, [
      clearControlTimer,
    ])

  const showControlsFor40Seconds =
    useCallback(() => {
      if (!mountedRef.current) {
        return
      }

      setShowControls(true)

      clearControlTimer()

      controlsTimerRef.current =
        setTimeout(() => {
          if (!mountedRef.current) {
            return
          }

          setShowControls(false)

          controlsTimerRef.current =
            null
        }, CONTROL_TIMEOUT)
    }, [
      clearControlTimer,
    ])

  /* ======================================================================== */
  /* VIDEO AUDIO STATE                                                        */
  /* ======================================================================== */

  useEffect(() => {
    const video =
      videoRef.current

    if (!video) {
      return
    }

    video.muted = true

    setIsMuted(true)

    const handleVolumeChange =
      () => {
        if (!mountedRef.current) {
          return
        }

        setIsMuted(
          video.muted ||
            video.volume === 0,
        )
      }

    video.addEventListener(
      'volumechange',
      handleVolumeChange,
    )

    return () => {
      video.removeEventListener(
        'volumechange',
        handleVolumeChange,
      )
    }
  }, [])

  /* ======================================================================== */
  /* AUTO PLAY WHEN VIDEO IS VISIBLE                                          */
  /* ======================================================================== */

  useEffect(() => {
    const video =
      videoRef.current

    if (!video) {
      return
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (!mountedRef.current) {
            return
          }

          if (
            entry.isIntersecting
          ) {
            video
              .play()
              .then(() => {
                if (
                  mountedRef.current
                ) {
                  setIsPlaying(
                    true,
                  )
                }
              })
              .catch(() => {
                if (
                  mountedRef.current
                ) {
                  setIsPlaying(
                    false,
                  )
                }
              })
          } else {
            video.pause()

            setIsPlaying(
              false,
            )
          }
        },
        {
          threshold: 0.6,
        },
      )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [])

  /* ======================================================================== */
  /* VIDEO TIME / PROGRESS                                                     */
  /* ======================================================================== */

  useEffect(() => {
    const video =
      videoRef.current

    if (!video) {
      return
    }

    const updatePlaybackState =
      () => {
        if (!mountedRef.current) {
          return
        }

        const videoDuration =
          Number.isFinite(
            video.duration,
          ) &&
          video.duration > 0
            ? video.duration
            : 0

        const current =
          Number.isFinite(
            video.currentTime,
          ) &&
          video.currentTime >= 0
            ? video.currentTime
            : 0

        const percentage =
          videoDuration > 0
            ? Math.min(
                100,
                Math.max(
                  0,
                  (current /
                    videoDuration) *
                    100,
                ),
              )
            : 0

        setProgress(
          percentage,
        )

        setCurrentTime(
          current,
        )

        setDuration(
          videoDuration,
        )

        /*
         * Open portal after 70% playback.
         */
        if (
          percentage > 70 &&
          !showPortal
        ) {
          setShowPortal(
            true,
          )
        }
      }

    const updateBuffered =
      () => {
        if (!mountedRef.current) {
          return
        }

        const videoDuration =
          Number.isFinite(
            video.duration,
          ) &&
          video.duration > 0
            ? video.duration
            : 0

        if (
          videoDuration <= 0 ||
          video.buffered.length === 0
        ) {
          setBufferedProgress(
            0,
          )

          return
        }

        let bufferedEnd = 0

        try {
          for (
            let index = 0;
            index <
            video.buffered.length;
            index++
          ) {
            const end =
              video.buffered.end(
                index,
              )

            if (
              end >
              bufferedEnd
            ) {
              bufferedEnd = end
            }
          }
        } catch {
          bufferedEnd = 0
        }

        const percentage =
          Math.min(
            100,
            Math.max(
              0,
              (bufferedEnd /
                videoDuration) *
                100,
            ),
          )

        setBufferedProgress(
          percentage,
        )
      }

    const handleLoadedMetadata =
      () => {
        if (!mountedRef.current) {
          return
        }

        const videoDuration =
          Number.isFinite(
            video.duration,
          )
            ? video.duration
            : 0

        setDuration(
          videoDuration,
        )

        updateBuffered()
      }

    const handleProgress =
      () => {
        updateBuffered()
      }

    const handlePlay =
      () => {
        if (
          mountedRef.current
        ) {
          setIsPlaying(true)
        }
      }

    const handlePause =
      () => {
        if (
          mountedRef.current
        ) {
          setIsPlaying(false)
        }
      }

    const handleEnded =
      () => {
        if (
          mountedRef.current
        ) {
          setIsPlaying(false)
          setProgress(100)
        }
      }

    video.addEventListener(
      'timeupdate',
      updatePlaybackState,
    )

    video.addEventListener(
      'loadedmetadata',
      handleLoadedMetadata,
    )

    video.addEventListener(
      'progress',
      handleProgress,
    )

    video.addEventListener(
      'loadeddata',
      updateBuffered,
    )

    video.addEventListener(
      'canplay',
      updateBuffered,
    )

    video.addEventListener(
      'play',
      handlePlay,
    )

    video.addEventListener(
      'pause',
      handlePause,
    )

    video.addEventListener(
      'ended',
      handleEnded,
    )

    updatePlaybackState()
    updateBuffered()

    return () => {
      video.removeEventListener(
        'timeupdate',
        updatePlaybackState,
      )

      video.removeEventListener(
        'loadedmetadata',
        handleLoadedMetadata,
      )

      video.removeEventListener(
        'progress',
        handleProgress,
      )

      video.removeEventListener(
        'loadeddata',
        updateBuffered,
      )

      video.removeEventListener(
        'canplay',
        updateBuffered,
      )

      video.removeEventListener(
        'play',
        handlePlay,
      )

      video.removeEventListener(
        'pause',
        handlePause,
      )

      video.removeEventListener(
        'ended',
        handleEnded,
      )
    }
  }, [
    showPortal,
  ])

  /* ======================================================================== */
  /* STOP IF NO VIDEO                                                         */
  /* ======================================================================== */

  if (!post?.video_url) {
    return null
  }

  /* ======================================================================== */
  /* PORTAL VIDEOS                                                             */
  /* ======================================================================== */

  const handleLoadPortalVideos =
    async () => {
      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            800,
          ),
      )

      if (!mountedRef.current) {
        return
      }

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

  /* ======================================================================== */
  /* PLAY / PAUSE                                                             */
  /* ======================================================================== */

  const handleTogglePlay =
    useCallback(() => {
      const video =
        videoRef.current

      if (!video) {
        return
      }

      if (video.paused) {
        video
          .play()
          .then(() => {
            if (
              mountedRef.current
            ) {
              setIsPlaying(
                true,
              )
            }
          })
          .catch(() => {
            if (
              mountedRef.current
            ) {
              setIsPlaying(
                false,
              )
            }
          })
      } else {
        video.pause()

        setIsPlaying(
          false,
        )
      }

      showControlsFor40Seconds()
    }, [
      showControlsFor40Seconds,
    ])

  /* ======================================================================== */
  /* CANCEL PENDING TAP ACTION                                                */
  /* ======================================================================== */

  const cancelPendingPlayToggle =
    useCallback(() => {
      if (
        pendingPlayToggleRef.current
      ) {
        clearTimeout(
          pendingPlayToggleRef.current,
        )

        pendingPlayToggleRef.current =
          null
      }
    }, [])

  /* ======================================================================== */
  /* VIDEO TAP / CLICK                                                         */
  /* ======================================================================== */

  const handleVideoClick =
    useCallback(() => {
      /*
       * Count clicks/taps ourselves.
       *
       * 1 tap:
       *   show controls
       *   play/pause
       *
       * 2+ taps:
       *   immediately hide controls
       *
       * This works with both mouse clicks and
       * touch-generated click events.
       */

      tapCountRef.current += 1

      const currentTapCount =
        tapCountRef.current

      if (
        tapTimerRef.current
      ) {
        clearTimeout(
          tapTimerRef.current,
        )

        tapTimerRef.current =
          null
      }

      /*
       * DOUBLE / TRIPLE TAP
       *
       * Intentional hide gesture.
       */
      if (
        currentTapCount >= 2
      ) {
        tapCountRef.current = 0

        cancelPendingPlayToggle()

        hideControls()

        return
      }

      /*
       * SINGLE TAP
       *
       * Give the user a 350ms
       * window to turn it into a
       * double/triple tap.
       */
      showControlsFor40Seconds()

      tapTimerRef.current =
        setTimeout(() => {
          tapCountRef.current = 0

          /*
           * Only perform play/pause if
           * the user did not double tap.
           */
          if (
            mountedRef.current
          ) {
            handleTogglePlay()
          }

          pendingPlayToggleRef.current =
            null

          tapTimerRef.current =
            null
        }, TAP_DELAY)

      pendingPlayToggleRef.current =
        tapTimerRef.current
    }, [
      cancelPendingPlayToggle,
      handleTogglePlay,
      hideControls,
      showControlsFor40Seconds,
    ])

  /* ======================================================================== */
  /* CONTROL CLICK                                                             */
  /* ======================================================================== */

  const handleControlInteraction =
    useCallback(
      (
        event:
          | React.MouseEvent
          | React.PointerEvent,
      ) => {
        event.stopPropagation()

        showControlsFor40Seconds()
      },
      [
        showControlsFor40Seconds,
      ],
    )

  /* ======================================================================== */
  /* VIDEO POINTER INTERACTION                                                */
  /* ======================================================================== */

  const handleVideoPointerDown =
    (
      event: React.PointerEvent<HTMLDivElement>,
    ) => {
      /*
       * Don't interfere with control elements.
       */
      const target =
        event.target as HTMLElement

      if (
        target.closest(
          'button, input, [role="slider"], [data-video-control="true"]',
        )
      ) {
        return
      }

      /*
       * We intentionally let the click
       * event perform the tap counting.
       */
    }

  /* ======================================================================== */
  /* CONTROL VISIBILITY                                                        */
  /* ======================================================================== */

  const controlVisibility =
    isMobile
      ? showControls
        ? 'opacity-100 visible'
        : 'opacity-0 invisible'
      : showControls
        ? 'opacity-100 visible'
        : 'opacity-0 invisible group-hover/player:opacity-100 group-hover/player:visible'

  /* ======================================================================== */
  /* RENDER                                                                   */
  /* ======================================================================== */

  return (
    <div
      ref={containerRef}
      className="
        group/player
        relative
        mt-4
        w-full
        aspect-video
        overflow-hidden
        bg-black
        rounded-none
        md:max-w-[854px]
        md:rounded-xl
        select-none
        touch-manipulation
        font-sans
      "
    >
      {/* ================================================================== */}
      {/* VIDEO SURFACE                                                       */}
      {/* ================================================================== */}

      <div
        onClick={
          handleVideoClick
        }
        onPointerDown={
          handleVideoPointerDown
        }
        className="
          relative
          flex
          h-full
          w-full
          items-center
          justify-center
          cursor-pointer
          touch-manipulation
        "
      >
        {/* ================================================================ */}
        {/* VIDEO                                                             */}
        {/* ================================================================ */}

        <video
          ref={videoRef}
          src={post.video_url}
          preload="metadata"
          playsInline
          muted={isMuted}
          loop
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          onContextMenu={(event) =>
            event.preventDefault()
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
            touch-manipulation
          "
        />

        {/* ================================================================ */}
        {/* VIGNETTE                                                         */}
        {/* ================================================================ */}

        <div
          className={`
            pointer-events-none
            absolute
            inset-0
            z-10
            bg-gradient-to-t
            from-black/70
            via-transparent
            to-black/35
            transition-opacity
            duration-200
            ${controlVisibility}
          `}
        />

        {/* ================================================================ */}
        {/* TOP PORTAL                                                        */}
        {/* ================================================================ */}

        <div
          data-video-control="true"
          className={`
            absolute
            inset-x-0
            top-0
            z-30
            flex
            justify-end
            p-3
            transition-opacity
            duration-200
            ${controlVisibility}
          `}
          onClick={
            handleControlInteraction
          }
          onPointerDown={
            handleControlInteraction
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
                video,
              )
            }
          />
        </div>

        {/* ================================================================ */}
        {/* CENTER PLAY / PAUSE                                               */}
        {/* ================================================================ */}

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
              bg-black/55
              p-4
              text-white
              shadow-2xl
              backdrop-blur-md
              transition-all
              duration-200
              ease-out
              ${
                showControls
                  ? 'scale-100 opacity-100'
                  : 'scale-90 opacity-0'
              }
            `}
          >
            {isPlaying ? (
              <svg
                className="
                  h-6
                  w-6
                  fill-current
                "
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                className="
                  h-6
                  w-6
                  fill-current
                "
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* BOTTOM CONTROL DECK                                               */}
        {/* ================================================================ */}

        <div
          data-video-control="true"
          className={`
            pointer-events-auto
            absolute
            inset-x-0
            bottom-0
            z-30
            flex
            flex-col
            gap-1
            px-2
            pb-2
            pt-16
            sm:px-3
            sm:pb-3
            transition-opacity
            duration-200
            ${controlVisibility}
          `}
          onClick={
            handleControlInteraction
          }
          onPointerDown={
            handleControlInteraction
          }
        >
          {/* ============================================================ */}
          {/* PROFESSIONAL TIMELINE                                          */}
          {/* ============================================================ */}

          <VideoTimeline
            videoRef={videoRef}
            progress={progress}
            bufferedProgress={
              bufferedProgress
            }
            currentTime={
              currentTime
            }
            duration={duration}
            onUserInteraction={
              showControlsFor40Seconds
            }
          />

          {/* ============================================================ */}
          {/* CONTROL ROW                                                    */}
          {/* ============================================================ */}

          <div
            className="
              flex
              min-h-10
              items-center
              justify-between
              gap-3
              px-1
              text-white
            "
          >
            {/* ========================================================== */}
            {/* PLAY BUTTON                                                  */}
            {/* ========================================================== */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <button
                type="button"
                data-video-control="true"
                onClick={(event) => {
                  event.stopPropagation()

                  handleTogglePlay()
                }}
                onPointerDown={(
                  event,
                ) => {
                  event.stopPropagation()

                  showControlsFor40Seconds()
                }}
                aria-label={
                  isPlaying
                    ? 'Pause video'
                    : 'Play video'
                }
                title={
                  isPlaying
                    ? 'Pause'
                    : 'Play'
                }
                className="
                  flex
                  h-10
                  w-10
                  touch-manipulation
                  items-center
                  justify-center
                  rounded-xl
                  bg-black/35
                  text-white
                  backdrop-blur-sm
                  transition-all
                  duration-150
                  hover:bg-white/10
                  active:scale-95
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/80
                "
              >
                {isPlaying ? (
                  <svg
                    className="
                      h-5
                      w-5
                      fill-current
                    "
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg
                    className="
                      h-5
                      w-5
                      fill-current
                    "
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* ========================================================== */}
            {/* RIGHT CONTROL                                                */}
            {/* ========================================================== */}

            <div
              className="
                flex
                items-center
              "
            >
              <button
                type="button"
                data-video-control="true"
                onClick={(event) => {
                  event.stopPropagation()

                  setShowSimilar(
                    (previous) =>
                      !previous,
                  )

                  showControlsFor40Seconds()
                }}
                onPointerDown={(
                  event,
                ) => {
                  event.stopPropagation()

                  showControlsFor40Seconds()
                }}
                className="
                  min-h-10
                  rounded-lg
                  px-2
                  text-[11px]
                  font-medium
                  tracking-wide
                  text-white/60
                  transition-colors
                  hover:text-white
                  active:bg-white/10
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/70
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