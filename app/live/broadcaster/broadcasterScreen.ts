'use client'

import type {
  ScreenCaptureOptions,
  ScreenCaptureResult,
} from './broadcasterScreenTypes'

export async function startScreenCapture(
  options: ScreenCaptureOptions = {},
): Promise<ScreenCaptureResult> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen sharing is not supported by this browser.')
  }

  const includeAudio = options.includeAudio ?? true
  const frameRate = options.frameRate ?? 30

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      width: {
        ideal: 1920,
      },
      height: {
        ideal: 1080,
      },
      frameRate: {
        ideal: frameRate,
      },
    },
    audio: includeAudio,
  })

  const videoTrack = stream.getVideoTracks()[0]

  if (!videoTrack) {
    stream.getTracks().forEach((track) => track.stop())

    throw new Error('No screen video track was provided.')
  }

  // Tell the browser this video contains detailed content
  // such as text, code, websites, documents and UI.
  try {
    videoTrack.contentHint = 'detail'
  } catch {
    // Some browsers may not support contentHint.
  }

  const settings = videoTrack.getSettings()

  console.log('🖥️ STREETGO SCREEN CAPTURE:', {
    width: settings.width,
    height: settings.height,
    frameRate: settings.frameRate,
    contentHint: videoTrack.contentHint,
    displaySurface: settings.displaySurface,
  })

  const audioTrack = stream.getAudioTracks()[0] ?? null

  return {
    stream,
    videoTrack,
    audioTrack,
  }
}

export function stopScreenCapture(
  stream: MediaStream | null,
) {
  if (!stream) return

  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

export function watchScreenCaptureEnded(
  stream: MediaStream,
  onEnded: () => void,
) {
  const videoTrack = stream.getVideoTracks()[0]

  if (!videoTrack) {
    return () => {}
  }

  const handleEnded = () => {
    onEnded()
  }

  videoTrack.addEventListener('ended', handleEnded)

  return () => {
    videoTrack.removeEventListener('ended', handleEnded)
  }
}