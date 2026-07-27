'use client'

import { useEffect, useState, useRef } from "react"

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

  const [heroIndex, setHeroIndex] = useState(0)
  const [layoutIndex, setLayoutIndex] = useState(0)
  const [prevHeroIndex, setPrevHeroIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
const [slideDirection, setSlideDirection] = useState<
  "left" | "right" | "up" | "down"
>("left")

const heroIndexRef = useRef(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Real-time canvas color extraction for high-fidelity ambient backdrops
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || imageUrls.length === 0) return

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = imageUrls[heroIndex]

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, 4, 4)
      const imgData = ctx.getImageData(0, 0, 4, 4).data
      
      let r = 0, g = 0, b = 0
      for (let i = 0; i < imgData.length; i += 4) {
        r += imgData[i]
        g += imgData[i + 1]
        b += imgData[i + 2]
      }
      const count = imgData.length / 4
      
      canvas.style.setProperty('--glow-r', `${Math.round(r / count)}`)
      canvas.style.setProperty('--glow-g', `${Math.round(g / count)}`)
      canvas.style.setProperty('--glow-b', `${Math.round(b / count)}`)
    }
  }, [heroIndex, imageUrls])

  // Soft crossfade auto-rotation safely isolated in transitions
useEffect(() => {
  if (imageUrls.length < 2) return

  heroIndexRef.current = heroIndex

  const interval = setInterval(() => {
    // Start animation
    setIsAnimating(true)

    // Wait for fade-out
    setTimeout(() => {
      setPrevHeroIndex(heroIndexRef.current)

setHeroIndex((prev) => {
  const next = (prev + 1) % imageUrls.length
  heroIndexRef.current = next
  return next
})
      // Fade back in
      setIsAnimating(false)
    }, 350)

  }, 6000)

  return () => clearInterval(interval)
}, [imageUrls.length])

useEffect(() => {
  if (imageUrls.length < 3) return

  const layoutTimer = setInterval(() => {
    setLayoutIndex((prev) => {
  const next = (prev + 1) % 4

  if (next === 0) setSlideDirection("left")
  if (next === 1) setSlideDirection("right")
  if (next === 2) setSlideDirection("up")
  if (next === 3) setSlideDirection("down")

  return next
})
  }, 30000) // every 30 seconds

  return () => clearInterval(layoutTimer)
}, [imageUrls.length])


  const openImage = (index: number) => {
    setCurrentImage(index)
    setShowImageViewer(true)
  }

  // MINIMALIST DESIGN SYSTEM
  const bentoContainer =
  "relative overflow-hidden rounded-2xl bg-black transition-all duration-500"
