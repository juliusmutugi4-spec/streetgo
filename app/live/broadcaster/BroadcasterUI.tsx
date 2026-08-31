'use client'

import type { RefObject } from 'react'

interface BroadcasterUIProps {
  videoRef: RefObject<HTMLVideoElement | null>
  cameraOn: boolean
  connecting: boolean
  connected: boolean
  isOffline: boolean
  error: string | null
  liveId: string | null
  stopping: boolean
  onStart: () => void
  onStop: () => void
}

export default function BroadcasterUI({
  videoRef,
  cameraOn,
  connecting,
  connected,
  isOffline,
  error,
  liveId,
  stopping,
  onStart,
  onStop,
}: BroadcasterUIProps) {
  
  // Clean, deterministic status resolution
  const getStatusConfig = () => {
    if (connected) return { text: 'LIVE', dotColor: 'bg-red-500 animate-pulse' }
    if (stopping) return { text: 'STOPPING...', dotColor: 'bg-zinc-500' }
    if (connecting) return { text: 'CONNECTING...', dotColor: 'bg-amber-500' }
    if (isOffline) return { text: 'NETWORK OFFLINE', dotColor: 'bg-rose-600' }
    if (cameraOn) return { text: 'RECONNECTING...', dotColor: 'bg-amber-500 animate-pulse' }
    return { text: 'OFFLINE', dotColor: 'bg-zinc-500' }
  }

  const { text: statusText, dotColor } = getStatusConfig()

  return (
    <section className="relative flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 font-sans text-white select-none">
      
      {/* 1. Full Screen Immersive Video Layer */}
      <div className="absolute inset-0 z-0 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: cameraOn ? 1 : 0.15 }}
        />
        
        {/* Dark Screen Placeholder when Camera is Completely Off */}
        {!cameraOn && !connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
            <p className="text-sm font-medium text-zinc-400 tracking-wide">
              CAMERA IS CURRENTLY FEED-OFF
            </p>
          </div>
        )}
      </div>

      {/* 2. Top Professional Cinematic HUD Overlay */}
      <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight">StreetGo Studio</h1>
            {liveId && (
              <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 border border-zinc-700">
                ID: {liveId}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-300 opacity-90 hidden sm:block">
            Professional WebRTC Stream Broadcaster
          </p>
        </div>

        {/* Live Badging */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          <span className="text-xs font-semibold tracking-wider text-zinc-200">{statusText}</span>
        </div>
      </div>

      {/* 3. Mid-Screen Interactive Status Overlay blocks */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        {/* Offline & Reconnecting Feed Interrupted State */}
        {isOffline && cameraOn && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/85 p-6 text-center shadow-2xl backdrop-blur-md max-w-sm w-full transition-all">
            <Spinner color="border-t-amber-500" size="h-10 w-10" />
            <h3 className="text-sm font-semibold text-white">Network Connection Dropped</h3>
            <p className="mt-1 text-xs text-zinc-400">
              Camera pipeline is active. Attempting auto-reconnect...
            </p>
          </div>
        )}

        {/* Initial Connecting Loop State */}
        {!isOffline && cameraOn && !connected && connecting && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 text-center shadow-2xl backdrop-blur-md max-w-sm w-full">
            <Spinner color="border-t-red-500" size="h-10 w-10" />
            <h3 className="text-sm font-semibold text-white">Negotiating WebRTC Uplink</h3>
            <p className="mt-1 text-xs text-zinc-400">Optimizing bandwidth stream parameters...</p>
          </div>
        )}
      </div>

      {/* 4. Bottom Cinematic Control Dashboard Layer */}
      <div className="absolute inset-x-0 bottom-0 z-20 mt-auto bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-12">
        {/* Error Alert Sub-panel inside the layout dynamically */}
        {error && !isOffline && (
          <div className="mb-4 max-w-xl mx-auto rounded-lg border border-red-500/20 bg-red-950/70 px-4 py-3 shadow-xl backdrop-blur-sm transition-all animate-in fade-in slide-in-from-bottom-2">
            <div className="flex gap-2 items-center">
              <svg className="h-4 w-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs font-medium text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Interactive Master Actions & Status Telemetry Block */}
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-4">
          
          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-3 order-2 sm:order-1">
            {!cameraOn ? (
              <button
                type="button"
                onClick={onStart}
                disabled={connecting || isOffline}
                className="w-full sm:w-auto min-w-[140px] rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 px-6 py-3 text-sm font-semibold tracking-wide text-white transition shadow-lg shadow-red-900/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isOffline ? 'Waiting for Network' : connecting ? 'Booting Live...' : 'Go Live'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onStop}
                disabled={stopping}
                className="w-full sm:w-auto min-w-[140px] rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-900 px-6 py-3 text-sm font-semibold tracking-wide text-white border border-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {stopping ? 'Disconnecting...' : 'Stop Broadcast'}
              </button>
            )}
          </div>

          {/* Telemetry Hardware Feed Stats Grid */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-medium tracking-wide text-zinc-400 order-1 sm:order-2">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 uppercase font-bold text-[10px]">Camera:</span>
              <span className={cameraOn ? 'text-green-400' : 'text-zinc-500'}>{cameraOn ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 uppercase font-bold text-[10px]">Network:</span>
              <span className={isOffline ? 'text-red-400' : 'text-green-400'}>{isOffline ? 'DISCONNECTED' : 'STABLE'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500 uppercase font-bold text-[10px]">Uplink (WebRTC):</span>
              <span className={connected ? 'text-green-400' : connecting ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}>
                {connected ? 'CONNECTED' : connecting ? 'NEGOTIATING' : 'IDLE'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function Spinner({ color, size }: { color: string; size: string }) {
  return (
    <div className={`mb-3 ${size} animate-spin rounded-full border-2 border-white/10 ${color}`} />
  )
}
