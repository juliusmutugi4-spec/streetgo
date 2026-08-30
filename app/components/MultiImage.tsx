'use client'

interface MultiImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function MultiImage({
  imageUrls,
  openImage,
}: MultiImageProps) {
  if (
    !Array.isArray(imageUrls) ||
    imageUrls.length < 5
  ) {
    return null
  }

  const images = imageUrls
    .slice(0, 5)
    .map((url) => url?.trim())

  if (images.some((url) => !url)) {
    return null
  }

  const remaining =
    Math.max(imageUrls.length - 5, 0)

  /*
   * =====================================================
   * IMAGE TILE
   * =====================================================
   */

  const tileClassName = `
    group
    relative
    block
    min-w-0
    overflow-hidden
    bg-[var(--surface)]
    p-0
    focus:outline-none
    focus-visible:ring-2
    focus-visible:ring-[#1877F2]/50
    focus-visible:ring-inset
  `

  const imageClassName = `
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
  `

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
          TOP ROW — 2 IMAGES
          ================================================= */}

      <div
        className="
          grid
          w-full
          grid-cols-2
          gap-1
          bg-[var(--surface)]
        "
      >
        {images
          .slice(0, 2)
          .map((url, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                openImage(index)
              }
              aria-label={`Open image ${
                index + 1
              }`}
              className={`
                ${tileClassName}
                aspect-[4/3]
              `}
            >
              <img
                src={url}
                alt={`Post image ${
                  index + 1
                }`}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={
                  imageClassName
                }
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
          ))}
      </div>

      {/* =================================================
          BOTTOM ROW — 3 IMAGES
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
        {images
          .slice(2, 5)
          .map((url, index) => {
            const actualIndex =
              index + 2

            const isLastVisible =
              actualIndex === 4

            return (
              <button
                key={actualIndex}
                type="button"
                onClick={() =>
                  openImage(
                    actualIndex
                  )
                }
                aria-label={
                  isLastVisible &&
                  remaining > 0
                    ? `Open image 5 and ${remaining} more images`
                    : `Open image ${
                        actualIndex + 1
                      }`
                }
                className={`
                  ${tileClassName}
                  aspect-square
                `}
              >
                <img
                  src={url}
                  alt={`Post image ${
                    actualIndex + 1
                  }`}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className={
                    imageClassName
                  }
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

                {/* =======================================
                    MORE IMAGES
                    ======================================= */}

                {isLastVisible &&
                  remaining > 0 && (
                    <span
                      className="
                        pointer-events-none
                        absolute
                        inset-0
                        z-20
                        flex
                        items-center
                        justify-center
                        bg-black/55
                        transition-colors
                        duration-200
                        group-hover:bg-black/45
                      "
                    >
                      <span
                        className="
                          font-sans
                          text-2xl
                          font-semibold
                          leading-none
                          tracking-tight
                          text-white
                          drop-shadow-sm
                          sm:text-3xl
                        "
                      >
                        +{remaining}
                      </span>
                    </span>
                  )}
              </button>
            )
          })}
      </div>
    </div>
  )
}