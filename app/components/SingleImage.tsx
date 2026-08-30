'use client'

import Image from 'next/image'

interface SingleImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function SingleImage({
  imageUrls,
  openImage,
}: SingleImageProps) {
  if (
    !Array.isArray(imageUrls) ||
    imageUrls.length === 0
  ) {
    return null
  }

  const imageUrl =
    imageUrls[0]?.trim()

  if (!imageUrl) {
    return null
  }

  return (
    <div
      className="
        relative
        w-full
        overflow-hidden
        bg-[var(--surface)]
      "
    >
      <button
        type="button"
        onClick={() => openImage(0)}
        aria-label="Open image"
        className="
          relative
          block
          w-full
          cursor-pointer
          border-0
          bg-transparent
          p-0
          text-left
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#1877F2]/50
          focus-visible:ring-inset
        "
      >
        <Image
          src={imageUrl}
          alt="Post image"
          width={1200}
          height={1200}
          sizes="
            (max-width: 640px) 100vw,
            (max-width: 1024px) 720px,
            854px
          "
          loading="lazy"
          className="
            block
            h-auto
            w-full
            max-h-[850px]
            object-contain
            select-none
            transition-[filter]
            duration-200
            hover:brightness-[0.97]
          "
          draggable={false}
        />
      </button>
    </div>
  )
}