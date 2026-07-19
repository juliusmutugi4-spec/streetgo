'use client'

import { useState, useEffect } from 'react'

export default function MaintenancePage() {
  const [timestamp, setTimestamp] = useState('')
  const [logs, setLogs] = useState<string[]>([
    'INIT: streetgo-edge-router connected',
    'SHARD: replicating partition tables (84%)'
  ])

  useEffect(() => {
    // Continuous precision time tracking
    setTimestamp(new Date().toISOString())
    const interval = setInterval(() => {
      setTimestamp(new Date().toISOString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Dynamic real-time server telemetry simulation
    const logPool = [
      'HEALTH: cluster-stg-91 micro-services optimized',
      'NET: caching layers flushed successfully',
      'SEC: rotated payload encryption keys',
      'DB: balancing master-replica indices',
      'API: streaming gateway nodes responding 200 OK'
    ]
    
    const logInterval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)]
      setLogs((prev) => [randomLog, prev[0]])
    }, 3500)

    return () => clearInterval(logInterval)
  }, [])

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070708] text-neutral-200 antialiased selection:bg-emerald-500/30 font-sans">
      
      {/* PERSPECTIVE GRID CYBER BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141417_1px,transparent_1px),linear-gradient(to_bottom,#141417_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />
      
      {/* VIBRANT GLOW ACCENTS */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] left-[30%] w-[300px] h-[150px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* CORE WRAPPER */}
      <div className="relative z-10 w-full max-w-xl px-6">
        
        {/* UPPER GLOW BAR LINE */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent mb-12" />

        {/* HEADER BRANDING */}
        <div className="flex items-center justify-between border-b border-neutral-800/50 pb-6 backdrop-blur-[2px]">
          <div className="flex items-center space-x-3 group">
            {/* High-Tech Reactive Isometric Logo Accent */}
            <div className="relative h-7 w-7 border border-neutral-700/80 rounded-md bg-neutral-900/90 flex items-center justify-center overflow-hidden shadow-inner group-hover:border-emerald-500/50 transition-colors duration-300">
              <div className="h-2 w-2 bg-emerald-500 rounded-sm animate-ping opacity-40 absolute" />
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-xs relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
            </div>
            <h1 className="font-['Nunito',_sans-serif] text-2xl font-black tracking-tight text-white select-none">
              street<span className="text-emerald-500 text-glow">go</span>
            </h1>
          </div>

          {/* DYNAMIC LIVE STATUS BADGE */}
          <div className="flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-950/20 px-3 py-1 text-[10px] font-bold tracking-widest text-emerald-400 uppercase shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="tabular-nums">SYS_MAINTENANCE</span>
          </div>
        </div>

        {/* CORE TELEMETRY PACK */}
        <div className="mt-12 space-y-5">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Upgrading network performance matrix.
          </h2>
          <p className="text-[14px] leading-relaxed text-neutral-400 font-normal max-w-lg">
            StreetGO core engine nodes are undergoing rolling cluster deployment passes. We are executing structural sharding layers alongside ultra-low latency edge routing arrays to provide rapid high-throughput processing.
          </p>
        </div>

        {/* CYBERTERMINAL SIMULATION MODULE */}
        <div className="mt-10 rounded-xl border border-neutral-800/80 bg-[rgba(10,10,12,0.4)] backdrop-blur-xl p-5 font-mono text-[11px] text-neutral-400 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-2.5 mb-3.5">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/40" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/40" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
              <span className="text-neutral-500 tracking-wider pl-2 text-[10px] font-bold">STG-NODE // TELEMETRY_STREAM</span>
            </div>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-widest text-[9px] shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              Node-91_Active
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-neutral-500 font-medium">SYSTEM TIMESTAMP:</span>
              <span className="text-neutral-200 tabular-nums bg-neutral-900/60 px-1.5 py-0.5 rounded border border-neutral-800/40">{timestamp || 'CALCULATING...'}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-neutral-500 font-medium">PIPELINE MATRIX:</span>
              <span className="text-emerald-400 font-bold tracking-wide">SHARD_REPLICATING (84%)</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-neutral-500 font-medium">OVERLAY LATENCY:</span>
              <span className="text-neutral-200 tabular-nums">0.02ms (EDGE FASTPATH)</span>
            </div>
            
            {/* LIVE FEED GENERATOR */}
            <div className="border-t border-neutral-800/40 pt-2.5 mt-2.5 space-y-1">
              <span className="text-[10px] text-neutral-600 block uppercase font-bold tracking-wider">Live Activity Stream:</span>
              {logs.map((log, index) => (
                <div key={index} className={`truncate transition-all duration-300 ${index === 0 ? 'text-neutral-300 font-semibold' : 'text-neutral-500 opacity-60'}`}>
                  <span className="text-emerald-500/50 mr-1.5">&gt;</span> {log}
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-neutral-800/40 pt-2.5 mt-2.5 text-[10px]">
              <span className="text-neutral-500 uppercase tracking-wider">ENGINEER IN CHARGE:</span>
              <span className="text-neutral-300 font-semibold tracking-wide">Plex Julius Mwangi Mutugi</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-neutral-500 uppercase tracking-wider">SYSTEM CONTACT:</span>
              <a href="mailto:tundastreet@gmail.com" className="text-neutral-400 hover:text-emerald-400 transition-colors underline decoration-neutral-800 hover:decoration-emerald-500/50">
                tundastreet@gmail.com
              </a>
            </div>
          </div>

          {/* High-Fidelity Micro Progress Indicator */}
          <div className="mt-5 h-[3px] w-full bg-neutral-950 rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-neutral-900" />
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-400 rounded-full w-[84%] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
          </div>
        </div>

        {/* BOTTOM GLOW BAR LINE */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent mt-12" />

        {/* FOOTER METRICS */}
        <footer className="mt-6 text-center text-[10px] text-neutral-600 tracking-widest uppercase selection:bg-neutral-800">
          &copy; {new Date().getFullYear()} StreetGO Technologies Inc. // All System Telemetry Encrypted (AES-256)
        </footer>
      </div>
    </main>
  )
}
