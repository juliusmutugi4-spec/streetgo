'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface FourImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function FourImage({
  imageUrls,
  openImage,
}: FourImageProps) {
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})

  if (!imageUrls || imageUrls.length < 4) {
    return (
      <div className="my-6 flex h-[250px] w-full items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 text-xs font-medium text-zinc-500">
        Insufficient images to generate layout grid
      </div>
    )
  }

  const totalCount = imageUrls.length
  // Facebook shows 4 images in this variation. 
  // Remaining text is total items minus the 4 visibly rendered slots.
  const remainingCount = totalCount - 4 

  const handleLoad = (index: number) => {
    setLoadedImages((prev) => ({ ...prev, [index]: true }))
  }

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-zinc-200/10 shadow-lg bg-zinc-950 flex flex-col gap-1 select-none">
      
      {/* 1. Main Top Horizontal Feature Banner */}
      <button
        onClick={() => openImage(0)}
        type="button"
        className="
          group 
          relative 
          block 
          w-full 
          aspect-[16/9] 
          overflow-hidden 
          bg-zinc-900 
          focus:outline-none 
          focus-visible:ring-2 
          focus-visible:ring-cyan-500
          focus-visible:z-10
        "
        aria-label="View full resolution main feature image"
      >
        {!loadedImages[0] && (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer bg-[length:200%_100%]" />
        )}
        
        <div className="absolute inset-0 z-10 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
        
        <Image
          src={imageUrls[0]}
          alt="Main grid feature layout"
          fill
          priority
          sizes="(max-w-md) 100vw, 720px"
          onLoad={() => handleLoad(0)}
          className={`
            object-cover 
            transition-all 
            duration-500 
            ease-out 
            group-hover:scale-[1.015]
            ${loadedImages[0] ? 'opacity-100' : 'opacity-0'}
          `}
        />
      </button>

      {/* 2. Bottom Row Grid */}
      <div className="grid grid-cols-3 gap-1 w-full">
        {imageUrls.slice(1, 4).map((url, idx) => {
          // idx goes: 0, 1, 2
          // actualIndex goes: 1, 2, 3 (Matches the true array index position)
          const actualIndex = idx + 1
          const isLastSlot = actualIndex === 3
          const hasMore = remainingCount > 0

          return (
            <button
              key={actualIndex}
              onClick={() => openImage(actualIndex)}
              type="button"
              className="
                group 
                relative 
                block 
                w-full 
                aspect-square 
                overflow-hidden 
                bg-zinc-900 
                focus:outline-none 
                focus-visible:ring-2 
                focus-visible:ring-cyan-500
                focus-visible:z-10
              "
              aria-label={
                isLastSlot && hasMore 
                  ? `View remaining ${remainingCount} images` 
                  : `View full resolution image ${actualIndex + 1}`
              }
            >
              {!loadedImages[actualIndex] && (
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer bg-[length:200%_100%]" />
              )}

              <div className="absolute inset-0 z-10 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
              
              <Image
                src={url}
                alt={`Grid item column element ${actualIndex + 1}`}
                fill
                sizes="(max-w-sm) 33vw, 240px"
                onLoad={() => handleLoad(actualIndex)}
                className={`
                  object-cover 
                  transition-all 
                  duration-500 
                  ease-out 
                  group-hover:scale-[1.025]
                  ${loadedImages[actualIndex] ? 'opacity-100' : 'opacity-0'}
                `}
                loading="lazy"
              />

              {/* Precise Facebook Style Text Overlap */}
              {isLastSlot && hasMore && (
                <div className="absolute inset-0 z-20 bg-black/60 transition-colors duration-300 group-hover:bg-black/50 flex flex-col items-center justify-center">
                  <span className="text-white text-2xl sm:text-4xl font-bold tracking-wide font-sans">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

    </div>
  )
}
