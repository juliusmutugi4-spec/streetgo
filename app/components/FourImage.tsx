'use client'

interface FourImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function FourImage({
  imageUrls,
  openImage,
}: FourImageProps) {
  if (
    !Array.isArray(imageUrls) ||
    imageUrls.length < 4
  ) {
    return null
  }

  const images = imageUrls
    .slice(0, 4)
    .map((url) => url?.trim())
  
  if (
    images.some((url) => !url)
  ) {
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
      {/* =================================================
          FEATURE IMAGE
          ================================================= */}

      <button
        type="button"
        onClick={() => openImage(0)}
        aria-label="Open image 1"
        className="
          group
          relative
          block
          w-full
          aspect-[16/9]
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
          src={images[0]}
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
          THREE LOWER IMAGES
          ================================================= */}

      <div
        className="
          grid
          w-full
          grid-cols-3
          gap-1
          bg-[var(--surface)]
        "
      >
        {images.slice(1, 4).map(
          (url, index) => {
            const actualIndex =
              index + 1

            return (
              <button
                key={actualIndex}
                type="button"
                onClick={() =>
                  openImage(
                    actualIndex
                  )
                }
                aria-label={`Open image ${
                  actualIndex + 1
                }`}
                className="
                  group
                  relative
                  block
                  min-w-0
                  aspect-square
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
                  src={url}
                  alt={`Post image ${
                    actualIndex + 1
                  }`}
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
            )
          }
        )}
      </div>
    </div>
  )
}