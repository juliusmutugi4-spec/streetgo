'use client'

interface ThreeImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function ThreeImage({
  imageUrls,
  openImage,
}: ThreeImageProps) {
  if (
    !Array.isArray(imageUrls) ||
    imageUrls.length < 3
  ) {
    return null
  }

  const firstImage = imageUrls[0]?.trim()
  const secondImage = imageUrls[1]?.trim()
  const thirdImage = imageUrls[2]?.trim()

  if (
    !firstImage ||
    !secondImage ||
    !thirdImage
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
      <div
        className="
          grid
          w-full
          grid-cols-3
          gap-1
          aspect-[4/3]
          bg-[var(--surface)]
        "
      >
        {/* =================================================
            IMAGE 1 — MAIN
            ================================================= */}

        <button
          type="button"
          onClick={() => openImage(0)}
          aria-label="Open image 1"
          className="
            group
            relative
            col-span-2
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
            RIGHT COLUMN
            ================================================= */}

        <div
          className="
            col-span-1
            grid
            min-w-0
            grid-rows-2
            gap-1
          "
        >
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
              min-h-0
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

          {/* =================================================
              IMAGE 3
              ================================================= */}

          <button
            type="button"
            onClick={() => openImage(2)}
            aria-label="Open image 3"
            className="
              group
              relative
              min-h-0
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
              src={thirdImage}
              alt="Post image 3"
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
    </div>
  )
}