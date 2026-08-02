'use client'

import React from 'react'
import { Heart, MessageCircle, Bookmark } from 'lucide-react'

interface ImageViewerActionsProps {
  imageUrls: string[]
  currentImage: number
  imageLikes: number[]
  imageCommentCounts: number[]
  isLiked?: boolean // Track active states professionally
  isSaved?: boolean
  toggleImageLike: () => void
  toggleImageSave?: () => void
  setShowImageComments: (show: boolean) => void
}

// Optional utility helper to format large social stats cleanly (e.g., 1.2k)
const formatStat = (num: number): string => {
  if (!num) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}m`
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`
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
  
  if (!imageUrls || imageUrls.length === 0) return null

  const currentLikes = imageLikes[currentImage] || 0
  const currentComments = imageCommentCounts[currentImage] || 0

  return (
    <footer
      className="
        absolute
        bottom-0
        inset-x-0
        z-20
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
      "
      aria-label="Image actions panel"
    >
      {/* Like Action */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleImageLike()
        }}
        type="button"
        className={`
          group
          flex
          items-center
          gap-2.5
          px-3
          py-2
          rounded-full
          hover:bg-white/10
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/50
          transition-all
          duration-200
          ${isLiked ? 'text-rose-500' : 'text-zinc-300 hover:text-rose-400'}
        `}
        aria-label={`${isLiked ? 'Unlike' : 'Like'} image. Current likes: ${currentLikes}`}
      >
        <Heart 
          size={22} 
          className={`transition-transform duration-200 group-active:scale-90 ${isLiked ? 'fill-current' : ''}`}
        />
        <span className="text-sm font-medium tracking-wide">
          {formatStat(currentLikes)}
        </span>
      </button>

      {/* Comments Action */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowImageComments(true)
        }}
        type="button"
        className="
          group
          flex
          items-center
          gap-2.5
          px-3
          py-2
          text-zinc-300
          hover:text-sky-400
          rounded-full
          hover:bg-white/10
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/50
          transition-all
          duration-200
        "
        aria-label={`View comments. Current comments: ${currentComments}`}
      >
        <MessageCircle size={22} className="transition-transform duration-200 group-active:scale-95" />
        <span className="text-sm font-medium tracking-wide">
          {formatStat(currentComments)}
        </span>
      </button>

      {/* Bookmark Action */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          toggleImageSave?.()
        }}
        type="button"
        className={`
          group
          flex
          items-center
          gap-2.5
          px-3
          py-2
          rounded-full
          hover:bg-white/10
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/50
          transition-all
          duration-200
          ${isSaved ? 'text-emerald-500' : 'text-zinc-300 hover:text-emerald-400'}
        `}
        aria-label={`${isSaved ? 'Remove from saved' : 'Save'} image`}
      >
        <Bookmark 
          size={22} 
          className={`transition-transform duration-200 group-active:scale-90 ${isSaved ? 'fill-current' : ''}`}
        />
        <span className="text-sm font-medium tracking-wide">
          {isSaved ? 'Saved' : 'Save'}
        </span>
      </button>
    </footer>
  )
}
