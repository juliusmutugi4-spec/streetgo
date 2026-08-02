'use client'

interface ImageGalleryProps {
  imageUrls: string[]
  openImage: (index: number) => void
}

export default function ImageGallery({ imageUrls, openImage }: ImageGalleryProps) {
  const count = imageUrls.length

  // Return null if there are no images to display
  if (count === 0) return null

  // Helper to render the remaining image count overlay (+X)
  const renderOverlay = (index: number) => {
    if (index === 4 && count > 5) {
      return (
        <div 
          onClick={() => openImage(index)}
          className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/40 transition-colors"
        >
          <span className="text-white text-2xl font-semibold font-sans">
            +{count - 4}
          </span>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full my-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* CASE 1: Single Image */}
      {count === 1 && (
        <div className="w-full overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={imageUrls[0]}
            alt="Gallery 1"
            onClick={() => openImage(0)}
            className="w-full max-h-[600px] object-cover cursor-pointer hover:brightness-95 transition-all"
          />
        </div>
      )}

      {/* CASE 2: Two Images (Side by Side Split) */}
      {count === 2 && (
        <div className="grid grid-cols-2 gap-1 bg-gray-200">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src={url}
                alt={`Gallery ${idx + 1}`}
                onClick={() => openImage(idx)}
                className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
              />
            </div>
          ))}
        </div>
      )}

      {/* CASE 3: Three Images (1 Main Left, 2 Stacked Right) */}
      {count === 3 && (
        <div className="grid grid-cols-3 gap-1 bg-gray-200 aspect-[4/3]">
          <div className="col-span-2 h-full overflow-hidden bg-gray-100">
            <img
              src={imageUrls[0]}
              alt="Gallery 1"
              onClick={() => openImage(0)}
              className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
            />
          </div>
          <div className="col-span-1 grid grid-rows-2 gap-1 h-full">
            {imageUrls.slice(1, 3).map((url, idx) => (
              <div key={idx} className="h-full overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Gallery ${idx + 2}`}
                  onClick={() => openImage(idx + 1)}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE 4: Four Images (1 Top Main, 3 Grid Bottom) */}
      {count === 4 && (
        <div className="flex flex-col gap-1 bg-gray-200">
          <div className="w-full aspect-[16/9] overflow-hidden bg-gray-100">
            <img
              src={imageUrls[0]}
              alt="Gallery 1"
              onClick={() => openImage(0)}
              className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
            />
          </div>
          <div className="grid grid-cols-3 gap-1 w-full">
            {imageUrls.slice(1, 4).map((url, idx) => (
              <div key={idx} className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Gallery ${idx + 2}`}
                  onClick={() => openImage(idx + 1)}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE 5: Five or More Images (2 Top Grid, 3 Bottom Grid + Overlay) */}
      {count >= 5 && (
        <div className="flex flex-col gap-1 bg-gray-200">
          <div className="grid grid-cols-2 gap-1 w-full">
            {imageUrls.slice(0, 2).map((url, idx) => (
              <div key={idx} className="aspect-[4/3] overflow-hidden bg-gray-100">
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  onClick={() => openImage(idx)}
                  className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1 w-full">
            {imageUrls.slice(2, 5).map((url, idx) => {
              const actualIndex = idx + 2
              return (
                <div key={actualIndex} className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={url}
                    alt={`Gallery ${actualIndex + 1}`}
                    onClick={() => openImage(actualIndex)}
                    className="w-full h-full object-cover cursor-pointer hover:brightness-95 transition-all"
                  />
                  {renderOverlay(actualIndex)}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
