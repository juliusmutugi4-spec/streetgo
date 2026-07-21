'use client'

import { Target } from "lucide-react"

interface Prediction {
  id: string
}

interface ProfilePredictionsProps {
  predictions: Prediction[]
}

export default function ProfilePredictions({
  predictions = [],
}: ProfilePredictionsProps) {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-6">

      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <h2 className="text-lg font-black text-white">
              Predictions
            </h2>

            <p className="text-xs text-zinc-500 font-mono">
              VERIFIED BETTING HISTORY
            </p>
          </div>
        </div>

        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
          <span className="font-mono text-xs font-bold text-emerald-300">
            {predictions.length} PICKS
          </span>
        </div>
      </header>
{predictions.length === 0 ? (
  <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-12 text-center">
    <Target className="mx-auto h-8 w-8 text-zinc-700" />

    <p className="mt-4 text-sm text-zinc-500">
      No predictions available.
    </p>
  </div>
) : (
  <div className="space-y-4">
    {predictions.map((prediction: any) => (
      <div
        key={prediction.id}
        className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">
            {prediction.title}
          </h3>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            PENDING
          </span>
        </div>

        {prediction.target_date && (
          <p className="mt-2 text-sm text-zinc-400">
            Target: {prediction.target_date}
          </p>
        )}

        <p className="mt-3 text-xs text-zinc-600">
          {new Date(prediction.created_at).toLocaleDateString()}
        </p>
      </div>
    ))}
  </div>
)}

    </section>
  )
}