const imageInteractions =
  "w-full h-auto object-contain bg-black cursor-pointer transition-all duration-700 ease-out hover:scale-[1.02]"

  // =========================================================================
  // SINGLE IMAGE: THE SPOTLIGHT
  // =========================================================================
  if (imageUrls.length === 1) {
    return (
      <div className="w-full my-6">
        <div className={`${bentoContainer} max-h-[600px] flex items-center justify-center p-2 bg-neutral-100/50 dark:bg-neutral-950/20`}>
          <img 
            src={imageUrls[0]} 
            alt="Gallery focus" 
            loading="eager" 
            onClick={() => openImage(0)} 
            className="w-full max-h-[580px] rounded-xl object-contain cursor-pointer transition-all duration-500 ease-out hover:brightness-[1.01]" 
          />
        </div>
      </div>
    )
  }

  // =========================================================================
  // TWO IMAGES: THE BALANCED DIPTYCH
  // =========================================================================
  if (imageUrls.length === 2) {
    return (
      <div className="w-full my-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 h-[320px] sm:h-[460px]">
          {imageUrls.map((url, index) => (
            <div key={url} className={bentoContainer}>
              <img 
                src={url} 
                alt={`Gallery view ${index + 1}`} 
                loading="lazy" 
                onClick={() => openImage(index)} 
                className={imageInteractions} 
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // =========================================================================
  // THREE+ IMAGES: REFINED BENTO
  // =========================================================================

const orderedImages = [
  ...imageUrls.slice(heroIndex),
  ...imageUrls.slice(0, heroIndex),
]

const orderedIndexes = [
  ...imageUrls.map((_, i) => i).slice(heroIndex),
  ...imageUrls.map((_, i) => i).slice(0, heroIndex),
]


const layoutClasses = [
  // 0 - Hero Left
  {
    wrapper: "grid grid-cols-1 lg:grid-cols-3 gap-3.5 h-auto max-h-[900px]",
    hero: "lg:col-span-2 order-1",
    side: "order-2",
  },

  // 1 - Hero Right
  {
    wrapper: "grid grid-cols-1 lg:grid-cols-3 gap-3.5 h-auto lg:h-[48max-h-[900px]0px]",
    hero: "lg:col-span-2 lg:col-start-2 order-2",
    side: "order-1",
  },

  // 2 - Hero Top
  {
    wrapper: "grid grid-cols-1 gap-3.5",
    hero: "order-1 h-[320px]",
    side: "grid grid-cols-2 gap-3.5 order-2",
  },

  // 3 - Hero Bottom
  {
    wrapper: "grid grid-cols-1 gap-3.5",
    hero: "order-2 h-[320px]",
    side: "grid grid-cols-2 gap-3.5 order-1",
  },
]

const currentLayout = layoutClasses[layoutIndex]


  return (
    <div className="w-full my-6 relative">
      <canvas ref={canvasRef} width="4" height="4" className="hidden" />
      
      {/* Super Subtle Ambient Glow */}
      <div 
        className="absolute -inset-4 opacity-[0.07] dark:opacity-[0.15] blur-[80px] transition-all duration-1000 pointer-events-none rounded-[32px]"
        style={{
          background: `radial-gradient(circle at center, rgb(var(--glow-r,120), var(--glow-g,120), var(--glow-b,120)) 0%, transparent 75%)`
        }}
      />

      <div
  className={`
    grid
    gap-3.5
    transition-all
    duration-1000
    ease-in-out

    ${
layoutIndex === 0
  ? "grid-cols-1 lg:grid-cols-3"
  : layoutIndex === 1
  ? "grid-cols-1 lg:grid-cols-3"
  : "grid-cols-1"
    }
  `}
>
        
        {/* HERO CONTAINER */}
        <div
  className={`
    ${bentoContainer}
    transition-all
    duration-1000
    ease-in-out

${
  layoutIndex === 0
    ? "lg:col-span-2 order-1 flex items-center justify-center p-2"
    : layoutIndex === 1
    ? "lg:col-span-2 lg:order-2 flex items-center justify-center p-2"
    : layoutIndex === 2
    ? "order-1 flex items-center justify-center p-2"
    : "order-2 flex items-center justify-center p-2"
}
  `}
>
<img
  src={imageUrls[heroIndex]}
  alt="Gallery highlight"
  loading="eager"
  onClick={() => openImage(heroIndex)}
  className={`
    w-full
    h-auto
    max-h-[80vh]
    object-contain
    cursor-pointer

    transition-all
    duration-700
    ease-[cubic-bezier(.22,.61,.36,1)]

    ${
      isAnimating
        ? slideDirection === "left"
          ? "-translate-x-12 opacity-0 scale-105 blur-sm"
          : slideDirection === "right"
          ? "translate-x-12 opacity-0 scale-105 blur-sm"
          : slideDirection === "up"
          ? "-translate-y-12 opacity-0 scale-105 blur-sm"
          : "translate-y-12 opacity-0 scale-105 blur-sm"
        : "translate-x-0 translate-y-0 opacity-100 scale-100 blur-0"
    }
  `}
/>

          <img 
            src={imageUrls[prevHeroIndex]} 
            alt="Background frame buffer" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 dark:opacity-20" 
          />

          {/* Minimalist Micro Progress Rails */}
          <div className="absolute bottom-3 inset-x-0 h-0.5 z-20 flex gap-1 px-4">
            {imageUrls.map((_, idx) => (
              <div 
                key={idx} 
                className="h-full flex-1 bg-neutral-500/10 dark:bg-white/10 rounded-full overflow-hidden"
              >
                {idx === heroIndex && (
                  <div className="h-full bg-neutral-800 dark:bg-white/80 animate-[progress_6s_linear_infinite]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SIDE BAR STACK */}
        <div
  className={`
    transition-all
    duration-1000
    ease-in-out

    ${
      layoutIndex === 0
        ? "grid grid-cols-2 lg:grid-cols-1 gap-3.5 h-[160px] lg:h-full order-2"
        : layoutIndex === 1
        ? "grid grid-cols-2 lg:grid-cols-1 gap-3.5 h-[160px] lg:h-full order-1"
        : layoutIndex === 2
        ? "grid grid-cols-2 gap-3.5 h-[160px] order-2"
        : "grid grid-cols-2 gap-3.5 h-[160px] order-1"
    }
  `}
>
          
          {/* Static Slot 1 */}
          <div className={bentoContainer}>
<img
  src={orderedImages[1]}
  alt="Gallery auxiliary thumbnail"
  loading="lazy"
  onClick={() => openImage(orderedIndexes[1])}
  className={imageInteractions}
/>
          </div>

          {/* Static Slot 2 / Counter */}
          <div className={bentoContainer}>
<img
  src={orderedImages[2]}
  alt="Gallery tertiary thumbnail"
  loading="lazy"
  onClick={() => openImage(orderedIndexes[2])}
  className={imageInteractions}
/>
            
            {imageUrls.length > 2 && (
              <div 
                onClick={() => openImage(orderedIndexes[2])} 
                className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md cursor-pointer transition-colors duration-300 hover:bg-white/70 dark:hover:bg-neutral-950/70"
              >
                <div className="text-center">
                  <span className="text-2xl font-light tracking-tight text-neutral-900 dark:text-white">
                    +{imageUrls.length - 3}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
                    View gallery
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
