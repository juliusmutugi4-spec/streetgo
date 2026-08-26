'use client'

import { useCallback, useEffect, useState } from 'react'

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

  // System Uptime Tracking simulation
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
    <div className="fixed bottom-20 right-6 z-50 select-none">
      {/* 🔮 THE ROUND CYBER BADGE CONTAINER */}
      <div 
        onClick={handleNavigation}
        className={`relative flex h-40 w-40 flex-col items-center justify-center rounded-full border text-center transition-all duration-500 ease-in-out cursor-pointer backdrop-blur-xl group
          ${driverOnline
            ? pendingRideCount > 0
              ? 'border-amber-500/40 bg-zinc-950/90 shadow-[0_0_30px_rgba(245,158,11,0.25),inset_0_0_20px_rgba(245,158,11,0.15)]'
              : 'border-emerald-500/40 bg-zinc-950/90 shadow-[0_0_30px_rgba(16,185,129,0.25),inset_0_0_20px_rgba(16,185,129,0.15)]'
            : 'border-zinc-800 bg-zinc-950/80 shadow-[0_12px_32px_rgba(0,0,0,0.6)]'
          }`}
      >
        
        {/* Outer Tech Ring Matrix */}
        <div className={`absolute inset-[-4px] rounded-full border border-dashed transition-all duration-1000 
          ${driverOnline 
            ? pendingRideCount > 0 
              ? 'border-amber-500/30 animate-[spin_20s_linear_infinite]' 
              : 'border-emerald-500/30 animate-[spin_30s_linear_infinite]' 
            : 'border-zinc-800/40'
          }`} 
        />

        {/* Top Arc Status Indicator Line */}
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="transparent"
            stroke={driverOnline ? (pendingRideCount > 0 ? '#f59e0b' : '#10b981') : '#27272a'}
            strokeWidth="2"
            strokeDasharray="295"
            strokeDashoffset={driverOnline ? "75" : "220"}
            className="transition-all duration-700 ease-in-out"
          />
        </svg>

        {/* INNER CONTENT CORE */}
        <div className="z-10 flex flex-col items-center justify-center p-4 w-full h-full">
          
          {/* System Title */}
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 transition-colors duration-300 group-hover:text-zinc-300">
            HUD Node
          </span>

          {/* Core Status / Action Button */}
          <button
            onClick={handleToggle}
            className={`mt-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-90
              ${driverOnline
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}
          >
            {driverOnline ? 'Active' : 'Standby'}
          </button>

          {/* Dynamic Metrics Display */}
          <div className="mt-2 min-h-[32px] flex flex-col items-center justify-center w-full px-2">
            {driverOnline ? (
              pendingRideCount > 0 ? (
                <div className="animate-pulse flex flex-col items-center">
                  <span className="text-[16px] font-black text-amber-400 leading-tight">
                    {pendingRideCount}R
                  </span>
                  <span className="text-[7px] font-bold text-orange-400 uppercase tracking-widest">
                    Routing
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                    {telemetryUptime}
                  </span>
                  <span className="text-[6px] font-black text-zinc-400 uppercase tracking-tight mt-0.5 animate-pulse">
                    Scanning Map
                  </span>
                </div>
              )
            ) : (
              <span className="text-[7px] font-bold text-zinc-600 uppercase tracking-widest text-center leading-normal">
                System<br />Suspended
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
