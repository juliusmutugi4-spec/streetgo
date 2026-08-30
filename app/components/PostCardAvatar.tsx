'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import StreetAI from './StreetAI'

interface PostCardAvatarProps {
  avatarUrl?: string | null
  username: string
  showAIBubble: boolean
  viewerCount: number
}

const AVATAR_COLORS = [
  {
    background: 'bg-cyan-500/10',
    text: 'text-cyan-500',
    border: 'border-cyan-500/20',
  },
  {
    background: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
  },
  {
    background: 'bg-violet-500/10',
    text: 'text-violet-500',
    border: 'border-violet-500/20',
  },
  {
    background: 'bg-rose-500/10',
    text: 'text-rose-500',
    border: 'border-rose-500/20',
  },
  {
    background: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
  },
]

export default function PostCardAvatar({
  avatarUrl,
  username,
  showAIBubble,
  viewerCount,
}: PostCardAvatarProps) {
  const [imageError, setImageError] =
    useState(false)

  const name =
    username?.trim() || 'StreetGO'

  /*
   * =====================================================
   * RESET IMAGE ERROR WHEN URL CHANGES
   * =====================================================
   */

  useEffect(() => {
    setImageError(false)
  }, [avatarUrl])

  /*
   * =====================================================
   * DETERMINISTIC FALLBACK COLOR
   * =====================================================
   */

  const avatarTheme = useMemo(() => {
    let hash = 0

    for (
      let index = 0;
      index < name.length;
      index++
    ) {
      hash =
        name.charCodeAt(index) +
        ((hash << 5) - hash)
    }

    const colorIndex =
      Math.abs(hash) %
      AVATAR_COLORS.length

    return AVATAR_COLORS[colorIndex]
  }, [name])

  /*
   * =====================================================
   * INITIAL
   * =====================================================
   */

  const initial =
    name.charAt(0).toUpperCase()

  const showImage =
    Boolean(avatarUrl) &&
    !imageError

  /*
   * =====================================================
   * AVATAR
   * =====================================================
   */

  return (
    <div
      className="
        relative
        flex
        shrink-0
        items-center
      "
    >
      {/* =================================================
          PROFILE AVATAR
          ================================================= */}

      <div
        className="
          relative
          h-10
          w-10
          shrink-0
        "
      >
        <div
          className="
            relative
            h-10
            w-10
            overflow-hidden
            rounded-full
            border
            border-black/10
            bg-[var(--surface-hover)]
            dark:border-white/10
          "
        >
          {showImage ? (
            <img
              src={avatarUrl!}
              alt={`${name}'s avatar`}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="
                block
                h-full
                w-full
                object-cover
                select-none
              "
              onError={() => {
                setImageError(true)
              }}
            />
          ) : (
            <div
              className={`
                flex
                h-full
                w-full
                items-center
                justify-center
                ${avatarTheme.background}
                ${avatarTheme.text}
              `}
            >
              <span
                className="
                  font-sans
                  text-[15px]
                  font-semibold
                  leading-none
                "
              >
                {initial}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          STREET AI
          ================================================= */}

      <StreetAI
        visible={showAIBubble}
        username={name}
        viewerCount={viewerCount}
      />
    </div>
  )
}