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
  // =====================================================
  // LIVE SESSION
  // =====================================================

  const isLive =
    post?.is_live === true &&
    Boolean(post?.live_id)

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      {/* =================================================
          LIVE WEBRTC VIDEO
          ================================================= */}

      {isLive && (
        <div className="relative w-full overflow-hidden bg-black">

          <Viewer liveId={post.live_id} />

          {/* LIVE BADGE */}

          <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white shadow-lg">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />

            LIVE

          </div>

          {/* VIEWER COUNT */}

          <div className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">

            👁 {post?.viewer_count ?? 0}

          </div>

        </div>
      )}

      {/* =================================================
          NORMAL IMAGES
          ================================================= */}

      {!isLive && imageUrls.length > 0 && (
        <SmartImageGallery
          imageUrls={imageUrls}
          currentImage={currentImage}
          setCurrentImage={setCurrentImage}
          setShowImageViewer={setShowImageViewer}
          onOpenImageViewer={onOpenImageViewer}
        />
      )}

      {/* =================================================
          NORMAL VIDEO
          ================================================= */}

      {!isLive && post?.video_url && (
        <PostVideo post={post} />
      )}
    </>
  )
}