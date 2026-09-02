'use client'

import type {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
} from 'react'

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
const STALL_AFTER_MS = 6000

const watchdogs = new WeakMap<
  RTCPeerConnection,
  () => void
>()

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
  let recovering = false

  const timer = window.setInterval(
    async () => {
      if (
        cancelledRef.current ||
        !mountedRef.current ||
        recovering
      ) {
        return
      }

      const currentPeer = peerRef.current
      const video = videoRef.current

      if (
        !currentPeer ||
        currentPeer !== peer ||
        !video
      ) {
        return
      }

      if (
        peer.connectionState === 'closed' ||
        peer.connectionState === 'failed'
      ) {
        return
      }

      try {
        const stats =
          await collectViewerStats(
            peer,
            previousStats,
          )

        if (
          cancelledRef.current ||
          !mountedRef.current
        ) {
          return
        }

        if (hasViewerFrames(stats)) {
          startedReceiving = true
        }

        if (
          previousStats &&
          hasViewerProgress(
            stats,
            previousStats,
          )
        ) {
          lastProgressAt = Date.now()
          setHasVideo(true)
        }

        previousStats = stats

        if (!startedReceiving) {
          return
        }

        const stalledFor =
          Date.now() - lastProgressAt

        const videoStopped =
          video.paused ||
          video.readyState < 2

        if (
          stalledFor >= STALL_AFTER_MS
        ) {
          recovering = true

          console.warn(
            'StreetGO Viewer: playback stalled. Reconnecting...',
            {
              stalledForMs: stalledFor,
              readyState:
                video.readyState,
              paused: video.paused,
              connectionState:
                peer.connectionState,
            },
          )

          setHasVideo(false)

          try {
            await video.play()
          } catch {}

          if (
            !cancelledRef.current &&
            mountedRef.current
          ) {
            onStall()
          }
        }
      } catch (err) {
        console.warn(
          'StreetGO Viewer playback watchdog error:',
          err,
        )
      }
    },
    CHECK_INTERVAL_MS,
  )

  const stop = () => {
    recovering = true
    window.clearInterval(timer)

    if (
      watchdogs.get(peer) === stop
    ) {
      watchdogs.delete(peer)
    }
  }

  watchdogs.set(peer, stop)

  return stop
}

export function stopViewerPlaybackWatchdog(
  peer: RTCPeerConnection | null,
) {
  if (!peer) {
    return
  }

  const stop = watchdogs.get(peer)

  if (stop) {
    stop()
  }
}