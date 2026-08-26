"use client"

import { ArrowLeft, ArrowRight, Heart } from "lucide-react"

interface DatingNavigationProps {
  step: number
  totalSteps: number
  canContinue: boolean
  saving: boolean
  onBack: () => void
  onNext: () => void
}

export default function DatingNavigation({
  step,
  totalSteps,
  canContinue,
  saving,
  onBack,
  onNext,
}: DatingNavigationProps) {
  const isLastStep = step === totalSteps

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-black/90 p-2.5 backdrop-blur-md sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none select-none">
      <div className="mx-auto flex w-full max-w-md gap-2">
        
        {/* BACK ACTION ELEMENT */}
        {step > 1 && (
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            aria-label="Previous step"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 transition-colors active:scale-95 active:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
          </button>
        )}

        {/* PRIMARY SUBMIT ACTION BUTTON */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue || saving}
          className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 text-[10px] font-black uppercase tracking-wider text-white shadow-[0_0_16px_rgba(244,63,94,0.1)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
        >
          {saving ? (
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span>Saving...</span>
            </div>
          ) : isLastStep ? (
            <>
              <span>Start Dating</span>
              <Heart className="h-3 w-3 fill-current text-white animate-pulse" />
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight className="h-3 w-3 stroke-[2.5]" />
            </>
          )}
        </button>

      </div>
    </div>
  )
}
