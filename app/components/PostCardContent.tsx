'use client'

import { useMemo, useState } from 'react'

interface PostCardContentProps {
  content?: string | null
  hasMedia?: boolean

  // LIVE POST
  isLive?: boolean
  liveId?: string | null
}

export default function PostCardContent({
  content,
  hasMedia = false,
  isLive = false,
  liveId = null,
}: PostCardContentProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  /* Clean up whitespace but keep line breaks intact like authentic Facebook */
  const cleanedContent = useMemo(() => {
    if (!content) return ''
    return content.trim()
  }, [content])

  if (!cleanedContent) return null

  const words = cleanedContent.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const actuallyLive = isLive === true && !!liveId
  
  // High-density view truncation thresholds
  const isShortTextStyle = wordCount < 25 && !hasMedia && !actuallyLive
  const shouldTruncate = wordCount > 70 && !isExpanded

  // Custom Times New Roman Font Stack
  const timesFontStack = '"Times New Roman", Times, Georgia, serif'

  /*
   * =====================================================
   * STYLIZED SHORT TEXT (Facebook Status Style)
   * =====================================================
   */
  if (isShortTextStyle) {
    return (
      <div className="w-full px-4 pb-3 pt-0.5">
        <div 
          className="w-full min-h-[140px] flex items-center justify-center p-5 rounded-lg bg-gradient-to-br from-[#1c2e4a] via-[#0f172a] to-[#1e293b] dark:from-[#0f172a] dark:to-[#1e293b] shadow-inner text-center select-text"
          style={{ fontFamily: timesFontStack }}
        >
          <p className="m-0 text-lg md:text-xl font-bold leading-snug tracking-tight text-white drop-shadow-sm whitespace-pre-wrap break-words max-w-[95%]">
            {cleanedContent}
          </p>
        </div>
      </div>
    )
  }

  /*
   * =====================================================
   * NORMAL / LONG / MEDIA / LIVE POST (Micro Style)
   * =====================================================
   */
  return (
    <div className="w-full px-4 pb-2.5 pt-0.5">
      <div 
        className="relative"
        style={{ fontFamily: timesFontStack }}
      >
        <p
          className={`
            m-0 
            break-words 
            whitespace-pre-wrap 
            text-[13px] 
            font-normal 
            leading-[1.4] 
            tracking-normal
text-[var(--foreground)]
            ${shouldTruncate ? 'line-clamp-4 overflow-hidden' : ''}
          `}
        >
          {cleanedContent}
        </p>

        {/* =================================================
            THEME-RESPONSIVE INLINE SEE MORE / LESS
            ================================================= */}
        {wordCount > 70 && (
          <div 
className="
  mt-1
  flex
  justify-end
"
          >
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-expanded={isExpanded}
              className="
                inline-block
                cursor-pointer
                border-0
                bg-transparent
                p-0
                text-[13px]
                font-semibold
                text-[#1877F2]
                dark:text-[#4599FF]
                hover:text-[#166FE5]
                dark:hover:text-[#67AFFF]
                hover:underline
                focus:outline-none
                select-none
                transition-colors
                duration-150
              "
            >
              {isExpanded ? 'See less' : 'See more'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
