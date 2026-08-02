'use client'

interface ImageGalleryProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function ImageGallery({ imageUrls, openImage }: ImageGalleryProps) {
  const count = imageUrls.length

  if (count === 0) return null

  return (
    <div className="w-full my-4 overflow-hidden rounded-xl border border-gray-200 bg-white select-none">
      
      {/* CASE 1: Single Image (Preserves natural dimensions without bad cropping) */}
      {count === 1 && (
        <div className="w-full overflow-hidden bg-zinc-950 flex items-center justify-center max-h-[580px]">
          <img
            src={imageUrls[0]}
            alt="Gallery view"
            onClick={() => openImage(0)}
            className="w-full max-h-[580px] object-contain cursor-pointer hover:opacity-95 transition-opacity duration-200"
          />
        </div>
      )}

      {/* CASE 2: Two Images (Perfect 50/50 vertical splits) */}
      {count === 2 && (
        <div className="grid grid-cols-2 gap-1 bg-gray-200">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src={url}
                alt={`Gallery visual ${idx + 1}`}
                onClick={() => openImage(idx)}
                className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
              />
            </div>
          ))}
        </div>
      )}

      {/* CASE 3: Three Images (1 Dominant Left, 2 Stacked Right) */}
      {count === 3 && (
        <div className="grid grid-cols-3 gap-1 bg-gray-200 aspect-[4/3]">
          <div className="col-span-2 h-full overflow-hidden bg-gray-100">
            <img
              src={imageUrls[0]}
              alt="Gallery visual 1"
              onClick={() => openImage(0)}
              className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
            />
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-1 h-full">
            {imageUrls.slice(1, 3).map((url, idx) => (
              <div key={idx} className="h-full overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Gallery visual ${idx + 2}`}
                  onClick={() => openImage(idx + 1)}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE 4: Four Images (1 Top Horizontal Feature, 3 Square Grid Footer) */}
      {count === 4 && (
        <div className="flex flex-col gap-1 bg-gray-200">
          <div className="w-full aspect-[16/10] overflow-hidden bg-gray-100">
            <img
              src={imageUrls[0]}
              alt="Gallery visual 1"
              onClick={() => openImage(0)}
              className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
            />
          </div>
          <div className="grid grid-cols-3 gap-1 w-full">
            {imageUrls.slice(1, 4).map((url, idx) => (
              <div key={idx} className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Gallery visual ${idx + 2}`}
                  onClick={() => openImage(idx + 1)}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE 5: Five or More Images (2 Balanced Top, 3 Bottom Grid + Combined Event Overlay) */}
      {count >= 5 && (
        <div className="flex flex-col gap-1 bg-gray-200">
          <div className="grid grid-cols-2 gap-1 w-full">
            {imageUrls.slice(0, 2).map((url, idx) => (
              <div key={idx} className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Gallery visual ${idx + 1}`}
                  onClick={() => openImage(idx)}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 w-full">
            {imageUrls.slice(2, 5).map((url, idx) => {
              const actualIndex = idx + 2
              const isLastVisible = actualIndex === 4
              const hasMoreImages = count > 5

              return (
                <div key={actualIndex} className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={url}
                    alt={`Gallery visual ${actualIndex + 1}`}
                    onClick={() => openImage(actualIndex)}
                    className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all duration-200"
                  />
                  
                  {isLastVisible && hasMoreImages && (
                    <div 
                      onClick={() => openImage(actualIndex)}
                      className="absolute inset-0 bg-black/60 hover:bg-black/50 transition-colors duration-200 flex items-center justify-center cursor-pointer select-none"
                    >
                      <span className="text-white text-3xl font-bold tracking-wide font-sans">
                        +{count - 4}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
