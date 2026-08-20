'use client'

import ImageViewer from './ImageViewer'

interface PostCardViewerProps {
  showImageViewer: boolean
  imageUrls: string[]
  currentImage: number
  setCurrentImage: (index: number) => void
  username: string
  avatarUrl: string

  onClose: () => void

  showImageComments: boolean
  setShowImageComments: (show: boolean) => void

  imageLikes: number[]
  imageCommentCounts: number[]

  toggleImageLike: () => void
  isImageLiked: boolean

  imageComments: any[]
  imageCommentText: string
  setImageCommentText: (text: string) => void

  addImageComment: () => void
}

export default function PostCardViewer({
  showImageViewer,
  imageUrls,
  currentImage,
  setCurrentImage,
  username,
  avatarUrl,
  onClose,
  showImageComments,
  setShowImageComments,
  imageLikes,
  imageCommentCounts,
  toggleImageLike,
  isImageLiked,
  imageComments,
  imageCommentText,
  setImageCommentText,
  addImageComment,
}: PostCardViewerProps) {
  return (
    <ImageViewer
      show={showImageViewer}
      imageUrls={imageUrls}
      currentImage={currentImage}
      setCurrentImage={setCurrentImage}
      username={username}
      avatarUrl={avatarUrl}
      onClose={onClose}
      showImageComments={showImageComments}
      setShowImageComments={setShowImageComments}
      imageLikes={imageLikes}
      imageCommentCounts={imageCommentCounts}
      toggleImageLike={toggleImageLike}
      isImageLiked={isImageLiked}
      imageComments={imageComments}
      imageCommentText={imageCommentText}
      setImageCommentText={setImageCommentText}
      addImageComment={addImageComment}
    />
  )
}