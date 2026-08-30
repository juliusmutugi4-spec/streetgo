'use client'

import { useCallback } from 'react'

import SingleImage from './SingleImage'
import TwoImage from './TwoImage'
import ThreeImage from './ThreeImage'
import FourImage from './FourImage'
import MultiImage from './MultiImage'

interface SmartImageGalleryProps {
  imageUrls: string[]
  currentImage: number
  setCurrentImage: (index: number) => void
  setShowImageViewer: (show: boolean) => void
  onOpenImageViewer?: (index: number) => void
}

export default function SmartImageGallery({
  imageUrls,
  setCurrentImage,
  setShowImageViewer,
  onOpenImageViewer,
}: SmartImageGalleryProps) {
  /*
   * =====================================================
   * VALIDATE IMAGES
   * =====================================================
   */

  const validImageUrls = imageUrls.filter(
    (url): url is string =>
      typeof url === 'string' &&
      url.trim().length > 0
  )

  if (validImageUrls.length === 0) {
    return null
  }

  /*
   * =====================================================
   * OPEN IMAGE VIEWER
   * =====================================================
   */

  const openImage = useCallback(
    (index: number) => {
      if (
        index < 0 ||
        index >= validImageUrls.length
      ) {
        return
      }

      setCurrentImage(index)

      if (onOpenImageViewer) {
        onOpenImageViewer(index)
        return
      }

      setShowImageViewer(true)
    },
    [
      validImageUrls.length,
      setCurrentImage,
      setShowImageViewer,
      onOpenImageViewer,
    ]
  )

  /*
   * =====================================================
   * SINGLE IMAGE
   * =====================================================
   */

  if (validImageUrls.length === 1) {
    return (
      <SingleImage
        imageUrls={validImageUrls}
        openImage={openImage}
      />
    )
  }

  /*
   * =====================================================
   * TWO IMAGES
   * =====================================================
   */

  if (validImageUrls.length === 2) {
    return (
      <TwoImage
        imageUrls={validImageUrls}
        openImage={openImage}
      />
    )
  }

  /*
   * =====================================================
   * THREE IMAGES
   * =====================================================
   */

  if (validImageUrls.length === 3) {
    return (
      <ThreeImage
        imageUrls={validImageUrls}
        openImage={openImage}
      />
    )
  }

  /*
   * =====================================================
   * FOUR IMAGES
   * =====================================================
   */

  if (validImageUrls.length === 4) {
    return (
      <FourImage
        imageUrls={validImageUrls}
        openImage={openImage}
      />
    )
  }

  /*
   * =====================================================
   * FIVE OR MORE
   * =====================================================
   */

  return (
    <MultiImage
      imageUrls={validImageUrls}
      openImage={openImage}
    />
  )
}