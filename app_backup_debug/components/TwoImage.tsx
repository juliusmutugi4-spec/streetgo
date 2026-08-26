'use client'

interface TwoImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function TwoImage({
  imageUrls,
  openImage,
}: TwoImageProps) {
  return (
    <div className="my-6 overflow-hidden rounded-2xl">

      <img
        src={imageUrls[0]}
        alt=""
        loading="lazy"
        onClick={() => openImage(0)}
        className="
          block
          w-full
          cursor-pointer
          object-cover
        "
      />

      <img
        src={imageUrls[1]}
        alt=""
        loading="lazy"
        onClick={() => openImage(1)}
        className="
          block
          w-full
          cursor-pointer
          object-cover
        "
      />

    </div>
  )
}