'use client'

import { useMemo, useState, useTransition } from 'react'
import PostTextVisual from './PostTextVisual'

interface PostCardContentProps {
  content?: string | null
  hasMedia?: boolean
}

export default function PostCardContent({
  content,
  hasMedia = false,
}: PostCardContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()

  const normalizedContent = useMemo(
    () => content?.trim() || '',
    [content]
  )

  const analysis = useMemo(() => {
    if (!normalizedContent) {
      return {
        isEmpty: true,
        isShortText: false,
        wordCount: 0,
        charCount: 0,
      }
    }

    const words = normalizedContent
      .split(/\s+/)
      .filter(Boolean)

    const paragraphCount = normalizedContent
      .split(/\n+/)
      .filter(Boolean)
      .length

    return {
      isEmpty: false,
      isShortText:
        words.length < 20 &&
        !hasMedia &&
        paragraphCount <= 1,
      wordCount: words.length,
      charCount: normalizedContent.length,
    }
  }, [normalizedContent, hasMedia])

  if (analysis.isEmpty) return null
  if (analysis.isShortText) {
    return <PostTextVisual content={normalizedContent} />
  }

  // Increased clamp threshold from 60 to 80 since text is now high-density microsize
  const shouldClamp = analysis.wordCount > 80 && !isExpanded

  const handleToggleExpand = () => {
    startTransition(() => {
      setIsExpanded((prev) => !prev)
    })
  }

  return (
    <div className="relative px-4 group/content select-text font-sans antialiased">
      
      {/* GEZEE INDUSTRIAL METADATA TRACE */}
      <div className="flex items-center gap-2 mb-2 font-mono text-[9px] uppercase tracking-[0.15em] text-slate-400 dark:text-zinc-500 select-none">
        <span className="flex items-center gap-1.5">
          <span className={`h-1 w-1 rounded-full ${isPending ? 'bg-amber-400 animate-spin' : 'bg-cyan-400'}`} />
          DATA//SRC
        </span>
        <span className="opacity-30">|</span>
        <span>W:{analysis.wordCount}</span>
        <span className="opacity-30">|</span>
        <span>C:{analysis.charCount}</span>
      </div>

      {/* CORE TEXT FIELD: Sub-pixel high-density typography */}
      <p
        className={`
          text-[12px]
          leading-[1.75]
          text-slate-700
          dark:text-zinc-300
          font-normal
          tracking-[0.02em]
          whitespace-pre-line
          [text-wrap:pretty]
          transition-all
          duration-500
          ease-in-out
          ${shouldClamp ? 'line-clamp-4 opacity-85 select-none pointer-events-none' : 'line-clamp-none opacity-100'}
        `}
      >
        {normalizedContent}
      </p>

      {/* RE-ENGINEERED CONTROLLER: Minimal wireframe expander */}
      {analysis.wordCount > 80 && (
        <div
          className={`
            transition-all
            duration-300
            ${shouldClamp
              ? 'absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95 flex items-end px-4 pb-0'
              : 'relative mt-3 flex pb-0'
            }
          `}
        >
          <button
            onClick={handleToggleExpand}
            type="button"
            aria-expanded={isExpanded}
            className="
              group/btn
              relative
              pointer-events-auto
              cursor-pointer
              text-[9px]
              font-bold
              tracking-[0.2em]
              uppercase
              font-mono
              py-2
              w-full
              flex
              items-center
              justify-between
              border-t
              border-slate-200/60
              dark:border-zinc-800/80
              text-slate-500
              dark:text-zinc-400
              hover:text-slate-900
              dark:hover:text-zinc-100
              transition-colors
              duration-200
              select-none
            "
          >
            <span className="flex items-center gap-1.5">
              <span className="text-slate-300 dark:text-zinc-700 group-hover/btn:text-slate-400 dark:group-hover/btn:text-zinc-500 transition-colors">⌁</span>
              {shouldClamp ? 'FETCH_STREAM' : 'COLLAPSE_STREAM'}
            </span>

            <div className="flex items-center gap-1.5 text-[8px] opacity-60">
              <span>{shouldClamp ? '01' : '02'}</span>
              <span 
                className={`
                  inline-block transition-transform duration-300 ease-out text-[7px]
                  ${shouldClamp ? 'rotate-0' : 'rotate-180'}
                `}
              >
                ▼
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
