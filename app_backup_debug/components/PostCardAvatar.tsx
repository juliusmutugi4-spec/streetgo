'use client'

import {
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react'

import type { MouseEvent } from 'react'

import StreetAI from './StreetAI'

interface PostCardAvatarProps {
  avatarUrl?: string | null
  username: string
  showAIBubble: boolean
  viewerCount: number
}

// Fixed core tint definitions
const CHROMATIC_PALETTES = [
  {
    id: 'cyan',
    base: '34, 211, 238',
    text: 'text-cyan-400 dark:text-cyan-300',
  },
  {
    id: 'fuchsia',
    base: '240, 70, 247',
    text: 'text-fuchsia-400 dark:text-fuchsia-300',
  },
  {
    id: 'emerald',
    base: '16, 185, 129',
    text: 'text-emerald-400 dark:text-emerald-300',
  },
  {
    id: 'rose',
    base: '244, 63, 94',
    text: 'text-rose-400 dark:text-rose-300',
  },
  {
    id: 'amber',
    base: '251, 191, 36',
    text: 'text-amber-400 dark:text-amber-300',
  },
]

export default function PostCardAvatar({
  avatarUrl,
  username,
  showAIBubble,
  viewerCount,
}: PostCardAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [imageError, setImageError] = useState(false)
  const [isLowPower, setIsLowPower] = useState(false)

  const [coords, setCoords] = useState({
    x: 0,
    y: 0,
  })

  const nameString = username || 'StreetGO'

  /*
   * LOW POWER DETECTION
   *
   * Detect:
   * - Save-Data mode
   * - Slow connection
   * - Reduced motion preference
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean
          effectiveType?: string
        }
      }
    ).connection

    const isSlowConnection =
      connection?.saveData === true ||
      /^(2g|3g)$/.test(connection?.effectiveType || '')

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

    setIsLowPower(
      isSlowConnection || prefersReducedMotion
    )
  }, [])

  /*
   * RESET IMAGE ERROR
   *
   * Important when the avatar URL changes.
   */
  useEffect(() => {
    setImageError(false)
  }, [avatarUrl])

  /*
   * CREATE DETERMINISTIC USER COLOR
   *
   * Same username = same color.
   */
  const { palette, initial } = useMemo(() => {
    let hash = 0

    for (let i = 0; i < nameString.length; i++) {
      hash =
        nameString.charCodeAt(i) +
        ((hash << 5) - hash)
    }

    const index =
      Math.abs(hash) % CHROMATIC_PALETTES.length

    return {
      palette: CHROMATIC_PALETTES[index],
      initial: nameString
        .charAt(0)
        .toUpperCase(),
    }
  }, [nameString])

  /*
   * 3D MICRO-TILT
   */
  const handleMouseMove = (
    e: MouseEvent<HTMLDivElement>
  ) => {
    if (
      isLowPower ||
      !containerRef.current
    ) {
      return
    }

    const rect =
      containerRef.current.getBoundingClientRect()

    if (!rect.width || !rect.height) {
      return
    }

    const x =
      (e.clientX - rect.left) /
        rect.width -
      0.5

    const y =
      (e.clientY - rect.top) /
        rect.height -
      0.5

    setCoords({
      x: x * 15,
      y: y * -15,
    })
  }

  /*
   * RESET TILT
   */
  const handleMouseLeave = () => {
    setCoords({
      x: 0,
      y: 0,
    })
  }

  /*
   * ONLY SHOW IMAGE WHEN:
   *
   * 1. URL exists
   * 2. Image hasn't failed
   */
  const displayImage =
    Boolean(avatarUrl) && !imageError

  return (
    <div className="relative inline-flex items-center gap-3 select-none">

      {/* AVATAR INTERACTION CONTAINER */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="
          relative
          group
          shrink-0
          cursor-pointer
          touch-none
          will-change-transform
        "
        style={{
          perspective: '1000px',

          transform: `
            rotateX(${coords.y}deg)
            rotateY(${coords.x}deg)
          `,

          transition:
            coords.x === 0 && coords.y === 0
              ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              : 'none',
        }}
      >

        {/* DYNAMIC SHADOW / GLOW */}
        <div
          className="
            absolute
            inset-0
            rounded-full
            opacity-30
            group-hover:opacity-80
            transition-opacity
            duration-500
            blur-xl
            scale-95
            pointer-events-none
          "
          style={{
            backgroundColor:
              `rgba(${palette.base}, 0.4)`,

            boxShadow:
              `0 0 32px 8px rgba(${palette.base}, 0.3)`,

            transform:
              `translate3d(
                ${coords.x * 0.4}px,
                ${coords.y * -0.4}px,
                -10px
              )`,
          }}
        />

        {/* OUTER TECHNOLOGY RING */}
        <div
          className="
            relative
            h-11
            w-11
            rounded-full
            p-[1.5px]
            transition-all
            duration-500
            ease-out
          "
          style={{
            backgroundImage:
              `linear-gradient(
                to bottom right,
                rgba(${palette.base}, 0.8),
                rgba(${palette.base}, 0.1),
                rgba(${palette.base}, 0.8)
              )`,
          }}
        >

          {/* MAIN AVATAR FRAME */}
          <div
            className="
              relative
              h-full
              w-full
              overflow-hidden
              rounded-full
              bg-slate-950
              dark:bg-zinc-950
              backdrop-blur-xl
              border
              border-white/[0.08]
              shadow-inner
            "
          >

            {/* HOLOGRAPHIC LASER */}
            {!isLowPower && (
              <div
                className="
                  absolute
                  inset-0
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                  duration-500
                  pointer-events-none
                  z-20
                "
              >
                <div
                  className="
                    absolute
                    inset-y-0
                    -left-[100%]
                    w-[50%]
                    skew-x-12
                    bg-gradient-to-r
                    from-transparent
                    via-white/20
                    to-transparent
                    group-hover:animate-[shimmer_1.2s_ease-in-out_infinite]
                  "
                />
              </div>
            )}

            {/* AVATAR IMAGE */}
            {displayImage ? (
              <img
                src={avatarUrl!}
                alt={nameString}
                loading="lazy"
                decoding="async"
                className="
                  h-full
                  w-full
                  object-cover
                  transition-all
                  duration-700
                  ease-out
                  scale-100
                  group-hover:scale-110
                  contrast-[1.02]
                  brightness-95
                  group-hover:brightness-105
                "
                onError={() => {
                  setImageError(true)
                }}
              />
            ) : null}

            {/* FALLBACK INITIAL */}
            <div
              className={`
                absolute
                inset-0
                flex
                items-center
                justify-center
                ${palette.text}
                font-black
                text-sm
                tracking-tight
                font-mono
                transition-opacity
                duration-300
                ${
                  displayImage
                    ? 'opacity-0 pointer-events-none'
                    : 'opacity-100'
                }
              `}
              style={{
                backgroundImage:
                  `linear-gradient(
                    to bottom,
                    rgba(${palette.base}, 0.15),
                    rgba(${palette.base}, 0.02)
                  )`,
              }}
            >

              {/* INITIAL */}
              <span
                className="
                  relative
                  z-10
                  drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]
                "
              >
                {initial}
              </span>

              {/* TOP RIGHT TARGET */}
              <div
                className="
                  absolute
                  top-1.5
                  right-1.5
                  h-[3px]
                  w-[3px]
                  rounded-full
                "
                style={{
                  backgroundColor:
                    `rgb(${palette.base})`,
                }}
              />

              {/* BOTTOM LEFT TARGET */}
              <div
                className="
                  absolute
                  bottom-1.5
                  left-1.5
                  h-[3px]
                  w-[3px]
                  rounded-full
                "
                style={{
                  backgroundColor:
                    `rgb(${palette.base})`,
                }}
              />

              {/* TECHNICAL CIRCLE */}
              <div
                className="
                  absolute
                  inset-1
                  border
                  border-dashed
                  border-white/5
                  rounded-full
                  pointer-events-none
                "
              />
            </div>

            {/* LENS REFRACTION */}
            <div
              className="
                absolute
                inset-0
                rounded-full
                ring-1
                ring-inset
                ring-white/10
                pointer-events-none
                mix-blend-overlay
              "
            />

          </div>
        </div>
      </div>

      {/* STREET AI */}
      <StreetAI
        visible={showAIBubble}
        username={username}
        viewerCount={viewerCount}
      />

    </div>
  )
}