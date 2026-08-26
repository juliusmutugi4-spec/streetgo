"use client"

interface SetupFooterProps {
  onSkip: () => void
}

export default function SetupFooter({ onSkip }: SetupFooterProps) {
  return (
    <div className="mt-auto pt-4 text-center select-none font-sans bg-black px-1 antialiased">
      {/* SECONDARY DISMISS PROMPT */}
      <p className="text-[9px] font-medium uppercase tracking-wider text-slate-600">
        You don't have to choose right now
      </p>

      {/* PRIMARY LINK ACTION BUTTON */}
      <button
        type="button"
        onClick={onSkip}
        className="mt-1 inline-block text-[9px] font-black uppercase tracking-widest text-slate-400 transition-colors active:scale-[0.98] active:text-rose-400"
      >
        Continue without a path <span className="font-sans font-medium opacity-60">→</span>
      </button>
    </div>
  )
}
