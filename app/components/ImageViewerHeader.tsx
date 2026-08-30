'use client'

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
  return (
    <header
      className="
        absolute
        inset-x-0
        top-0
        z-50
        flex
        items-center
        justify-between
        px-4
        py-4
        sm:px-6
        sm:py-5
        bg-gradient-to-b
        from-black/90
        via-black/50
        to-transparent
        select-none
        pointer-events-none
      "
      aria-label="Image viewer header"
    >
      {/* =====================================================
          CLOSE
          ===================================================== */}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        aria-label="Close image viewer"
        className="
          pointer-events-auto
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-white
          transition-all
          duration-200
          hover:bg-white/10
          hover:scale-105
          active:scale-95
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/60
        "
      >
        <X
          className="h-6 w-6"
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>

      {/* =====================================================
          USER INFORMATION
          ===================================================== */}

      <div
        className="
          pointer-events-auto
          flex
          min-w-0
          max-w-[60%]
          items-center
          gap-3
        "
      >
        {/* Avatar */}

        <div
          className="
            relative
            h-9
            w-9
            shrink-0
            overflow-hidden
            rounded-full
            border
            border-white/20
            bg-zinc-800
            sm:h-10
            sm:w-10
          "
        >
          <Image
            src={
              avatarUrl ||
              '/placeholder-avatar.png'
            }
            alt={`${username}'s avatar`}
            fill
            sizes="40px"
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Name */}

        <div className="min-w-0">
          <div
            className="
              truncate
              text-sm
              font-semibold
              tracking-tight
              text-white
            "
          >
            {username}
          </div>

          {/* Counter */}

          {imageUrls.length > 1 && (
            <div
              className="
                mt-0.5
                text-[11px]
                font-medium
                text-zinc-400
              "
            >
              {currentImage + 1} of {imageUrls.length}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MORE MENU
          ===================================================== */}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onMenuClick?.()
        }}
        disabled={!onMenuClick}
        aria-label="More options"
        className="
          pointer-events-auto
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-white
          transition-all
          duration-200
          hover:bg-white/10
          hover:scale-105
          active:scale-95
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-white/60
          disabled:pointer-events-none
          disabled:opacity-40
        "
      >
        <MoreHorizontal
          className="h-6 w-6"
          strokeWidth={2}
          aria-hidden="true"
        />
      </button>
    </header>
  )
}