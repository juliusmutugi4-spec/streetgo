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

// YouTube-Grade Pacing Constants:
const CHECK_INTERVAL_MS = 2500      // Slightly relaxed interval to match network packet arrival cycles
const STALL_AFTER_MS = 18000         // Increased threshold: gives the buffer room to naturally breath without sudden drops
const MAX_STALL_STRIKES = 3          // Must fail consecutive data cycles before executing an aggressive reconnection

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
  let stallStrikeCount = 0 // Accumulator to prevent premature false-alarm reconnections

  const timer = window.setInterval(
    async () => {
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

      // If the user manually paused the content, shift the timeline window forward 
      if (video.paused) {
        lastProgressAt = Date.now()
        stallStrikeCount = 0
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

        // Validate if incoming packets or processed frame counters advanced
        if (previousStats && hasViewerProgress(stats, previousStats)) {
          lastProgressAt = Date.now()
          stallStrikeCount = 0 // Perfect delivery! Fully reset structural strike counts
          setHasVideo(true)
        }

        previousStats = stats

        if (!startedReceiving) {
          return
        }

        const stalledFor = Date.now() - lastProgressAt
        const isVideoEngineStuck = video.readyState < 3 // HAVE_FUTURE_DATA verification barrier

        // Evaluate if the pipeline is truly broken or just temporarily adjusting
        if (stalledFor >= STALL_AFTER_MS || isVideoEngineStuck) {
          stallStrikeCount++
          
          console.log(`StreetGO Viewer: Minor pipeline delay detected. Warning strike: [${stallStrikeCount}/${MAX_STALL_STRIKES}]`)

          // The stream will ONLY undergo a heavy reconnect if it consistently fails multiple cycles
          if (stallStrikeCount >= MAX_STALL_STRIKES) {
            isRecoveringActionActive = true
            
            console.warn('StreetGO Viewer: Max check-strikes reached. Initiating clean stream recovery...', {
              stalledForMs: stalledFor,
              readyState: video.readyState,
              connectionState: peer.connectionState,
            })

            setHasVideo(false)

            try {
              // Attempt a silent inline engine playback kick before throwing a destructive layout stall reset
              await video.play()
            } catch (playbackError) {
              console.debug('Watchdog silent wake-up engine kick skipped:', playbackError)
            }

            if (!cancelledRef.current && mountedRef.current) {
              onStall()
            }
            
            isRecoveringActionActive = false
            stallStrikeCount = 0
          }
        } else {
          // Reset strikes if metrics are within safe operational bounds
          stallStrikeCount = 0
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
