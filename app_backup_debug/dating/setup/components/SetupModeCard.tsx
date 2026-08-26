"use client"

type SetupMode = "dating" | "business" | "job"

interface SetupModeCardProps {
  mode: SetupMode
  icon: string
  title: string
  description: string
  action: string
  onClick: (mode: SetupMode) => void
}

const styles = {
  dating: {
    border: "border-rose-500/10 active:border-rose-500/30",
    background: "from-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/10 text-rose-400",
    text: "text-rose-400",
    glow: "shadow-[0_0_12px_rgba(244,63,94,0.02)]",
  },
  business: {
    border: "border-blue-500/10 active:border-blue-500/30",
    background: "from-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-400",
    text: "text-blue-400",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.02)]",
  },
  job: {
    border: "border-emerald-500/10 active:border-emerald-500/30",
    background: "from-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-400",
    text: "text-emerald-400",
    glow: "shadow-[0_0_12px_rgba(16,185,129,0.02)]",
  },
}

export default function SetupModeCard({
  mode,
  icon,
  title,
  description,
  action,
  onClick,
}: SetupModeCardProps) {
  const style = styles[mode]

  // Micro-format actions to keep buttons clean on one line
  const microAction = action.replace("→", "").trim()

  return (
    <button
      type="button"
      onClick={() => onClick(mode)}
      className={`
        group
        relative
        w-full
        overflow-hidden
        rounded-2xl
        border
        bg-gradient-to-b
        p-3
        text-left
        transition-all
        active:scale-[0.98]
        ${style.border}
        ${style.background}
        ${style.glow}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        {/* TEXT DETAILS FRAME */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {/* MICRO EMOJI FRAME */}
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-sm ${style.iconBg}`}>
              {icon}
            </div>
            
            <h3 className="text-xs font-black tracking-wide text-slate-100 uppercase">
              {title}
            </h3>
          </div>

          <p className="mt-1 text-[11px] leading-normal text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {/* ULTRA TIGHT MICRO-ACTION TEXT */}
      <div className={`mt-2.5 flex items-center justify-end border-t border-white/[0.03] pt-1.5 text-[9px] font-black uppercase tracking-wider ${style.text}`}>
        <span className="transition-transform group-active:translate-x-0.5">
          {microAction}
        </span>
        <span className="ml-0.5 font-sans font-medium opacity-80">→</span>
      </div>
    </button>
  )
}
