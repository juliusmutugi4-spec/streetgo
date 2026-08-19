'use client'

import { useMemo } from 'react'

interface PostTextVisualProps {
  content: string
}

export default function PostTextVisual({ content }: PostTextVisualProps) {
  const normalizedContent = useMemo(() => content?.trim() || '', [content])

  // Performance-optimized typography scale computation
  const textStyles = useMemo(() => {
    if (!normalizedContent) return 'text-xl'
    
    const wordCount = normalizedContent.split(/\s+/).filter(Boolean).length

    if (wordCount <= 3) {
      return 'text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] leading-[1.05]'
    }
    if (wordCount <= 7) {
      return 'text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.025em] leading-[1.1]'
    }
    if (wordCount <= 15) {
      return 'text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em] leading-[1.15]'
    }
    if (wordCount <= 30) {
      return 'text-xl sm:text-2xl md:text-3xl font-semibold tracking-[-0.015em] leading-[1.2]'
    }
    return 'text-base sm:text-lg md:text-xl font-normal tracking-normal leading-[1.3]'
  }, [normalizedContent])

  if (!normalizedContent) return null

  return (
    <div
      className="
        relative
        flex
        aspect-[16/10]
        min-h-[240px]
        w-full
        items-center
        justify-center
        overflow-hidden
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--background)]
        px-6
        py-10
        antialiased
        transition-colors
        duration-300
        content-visibility-auto
      "
    >
      {/* Premium Subtle Ambient Vignette Background */}
      <div 
        className="
          pointer-events-none 
          absolute 
          inset-0 
          bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.02))] 
          dark:bg-[radial-gradient(circle_at_center,transparent_40%,rgba(255,255,255,0.015))]
        " 
      />

      <p
        style={{ textWrap: 'balance' } as React.CSSProperties}
        className={`
          z-10
          max-w-[90%]
          text-center
          text-[var(--foreground)]
          transition-all
          duration-300
          ${textStyles}
        `}
      >
        {normalizedContent}
      </p>
    </div>
  )
}
