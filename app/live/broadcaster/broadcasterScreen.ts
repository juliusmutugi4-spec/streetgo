import type {
  ScreenCaptureOptions,
  ScreenCaptureResult,
} from './broadcasterScreenTypes'

export async function startScreenCapture(
  options: ScreenCaptureOptions = {}
): Promise<ScreenCaptureResult> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Screen sharing is not supported by this browser.')
  }

  const frameRate = options.frameRate ?? 30
  const includeAudio = options.includeAudio ?? true

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      frameRate: {
        ideal: frameRate,
        max: frameRate,
      },
    },
    audio: includeAudio,
  })

  const videoTrack = stream.getVideoTracks()[0]

  if (!videoTrack) {
    stream.getTracks().forEach((track) => track.stop())
    throw new Error('No screen video track was provided.')
  }

  const audioTrack = stream.getAudioTracks()[0] ?? null

  return {
    stream,
    videoTrack,
    audioTrack,
  }
}

export function stopScreenCapture(stream: MediaStream | null) {
  if (!stream) return

  stream.getTracks().forEach((track) => {
    track.stop()
  })
}

export function watchScreenCaptureEnded(
  stream: MediaStream,
  onEnded: () => void
) {
  const videoTrack = stream.getVideoTracks()[0]

  if (!videoTrack) return () => {}

  const handleEnded = () => {
    onEnded()
  }

  videoTrack.addEventListener('ended', handleEnded)

  return () => {
    videoTrack.removeEventListener('ended', handleEnded)
  }
}