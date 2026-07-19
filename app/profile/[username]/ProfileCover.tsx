'use client'

import { ArrowLeft, MoreHorizontal, Crown } from "lucide-react"

interface Props {
  coverUrl?: string | null
}

export default function ProfileCover({ coverUrl }: Props) {
  return (
    <div className="relative h-[220px] xs:h-[260px] sm:h-[300px] w-full overflow-hidden select-none">
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
          aria-label="Go back"
          className="w-9 h-9 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-white/90" />
        </button>
        
        <button 
          aria-label="More options"
          className="w-9 h-9 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-white/90" />
        </button>
      </div>

      {/* Micro-Sized Creator Badge Fitted Above Bottom Curve */}
<div className="absolute left-4 bottom-[150px] inline-flex items-center gap-1 h-5 rounded px-1.5 bg-[#FBBF24] text-[9px] font-black uppercase tracking-wider text-black shadow-md shadow-black/40 antialiased z-10 select-none">
  <Crown className="w-2.5 h-2.5 fill-black stroke-black stroke-[1.5]" />
  <span>Elite Creator</span>
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
