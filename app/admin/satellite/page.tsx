'use client'

import { useEffect, useState } from 'react'

type Signal = {
  signal: string
  points: number
  status: string
}

type SatelliteData = {
  opportunity?: {
    opportunity_score: number
    maximum_score: number
    interpretation: string
    signals: Signal[]
  }
  starlink?: {
    summary: {
      "Starlink Direct-to-Cell": boolean
      "Kenya Mention": boolean
      "Airtel Africa Mention": boolean
      "Safaricom Mention": boolean
      "Commercial Signal": boolean
    }
  }
  history?: unknown[]
}

export default function SatellitePage() {
  const [data, setData] = useState<SatelliteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/satellite')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch radar intelligence data')
        return res.json()
      })
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm font-medium text-zinc-400">
        <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
        Initializing satellite radar system...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-center text-red-400">
        <p className="font-semibold">System Error</p>
        <p className="mt-1 text-sm text-red-400/80">{error || 'No data payload received.'}</p>
      </div>
    )
  }

  const score = data.opportunity?.opportunity_score ?? 0
  const maxScore = data.opportunity?.maximum_score ?? 100
  const totalScans = data.history?.length ?? 0
  const signals = data.opportunity?.signals ?? []
  
  // Intelligence Metrics
  const isDirectToCellReady = !!data.starlink?.summary["Starlink Direct-to-Cell"]
  const scoreColor = score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="mx-auto max-w-6xl p-6 text-zinc-100 space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            StreetGO Satellite Radar
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time geospatial intelligence, carrier mentions, and commercial signals.
          </p>
        </div>
        {data.opportunity?.interpretation && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-xs font-medium text-zinc-300 self-start md:self-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {data.opportunity.interpretation}
          </div>
        )}
      </header>

      {/* Main Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Opportunity Index">
          <span className={`text-3xl font-bold tracking-tight ${scoreColor}`}>
            {score}
          </span>
          <span className="text-zinc-500 text-sm font-normal"> / {maxScore}</span>
        </Card>

        <Card title="Direct-to-Cell Capability">
          <span className={`text-xl font-bold tracking-tight ${isDirectToCellReady ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {isDirectToCellReady ? 'OPERATIONAL' : 'DEACTIVATED'}
          </span>
        </Card>

        <Card title="Radar Coverage">
          <span className="text-3xl font-bold tracking-tight text-zinc-100">
            {totalScans}
          </span>
          <span className="text-zinc-500 text-sm font-normal"> active scans</span>
        </Card>
      </section>

      {/* Two-Column Detail Layout */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Signal Matrix Panel */}
        <section className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-200">
              Signal Intelligence Matrix
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Individual data feeds weighting the final opportunity index score.
            </p>
          </div>

          <div className="divide-y divide-zinc-800/60 border border-zinc-800/60 rounded-lg overflow-hidden bg-zinc-950/40">
            {signals.length === 0 ? (
              <p className="p-4 text-sm text-zinc-500 text-center">No telemetric signals registered.</p>
            ) : (
              signals.map((signal) => {
                const isFound = signal.status === "FOUND"
                return (
                  <div 
                    key={signal.signal} 
                    className="flex items-center justify-between p-3.5 text-sm transition-colors hover:bg-zinc-900/40"
                  >
                    <span className="font-medium text-zinc-300">{signal.signal}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                      isFound 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                        : 'bg-zinc-900 text-zinc-500 border border-transparent'
                    }`}>
                      {isFound ? `+${signal.points} pts` : 'ABSENT'}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Regional & Carrier Intercepts Panel */}
        {data.starlink?.summary && (
          <section className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-zinc-200">
                Network Intercepts
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Key vector flags detected in local registry.
              </p>
            </div>

            <div className="space-y-2">
              {Object.entries(data.starlink.summary)
                .filter(([key]) => key !== "Starlink Direct-to-Cell") // Handled in core card
                .map(([key, value]) => (
                  <div 
                    key={key} 
                    className="flex items-center justify-between rounded-lg bg-zinc-950/30 border border-zinc-800/40 p-3 text-xs"
                  >
                    <span className="text-zinc-400 font-medium">{key}</span>
                    <span className={`font-mono font-bold ${value ? 'text-cyan-400' : 'text-zinc-600'}`}>
                      {value ? 'TRUE' : 'FALSE'}
                    </span>
                  </div>
                ))
              }
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

interface CardProps {
  title: string
  children: React.ReactNode
}

function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm p-5 flex flex-col justify-between min-h-[110px]">
      <p className="text-zinc-400 text-xs font-medium tracking-wide uppercase">
        {title}
      </p>
      <div className="mt-3 flex items-baseline gap-1">
        {children}
      </div>
    </div>
  )
}
