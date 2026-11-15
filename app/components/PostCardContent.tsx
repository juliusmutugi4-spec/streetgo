'use client'

import { useMemo, useState } from 'react'

interface Props {
  content?: string | null
  hasMedia?: boolean
  isLive?: boolean
  liveId?: string | null
}

export default function PostCardContent({ content }: Props) {
  const [expanded, setExpanded] = useState(false)

  const text = useMemo(
    () => content?.trim().replace(/\r\n/g, '\n').replace(/\n[ \t]*\n+/g, '\n') ?? '',
    [content]
  )

  if (!text) return null

  const isLong = text.split(/\s+/).length > 70

  return (
    <div className="w-full px-3 pb-2">
      <p
        className={`m-0 break-words whitespace-pre-line text-[14px] leading-[1.35] text-[var(--foreground)] ${
          isLong && !expanded ? 'line-clamp-4' : ''
        }`}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-0.5 text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline transition-colors"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}
