'use client'

import React from 'react'
import {
  Heart,
  MessageCircle,
  Bookmark,
} from 'lucide-react'

interface ImageViewerActionsProps {
  imageUrls: string[]
  currentImage: number
  imageLikes: number[]
  imageCommentCounts: number[]

  isLiked?: boolean
  isSaved?: boolean

  toggleImageLike: () => void
  toggleImageSave?: () => void

  setShowImageComments: (show: boolean) => void
}

/*
 * =========================================================
 * FORMAT SOCIAL STATISTICS
 * =========================================================
 */

const formatStat = (num: number): string => {
  if (!num) {
    return '0'
  }

  if (num >= 1000000) {
    return `${(num / 1000000)
      .toFixed(1)
      .replace(/\.0$/, '')}m`
  }

  if (num >= 1000) {
    return `${(num / 1000)
      .toFixed(1)
      .replace(/\.0$/, '')}k`
  }

  return num.toString()
}

export default function ImageViewerActions({
  imageUrls,
  currentImage,
  imageLikes,
  imageCommentCounts,
  isLiked = false,
  isSaved = false,
  toggleImageLike,
  toggleImageSave,
  setShowImageComments,
}: ImageViewerActionsProps) {

  /*
   * =========================================================
   * EMPTY
   * =========================================================
   */

  if (!imageUrls || imageUrls.length === 0) {
    return null
  }

  /*
   * =========================================================
   * SINGLE IMAGE
   *
   * Facebook-style:
   * Do not show the image action bar for a single image.
   * =========================================================
   */

  if (imageUrls.length === 1) {
    return null
  }

  /*
   * =========================================================
   * CURRENT IMAGE STATS
   * =========================================================
   */

  const currentLikes =
    imageLikes?.[currentImage] || 0

  const currentComments =
    imageCommentCounts?.[currentImage] || 0

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <footer
      className="
        absolute
        bottom-0
        inset-x-0
        z-40
        flex
        items-center
        justify-center
        gap-6
        sm:gap-10
        px-6
        py-6
        bg-gradient-to-t
        from-black/90
        via-black/40
        to-transparent
        select-none
        pointer-events-none
      "
      aria-label="Image actions panel"
    >

      {/* =====================================================
          LIKE
          ===================================================== */}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          toggleImageLike()
        }}
        className={`
          pointer-events-auto
          group
          flex
          items-center
          gap-2.5
          rounded-full
          px-3
          py-2
          transition-all
          duration-200
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/50
          hover:bg-white/10
          ${
            isLiked
              ? 'text-rose-500'
              : 'text-zinc-300 hover:text-rose-400'
          }
        `}
        aria-label={`
          ${isLiked ? 'Unlike' : 'Like'} image.
          Current likes: ${currentLikes}
        `}
      >
        <Heart
          size={22}
          strokeWidth={2}
          className={`
            transition-transform
            duration-200
            group-active:scale-90
            ${
              isLiked
                ? 'fill-current'
                : ''
            }
          `}
        />

        <span
          className="
            text-sm
            font-medium
            tracking-wide
          "
        >
          {formatStat(currentLikes)}
        </span>
      </button>

      {/* =====================================================
          COMMENTS
          ===================================================== */}
<button
  type="button"
  onClick={(e) => {
    e.preventDefault()
    e.stopPropagation()

    console.log('COMMENT BUTTON CLICKED')

    setShowImageComments(true)
  }}
  className="
    group
    flex
    items-center
    gap-2.5
    rounded-full
    px-3
    py-2
    text-zinc-300
    hover:bg-white/10
    hover:text-sky-400
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-white/50
    transition-all
    duration-200
  "
  aria-label={`View comments. Current comments: ${currentComments}`}
>
  <MessageCircle
    size={22}
    className="
      transition-transform
      duration-200
      group-active:scale-95
    "
  />

  <span className="text-sm font-medium tracking-wide">
    {formatStat(currentComments)}
  </span>
</button>
      {/* =====================================================
          SAVE
          ===================================================== */}

      {toggleImageSave && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            toggleImageSave()
          }}
          className={`
            pointer-events-auto
            group
            flex
            items-center
            gap-2.5
            rounded-full
            px-3
            py-2
            transition-all
            duration-200
            hover:bg-white/10
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-white/50
            ${
              isSaved
                ? 'text-emerald-500'
                : 'text-zinc-300 hover:text-emerald-400'
            }
          `}
          aria-label={
            isSaved
              ? 'Remove from saved'
              : 'Save image'
          }
        >
          <Bookmark
            size={22}
            strokeWidth={2}
            className={`
              transition-transform
              duration-200
              group-active:scale-90
              ${
                isSaved
                  ? 'fill-current'
                  : ''
              }
            `}
          />

          <span
            className="
              text-sm
              font-medium
              tracking-wide
            "
          >
            {isSaved
              ? 'Saved'
              : 'Save'}
          </span>
        </button>
      )}

    </footer>
  )
}