'use client'

interface PostCardValleyProps {
  children?: React.ReactNode
}

export default function PostCardValley({
  children,
}: PostCardValleyProps) {
  return (
    <div className="relative w-full group/valley select-none">

      {/* 100% COLORLESS HIGH-FIDELITY STRUCTURAL MATRIC BOX */}
      <div
        className="
          relative
          mx-2
          -mt-px
          rounded-b-[4px]
          bg-transparent
          shadow-none

          /* Zero-color sub-pixel wireframe alignment */
          border-x
          border-b
          border-slate-200/10
          dark:border-zinc-800/40
          group-hover/valley:border-slate-300/30
          dark:group-hover/valley:border-zinc-700/60

          transition-colors
          duration-500
          ease-out
          layout-gpu
        "
      >
        {/* HYPER-SLIM MICRO LINE DECK FRAME */}
        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-[0.5px]
            bg-gradient-to-r
            from-transparent
            via-slate-200/30
            dark:via-zinc-800/80
            group-hover/valley:via-cyan-500/40
            to-transparent
            transition-colors
            duration-700
          "
        />

        {/* HIGH-PREMIUM CHROME LASER SWEEP (Triggers smoothly on parent hover) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-b-[4px] opacity-0 group-hover/valley:opacity-100 transition-opacity duration-700">
          <div className="absolute bottom-0 -left-[100%] w-[40%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 dark:via-cyan-400/60 to-transparent group-hover/valley:animate-[shimmer_2s_cubic-bezier(0.16,1,0.3,1)_infinite]" />
        </div>

        {/* GEZEE BLUEPRINT CORNER RETICLES (Asymmetric tech marks) */}
        <div className="absolute bottom-[-1px] left-[-1px] h-1.5 w-1.5 border-b border-l border-slate-400/30 dark:border-zinc-600/50 pointer-events-none" />
        <div className="absolute bottom-[-1px] right-[-1px] h-1.5 w-1.5 border-b border-r border-slate-400/30 dark:border-zinc-600/50 pointer-events-none" />

        {/* DYNAMIC TELEMETRY DATA WATERMARK */}
        <div className="absolute bottom-1 right-2 font-mono text-[6.5px] tracking-[0.25em] text-slate-300 dark:text-zinc-700 opacity-0 group-hover/valley:opacity-100 transition-opacity duration-300 pointer-events-none">
          SYS_VALLEY//02
        </div>

        {/* SAFE CONTENT PASSTHROUGH STREAM */}
        <div className="relative z-10 w-full">
          {children}
        </div>
      </div>

    </div>
  )
}
