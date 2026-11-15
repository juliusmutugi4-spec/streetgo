
'use client'

import { useMemo, useState } from 'react'

interface PostCardContentProps {
  content?: string | null
  hasMedia?: boolean
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

  const cleanedContent = useMemo(() => {
    if (!content) return ''

    return content
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\n[ \t]*\n+/g, '\n')
  }, [content])

  if (!cleanedContent) return null

  const wordCount = cleanedContent.split(/\s+/).filter(Boolean).length
  const shouldTruncate = wordCount > 70 && !isExpanded

  return (
    <div className={`w-full px-3 ${hasMedia ? 'pb-2 pt-0' : 'pb-2 pt-0'}`}>
      <div>
        <p
          className={`
            m-0
            break-words
            whitespace-pre-line
            text-[15px]
            font-normal
            leading-[1.42]
            tracking-normal
            text-[var(--foreground)]
            ${shouldTruncate ? 'line-clamp-4 overflow-hidden' : ''}
          `}
        >
          {cleanedContent}
        </p>

        {wordCount > 70 && (
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            aria-expanded={isExpanded}
            className="
              mt-0.5
              inline-flex
              min-h-7
              items-center
              rounded
              text-[13px]
              font-semibold
              text-emerald-400
              hover:text-emerald-300
              hover:underline
              transition-colors
            "
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    </div>
  )
}
