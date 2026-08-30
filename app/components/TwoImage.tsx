'use client'

interface TwoImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function TwoImage({
  imageUrls,
  openImage,
}: TwoImageProps) {
  if (
    !Array.isArray(imageUrls) ||
    imageUrls.length < 2
  ) {
    return null
  }

  const firstImage = imageUrls[0]?.trim()
  const secondImage = imageUrls[1]?.trim()

  if (!firstImage || !secondImage) {
    return null
  }

  return (
    <div
      className="
        w-full
        overflow-hidden
        bg-[var(--surface)]
        select-none
      "
    >
      <div
        className="
          grid
          w-full
          grid-cols-2
          gap-1
          bg-[var(--surface)]
        "
      >
        {/* =================================================
            IMAGE 1
            ================================================= */}

        <button
          type="button"
          onClick={() => openImage(0)}
          aria-label="Open image 1"
          className="
            group
            relative
            block
            aspect-square
            min-w-0
            overflow-hidden
            bg-[var(--surface)]
            p-0
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#1877F2]/50
            focus-visible:ring-inset
          "
        >
          <img
            src={firstImage}
            alt="Post image 1"
            loading="lazy"
            decoding="async"
            draggable={false}
            className="
              block
              h-full
              w-full
              object-cover
              select-none
              transition-[filter,transform]
              duration-200
              ease-out
              group-hover:scale-[1.01]
              group-hover:brightness-[0.97]
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/0
              transition-colors
              duration-200
              group-hover:bg-black/[0.025]
            "
          />
        </button>

        {/* =================================================
            IMAGE 2
            ================================================= */}

        <button
          type="button"
          onClick={() => openImage(1)}
          aria-label="Open image 2"
          className="
            group
            relative
            block
            aspect-square
            min-w-0
            overflow-hidden
            bg-[var(--surface)]
            p-0
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#1877F2]/50
            focus-visible:ring-inset
          "
        >
          <img
            src={secondImage}
            alt="Post image 2"
            loading="lazy"
            decoding="async"
            draggable={false}
            className="
              block
              h-full
              w-full
              object-cover
              select-none
              transition-[filter,transform]
              duration-200
              ease-out
              group-hover:scale-[1.01]
              group-hover:brightness-[0.97]
            "
          />

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-black/0
              transition-colors
              duration-200
              group-hover:bg-black/[0.025]
            "
          />
        </button>
      </div>
    </div>
  )
}