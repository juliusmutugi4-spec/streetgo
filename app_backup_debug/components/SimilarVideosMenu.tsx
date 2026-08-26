'use client'

interface SimilarVideosMenuProps {
  videos: any[]
  onSelect: (video: any) => void
}

export default function SimilarVideosMenu({ videos, onSelect }: SimilarVideosMenuProps) {
  return (
    /* Changed fixed to absolute positioning layout rules */
    <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-sm border border-cyan-500/30 bg-zinc-950/80 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-lg select-none font-mono">
      
      {/* Sci-Fi Decorative Corner Brackets */}
      <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyan-400" />
      <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-cyan-400" />
      
      {/* Futuristic Header with Telemetry */}
      <div className="relative px-2 py-1 border-b border-cyan-500/20 bg-cyan-950/20 flex items-center justify-between overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_95%,rgba(6,182,212,0.1)_95%)] bg-[size:100%_4px] animate-[pulse_2s_infinite]" />
        
        <div className="flex items-center gap-1.5 z-10">
          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[9px] font-black tracking-widest uppercase text-cyan-300">
            SIMILAR_SRC //
          </span>
        </div>
        <span className="text-[7px] text-cyan-500/60 z-10 tracking-tighter">
          SYS.LOC_0X4F
        </span>
      </div>

      {/* Futuristic Dense List */}
      <div className="max-h-44 overflow-y-auto divide-y divide-cyan-500/10 custom-scrollbar">
        {videos.map((video, idx) => (
          <button
            key={video.id}
            onClick={() => {
  onSelect(video)
}}
            className="group relative w-full flex items-stretch gap-2 p-1 hover:bg-cyan-500/10 active:bg-cyan-500/20 transition-all duration-150 text-left border-l-2 border-transparent hover:border-cyan-400"
          >
            <span className="absolute right-1 bottom-0.5 text-[6px] text-cyan-500/30 group-hover:text-cyan-400/50">
              [{String(idx + 1).padStart(2, '0')}]
            </span>

            <div className="relative h-7 w-11 flex-shrink-0 rounded-sm bg-zinc-900 border border-cyan-500/20 overflow-hidden group-hover:border-cyan-400/50 transition-colors">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/70 shadow-[0_0_4px_#22d3ee] animate-[bounce_1.5s_infinite]" />
              <div className="w-full h-full bg-cyan-950/40" />
            </div>
            
            <div className="min-w-0 flex-1 flex flex-col justify-center pr-4">
              <p className="text-[9px] font-bold text-zinc-100 truncate tracking-tight group-hover:text-cyan-300 transition-colors">
                {video.content ? video.content.toUpperCase() : "NULL_DATA"}
              </p>
              
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[7px] text-cyan-500 font-medium">@</span>
                <p className="text-[8px] text-cyan-400/60 truncate tracking-tight group-hover:text-cyan-400/80">
                  {video.username || "UNKNOWN_NODE"}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Footer Status Bar */}
      <div className="px-2 py-0.5 border-t border-cyan-500/10 bg-cyan-950/10 flex justify-between items-center text-[7px] text-cyan-600/80">
        <span>FEED_STATUS: NOMINAL</span>
        <span className="animate-pulse">● FEED_ONLINE</span>
      </div>
    </div>
  )
}
