'use client'

import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react'
import {
  collectViewerStats,
  hasViewerFrames,
  hasViewerProgress,
  type ViewerStats,
} from './viewerStats'

export interface ViewerPlaybackWatchdogOptions {
  peerRef: MutableRefObject<RTCPeerConnection | null>
  videoRef: RefObject<HTMLVideoElement | null>
  cancelledRef: MutableRefObject<boolean>
  mountedRef: MutableRefObject<boolean>
  setHasVideo: Dispatch<SetStateAction<boolean>>
  onStall: () => void
}

const CHECK_INTERVAL_MS = 2000
const STALL_AFTER_MS = 12000

const watchdogs = new WeakMap<RTCPeerConnection, () => void>()

export function startViewerPlaybackWatchdog({
  peerRef,
  videoRef,
  cancelledRef,
  mountedRef,
  setHasVideo,
  onStall,
}: ViewerPlaybackWatchdogOptions) {
  const peer = peerRef.current
  if (!peer) {
    return () => {}
  }

  stopViewerPlaybackWatchdog(peer)

  let previousStats: ViewerStats | undefined
  let lastProgressAt = Date.now()
  let startedReceiving = false
  let isRecoveringActionActive = false

  const timer = window.setInterval(
    async () => {
      // 1. Guard immediate execution closures
      if (cancelledRef.current || !mountedRef.current || isRecoveringActionActive) {
        return
      }

      const currentPeer = peerRef.current
      const video = videoRef.current

      if (!currentPeer || currentPeer !== peer || !video) {
        return
      }

      if (peer.connectionState === 'closed' || peer.connectionState === 'failed') {
        return
      }

      // 2. YouTube-like behavior: If the user paused it, don't flag a progress stall
      if (video.paused) {
        lastProgressAt = Date.now() // Shift window forward smoothly
        return
      }

      try {
        const stats = await collectViewerStats(peer, previousStats)

        if (cancelledRef.current || !mountedRef.current) {
          return
        }

        if (hasViewerFrames(stats)) {
          startedReceiving = true
        }

        // Check if data packets or rendering frames progressed
        if (previousStats && hasViewerProgress(stats, previousStats)) {
          lastProgressAt = Date.now()
          setHasVideo(true)
        }

        previousStats = stats

        if (!startedReceiving) {
          return
        }

        const stalledFor = Date.now() - lastProgressAt
        const isVideoEngineStuck = video.readyState < 2 // HAVE_CURRENT_DATA or lower

        if (stalledFor >= STALL_AFTER_MS || isVideoEngineStuck) {
          isRecoveringActionActive = true
          
          console.warn('StreetGO Viewer: playback stalled. Reconnecting...', {
            stalledForMs: stalledFor,
            readyState: video.readyState,
            connectionState: peer.connectionState,
          })

          setHasVideo(false)

          try {
            // Attempt an inline engine wake-up kick before hard component stalling
            await video.play()
          } catch (playbackError) {
            console.debug('Watchdog engine kick-start skipped:', playbackError)
          }

          // Double check context hasn't changed during the microtask execution
          if (!cancelledRef.current && mountedRef.current) {
            onStall()
          }
          
          isRecoveringActionActive = false
        }
      } catch (err) {
        console.warn('StreetGO Viewer playback watchdog error:', err)
        isRecoveringActionActive = false
      }
    },
    CHECK_INTERVAL_MS,
  )

  const stop = () => {
    window.clearInterval(timer)
    if (watchdogs.get(peer) === stop) {
      watchdogs.delete(peer)
    }
  }

  watchdogs.set(peer, stop)
  return stop
}

export function stopViewerPlaybackWatchdog(peer: RTCPeerConnection | null) {
  if (!peer) {
    return
  }
  const stop = watchdogs.get(peer)
  if (stop) {
    stop()
  }
}
