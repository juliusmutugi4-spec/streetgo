'use client'

import { useState, useRef, useEffect } from 'react'

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
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close interface safely when clicking outside the menu node
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const copyLink = async () => {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShowMenu(false)
      }, 1000)
    } catch (err) {
      setShowMenu(false)
    }
  }

  return (
    <div ref={menuRef} className="relative inline-block select-none font-mono">
      
      {/* SLIM TRIGGER DOTS */}
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        type="button"
        aria-expanded={showMenu}
        className="
          flex
          items-center
          justify-center
          h-5
          w-5
          rounded-[4px]
          border
          border-slate-200/40
          dark:border-zinc-800/80
          bg-transparent
          text-[10px]
          text-slate-400
          dark:text-zinc-500
          hover:text-slate-900
          dark:hover:text-zinc-200
          hover:border-slate-300/60
          dark:hover:border-zinc-700/60
          cursor-pointer
          transition-colors
          duration-150
        "
      >
        •••
      </button>

      {/* TECHNICAL FLOATING DROPDOWN NODE */}
      {showMenu && (
        <div
          className="
            absolute
            right-0
            top-6
            z-50
            w-40
            overflow-hidden
            rounded-[4px]
            border
            border-slate-200/80
            dark:border-zinc-800/90
            bg-white/95
            dark:bg-zinc-950/95
            backdrop-blur-xl
            shadow-[0_4px_12px_rgba(0,0,0,0.15)]
            animate-in fade-in slide-in-from-top-1
            duration-150
          "
        >
          <button
            className="
              w-full
              px-2.5
              py-1.5
              text-left
              text-[10px]
              font-bold
              tracking-wider
              uppercase
              text-slate-600
              dark:text-zinc-400
              hover:text-cyan-500
              dark:hover:text-cyan-400
              hover:bg-slate-50
              dark:hover:bg-zinc-900/50
              border-b
              border-slate-100
              dark:border-zinc-900/40
              transition-colors
              cursor-pointer
            "
            onClick={copyLink}
          >
            {copied ? '✔_COPIED' : 'LN_COPY'}
          </button>

          <button
            className="
              w-full
              px-2.5
              py-1.5
              text-left
              text-[10px]
              font-bold
              tracking-wider
              uppercase
              text-slate-600
              dark:text-zinc-400
              hover:text-slate-900
              dark:hover:text-zinc-100
              hover:bg-slate-50
              dark:hover:bg-zinc-900/50
              border-b
              border-slate-100
              dark:border-zinc-900/40
              transition-colors
              cursor-pointer
            "
            onClick={() => setShowMenu(false)}
          >
            ST_SAVE
          </button>

          <button
            className="
              w-full
              px-2.5
              py-1.5
              text-left
              text-[10px]
              font-bold
              tracking-wider
              uppercase
              text-slate-600
              dark:text-zinc-400
              hover:text-rose-500
              hover:bg-slate-50
              dark:hover:bg-zinc-900/50
              transition-colors
              cursor-pointer
            "
            onClick={() => setShowMenu(false)}
          >
            FL_REPORT
          </button>

          {user?.id === postUserId && (
            <button
              className="
                w-full
                px-2.5
                py-1.5
                text-left
                text-[10px]
                font-bold
                tracking-wider
                uppercase
                text-rose-500
                dark:text-rose-400/90
                hover:text-white
                bg-rose-500/5
                hover:bg-rose-600
                border-t
                border-slate-100
                dark:border-zinc-900/40
                transition-all
                cursor-pointer
              "
              onClick={() => setShowMenu(false)}
            >
              SYS_DELETE
            </button>
          )}
        </div>
      )}
    </div>
  )
}
