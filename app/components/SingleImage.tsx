'use client'

interface SingleImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function SingleImage({
  imageUrls,
  openImage,
}: SingleImageProps) {

  if (!imageUrls || imageUrls.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-hidden bg-gray-100 flex items-center justify-center">
      <img
        src={imageUrls[0]}
        alt="Image 1"
        onClick={() => openImage(0)}
        className="
          w-full
          max-h-[600px]
          object-cover
          cursor-pointer
          hover:brightness-95
          transition-all
        "
      />
    </div>
  )
}