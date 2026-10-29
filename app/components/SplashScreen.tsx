'use client'

import { useEffect, useState } from 'react'

interface SplashScreenProps {
  progress: number
  status: string
}

export default function SplashScreen({
  progress,
  status,
}: SplashScreenProps) {


  return (
    <div 
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#04060a] select-none overflow-hidden"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >

      {/* Layer 1: Ambient Background Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.07)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />

      {/* Main Core Content Wrapper */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Brand Typography with Enhanced Spatial Contrast */}
        <h1 className="font-sans text-5xl font-black tracking-tight text-white antialiased">
          street<span className="text-emerald-500 font-extrabold ml-[1px] drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">go</span>
        </h1>

        {/* Precision Subtext & Real-time Metrics */}
        <div className="mt-8 flex items-center justify-between w-48 text-[10px] font-bold tracking-[0.25em] uppercase text-zinc-500 font-sans">
          <span>{status}</span>
          <span className="font-mono text-zinc-400 tracking-normal">{progress}%</span>
        </div>

        {/* High-End Sleek Loading Rail */}
        <div className="mt-3 h-[2px] w-48 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/[0.03]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all ease-out duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>

    </div>
  )
}
