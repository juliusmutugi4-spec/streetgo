'use client'

import SmartImageGallery from './SmartImageGallery'
import PostVideo from './PostVideo'
import Viewer from '../live/Viewer'

interface PostCardMediaProps {
  imageUrls: string[]
  currentImage: number
  setCurrentImage: (index: number) => void
  setShowImageViewer: (show: boolean) => void
  onOpenImageViewer?: (index: number) => void
  post: any
}

export default function PostCardMedia({
  imageUrls,
  currentImage,
  setCurrentImage,
  setShowImageViewer,
  onOpenImageViewer,
  post,
}: PostCardMediaProps) {
  /*
   * =====================================================
   * MEDIA TYPE
   * =====================================================
   */

  const isLive =
    post?.is_live === true &&
    Boolean(post?.live_id)

  const hasImages =
    Array.isArray(imageUrls) &&
    imageUrls.length > 0

  const hasVideo =
    !isLive &&
    Boolean(post?.video_url)

  /*
   * =====================================================
   * LIVE VIEWER COUNT
   * =====================================================
   */

  const viewerCount =
    Number(post?.viewer_count ?? 0)

  /*
   * =====================================================
   * NO MEDIA
   * =====================================================
   */

  if (
    !isLive &&
    !hasImages &&
    !hasVideo
  ) {
    return null
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div
      className="
        relative
        w-full
        m-0
        p-0
        overflow-hidden
        bg-[var(--surface)]
        select-none
      "
    >

      {/* =================================================
          LIVE SESSION
          ================================================= */}

      {isLive && (
        <div
          className="
            relative
            w-full
            overflow-hidden
            bg-black
            select-none
          "
        >
          {/* LIVE VIDEO */}

          <div
            className="
              relative
              w-full
              overflow-hidden
              bg-black
            "
          >
            <Viewer
              liveId={post.live_id}
            />
          </div>

          {/* LIVE BADGE */}

          <div
            className="
              pointer-events-none
              absolute
              left-3
              top-3
              z-20
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-red-600
              px-2.5
              py-1
              font-sans
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-md
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-white
                animate-pulse
              "
            />

            <span>
              LIVE
            </span>
          </div>

          {/* VIEWER COUNT */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-3
              right-3
              z-20
              inline-flex
              items-center
              gap-1.5
              rounded-full
              bg-black/65
              px-2.5
              py-1.5
              font-sans
              text-[10px]
              font-semibold
              text-white
              shadow-md
              backdrop-blur-sm
            "
          >
            <span className="text-[11px] opacity-90">
              👁
            </span>

            <span>
              {viewerCount.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* =================================================
          NORMAL IMAGE GALLERY
          ================================================= */}

      {!isLive && hasImages && (
        <SmartImageGallery
          imageUrls={imageUrls}
          currentImage={currentImage}
          setCurrentImage={setCurrentImage}
          setShowImageViewer={
            setShowImageViewer
          }
          onOpenImageViewer={
            onOpenImageViewer
          }
        />
      )}

      {/* =================================================
          NORMAL VIDEO
          ================================================= */}

      {hasVideo && (
        <PostVideo
          post={post}
        />
      )}

    </div>
  )
}