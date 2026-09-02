'use client'

import type {
  MutableRefObject,
  RefObject,
} from 'react'

export interface ViewerPlayerOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  remoteStreamRef: MutableRefObject<MediaStream | null>
  playbackPromiseRef: MutableRefObject<Promise<void> | null>
  cancelledRef: MutableRefObject<boolean>
  mountedRef: MutableRefObject<boolean>
}

export function prepareViewerPlayer({
  videoRef,
  remoteStreamRef,
  playbackPromiseRef,
  cancelledRef,
  mountedRef,
}: ViewerPlayerOptions) {
  const video = videoRef.current

  if (!video) {
    return
  }

  video.autoplay = true
  video.playsInline = true
  video.controls = false
  video.muted = true

  video.preload = 'auto'

  const stream =
    remoteStreamRef.current

  if (
    stream &&
    video.srcObject !== stream
  ) {
    video.srcObject = stream
  }

  if (
    cancelledRef.current ||
    !mountedRef.current
  ) {
    return
  }

  void ensureViewerPlayback({
    videoRef,
    playbackPromiseRef,
    cancelledRef,
    mountedRef,
  })
}

export async function ensureViewerPlayback({
  videoRef,
  playbackPromiseRef,
  cancelledRef,
  mountedRef,
}: Omit<
  ViewerPlayerOptions,
  'remoteStreamRef'
>) {
  const video = videoRef.current

  if (
    !video ||
    cancelledRef.current ||
    !mountedRef.current
  ) {
    return
  }

  if (!video.srcObject) {
    return
  }

  if (
    !video.paused &&
    video.readyState >= 2
  ) {
    return
  }

  if (
    playbackPromiseRef.current
  ) {
    try {
      await playbackPromiseRef.current
    } catch {}

    return
  }

  const promise =
    video.play()

  playbackPromiseRef.current =
    promise

  try {
    await promise
  } catch (err) {
    console.warn(
      'StreetGO Viewer: unable to start playback.',
      err,
    )
  } finally {
    if (
      playbackPromiseRef.current ===
      promise
    ) {
      playbackPromiseRef.current =
        null
    }
  }
}

export function attachViewerStream(
  videoRef: RefObject<HTMLVideoElement | null>,
  stream: MediaStream,
) {
  const video = videoRef.current

  if (!video) {
    return
  }

  video.autoplay = true
  video.playsInline = true
  video.muted = true
  video.preload = 'auto'

  if (
    video.srcObject !== stream
  ) {
    video.srcObject = stream
  }
}

export function detachViewerStream(
  videoRef: RefObject<HTMLVideoElement | null>,
) {
  const video = videoRef.current

  if (!video) {
    return
  }

  video.pause()
  video.srcObject = null
}

export function isViewerPlaybackHealthy(
  video: HTMLVideoElement | null,
) {
  if (!video) {
    return false
  }

  return (
    !!video.srcObject &&
    video.readyState >= 2 &&
    !video.paused &&
    !video.ended
  )
}