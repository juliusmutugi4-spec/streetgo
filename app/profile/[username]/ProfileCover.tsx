'use client'

import { ArrowLeft, MoreHorizontal, Crown } from "lucide-react"

interface Props {
  coverUrl?: string | null
  onBack?: () => void
}

export default function ProfileCover({
  coverUrl,
  onBack,
}: Props) {
  return (
    <div className="relative h-[120px] xs:h-[140px] sm:h-[180px] w-full overflow-hidden select-none">
      {/* Background Image with Professional Cinematographic Filters */}
      <img 
        src={coverUrl || "/cover.jpg"} 
        alt="Profile cover background" 
        className="absolute inset-0 w-full h-full object-cover brightness-[0.65] saturate-[1.2] transition-transform duration-500 ease-out" 
      />
      
      {/* Precision Ambient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#070b12]/30 to-black/40" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#070b12]/90 pointer-events-none" />

      {/* Ultra-Compact Top Navigation bar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
<button 
  onClick={onBack} 
  type="button"
  aria-label="Go back" 
  className="
    w-10 h-10 -ml-1 rounded-full 
    flex items-center justify-center 
    text-zinc-100 hover:text-white
    active:bg-zinc-800/40 active:scale-95 
    transition-all duration-200 outline-none select-none
  "
>
  {/* WhatsApp-style thick, sharp micro back arrow path */}
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    className="stroke-current"
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
</button>

        
        <button 
          aria-label="More options"

        >
          <MoreHorizontal className="w-3.5 h-3.5 text-white/90" />
        </button>
      </div>




      {/* Seamless Wave-to-Background Vector Curve */}
      <svg 
        className="absolute bottom-[-1px] w-full h-[50px] pointer-events-none" 
        viewBox="0 0 1440 170" 
        preserveAspectRatio="none"
      >
        <path 
          fill="#070b12" 
          d="M0,80 C250,170 500,0 720,80 C950,170 1200,20 1440,120 L1440,170 L0,170 Z" 
        />
      </svg>
    </div>
  )
}
