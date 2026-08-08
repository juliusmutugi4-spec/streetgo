'use client'

import { useCallback, useEffect, useState } from 'react'

// Strict UI Telemetry Subsystem Definitions
interface DriverOperationsHubProps {
  driverOnline: boolean
  pendingRideCount: number
  toggleDriverOnline: () => void
  onOpenDriver: () => void
}

export default function DriverOperationsHub({
  driverOnline,
  pendingRideCount,
  toggleDriverOnline,
  onOpenDriver,
}: DriverOperationsHubProps) {
  const [telemetryUptime, setTelemetryUptime] = useState<string>('00:00')

  // Synthetic Audio Generator for Premium HUD Feedback
  const triggerAudioPing = useCallback((frequency: number, duration: number) => {
    if (typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.value = frequency
      gain.gain.setValueAtTime(0.04, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch {
      // Fail silently if browser blocks automated audio context
    }
  }, [])

  // System Uptime Tracking simulation for immersive telemetry
  useEffect(() => {
    if (!driverOnline) {
      setTelemetryUptime('00:00')
      return
    }
    const startTime = Date.now()
    const timer = setInterval(() => {
      const diff = Date.now() - startTime
      const secs = Math.floor((diff / 1000) % 60)
      const mins = Math.floor((diff / 60000) % 60)
      setTelemetryUptime(
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [driverOnline])

  // Combined Interactions
  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      triggerAudioPing(driverOnline ? 280 : 540, 0.08)
      toggleDriverOnline()
    },
    [driverOnline, toggleDriverOnline, triggerAudioPing]
  )

  const handleNavigation = useCallback(() => {
    triggerAudioPing(660, 0.04)
    onOpenDriver()
  }, [onOpenDriver, triggerAudioPing])

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 border-t border-zinc-800/80 bg-zinc-950/80 shadow-[0_-12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-500 ease-in-out select-none">
      
      {/* 📡 Telemetry Status Ribbon Matrix */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] transition-all duration-700 ${
          driverOnline
            ? pendingRideCount > 0
              ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 shadow-[0_1px_12px_#f59e0b]'
              : 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-500 shadow-[0_1px_12px_#10b981]'
            : 'bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800'
        }`}
      />

      <div className="mx-auto max-w-xl px-5 py-3.5 flex items-center justify-between gap-4">
        
        {/* INTERACTIVE COMPONENT AXIS */}
        <div
          role="button"
          tabIndex={0}
          onClick={handleNavigation}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleNavigation()
          }}
          className="group flex-1 cursor-pointer outline-none"
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[12px] font-black uppercase tracking-widest text-zinc-100 flex items-center gap-1.5 transition-colors duration-300 group-hover:text-emerald-400">
                <span className="text-xs opacity-80 group-hover:animate-pulse">⚡</span>
                Operator System
              </h2>
              {driverOnline && (
                <div className="font-mono text-[9px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800/60 rounded px-1.5 py-0.5 tracking-wider">
                  UPTIME {telemetryUptime}
                </div>
              )}
            </div>

            {/* DYNAMIC TELEMETRY INTERFACE LOGIC */}
            <p className="text-[10px] font-bold tracking-wider uppercase transition-all duration-300">
              {driverOnline ? (
                pendingRideCount > 0 ? (
                  <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent font-black animate-pulse flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
                    {pendingRideCount} Network Link Request{pendingRideCount === 1 ? '' : 's'} Routing
                  </span>
                ) : (
                  <span className="text-emerald-400/90 tracking-wide font-medium flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
                    Scanning Coordinate Matrix...
                  </span>
                )
              ) : (
                <span className="text-zinc-500 font-medium tracking-wide flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-700" />
                  Core Suspended — Initialize Node
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CONTROLS EXPANSION DOWNLINK */}
        <button
          onClick={handleToggle}
          className={`relative overflow-hidden rounded-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
            driverOnline
              ? 'border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)] hover:border-emerald-400/50 hover:bg-emerald-500/20'
              : 'border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
          }`}
        >
          {/* Internal Glow Layer */}
          <span className={`absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300 ${driverOnline ? 'group-hover:opacity-100' : ''}`} />
          <span className="relative z-10">{driverOnline ? 'Active' : 'Standby'}</span>
        </button>

      </div>
    </div>
  )
}
