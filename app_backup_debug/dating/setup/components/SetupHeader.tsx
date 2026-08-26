"use client"

interface SetupHeaderProps {
  onBack: () => void
  onSkip: () => void
}

export default function SetupHeader({
  onBack,
  onSkip,
}: SetupHeaderProps) {
  return (
    <header
      className="
        flex
        h-7
        items-center
        justify-between
        bg-black
        px-1
        font-sans
        text-white
        antialiased
        select-none
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-2">

        {/* BACK TO NORMAL FEED */}
        <button
          type="button"
          onClick={onBack}
          className="
            flex
            h-6
            items-center
            justify-center
            rounded-lg
            border
            border-white/5
            bg-white/[0.02]
            px-2
            text-[9px]
            font-black
            uppercase
            tracking-widest
            text-slate-400
            transition-all
            hover:bg-white/[0.05]
            hover:text-white
            active:scale-[0.96]
          "
        >
          ← Back
        </button>

        {/* BRAND */}
        <div className="flex items-center gap-1.5">
          <h1
            className="
              text-[11px]
              font-black
              uppercase
              tracking-widest
              text-slate-100
            "
          >
            Street
            <span
              className="
                bg-gradient-to-r
                from-rose-500
                to-pink-500
                bg-clip-text
                text-transparent
              "
            >
              GO
            </span>
          </h1>

          <span className="h-2 w-px bg-white/10" />

          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            Onboarding
          </p>
        </div>
      </div>

      {/* SKIP — LEAVE THIS BEHAVIOR ALONE */}
      <button
        type="button"
        onClick={onSkip}
        className="
          flex
          h-6
          items-center
          justify-center
          rounded-lg
          border
          border-white/5
          bg-white/[0.02]
          px-2.5
          text-[9px]
          font-black
          uppercase
          tracking-widest
          text-slate-400
          transition-all
          active:scale-[0.96]
          active:bg-white/[0.05]
          active:text-white
        "
      >
        Skip
      </button>
    </header>
  )
}