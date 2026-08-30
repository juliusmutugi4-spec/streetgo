'use client'

interface PostCardValleyProps {
  children?: React.ReactNode
}

export default function PostCardValley({
  children,
}: PostCardValleyProps) {
  return (
    <div
      className="
        relative
        w-full
        m-0
        p-0
        bg-[var(--surface)]
        text-[var(--foreground)]
        select-none
      "
    >
      <div
        className="
          relative
          w-full
          m-0
          p-0
          bg-[var(--surface)]
          overflow-hidden
        "
      >
        {children}
      </div>
    </div>
  )
}