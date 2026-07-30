'use client'

import { useEffect, useRef } from 'react'
import { Radio, Sparkles, X } from 'lucide-react'

type CreateMenuProps = {
  onClose: () => void
  onCreateSelect: (mode: 'post' | 'prediction') => void
}

export default function CreateMenu({ onClose, onCreateSelect }: CreateMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside to close naturally
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div 
      ref={menuRef}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 zoom-in-95 duration-200"
    >
      <div className="relative w-72 rounded-2xl border border-white/[0.08] bg-[#1c1d1f]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-[15px] font-bold text-white tracking-wide">
            Create Content
          </h3>
          <button 
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-zinc-400 hover:bg-white/[0.12] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* SEPARATOR */}
        <div className="h-px bg-white/[0.06] mx-4" />

        {/* MENU OPTIONS */}
        <div className="p-2 space-y-1">
          
          {/* TRANSMIT (POST) */}
          <button
            onClick={() => {
              onClose()
              onCreateSelect('post')
            }}
            className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-all duration-150 hover:bg-white/[0.04] active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1877f2]/10 ring-1 ring-[#1877f2]/20 text-[#1877f2] group-hover:bg-[#1877f2] group-hover:text-white transition-all duration-200">
              <Radio size={18} className="group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-zinc-100 group-hover:text-white transition-colors">
                Transmit Live
              </p>
              <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                Start a live broadcast to your feed
              </p>
            </div>
          </button>

          {/* PREDICT */}
          <button
            onClick={() => {
              onClose()
              onCreateSelect('prediction')
            }}
            className="group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-all duration-150 hover:bg-white/[0.04] active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/10 ring-1 ring-[#22c55e]/20 text-[#22c55e] group-hover:bg-[#22c55e] group-hover:text-white transition-all duration-200">
              <Sparkles size={18} className="group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-zinc-100 group-hover:text-white transition-colors">
                Predict Forecast
              </p>
              <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                Publish a speculative prediction
              </p>
            </div>
          </button>

        </div>
      </div>

      {/* POINTER ARROW */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-[#1c1d1f] border-r border-b border-white/[0.08]" />
    </div>
  )
}
