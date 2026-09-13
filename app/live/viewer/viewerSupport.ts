'use client'

import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { collectViewerStats, getPacketLossRate } from './viewerStats'

export const statsMonitors = new WeakMap<RTCPeerConnection, () => void>()

export function clearViewerRetry(timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current) {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }
}

export function scheduleViewerRetry(timerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>) {
  if (timerRef.current || !navigator.onLine) return
  timerRef.current = setTimeout(() => {
    timerRef.current = null
    if (!navigator.onLine) return
    window.dispatchEvent(new CustomEvent('streetgo-viewer-reconnect'))
  }, 3000)
}

export function syncViewerReceivers(
  peer: RTCPeerConnection,
  stream: MediaStream,
  setHasVideo: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
) {
  for (const receiver of peer.getReceivers()) {
    const track = receiver.track
    if (!track || track.readyState === 'ended') continue
    if (!stream.getTracks().some((existing) => existing.id === track.id)) stream.addTrack(track)
    if (track.kind === 'video') {
      setHasVideo(true)
      setError('')
    }
  }
}

export function startViewerStatsMonitor(
  peer: RTCPeerConnection,
  mountedRef: MutableRefObject<boolean>,
  cancelledRef: MutableRefObject<boolean>,
) {
  let previousStats: Awaited<ReturnType<typeof collectViewerStats>> | undefined
  let running = true

  const timer = window.setInterval(async () => {
    if (!running || cancelledRef.current || !mountedRef.current || peer.connectionState === 'closed') return
    try {
      const stats = await collectViewerStats(peer, previousStats)
      previousStats = stats
      console.log('=== STREETGO VIEWER STATS ===', {
        bitrateMbps: Number((stats.bitrate / 1000000).toFixed(2)),
        packetsReceived: stats.packetsReceived,
        packetsLost: stats.packetsLost,
        packetLossPercent: Number((getPacketLossRate(stats) * 100).toFixed(2)),
        jitterMs: Number((stats.jitter * 1000).toFixed(2)),
        rttMs: stats.rtt === null ? null : Number((stats.rtt * 1000).toFixed(2)),
        framesReceived: stats.framesReceived,
        framesDecoded: stats.framesDecoded,
      })
    } catch (err) {
      console.warn('StreetGO viewer stats error:', err)
    }
  }, 2000)

  return () => {
    running = false
    window.clearInterval(timer)
  }
}

export function stoppingOrCancelled(
  cancelledRef: MutableRefObject<boolean>,
  mountedRef: MutableRefObject<boolean>,
) {
  return cancelledRef.current || !mountedRef.current
}

export function waitForIceGathering(peer: RTCPeerConnection, timeoutMs = 1500): Promise<void> {
  if (peer.iceGatheringState === 'complete') return Promise.resolve()

  return new Promise((resolve) => {
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      peer.removeEventListener('icegatheringstatechange', check)
      resolve()
    }
    const check = () => {
      if (peer.iceGatheringState === 'complete') finish()
    }
    const timer = setTimeout(finish, timeoutMs)
    peer.addEventListener('icegatheringstatechange', check)
    check()
  })
}

export function stopViewerMonitors(peer: RTCPeerConnection) {
  const stopStats = statsMonitors.get(peer)
  if (stopStats) {
    stopStats()
    statsMonitors.delete(peer)
  }
  stopViewerPlaybackWatchdogSafe(peer)
}

function stopViewerPlaybackWatchdogSafe(peer: RTCPeerConnection) {
  // Kept here to avoid making playback ownership part of the connection coordinator.
  // The actual watchdog is stopped by viewerConnection, where it is installed.
  void peer
}
