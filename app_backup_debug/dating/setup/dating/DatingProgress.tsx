"use client"

import { ArrowLeft, Heart } from "lucide-react"

interface DatingProgressProps {
  step: number
  totalSteps: number
  onBack: () => void
}

export default function DatingProgress({
  step,
  totalSteps,
  onBack,
}: DatingProgressProps) {
  // Ensure we don't divide by zero or exceed 100%
  const progress = totalSteps > 0 ? Math.min((step / totalSteps) * 100, 100) : 0
  const stepsLabels = ["About", "Interests", "Personality", "Goals"]

  return (
    <div className="w-full select-none bg-black p-3 font-sans text-white antialiased">
      {/* TOP NAVIGATION ROW */}
      <div className="flex items-center justify-between h-6">
        {/* Back Button - Micro & Borderless */}
        <button
          type="button"
          onClick={onBack}
          className="flex h-6 w-6 items-center justify-start text-slate-400 transition-colors active:text-rose-400"
          aria-label="Go back"
        >
          <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        {/* Center Brand - Ultra Tight */}
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3 fill-rose-500 text-rose-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-200">
            Dating
          </span>
        </div>

        {/* Step Indicator Counter */}
        <span className="w-6 text-right font-mono text-[10px] font-bold text-slate-500">
          {step}<span className="text-slate-700">/</span>{totalSteps}
        </span>
      </div>

      {/* TRACK & PROGRESS BAR */}
      <div className="mt-3">
        <div className="h-[3px] w-full rounded-full bg-slate-900 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* MICRO STEP LABELS */}
        <div className="mt-1.5 flex justify-between px-0.5">
          {stepsLabels.map((label, index) => {
            const currentStepIndex = index + 1
            const isActive = step >= currentStepIndex
            const isCurrent = step === currentStepIndex

            return (
              <span
                key={label}
                className={`text-[9px] font-medium tracking-wider uppercase transition-all duration-300 ${
                  isCurrent
                    ? "text-rose-400 font-bold scale-105"
                    : isActive
                    ? "text-slate-400 opacity-80"
                    : "text-slate-600 opacity-40"
                }`}
              >
                {label}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
