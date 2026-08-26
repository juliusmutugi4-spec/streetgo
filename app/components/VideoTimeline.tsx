'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

interface VideoTimelineProps {
  videoRef: React.RefObject<HTMLVideoElement | null>

  progress: number

  bufferedProgress?: number

  currentTime: number

  duration: number

  /*
   * Parent video player uses this callback to restart
   * the 40-second control visibility timer.
   */
  onUserInteraction?: () => void
}

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

const DEFAULT_VOLUME = 1

const RESTORE_VOLUME = 0.5

const MOBILE_TOUCH_HEIGHT = 48

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const clamp = (
  value: number,
  min = 0,
  max = 1,
): number => {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(
    Math.max(value, min),
    max,
  )
}

const clampPercent = (
  value: number,
): number => {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(
    Math.max(value, 0),
    100,
  )
}

const formatTime = (
  seconds: number,
): string => {
  if (
    !Number.isFinite(seconds) ||
    seconds < 0
  ) {
    return '0:00'
  }

  const totalSeconds =
    Math.floor(seconds)

  const hours =
    Math.floor(
      totalSeconds / 3600,
    )

  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60,
    )

  const secs =
    totalSeconds % 60

  const paddedSeconds =
    String(secs).padStart(
      2,
      '0',
    )

  if (hours > 0) {
    return `${hours}:${String(
      minutes,
    ).padStart(
      2,
      '0',
    )}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}

/* ========================================================================== */
/* VOLUME ICONS                                                               */
/* ========================================================================== */

function VolumeMutedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="
          M4 9.25
          H2.75
          C2.336 9.25 2 9.586 2 10
          V14
          C2 14.414 2.336 14.75 2.75 14.75
          H4
          L8.35 18.3
          A.75.75 0 0 0 9.575 17.718
          V6.282
          A.75.75 0 0 0 8.35 5.7
          L4 9.25Z
        "
        fill="currentColor"
      />

      <path
        d="
          M15.5 9.5
          L21 15
          M21 9.5
          L15.5 15
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function VolumeLowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="
          M4 9.25
          H2.75
          C2.336 9.25 2 9.586 2 10
          V14
          C2 14.414 2.336 14.75 2.75 14.75
          H4
          L8.35 18.3
          A.75.75 0 0 0 9.575 17.718
          V6.282
          A.75.75 0 0 0 8.35 5.7
          L4 9.25Z
        "
        fill="currentColor"
      />

      <path
        d="
          M14.5 9.25
          A4 4 0 0 1 14.5 14.75
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function VolumeMediumIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="
          M4 9.25
          H2.75
          C2.336 9.25 2 9.586 2 10
          V14
          C2 14.414 2.336 14.75 2.75 14.75
          H4
          L8.35 18.3
          A.75.75 0 0 0 9.575 17.718
          V6.282
          A.75.75 0 0 0 8.35 5.7
          L4 9.25Z
        "
        fill="currentColor"
      />

      <path
        d="
          M14.5 8.25
          A5.5 5.5 0 0 1 14.5 15.75
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="
          M17.5 6
          A8.5 8.5 0 0 1 17.5 18
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  )
}

function VolumeHighIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-[17px] w-[17px]"
    >
      <path
        d="
          M4 9.25
          H2.75
          C2.336 9.25 2 9.586 2 10
          V14
          C2 14.414 2.336 14.75 2.75 14.75
          H4
          L8.35 18.3
          A.75.75 0 0 0 9.575 17.718
          V6.282
          A.75.75 0 0 0 8.35 5.7
          L4 9.25Z
        "
        fill="currentColor"
      />

      <path
        d="
          M14.5 8.25
          A5.5 5.5 0 0 1 14.5 15.75
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="
          M17.5 6
          A8.5 8.5 0 0 1 17.5 18
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="
          M20 4.25
          A11 11 0 0 1 20 19.75
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity=".55"
      />
    </svg>
  )
}

/* ========================================================================== */
/* MAIN COMPONENT                                                             */
/* ========================================================================== */

export default function YouTubeVideoTimeline({
  videoRef,
  progress,
  bufferedProgress = 0,
  currentTime,
  duration,
  onUserInteraction,
}: VideoTimelineProps) {
  /* ------------------------------------------------------------------------ */
  /* REFS                                                                     */
  /* ------------------------------------------------------------------------ */

  const railRef =
    useRef<HTMLDivElement>(null)

  const volumeSliderRef =
    useRef<HTMLInputElement>(null)

  const isDraggingRef =
    useRef(false)

  const animationFrameRef =
    useRef<number | null>(null)

  const lastVolumeRef =
    useRef(DEFAULT_VOLUME)

  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [isDragging, setIsDragging] =
    useState(false)

  const [railActive, setRailActive] =
    useState(false)

  const [hoverPosition, setHoverPosition] =
    useState<number | null>(null)

  const [volume, setVolume] =
    useState(DEFAULT_VOLUME)

  const [isMuted, setIsMuted] =
    useState(false)

  const [volumeOpen, setVolumeOpen] =
    useState(false)

  const [isTouchDevice, setIsTouchDevice] =
    useState(false)

  /* ------------------------------------------------------------------------ */
  /* TOUCH DEVICE DETECTION                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      typeof window === 'undefined'
    ) {
      return
    }

    const media =
      window.matchMedia(
        '(pointer: coarse)',
      )

    const update =
      () => {
        setIsTouchDevice(
          media.matches,
        )
      }

    update()

    media.addEventListener(
      'change',
      update,
    )

    return () => {
      media.removeEventListener(
        'change',
        update,
      )
    }
  }, [])

  /* ------------------------------------------------------------------------ */
  /* SAFE VALUES                                                              */
  /* ------------------------------------------------------------------------ */

  const safeProgress =
    clampPercent(
      progress,
    )

  const safeBuffered =
    clampPercent(
      bufferedProgress,
    )

  const safeCurrentTime =
    Number.isFinite(
      currentTime,
    ) &&
    currentTime >= 0
      ? currentTime
      : 0

  const safeDuration =
    Number.isFinite(
      duration,
    ) &&
    duration > 0
      ? duration
      : 0

  const safeVolume =
    clamp(
      volume,
    )

  const ariaValueNow =
    safeDuration > 0
      ? Math.round(
          clamp(
            safeCurrentTime /
              safeDuration,
          ) * 100,
        )
      : 0

  /* ------------------------------------------------------------------------ */
  /* NOTIFY PARENT                                                            */
  /* ------------------------------------------------------------------------ */

  const notifyInteraction =
    useCallback(() => {
      onUserInteraction?.()
    }, [
      onUserInteraction,
    ])

  /* ------------------------------------------------------------------------ */
  /* SYNCHRONIZE AUDIO                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const video =
      videoRef.current

    if (!video) {
      return
    }

    const syncAudio =
      () => {
        const nextVolume =
          clamp(
            video.volume,
          )

        setVolume(
          nextVolume,
        )

        setIsMuted(
          video.muted ||
            nextVolume === 0,
        )

        if (
          nextVolume > 0
        ) {
          lastVolumeRef.current =
            nextVolume
        }
      }

    syncAudio()

    video.addEventListener(
      'volumechange',
      syncAudio,
    )

    return () => {
      video.removeEventListener(
        'volumechange',
        syncAudio,
      )
    }
  }, [
    videoRef,
  ])

  /* ------------------------------------------------------------------------ */
  /* FIND POSITION ON TIMELINE                                                */
  /* ------------------------------------------------------------------------ */

  const getPercentage =
    useCallback(
      (
        clientX: number,
      ): number | null => {
        const rail =
          railRef.current

        if (!rail) {
          return null
        }

        const rect =
          rail.getBoundingClientRect()

        if (
          rect.width <= 0
        ) {
          return null
        }

        const x =
          clientX -
          rect.left

        return clamp(
          x / rect.width,
        )
      },
      [],
    )

  /* ------------------------------------------------------------------------ */
  /* SEEK VIDEO                                                               */
  /* ------------------------------------------------------------------------ */

  const seekFromClientX =
    useCallback(
      (
        clientX: number,
      ) => {
        const video =
          videoRef.current

        if (!video) {
          return
        }

        const percentage =
          getPercentage(
            clientX,
          )

        if (
          percentage === null
        ) {
          return
        }

        const videoDuration =
          video.duration

        if (
          !Number.isFinite(
            videoDuration,
          ) ||
          videoDuration <= 0
        ) {
          return
        }

        try {
          video.currentTime =
            percentage *
            videoDuration
        } catch {
          return
        }

        notifyInteraction()
      },
      [
        getPercentage,
        notifyInteraction,
        videoRef,
      ],
    )

  /* ------------------------------------------------------------------------ */
  /* POINTER DOWN                                                             */
  /* ------------------------------------------------------------------------ */

  const handlePointerDown =
    (
      event: React.PointerEvent<HTMLDivElement>,
    ) => {
      if (
        event.pointerType ===
          'mouse' &&
        event.button !== 0
      ) {
        return
      }

      event.preventDefault()

      event.stopPropagation()

      notifyInteraction()

      isDraggingRef.current =
        true

      setIsDragging(
        true,
      )

      setRailActive(
        true,
      )

      try {
        event.currentTarget.setPointerCapture(
          event.pointerId,
        )
      } catch {
        // Safe fallback.
      }

      seekFromClientX(
        event.clientX,
      )
    }

  /* ------------------------------------------------------------------------ */
  /* POINTER MOVE                                                             */
  /* ------------------------------------------------------------------------ */

  const handlePointerMove =
    (
      event: React.PointerEvent<HTMLDivElement>,
    ) => {
      event.stopPropagation()

      if (
        event.pointerType ===
        'mouse'
      ) {
        const percentage =
          getPercentage(
            event.clientX,
          )

        if (
          percentage !== null
        ) {
          setHoverPosition(
            percentage * 100,
          )
        }
      }

      if (
        !isDraggingRef.current
      ) {
        return
      }

      seekFromClientX(
        event.clientX,
      )
    }

  /* ------------------------------------------------------------------------ */
  /* POINTER UP                                                               */
  /* ------------------------------------------------------------------------ */

  const finishDragging =
    () => {
      isDraggingRef.current =
        false

      setIsDragging(
        false,
      )

      notifyInteraction()

      window.setTimeout(
        () => {
          setRailActive(
            false,
          )
        },
        250,
      )
    }

  /* ------------------------------------------------------------------------ */
  /* POINTER LEAVE                                                            */
  /* ------------------------------------------------------------------------ */

  const handlePointerLeave =
    () => {
      if (
        !isDraggingRef.current
      ) {
        setHoverPosition(
          null,
        )

        if (
          !isTouchDevice
        ) {
          setRailActive(
            false,
          )
        }
      }
    }

  /* ------------------------------------------------------------------------ */
  /* GLOBAL DRAGGING                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const handleMove =
      (
        event: PointerEvent,
      ) => {
        if (
          !isDraggingRef.current
        ) {
          return
        }

        if (
          animationFrameRef.current !==
          null
        ) {
          cancelAnimationFrame(
            animationFrameRef.current,
          )
        }

        animationFrameRef.current =
          requestAnimationFrame(
            () => {
              seekFromClientX(
                event.clientX,
              )
            },
          )
      }

    const handleUp =
      () => {
        isDraggingRef.current =
          false

        setIsDragging(
          false,
        )

        notifyInteraction()
      }

    window.addEventListener(
      'pointermove',
      handleMove,
      {
        passive: true,
      },
    )

    window.addEventListener(
      'pointerup',
      handleUp,
    )

    window.addEventListener(
      'pointercancel',
      handleUp,
    )

    return () => {
      window.removeEventListener(
        'pointermove',
        handleMove,
      )

      window.removeEventListener(
        'pointerup',
        handleUp,
      )

      window.removeEventListener(
        'pointercancel',
        handleUp,
      )

      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        )

        animationFrameRef.current =
          null
      }
    }
  }, [
    isDragging,
    notifyInteraction,
    seekFromClientX,
  ])

  /* ------------------------------------------------------------------------ */
  /* KEYBOARD SEEK                                                            */
  /* ------------------------------------------------------------------------ */

  const handleTimelineKeyDown =
    (
      event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
      const video =
        videoRef.current

      if (!video) {
        return
      }

      const total =
        Number.isFinite(
          video.duration,
        ) &&
        video.duration > 0
          ? video.duration
          : safeDuration

      if (
        total <= 0
      ) {
        return
      }

      let nextTime =
        video.currentTime

      switch (
        event.key
      ) {
        case 'ArrowRight':
          nextTime =
            Math.min(
              total,
              nextTime + 5,
            )
          break

        case 'ArrowLeft':
          nextTime =
            Math.max(
              0,
              nextTime - 5,
            )
          break

        case 'j':
        case 'J':
          nextTime =
            Math.max(
              0,
              nextTime - 10,
            )
          break

        case 'l':
        case 'L':
          nextTime =
            Math.min(
              total,
              nextTime + 10,
            )
          break

        case 'Home':
          nextTime = 0
          break

        case 'End':
          nextTime =
            total
          break

        default:
          return
      }

      event.preventDefault()

      try {
        video.currentTime =
          nextTime
      } catch {
        return
      }

      notifyInteraction()
    }

  /* ------------------------------------------------------------------------ */
  /* MUTE                                                                     */
  /* ------------------------------------------------------------------------ */

  const toggleMute =
    () => {
      const video =
        videoRef.current

      if (!video) {
        return
      }

      notifyInteraction()

      if (
        video.muted ||
        video.volume === 0
      ) {
        const restored =
          lastVolumeRef.current >
          0
            ? lastVolumeRef.current
            : RESTORE_VOLUME

        video.volume =
          restored

        video.muted =
          false

        setVolume(
          restored,
        )

        setIsMuted(
          false,
        )

        return
      }

      lastVolumeRef.current =
        video.volume

      video.muted =
        true

      setIsMuted(
        true,
      )
    }

  /* ------------------------------------------------------------------------ */
  /* VOLUME CHANGE                                                            */
  /* ------------------------------------------------------------------------ */

  const handleVolumeChange =
    (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      event.stopPropagation()

      const video =
        videoRef.current

      if (!video) {
        return
      }

      const nextVolume =
        clamp(
          Number(
            event.target.value,
          ),
        )

      video.volume =
        nextVolume

      if (
        nextVolume <= 0
      ) {
        video.muted =
          true

        setIsMuted(
          true,
        )
      } else {
        video.muted =
          false

        lastVolumeRef.current =
          nextVolume

        setIsMuted(
          false,
        )
      }

      setVolume(
        nextVolume,
      )

      notifyInteraction()
    }

  /* ------------------------------------------------------------------------ */
  /* VOLUME KEYBOARD                                                          */
  /* ------------------------------------------------------------------------ */

  const handleVolumeKeyDown =
    (
      event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      event.stopPropagation()

      if (
        event.key === 'm' ||
        event.key === 'M'
      ) {
        event.preventDefault()

        toggleMute()

        return
      }

      notifyInteraction()
    }

  /* ------------------------------------------------------------------------ */
  /* VOLUME ICON                                                              */
  /* ------------------------------------------------------------------------ */

  const volumeIcon =
    isMuted ||
    safeVolume <= 0 ? (
      <VolumeMutedIcon />
    ) : safeVolume < 0.33 ? (
      <VolumeLowIcon />
    ) : safeVolume < 0.7 ? (
      <VolumeMediumIcon />
    ) : (
      <VolumeHighIcon />
    )

  const volumePercent =
    isMuted
      ? 0
      : safeVolume * 100

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="
        w-full
        select-none
        font-sans
        text-white
      "
      data-video-control="true"
      onPointerDown={(event) => {
        event.stopPropagation()

        notifyInteraction()
      }}
      onClick={(event) => {
        event.stopPropagation()

        notifyInteraction()
      }}
    >
      {/* ================================================================== */}
      {/* TIMELINE                                                            */}
      {/* ================================================================== */}

      <div
        ref={railRef}
        role="slider"
        aria-label="Video timeline"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          ariaValueNow
        }
        aria-valuetext={`${formatTime(
          safeCurrentTime,
        )} of ${formatTime(
          safeDuration,
        )}`}
        tabIndex={0}
        onPointerDown={
          handlePointerDown
        }
        onPointerMove={
          handlePointerMove
        }
        onPointerUp={
          finishDragging
        }
        onPointerCancel={
          finishDragging
        }
        onPointerEnter={() => {
          if (
            !isTouchDevice
          ) {
            setRailActive(
              true,
            )
          }
        }}
        onPointerLeave={
          handlePointerLeave
        }
        onKeyDown={
          handleTimelineKeyDown
        }
        className="
          group/timeline
          relative
          flex
          h-12
          w-full
          touch-none
          cursor-pointer
          items-center
          outline-none
        "
      >
        {/* ================================================================ */}
        {/* LARGE TOUCH TARGET                                               */}
        {/* ================================================================ */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-1/2
            h-12
            -translate-y-1/2
          "
          aria-hidden="true"
        />

        {/* ================================================================ */}
        {/* TRACK                                                            */}
        {/* ================================================================ */}

        <div
          className={`
            pointer-events-none
            relative
            z-10
            w-full
            rounded-full
            bg-white/20
            transition-all
            duration-150
            ease-out
            ${
              isDragging ||
              railActive
                ? 'h-[6px]'
                : 'h-[4px]'
            }
          `}
        >
          {/* BUFFERED */}

          <div
            className="
              absolute
              inset-y-0
              left-0
              rounded-full
              bg-white/35
            "
            style={{
              width: `${safeBuffered}%`,
            }}
          />

          {/* HOVER */}

          {hoverPosition !==
            null && (
            <div
              className="
                absolute
                inset-y-0
                left-0
                rounded-full
                bg-white/20
              "
              style={{
                width: `${hoverPosition}%`,
              }}
            />
          )}

          {/* PLAYED */}

          <div
            className="
              absolute
              inset-y-0
              left-0
              rounded-full
              bg-[#ff0000]
              shadow-[0_0_8px_rgba(255,0,0,.4)]
            "
            style={{
              width: `${safeProgress}%`,
            }}
          />

          {/* SCRUBBER */}

          <div
            className={`
              absolute
              top-1/2
              h-[18px]
              w-[18px]
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-[#ff0000]
              shadow-[0_2px_10px_rgba(0,0,0,.65),0_0_10px_rgba(255,0,0,.5)]
              transition-transform
              duration-100
              ease-out
              ${
                isDragging ||
                railActive
                  ? 'scale-100'
                  : 'scale-0'
              }
            `}
            style={{
              left: `${safeProgress}%`,
            }}
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* BOTTOM ROW                                                          */}
      {/* ================================================================== */}

      <div
        className="
          flex
          min-h-11
          w-full
          items-center
          justify-between
          gap-2
        "
      >
        {/* ================================================================ */}
        {/* LEFT CONTROLS                                                     */}
        {/* ================================================================ */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-2
          "
        >
          {/* ============================================================ */}
          {/* SPEAKER                                                       */}
          {/* ============================================================ */}

          <div
            className="
              relative
              shrink-0
            "
            data-video-control="true"
          >
            <button
              type="button"
              aria-label={
                isMuted
                  ? 'Unmute video'
                  : 'Mute video'
              }
              title={
                isMuted
                  ? 'Unmute'
                  : 'Mute'
              }
              onClick={(event) => {
                event.stopPropagation()

                notifyInteraction()

                if (
                  isTouchDevice
                ) {
                  setVolumeOpen(
                    (current) =>
                      !current,
                  )

                  return
                }

                toggleMute()
              }}
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
                backdrop-blur-md
                transition-all
                duration-150
                hover:bg-white/10
                active:scale-95
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-white/80
              "
            >
              <span className="scale-[0.8]">
                {volumeIcon}
              </span>

              {!isMuted &&
                safeVolume > 0 && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute
                      bottom-[6px]
                      right-[6px]
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-red-500
                      shadow-[0_0_6px_rgba(239,68,68,.9)]
                    "
                  />
                )}
            </button>

            {/* ========================================================== */}
            {/* MOBILE VOLUME PANEL                                         */}
            {/* ========================================================== */}

            {volumeOpen && (
              <div
                data-video-control="true"
                className="
                  absolute
                  bottom-12
                  left-0
                  z-[60]
                  w-[190px]
                  rounded-xl
                  border
                  border-white/10
                  bg-black/90
                  p-2.5
                  shadow-[0_8px_30px_rgba(0,0,0,.55)]
                  backdrop-blur-xl
                "
                onPointerDown={(event) => {
                  event.stopPropagation()
                  notifyInteraction()
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  notifyInteraction()
                }}
              >
                {/* ---------------------------------------------------------- */}
                {/* COMPACT VOLUME HEADER                                      */}
                {/* ---------------------------------------------------------- */}

                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-medium
                      text-white/75
                    "
                  >
                    Volume
                  </span>

                  <button
                    type="button"
                    aria-label="Close volume control"
                    title="Close"
                    onPointerDown={(event) => {
                      event.stopPropagation()
                    }}
                    onClick={(event) => {
                      event.stopPropagation()
                      setVolumeOpen(false)
                      notifyInteraction()
                    }}
                    className="
                      flex
                      h-7
                      w-7
                      touch-manipulation
                      items-center
                      justify-center
                      rounded-full
                      text-white/60
                      transition-all
                      duration-150
                      hover:bg-white/10
                      hover:text-white
                      active:scale-90
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-white/70
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[15px] w-[15px]"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 6L18 18M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* ---------------------------------------------------------- */}
                {/* COMPACT VOLUME ROW                                         */}
                {/* ---------------------------------------------------------- */}

                <div
                  className="
                    flex
                    items-center
                    gap-2.5
                  "
                >
                  <button
                    type="button"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleMute()
                      notifyInteraction()
                    }}
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      touch-manipulation
                      items-center
                      justify-center
                      rounded-lg
                      text-white
                      transition-all
                      duration-150
                      hover:bg-white/10
                      active:scale-90
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-white/70
                    "
                  >
                    <span className="scale-[0.8]">
                      {volumeIcon}
                    </span>
                  </button>

                  <input
                    ref={volumeSliderRef}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : safeVolume}
                    onChange={handleVolumeChange}
                    onKeyDown={handleVolumeKeyDown}
                    aria-label="Volume"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(volumePercent)}
                    className="
                      h-[3px]
                      min-w-0
                      flex-1
                      cursor-pointer
                      touch-manipulation
                      appearance-none
                      rounded-full
                      accent-white
                    "
                    style={{
                      background:
                        `linear-gradient(
                          to right,
                          #ffffff 0%,
                          #ffffff ${volumePercent}%,
                          rgba(255,255,255,.25) ${volumePercent}%,
                          rgba(255,255,255,.25) 100%
                        )`,
                    }}
                  />

                  <span
                    className="
                      w-7
                      shrink-0
                      text-right
                      text-[10px]
                      font-medium
                      tabular-nums
                      text-white/55
                    "
                  >
                    {Math.round(volumePercent)}
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* DESKTOP VOLUME SLIDER                                       */}
            {/* ========================================================== */}

            {!isTouchDevice && (
              <div
                className="
                  absolute
                  left-11
                  top-1/2
                  hidden
                  h-10
                  w-20
                  -translate-y-1/2
                  items-center
                  md:flex
                "
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={
                    isMuted
                      ? 0
                      : safeVolume
                  }
                  onChange={
                    handleVolumeChange
                  }
                  onKeyDown={
                    handleVolumeKeyDown
                  }
                  aria-label="Volume"
                  className="
                    h-1
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-full
                    accent-white
                  "
                  style={{
                    background:
                      `linear-gradient(
                        to right,
                        #ffffff 0%,
                        #ffffff ${volumePercent}%,
                        rgba(255,255,255,.25) ${volumePercent}%,
                        rgba(255,255,255,.25) 100%
                      )`,
                  }}
                />
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* TIME                                                           */}
          {/* ============================================================ */}

          <div
            className="
              flex
              items-center
              whitespace-nowrap
              text-[13px]
              font-medium
              leading-none
              tabular-nums
              text-white
            "
            aria-label={`Current time ${formatTime(
              safeCurrentTime,
            )} of ${formatTime(
              safeDuration,
            )}`}
          >
            <span>
              {formatTime(
                safeCurrentTime,
              )}
            </span>

            <span
              className="
                mx-1.5
                text-white/40
              "
            >
              /
            </span>

            <span
              className="
                text-white/65
              "
            >
              {formatTime(
                safeDuration,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}