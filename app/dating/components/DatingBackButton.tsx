"use client"

import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface DatingBackButtonProps {
  label?: string
  isLoading?: boolean
}

export default function DatingBackButton({
  label = "Back",
  isLoading = false,
}: DatingBackButtonProps) {
  const router = useRouter()

  const handleBack = () => {
    if (isLoading) return
    router.back()
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      disabled={isLoading}
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border border-cyan-500/30 bg-slate-950/40 px-4 py-2.5 text-sm font-semibold tracking-wide text-cyan-400 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-950/30 hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95 disabled:pointer-events-none disabled:opacity-70"
      aria-label={label}
    >
      {/* Futuristic Grid Glow Overlay */}
      <span className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4px_4px]" />

      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-[spin_0.4s_linear_infinite] text-cyan-400 filter drop-shadow-[0_0_4px_#22d3ee]" />
      ) : (
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      )}

      <span className="relative z-10 font-mono text-xs uppercase tracking-widest">
        {isLoading ? "Syncing..." : label}
      </span>
    </button>
  )
}
