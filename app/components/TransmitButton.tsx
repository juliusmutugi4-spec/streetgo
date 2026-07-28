'use client'

import React from 'react'
import { Loader2, Send } from 'lucide-react'

interface TransmitButtonProps {
  uploading: boolean
  onClick: () => void
}

export default function TransmitButton({
  uploading,
  onClick,
}: TransmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={uploading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 shadow-sm transition-all duration-200 hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-300 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
    >
      {uploading ? (
        <>
          <Loader2 size={13} className="animate-spin text-zinc-400 dark:text-zinc-500" />
          <span>Uploading...</span>
        </>
      ) : (
        <>
          <Send size={13} className="text-zinc-400 group-hover:text-zinc-200 dark:text-zinc-500" />
          <span>Transmit</span>
        </>
      )
    }
    </button>
  )
}
