'use client'

import type {
  MutableRefObject,
  RefObject,
} from 'react'

export type ViewerRecoveryReason =
  | 'playback-stall'
  | 'connection-disconnected'
  | 'connection-failed'
  | 'ice-disconnected'
  | 'ice-failed'
  | 'manual'

export interface ViewerRecoveryOptions {
  peerRef: MutableRefObject<RTCPeerConnection | null>
  videoRef: RefObject<HTMLVideoElement | null>
  retryTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  cancelledRef: MutableRefObject<boolean>
  mountedRef: MutableRefObject<boolean>
  reason: ViewerRecoveryReason
  reconnect: () => void
}

const RETRY_DELAY_MS = 3000

let recoveryInProgress = false

export function recoverViewer({
  peerRef,
  videoRef,
  retryTimerRef,
  cancelledRef,
  mountedRef,
  reason,
  reconnect,
}: ViewerRecoveryOptions) {
  if (
    recoveryInProgress ||
    cancelledRef.current ||
    !mountedRef.current
  ) {
    return
  }

  if (!navigator.onLine) {
    return
  }

  recoveryInProgress = true

  const peer =
    peerRef.current

  console.warn(
    'StreetGO Viewer: recovery started',
    {
      reason,
      connectionState:
        peer?.connectionState,
      iceConnectionState:
        peer?.iceConnectionState,
    },
  )

  const video =
    videoRef.current

  if (video) {
    void tryResumePlayback(video)
  }

  if (retryTimerRef.current) {
    clearTimeout(
      retryTimerRef.current,
    )

    retryTimerRef.current = null
  }

  retryTimerRef.current =
    setTimeout(() => {
      retryTimerRef.current = null

      recoveryInProgress = false

      if (
        cancelledRef.current ||
        !mountedRef.current ||
        !navigator.onLine
      ) {
        return
      }

      reconnect()
    }, RETRY_DELAY_MS)
}

export function resetViewerRecovery() {
  recoveryInProgress = false
}

export function cancelViewerRecovery(
  retryTimerRef: MutableRefObject<
    ReturnType<typeof setTimeout> | null
  >,
) {
  if (retryTimerRef.current) {
    clearTimeout(
      retryTimerRef.current,
    )

    retryTimerRef.current = null
  }

  recoveryInProgress = false
}

async function tryResumePlayback(
  video: HTMLVideoElement,
) {
  if (!video.srcObject) {
    return
  }

  if (video.readyState < 2) {
    return
  }

  if (!video.paused) {
    return
  }

  try {
    await video.play()

    console.log(
      'StreetGO Viewer: playback resumed without WebRTC reconnect.',
    )
  } catch (err) {
    console.warn(
      'StreetGO Viewer: playback resume failed.',
      err,
    )
  }
}