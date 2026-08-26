"use client"

import { ShieldCheck } from "lucide-react"

interface DatingStepGoalsProps {
  lookingFor: string
  setLookingFor: React.Dispatch<React.SetStateAction<string>>
}

const goalOptions = [
  {
    id: "long_term",
    title: "Long-term relationship",
    description: "Something meaningful, stable and lasting.",
    emoji: "❤️",
  },
  {
    id: "meaningful_connection",
    title: "Meaningful connection",
    description: "Meet someone I genuinely connect with.",
    emoji: "🤝",
  },
  {
    id: "friendship",
    title: "Friendship first",
    description: "Build a friendship and see where it goes.",
    emoji: "💬",
  },
  {
    id: "open_to_see",
    title: "Open to seeing where it goes",
    description: "Meet naturally without forcing an outcome.",
    emoji: "✨",
  },
]

export default function DatingStepGoals({
  lookingFor,
  setLookingFor,
}: DatingStepGoalsProps) {
  return (
    <section className="w-full max-w-md bg-black px-1 font-sans text-white antialiased select-none">
      
      {/* HEADER SECTION */}
      <div className="mb-4 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
            Step 4 of 4
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
        </div>
        
        <h2 className="mt-1.5 text-xl font-black tracking-tight text-slate-100">
          What are you looking for?
        </h2>
        
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Being clear about intentions helps us surface compatible matches.
        </p>
      </div>

      {/* GOAL OPTIONS LIST */}
      <div className="space-y-2">
        {goalOptions.map((goal) => {
          const selected = lookingFor === goal.id

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => setLookingFor(goal.id)}
              aria-pressed={selected}
              className={`relative flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all active:scale-[0.98] ${
                selected
                  ? "border-rose-500/40 bg-gradient-to-r from-rose-500/10 to-pink-500/5 shadow-[0_0_12px_rgba(244,63,94,0.03)]"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 active:bg-white/[0.04]"
              }`}
            >
              {/* Micro Emoji Frame */}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-colors ${
                  selected ? "bg-rose-500/20" : "bg-white/[0.04]"
                }`}
              >
                {goal.emoji}
              </span>

              {/* Dynamic Option Typography */}
              <span className="min-w-0 flex-1">
                <span className={`block text-xs font-black tracking-wide ${selected ? "text-rose-400" : "text-slate-200"}`}>
                  {goal.title}
                </span>
                <span className="mt-0.5 block text-[10px] leading-normal text-slate-500">
                  {goal.description}
                </span>
              </span>

              {/* Minimal Radio Indicator */}
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                  selected ? "border-rose-500 bg-rose-500" : "border-white/20 bg-transparent"
                }`}
              >
                {selected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* PRIVACY ASSURANCE NOTE */}
      <div className="mt-4 border border-white/5 bg-white/[0.01] rounded-xl p-2.5">
        <div className="flex gap-2 items-start">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Your intention matters
            </p>
            <p className="mt-0.5 text-[9px] leading-relaxed text-slate-600">
              Matches optimize around your preferences. Change this selection anytime via settings.
            </p>
          </div>
        </div>
      </div>

    </section>
  )
}
