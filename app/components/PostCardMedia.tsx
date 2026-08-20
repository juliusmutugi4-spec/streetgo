'use client'

import SmartImageGallery from './SmartImageGallery'
import PostVideo from './PostVideo'

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
  return (
    <>
      {imageUrls.length > 0 && (
        <SmartImageGallery
          imageUrls={imageUrls}
          currentImage={currentImage}
          setCurrentImage={setCurrentImage}
          setShowImageViewer={setShowImageViewer}
          onOpenImageViewer={onOpenImageViewer}
        />
      )}

      {post?.video_url && (
        <PostVideo post={post} />
      )}
    </>
  )
}