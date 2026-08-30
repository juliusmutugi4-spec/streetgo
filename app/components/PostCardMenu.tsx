'use client'

import {
  Copy,
  Flag,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

interface PostCardMenuProps {
  postId: string
  postUserId: string
  user: any
}

export default function PostCardMenu({
  postId,
  postUserId,
  user,
}: PostCardMenuProps) {
  const [showMenu, setShowMenu] =
    useState(false)

  const [copied, setCopied] =
    useState(false)

  const menuRef =
    useRef<HTMLDivElement>(null)

  /*
   * =====================================================
   * CLOSE OUTSIDE / ESCAPE
   * =====================================================
   */

  useEffect(() => {
    if (!showMenu) {
      return
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node

      if (
        menuRef.current &&
        !menuRef.current.contains(
          target
        )
      ) {
        setShowMenu(false)
      }
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setShowMenu(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    )

    document.addEventListener(
      'keydown',
      handleEscape
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      )

      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [showMenu])

  /*
   * =====================================================
   * COPY
   * =====================================================
   */

  const copyLink = async () => {
    if (
      typeof window ===
      'undefined'
    ) {
      return
    }

    try {
      const url =
        `${window.location.origin}/post/${postId}`

      await navigator.clipboard.writeText(
        url
      )

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 900)
    } catch {
      setShowMenu(false)
    }
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div
      ref={menuRef}
      className="
        relative
        select-none
      "
    >
      {/* =================================================
          TRIGGER
          ================================================= */}

      <button
        type="button"
        onClick={() =>
          setShowMenu(
            (previous) =>
              !previous
          )
        }
        aria-label="Post options"
        aria-expanded={showMenu}
        className="
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          text-[var(--muted)]
          transition-colors
          duration-150
          hover:bg-[var(--surface-hover)]
          hover:text-[var(--foreground)]
          active:scale-95
          focus:outline-none
          focus-visible:ring-1
          focus-visible:ring-[var(--accent)]/40
        "
      >
        <MoreHorizontal
          size={16}
          strokeWidth={2.2}
        />
      </button>

      {/* =================================================
          MENU
          ================================================= */}

      {showMenu && (
        <div
          role="menu"
          aria-label="Post options"
          className="
            absolute
            right-0
            top-8
            z-[100]
            w-[170px]
            overflow-hidden
            rounded-lg
            border
            border-[var(--border)]
            bg-[var(--surface)]
            p-1
            shadow-[0_8px_24px_rgba(0,0,0,0.14)]
            dark:shadow-[0_8px_24px_rgba(0,0,0,0.34)]
            animate-in
            fade-in
            zoom-in-95
            duration-100
          "
        >
          {/* =================================================
              COPY LINK
              ================================================= */}

          <button
            type="button"
            role="menuitem"
            onClick={
              copyLink
            }
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-md
              px-2
              py-1.5
              text-left
              font-['Courier_New']
              text-[9px]
              font-bold
              text-[var(--foreground)]
              transition-colors
              duration-100
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--accent)]
              focus:outline-none
              focus-visible:ring-1
              focus-visible:ring-[var(--accent)]/40
            "
          >
            <Copy
              size={12}
              strokeWidth={2}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span className="min-w-0 truncate">
              {copied
                ? 'Link copied'
                : 'Copy link'}
            </span>
          </button>

          {/* =================================================
              SAVE
              ================================================= */}

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              setShowMenu(
                false
              )
            }
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-md
              px-2
              py-1.5
              text-left
              font-['Courier_New']
              text-[9px]
              font-bold
              text-[var(--foreground)]
              transition-colors
              duration-100
              hover:bg-[var(--surface-hover)]
              hover:text-[var(--accent)]
              focus:outline-none
              focus-visible:ring-1
              focus-visible:ring-[var(--accent)]/40
            "
          >
            <svg
              viewBox="0 0 24 24"
              className="
                h-3
                w-3
                shrink-0
                fill-current
                text-[var(--muted)]
              "
              aria-hidden="true"
            >
              <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2Z" />
            </svg>

            <span>
              Save post
            </span>
          </button>

          {/* =================================================
              REPORT
              ================================================= */}

          <button
            type="button"
            role="menuitem"
            onClick={() =>
              setShowMenu(
                false
              )
            }
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-md
              px-2
              py-1.5
              text-left
              font-['Courier_New']
              text-[9px]
              font-bold
              text-[var(--foreground)]
              transition-colors
              duration-100
              hover:bg-[var(--surface-hover)]
              hover:text-amber-500
              focus:outline-none
              focus-visible:ring-1
              focus-visible:ring-amber-500/40
            "
          >
            <Flag
              size={12}
              strokeWidth={2}
              className="
                shrink-0
                text-[var(--muted)]
              "
            />

            <span>
              Report post
            </span>
          </button>

          {/* =================================================
              DELETE — OWNER ONLY
              ================================================= */}

          {user?.id ===
            postUserId && (
            <>
              <div
                className="
                  my-1
                  h-px
                  bg-[var(--border)]
                "
              />

              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  setShowMenu(
                    false
                  )
                }
                className="
                  flex
                  w-full
                  items-center
                  gap-2
                  rounded-md
                  px-2
                  py-1.5
                  text-left
                  font-['Courier_New']
                  text-[9px]
                  font-bold
                  text-rose-500
                  transition-colors
                  duration-100
                  hover:bg-rose-500/10
                  hover:text-rose-500
                  focus:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-rose-500/40
                "
              >
                <Trash2
                  size={12}
                  strokeWidth={2}
                  className="
                    shrink-0
                  "
                />

                <span>
                  Delete post
                </span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}