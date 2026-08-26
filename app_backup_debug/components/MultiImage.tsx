'use client'

interface MultiImageProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function MultiImage({
  imageUrls,
  openImage,
}: MultiImageProps) {
  const count = imageUrls.length
  const remaining = count - 5

  return (
    <div className="w-full my-6 overflow-hidden rounded-2xl bg-gray-200 flex flex-col gap-1 select-none">
      
      {/* Top Row: 2 Split Images */}
      <div className="grid grid-cols-2 gap-1 w-full">
        {imageUrls.slice(0, 2).map((url, idx) => (
          <div key={idx} className="aspect-[4/3] overflow-hidden bg-gray-100">
            <img
              src={url}
              alt=""
              loading="lazy"
              onClick={() => openImage(idx)}
              className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
            />
          </div>
        ))}
      </div>

      {/* Bottom Row: 3 Split Images with Potential Overlay */}
      <div className="grid grid-cols-3 gap-1 w-full">
        {imageUrls.slice(2, 5).map((url, idx) => {
          const actualIndex = idx + 2
          const isLastSlot = actualIndex === 4
          const hasRemaining = remaining > 0

          return (
            <div key={actualIndex} className="relative aspect-square overflow-hidden bg-gray-100">
              <img
                src={url}
                alt=""
                loading="lazy"
                onClick={() => openImage(actualIndex)}
                className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
              />
              
              {/* Facebook-style overlay container */}
              {isLastSlot && hasRemaining && (
                <div 
                  onClick={() => openImage(actualIndex)}
                  className="absolute inset-0 bg-black/60 hover:bg-black/50 transition-colors duration-200 flex items-center justify-center cursor-pointer"
                >
                  <span className="text-white text-3xl font-bold tracking-wide font-sans">
                    +{remaining}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}
