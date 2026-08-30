'use client'

import ImageViewerHeader from './ImageViewerHeader'
import ImageViewerImage from './ImageViewerImage'
import ImageViewerActions from './ImageViewerActions'
import ImageViewerComments from './ImageViewerComments'

interface ImageViewerProps {
  show: boolean

  imageUrls: string[]
  currentImage: number
  setCurrentImage: (index: number) => void

  isImageLiked: boolean

  username: string
  avatarUrl: string

  onClose: () => void

  showImageComments: boolean
  setShowImageComments: (show: boolean) => void

  imageLikes: number[]
  imageCommentCounts: number[]

  imageComments: any[]
  imageCommentText: string

  setImageCommentText: (text: string) => void
  addImageComment: () => void

  toggleImageLike: () => void
}

export default function ImageViewer({
  show,
  imageUrls,
  currentImage,
  setCurrentImage,
  isImageLiked,
  username,
  avatarUrl,
  onClose,
  showImageComments,
  setShowImageComments,
  imageLikes,
  imageCommentCounts,
  imageComments,
  imageCommentText,
  setImageCommentText,
  addImageComment,
  toggleImageLike,
}: ImageViewerProps) {
  if (!show) {
    return null
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        bg-black
      "
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      {/* =====================================================
          VIEWER
          ===================================================== */}

      <div
        className="
          relative
          h-full
          w-full
          overflow-hidden
          bg-black
        "
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {/* =================================================
            IMAGE SCROLLER
            ================================================= */}

        <div
          className="
            absolute
            inset-0
          "
        >
          <ImageViewerImage
            imageUrls={imageUrls}
            currentImage={currentImage}
            setCurrentImage={setCurrentImage}
          />
        </div>

        {/* =================================================
            HEADER
            ================================================= */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            z-[700]
          "
        >
          <div className="pointer-events-auto">
            <ImageViewerHeader
              username={username}
              avatarUrl={avatarUrl}
              currentImage={currentImage}
              imageUrls={imageUrls}
              onClose={onClose}
            />
          </div>
        </div>

        {/* =================================================
            BOTTOM ACTIONS
            Hide them while comments are open so the
            comments panel owns the bottom area.
            ================================================= */}

        {!showImageComments && (
          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              z-[650]
            "
          >
            <div className="pointer-events-auto">
              <ImageViewerActions
                imageUrls={imageUrls}
                currentImage={currentImage}
                imageLikes={imageLikes}
                imageCommentCounts={
                  imageCommentCounts
                }
                isLiked={isImageLiked}
                toggleImageLike={
                  toggleImageLike
                }
                setShowImageComments={
                  setShowImageComments
                }
              />
            </div>
          </div>
        )}

        {/* =================================================
            COMMENTS
            ================================================= */}

        {showImageComments && (
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              z-[800]
            "
          >
            <ImageViewerComments
              showImageComments={
                showImageComments
              }
              setShowImageComments={
                setShowImageComments
              }
              imageComments={
                imageComments
              }
              imageCommentText={
                imageCommentText
              }
              setImageCommentText={
                setImageCommentText
              }
              addImageComment={
                addImageComment
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}