'use client'

import React from 'react'
import Image from 'next/image'
import { X, MoreHorizontal } from 'lucide-react'

interface ImageViewerHeaderProps {
  username: string
  avatarUrl: string
  currentImage: number
  imageUrls: string[]
  onClose: () => void
  onMenuClick?: () => void
}

export default function ImageViewerHeader({
  username,
  avatarUrl,
  currentImage,
  imageUrls,
  onClose,
  onMenuClick,
}: ImageViewerHeaderProps) {
  const hasMultipleImages = imageUrls.length > 1

  return (
    <header
      className="
        absolute 
        top-0 
        inset-x-0 
        z-20 
        flex 
        items-center 
        justify-between 
        px-6 
        py-5 
        bg-gradient-to-b 
        from-black/90 
        via-black/40 
        to-transparent 
        select-none
      "
      aria-label="Image viewer header"
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        type="button"
        className="
          p-2 
          -ml-2
          text-zinc-300 
          hover:text-white 
          focus-visible:text-white
          rounded-full 
          hover:bg-white/10 
          focus:outline-none 
          focus-visible:ring-2 
          focus-visible:ring-white/50 
          transition-all 
          duration-200
        "
        aria-label="Close image viewer"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* User Information & Counter */}
      <div className="flex items-center gap-3 framework-user-info">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-zinc-800">
          <Image
            src={avatarUrl || '/placeholder-avatar.png'}
            alt={`${username}'s avatar`}
            fill
            sizes="40px"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-medium text-white tracking-wide">
            {username}
          </span>
          {hasMultipleImages && (
            <span className="text-xs text-zinc-400 font-normal mt-0.5">
              {currentImage + 1} / {imageUrls.length}
            </span>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onMenuClick?.()
        }}
        type="button"
        className="
          p-2 
          -mr-2
          text-zinc-300 
          hover:text-white 
          focus-visible:text-white
          rounded-full 
          hover:bg-white/10 
          focus:outline-none 
          focus-visible:ring-2 
          focus-visible:ring-white/50 
          transition-all 
          duration-200
          disabled:opacity-50
        "
        aria-label="More options"
        disabled={!onMenuClick}
      >
        <MoreHorizontal className="h-6 w-6" aria-hidden="true" />
      </button>
    </header>
  )
}
