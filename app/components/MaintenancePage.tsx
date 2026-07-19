'use client'

import { useState, useEffect } from 'react'

export default function MaintenancePage() {
  const [timestamp, setTimestamp] = useState('')

  useEffect(() => {
    setTimestamp(new Date().toISOString())
    const interval = setInterval(() => {
      setTimestamp(new Date().toISOString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090b] text-neutral-200 antialiased selection:bg-emerald-500/30">
      
      {/* PROFESSIONAL DOT MATRIX BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
      
      {/* CONTROLLED AMBIENT COMPRESSION GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* CORE CONTAINER */}
      <div className="relative z-10 w-full max-w-xl px-6">
        
        {/* HEADER BRANDING */}
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-6">
          <div className="flex items-center space-x-3">
            {/* Minimal High-Tech Isomorphic Logo Accent */}
            <div className="relative h-6 w-6 border border-neutral-700 rounded bg-neutral-900 flex items-center justify-center overflow-hidden">
              <div className="h-2 w-2 bg-emerald-500 rounded-sm animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
            </div>
            <h1 className="font-['Nunito',_sans-serif] text-xl font-extrabold tracking-tight text-white">
              street<span className="text-emerald-500">go</span>
            </h1>
          </div>
          
          {/* MICRO LIVE REGIONAL STATUS PIN */}
          <div className="flex items-center space-x-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>KE_CLUSTER_MAINTENANCE</span>
          </div>
        </div>

        {/* CONTENT PACK */}
        <div className="mt-10 space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Optimizing environment performance.
          </h2>
          
          <p className="text-[14px] leading-relaxed text-neutral-400 font-normal">
            StreetGO regional nodes across Kenya are undergoing a seamless rolling infrastructure update. Under the technical oversight of Julius Mwangi Mutugi, our engineering team is optimizing localized database sharding and edge routing configurations to guarantee faster transaction processing speeds nationwide.
          </p>
        </div>

        {/* ENTERPRISE PROCESS DISPLAY */}
        <div className="mt-10 rounded-lg border border-neutral-800/80 bg-neutral-900/30 backdrop-blur-md p-4 font-mono text-[11px] text-neutral-400 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2 mb-3">
            <span className="text-neutral-500 tracking-wider">DEPLOYMENT LOGS</span>
            <span className="text-emerald-500/80 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-bold uppercase tracking-widest text-[9px]">
              Active NBO-STG-91
            </span>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-neutral-500">TIMESTAMP:</span>
              <span className="text-neutral-300 tabular-nums">{timestamp || 'FETCHING...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">LEAD CONTROLLER:</span>
              <span className="text-neutral-300 uppercase tracking-wide">J. M. MUTUGI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">PIPELINE STATUS:</span>
              <span className="text-neutral-300">SHARD_REPLICATING (84%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">NETWORK NODE:</span>
              <span className="text-emerald-400">KENYA_MAIN_GATEWAY</span>
            </div>
          </div>

          {/* Clean Progress Meter */}
          <div className="mt-4 h-1.5 w-full bg-neutral-950 border border-neutral-800/80 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-[84%] transition-all duration-500 ease-out" />
          </div>
        </div>

        {/* MINIMAL FOOTER SUB-TEXT */}
        <footer className="mt-12 text-center text-[11px] text-neutral-600 tracking-wide">
          &copy; {new Date().getFullYear()} StreetGO Technologies Inc. All systems telemetry encrypted.
        </footer>

      </div>
    </main>
  )
}
