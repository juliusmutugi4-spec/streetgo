'use client'

import React, { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageViewerImageProps {
  imageUrls: string[]
  currentImage: number
  setCurrentImage: (index: number) => void
}

export default function ImageViewerImage({
  imageUrls,
  currentImage,
  setCurrentImage,
}: ImageViewerImageProps) {
  const totalImages = imageUrls.length
  const hasMultipleImages = totalImages > 1

  // Handle navigation calculations safely
  const handlePrevious = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!hasMultipleImages) return
    setCurrentImage((currentImage - 1 + totalImages) % totalImages)
  }, [currentImage, totalImages, hasMultipleImages, setCurrentImage])

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!hasMultipleImages) return
    setCurrentImage((currentImage + 1) % totalImages)
  }, [currentImage, totalImages, hasMultipleImages, setCurrentImage])

  // Bind keyboard arrow keys for a premium user experience
  useEffect(() => {
    if (!hasMultipleImages) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevious, handleNext, hasMultipleImages])

  if (!imageUrls || totalImages === 0) {
    return (
      <div className="text-zinc-500 text-sm font-medium">
        No image available
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center select-none px-4">
      
      {/* Navigation: Left Button */}
      {hasMultipleImages && (
        <button
          onClick={handlePrevious}
          type="button"
          className="
            absolute
            left-6
            z-30
            flex
            h-12
            w-12
            items-center
            justify-center
            text-zinc-300
            hover:text-white
            focus-visible:text-white
            bg-black/30
            hover:bg-black/60
            backdrop-blur-sm
            rounded-full
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-white/50
            transition-all
            duration-200
          "
          aria-label="Previous image"
        >
          <ChevronLeft className="h-7 w-7" aria-hidden="true" />
        </button>
      )}

      {/* Main Image Container */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative max-w-[95vw] w-full max-h-[80vh] h-full"
      >
        <Image
          src={imageUrls[currentImage]}
          alt={`Viewer image ${currentImage + 1} of ${totalImages}`}
          fill
          sizes="95vw"
          className="object-contain transition-opacity duration-300 ease-in-out"
          priority
          unoptimized // Keeps original formatting/quality for photography apps
        />
      </div>

      {/* Navigation: Right Button */}
      {hasMultipleImages && (
        <button
          onClick={handleNext}
          type="button"
          className="
            absolute
            right-6
            z-30
            flex
            h-12
            w-12
            items-center
            justify-center
            text-zinc-300
            hover:text-white
            focus-visible:text-white
            bg-black/30
            hover:bg-black/60
            backdrop-blur-sm
            rounded-full
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-white/50
            transition-all
            duration-200
          "
          aria-label="Next image"
        >
          <ChevronRight className="h-7 w-7" aria-hidden="true" />
        </button>
      )}

    </div>
  )
}
