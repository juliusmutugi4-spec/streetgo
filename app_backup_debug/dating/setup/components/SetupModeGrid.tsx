"use client"

import SetupModeCard from "./SetupModeCard"

type SetupMode = "dating" | "business" | "job"

interface SetupModeGridProps {
  onChoose: (mode: SetupMode) => void
}

export default function SetupModeGrid({ onChoose }: SetupModeGridProps) {
  return (
    <section className="grid grid-cols-1 gap-2 w-full max-w-md bg-black px-1 font-sans text-white antialiased select-none">
      
      {/* SELECTION MATRIX CARD: DATING */}
      <SetupModeCard
        mode="dating"
        icon="❤️"
        title="Dating"
        description="Meet individuals, test compatibility, and foster relationships."
        action="Setup Dating"
        onClick={onChoose}
      />

      {/* SELECTION MATRIX CARD: BUSINESS */}
      <SetupModeCard
        mode="business"
        icon="💼"
        title="Business"
        description="Expand professional networks and unlock enterprise partnerships."
        action="Setup Business"
        onClick={onChoose}
      />

      {/* SELECTION MATRIX CARD: JOBS */}
      <SetupModeCard
        mode="job"
        icon="🎯"
        title="Jobs"
        description="Expose professional skills and sync up directly with active employers."
        action="Setup Jobs"
        onClick={onChoose}
      />

    </section>
  )
}
