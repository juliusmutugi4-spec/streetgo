'use client'

import SingleImage from "./SingleImage"
import TwoImage from "./TwoImage"
import ThreeImage from "./ThreeImage"
import FourImage from "./FourImage"
import MultiImage from "./MultiImage"

interface SmartImageGalleryProps {
  imageUrls: string[]
  currentImage: number
  setCurrentImage: (index: number) => void
  setShowImageViewer: (show: boolean) => void
}

export default function SmartImageGallery({
  imageUrls,
  setCurrentImage,
  setShowImageViewer,
}: SmartImageGalleryProps) {

  if (!imageUrls || imageUrls.length === 0) return null

  const openImage = (index: number) => {
    setCurrentImage(index)
    setShowImageViewer(true)
  }

  if (imageUrls.length === 1) {
    return (
      <SingleImage
        imageUrls={imageUrls}
        openImage={openImage}
      />
    )
  }

  if (imageUrls.length === 2) {
    return (
      <TwoImage
        imageUrls={imageUrls}
        openImage={openImage}
      />
    )
  }

  if (imageUrls.length === 3) {
    return (
      <ThreeImage
        imageUrls={imageUrls}
        openImage={openImage}
      />
    )
  }

  if (imageUrls.length === 4) {
    return (
      <FourImage
        imageUrls={imageUrls}
        openImage={openImage}
      />
    )
  }

  return (
    <MultiImage
      imageUrls={imageUrls}
      openImage={openImage}
    />
  )
}