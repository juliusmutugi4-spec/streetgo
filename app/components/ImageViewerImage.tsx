'use client'

import React, {
  useEffect,
  useRef,
} from 'react'

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
  const containerRef =
    useRef<HTMLDivElement | null>(null)

  const imageRefs =
    useRef<Array<HTMLElement | null>>([])

  const totalImages =
    imageUrls.length

  /*
   * =====================================================
   * MOVE TO CURRENT IMAGE
   * =====================================================
   */

  useEffect(() => {
    const container =
      containerRef.current

    if (!container || totalImages === 0) {
      return
    }

    const safeIndex = Math.min(
      Math.max(currentImage, 0),
      totalImages - 1
    )

    const target =
      imageRefs.current[safeIndex]

    if (!target) {
      return
    }

    /*
     * Put the selected image exactly at
     * the top of its own full-screen slide.
     */

    container.scrollTo({
      top:
        target.offsetTop,
      behavior: 'smooth',
    })
  }, [
    currentImage,
    totalImages,
  ])

  /*
   * =====================================================
   * DETECT CURRENT IMAGE WHILE SCROLLING
   * =====================================================
   */

  useEffect(() => {
    const container =
      containerRef.current

    if (!container || totalImages <= 1) {
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          let bestEntry:
            IntersectionObserverEntry | null =
            null

          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue
            }

            if (
              !bestEntry ||
              entry.intersectionRatio >
                bestEntry.intersectionRatio
            ) {
              bestEntry = entry
            }
          }

          if (!bestEntry) {
            return
          }

          const element =
            bestEntry.target as HTMLElement

          const index =
            Number(element.dataset.index)

          if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= totalImages
          ) {
            return
          }

          if (
            index !== currentImage
          ) {
            setCurrentImage(index)
          }
        },
        {
          root: container,
          threshold: [
            0.6,
            0.75,
            0.9,
          ],
        }
      )

    imageRefs.current.forEach(
      (element) => {
        if (element) {
          observer.observe(element)
        }
      }
    )

    return () => {
      observer.disconnect()
    }
  }, [
    totalImages,
    currentImage,
    setCurrentImage,
  ])

  /*
   * =====================================================
   * EMPTY
   * =====================================================
   */

  if (
    !imageUrls ||
    totalImages === 0
  ) {
    return (
      <div
        className="
          absolute
          inset-0
          z-10
          flex
          items-center
          justify-center
          bg-black
          font-['Courier_New']
          text-sm
          text-zinc-400
        "
      >
        No image available
      </div>
    )
  }

  /*
   * =====================================================
   * FULL-SCREEN VERTICAL VIEWER
   * =====================================================
   */

  return (
    <div
      ref={containerRef}
      onClick={(event) => {
        event.stopPropagation()
      }}
      className="
        absolute
        inset-0
        z-10
        h-full
        w-full
        overflow-y-auto
        overflow-x-hidden
        bg-black
        overscroll-contain
        snap-y
        snap-mandatory
        scroll-smooth
        touch-pan-y
      "
      style={{
        WebkitOverflowScrolling:
          'touch',
      }}
    >
      {imageUrls.map(
        (url, index) => {
          const cleanUrl =
            typeof url === 'string'
              ? url.trim()
              : ''

          if (!cleanUrl) {
            return null
          }

          return (
            <section
              key={`${cleanUrl}-${index}`}
              ref={(element) => {
                imageRefs.current[index] =
                  element
              }}
              data-index={index}
              className="
                relative
                flex
                h-screen
                min-h-screen
                w-full
                shrink-0
                snap-start
                snap-always
                items-center
                justify-center
                overflow-hidden
                bg-black
              "
            >
              <img
                src={cleanUrl}
                alt={`Image ${
                  index + 1
                } of ${totalImages}`}
                draggable={false}
                loading={
                  index === currentImage
                    ? 'eager'
                    : 'lazy'
                }
                decoding="async"
                className="
                  block
                  h-auto
                  w-auto
                  max-h-[calc(100vh-7rem)]
                  max-w-full
                  object-contain
                  select-none
                "
                onError={() => {
                  console.error(
                    'IMAGE VIEWER FAILED:',
                    cleanUrl
                  )
                }}
              />
            </section>
          )
        }
      )}

      {/* =================================================
          IMAGE COUNTER
          ================================================= */}

      {totalImages > 1 && (
        <div
          className="
            pointer-events-none
            fixed
            bottom-24
            left-1/2
            z-[100]
            -translate-x-1/2
            rounded-full
            bg-black/70
            px-3
            py-1.5
            font-['Courier_New']
            text-[11px]
            font-bold
            tracking-wide
            text-white
            backdrop-blur-md
          "
        >
          {currentImage + 1}
          {' / '}
          {totalImages}
        </div>
      )}
    </div>
  )
}