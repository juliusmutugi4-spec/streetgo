'use client'
import ImageViewerHeader from "./ImageViewerHeader"
import ImageViewerImage from "./ImageViewerImage"
import ImageViewerActions from "./ImageViewerActions"
import ImageViewerComments from "./ImageViewerComments"
import {
  Heart,
  MessageCircle,
  Bookmark,
} from "lucide-react"

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

  if (!show) return null

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[99999]
        bg-black/95
        flex
        items-center
        justify-center
      "
    >

<ImageViewerHeader
  username={username}
  avatarUrl={avatarUrl}
  currentImage={currentImage}
  imageUrls={imageUrls}
  onClose={onClose}
/>
<ImageViewerImage
  imageUrls={imageUrls}
  currentImage={currentImage}
  setCurrentImage={setCurrentImage}
/>

<ImageViewerActions
  imageUrls={imageUrls}
  currentImage={currentImage}
  imageLikes={imageLikes}
  imageCommentCounts={imageCommentCounts}
  toggleImageLike={toggleImageLike}
  setShowImageComments={setShowImageComments}
/>

<ImageViewerComments
  showImageComments={showImageComments}
  setShowImageComments={setShowImageComments}
  imageComments={imageComments}
  imageCommentText={imageCommentText}
  setImageCommentText={setImageCommentText}
  addImageComment={addImageComment}
/>

    </div>
  )
}