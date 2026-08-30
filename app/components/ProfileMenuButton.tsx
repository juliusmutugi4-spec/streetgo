'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

interface ProfileMenuButtonProps {
  onClick: () => void
}

export default function ProfileMenuButton({
  onClick,
}: ProfileMenuButtonProps) {
  const [isRotating, setIsRotating] =
    useState(false)

  const handleProfileClick = () => {
    if (isRotating) return

    setIsRotating(true)

    onClick()

    window.setTimeout(() => {
      setIsRotating(false)
    }, 500)
  }

  return (
    <button
      type="button"
      onClick={handleProfileClick}
      className="
        flex
        w-full
        items-center
        gap-2.5
        rounded-md
        px-2.5
        py-2
        font-['Courier_New']
        text-[9px]
        font-bold
        text-[var(--foreground)]
        transition-colors
        hover:bg-[var(--surface-hover)]
        active:scale-[0.99]
      "
    >
      <User
        size={14}
        strokeWidth={1.9}
        className={`
          shrink-0
          ${
            isRotating
              ? 'animate-spin [animation-duration:0.5s]'
              : ''
          }
        `}
      />

      <span>
        Profile
      </span>
    </button>
  )
}