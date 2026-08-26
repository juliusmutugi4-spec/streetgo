"use client"

interface DatingStepInterestsProps {
  interests: string[]
  setInterests: React.Dispatch<React.SetStateAction<string[]>>
}

const interestOptions = [
  { id: "Football", emoji: "⚽", label: "Football" },
  { id: "Music", emoji: "🎵", label: "Music" },
  { id: "Movies", emoji: "🎬", label: "Movies" },
  { id: "Technology", emoji: "💻", label: "Tech" },
  { id: "Travel", emoji: "✈️", label: "Travel" },
  { id: "Fitness", emoji: "🏋️", label: "Fitness" },
  { id: "Gaming", emoji: "🎮", label: "Gaming" },
  { id: "Food", emoji: "🍽️", label: "Food" },
  { id: "Business", emoji: "💼", label: "Biz" },
  { id: "Art", emoji: "🎨", label: "Art" },
  { id: "Reading", emoji: "📚", label: "Books" },
  { id: "Nature", emoji: "🌿", label: "Nature" },
]

export default function DatingStepInterests({
  interests,
  setInterests,
}: DatingStepInterestsProps) {
  function toggleInterest(id: string) {
    setInterests((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  return (
    <section className="w-full max-w-md bg-black px-1 font-sans text-white antialiased select-none">
      
      {/* HEADER SECTION */}
      <div className="mb-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Step 2 of 4
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
        </div>
        
        <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-100">
          What do you enjoy?
        </h2>
        
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Interests map out your profile to discover organic connections.
        </p>
      </div>

      {/* SELECTION BAR TRACKER */}
      <div className="mb-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] px-3 py-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Your interests
          </p>
          <p className="text-[9px] text-slate-600">
            Select matching activities
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-black bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md border border-rose-500/20">
            {interests.length}
          </span>
          <span className="text-[9px] font-medium tracking-wide text-slate-500 uppercase">
            Active
          </span>
        </div>
      </div>

      {/* COMPACT INTEREST GRID */}
      <div className="grid grid-cols-3 gap-2">
        {interestOptions.map((interest) => {
          const selected = interests.includes(interest.id)

          return (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggleInterest(interest.id)}
              aria-pressed={selected}
              className={`relative flex flex-col items-center justify-center rounded-xl border py-3 text-center transition-all active:scale-[0.96] ${
                selected
                  ? "border-rose-500/40 bg-gradient-to-b from-rose-500/10 to-pink-500/5 shadow-[0_0_12px_rgba(244,63,94,0.03)]"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 active:bg-white/[0.04]"
              }`}
            >
              {/* Micro Status Dot */}
              {selected && (
                <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-rose-400 animate-ping" />
              )}

              {/* Emoji Display */}
              <span className={`text-base transition-transform duration-200 ${selected ? "scale-110" : "opacity-80"}`}>
                {interest.emoji}
              </span>

              {/* Label */}
              <p className={`mt-1.5 text-[10px] font-bold tracking-wide uppercase transition-colors ${
                selected ? "text-rose-400" : "text-slate-400"
              }`}>
                {interest.label}
              </p>
            </button>
          )
        })}
      </div>

      {/* FOOTER VERIFICATION HELPER */}
      <p className="mt-4 text-center text-[9px] font-medium uppercase tracking-wider text-slate-600">
        Pick at least one interest to unlock progression
      </p>

    </section>
  )
}
