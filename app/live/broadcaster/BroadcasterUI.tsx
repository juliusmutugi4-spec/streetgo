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
  onStartScreen: () => void
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
  onStartScreen,
  onStop,
}: BroadcasterUIProps) {
  const status = connected
    ? { text: 'You’re Live', dot: 'bg-red-500 animate-pulse' }
    : stopping
      ? { text: 'Stopping...', dot: 'bg-zinc-500' }
      : connecting
        ? { text: 'Connecting...', dot: 'bg-amber-400 animate-pulse' }
        : isOffline
          ? { text: 'You’re Offline', dot: 'bg-rose-500' }
          : cameraOn
            ? { text: 'Reconnecting...', dot: 'bg-amber-400 animate-pulse' }
            : { text: 'Ready to Go Live', dot: 'bg-zinc-500' }

  return (
    <section className="relative flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-white select-none">
      <div className="absolute inset-0 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
          style={{ opacity: cameraOn ? 1 : 0.12 }}
        />

        {!cameraOn && !connecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="px-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
                📹
              </div>

              <p className="text-sm font-medium text-zinc-300">
                Choose how you want to go live
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Use your camera or share your screen.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">
                StreetGo Live
              </h1>

              {liveId && (
                <span className="rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-[9px] text-zinc-400">
                  {liveId}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-zinc-300/80">
              Share what’s happening around you.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1.5 backdrop-blur-md">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            <span className="text-xs font-semibold text-zinc-200">
              {status.text}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none">
        {isOffline && cameraOn && (
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950/85 p-6 text-center shadow-2xl backdrop-blur-xl">
            <Spinner color="border-t-amber-400" />

            <h3 className="text-sm font-semibold text-white">
              Connection lost
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Your stream is still active. We’ll reconnect automatically.
            </p>
          </div>
        )}

        {!isOffline && cameraOn && !connected && connecting && (
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950/80 p-6 text-center shadow-2xl backdrop-blur-xl">
            <Spinner color="border-t-red-500" />

            <h3 className="text-sm font-semibold text-white">
              Getting you live...
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Connecting your stream to StreetGo.
            </p>
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pt-20 sm:p-6 sm:pt-24">
        {error && !isOffline && (
          <div className="mx-auto mb-4 max-w-xl rounded-xl border border-red-500/20 bg-red-950/60 px-4 py-3 backdrop-blur-md">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-sm">⚠️</span>

              <p className="text-xs leading-relaxed text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {!cameraOn ? (
          <div className="mx-auto flex max-w-5xl flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onStart}
              disabled={connecting || isOffline}
              className="rounded-xl bg-red-600 px-7 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {connecting ? 'Starting...' : '📹 Camera Live'}
            </button>

            <button
              type="button"
              onClick={onStartScreen}
              disabled={connecting || isOffline}
              className="rounded-xl border border-white/10 bg-zinc-800 px-7 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {connecting ? 'Starting...' : '🖥️ Screen Live'}
            </button>
          </div>
        ) : (
          <div className="mx-auto flex max-w-5xl justify-center border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onStop}
              disabled={stopping}
              className="min-w-[150px] rounded-xl border border-zinc-700 bg-zinc-800 px-7 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {stopping ? 'Stopping...' : 'Stop Live'}
            </button>
          </div>
        )}

        <div className="mx-auto mt-4 flex max-w-5xl justify-center gap-5 text-[10px] font-medium text-zinc-400">
          <div>
            <span className="text-zinc-600">CAMERA </span>
            <span className={cameraOn ? 'text-emerald-400' : 'text-zinc-500'}>
              {cameraOn ? 'ON' : 'OFF'}
            </span>
          </div>

          <div>
            <span className="text-zinc-600">INTERNET </span>
            <span className={isOffline ? 'text-red-400' : 'text-emerald-400'}>
              {isOffline ? 'OFFLINE' : 'CONNECTED'}
            </span>
          </div>

          <div>
            <span className="text-zinc-600">LIVE </span>
            <span
              className={
                connected
                  ? 'text-red-400'
                  : connecting
                    ? 'text-amber-400'
                    : 'text-zinc-500'
              }
            >
              {connected ? 'ON AIR' : connecting ? 'CONNECTING' : 'READY'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Spinner({ color }: { color: string }) {
  return (
    <div
      className={`mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-white/10 ${color}`}
    />
  )
}