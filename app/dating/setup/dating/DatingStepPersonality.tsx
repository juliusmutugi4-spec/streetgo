"use client"

interface DatingStepPersonalityProps {
  personalityTraits: string[]
  setPersonalityTraits: React.Dispatch<React.SetStateAction<string[]>>
  personality: string
  setPersonality: React.Dispatch<React.SetStateAction<string>>
}

const personalityOptions = [
  { id: "Calm", emoji: "🌿" },
  { id: "Ambitious", emoji: "🚀" },
  { id: "Funny", emoji: "😂" },
  { id: "Caring", emoji: "❤️" },
  { id: "Adventurous", emoji: "🌍" },
  { id: "Creative", emoji: "🎨" },
  { id: "Outgoing", emoji: "✨" },
  { id: "Family", emoji: "🏡" }, // "Family-oriented" shortened to prevent breaking layout columns
]

export default function DatingStepPersonality({
  personalityTraits,
  setPersonalityTraits,
  personality,
  setPersonality,
}: DatingStepPersonalityProps) {
  function toggleTrait(id: string) {
    setPersonalityTraits((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  return (
    <section className="w-full max-w-md bg-black px-1 font-sans text-white antialiased select-none">
      
      {/* HEADER SECTION */}
      <div className="mb-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Step 3 of 4
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
        </div>
        
        <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-100">
          Tell us about you
        </h2>
        
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Personality shapes conversations. Share traits that reflect your true self.
        </p>
      </div>

      {/* TRAITS ROW SELECTION */}
      <div className="mb-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Your Personality
          </p>
          <span className="text-[9px] font-medium tracking-wide text-slate-600 uppercase">
            Pick matching styles
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {personalityOptions.map((trait) => {
            const selected = personalityTraits.includes(trait.id)

            return (
              <button
                key={trait.id}
                type="button"
                onClick={() => toggleTrait(trait.id)}
                aria-pressed={selected}
                className={`relative flex flex-col items-center justify-center rounded-xl border py-2.5 text-center transition-all active:scale-[0.95] ${
                  selected
                    ? "border-rose-500/40 bg-gradient-to-b from-rose-500/10 to-pink-500/5 shadow-[0_0_12px_rgba(244,63,94,0.03)]"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10 active:bg-white/[0.04]"
                }`}
              >
                {/* Active Indicator Light */}
                {selected && (
                  <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-rose-400 animate-ping" />
                )}

                <span className={`text-base transition-transform duration-200 ${selected ? "scale-110" : "opacity-80"}`}>
                  {trait.emoji}
                </span>

                <span className={`mt-1 text-[9px] font-bold tracking-wide uppercase transition-colors ${
                  selected ? "text-rose-400" : "text-slate-400"
                }`}>
                  {trait.id}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* PERSONAL TEXT DESCRIPTION AREA */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="dating-personality" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            In your own words
          </label>
          <span className="text-[9px] font-medium tracking-wide text-slate-600 uppercase">
            Bio Text
          </span>
        </div>

        <div className="relative">
          <textarea
            id="dating-personality"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            maxLength={500}
            placeholder="I'm a calm and ambitious person who enjoys..."
            className="w-full h-20 resize-none rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs text-white leading-normal outline-none transition-all placeholder:text-slate-600 focus:border-rose-500/40 focus:bg-white/[0.04] focus:ring-1 focus:ring-rose-500/20"
          />
          <div className="absolute right-2 bottom-1.5 text-[8px] font-mono font-medium text-slate-700">
            {personality.length}/500
          </div>
        </div>

        <div className="mt-1 flex justify-between text-[9px] font-medium uppercase tracking-wider text-slate-600">
          <span>Be genuine</span>
          <span>No wrong answers</span>
        </div>
      </div>

      {/* FOOTER HELPER */}
      <p className="mt-4 text-center text-[9px] font-medium uppercase tracking-wider text-slate-600">
        Complete either action element above to proceed
      </p>

    </section>
  )
}
