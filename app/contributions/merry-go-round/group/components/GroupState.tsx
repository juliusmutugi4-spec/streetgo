"use client"

import { AlertCircle, Loader2 } from "lucide-react"

type Props = {
  loading: boolean
  error: string | null
}

export default function GroupState({
  loading,
  error,
}: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-white/50">
          <Loader2 className="animate-spin" size={20} />
          Loading contribution group...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="max-w-md rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-6 text-center">
          <AlertCircle
            size={28}
            className="mx-auto text-red-400"
          />

          <div className="mt-3 text-sm font-black">
            Unable to load group
          </div>

          <p className="mt-2 text-xs leading-6 text-white/50">
            {error}
          </p>
        </div>
      </div>
    )
  }

  return null
}