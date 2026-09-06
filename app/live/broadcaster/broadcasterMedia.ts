'use client'

export interface BroadcasterMediaOptions {
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  streamRef: React.MutableRefObject<MediaStream | null>

  setCameraOn: (
    value: boolean
  ) => void

  setConnecting: (
    value: boolean
  ) => void

  setConnected: (
    value: boolean
  ) => void

  setIsOffline: (
    value: boolean
  ) => void

  setError: (
    value: string
  ) => void
}

export type CameraFacingMode =
  | 'user'
  | 'environment'

let currentFacingMode: CameraFacingMode =
  'user'

/*
 * ============================================================
 * START CAMERA + MICROPHONE
 * ============================================================
 */

export async function startBroadcasterMedia({
  videoRef,
  streamRef,
  setCameraOn,
  setConnecting,
  setConnected,
  setIsOffline,
  setError,
}: BroadcasterMediaOptions): Promise<MediaStream> {
  if (!navigator.onLine) {
    setIsOffline(true)
    setConnected(false)
    setConnecting(false)

    throw new Error(
      'You are offline. Connect to the internet to start StreetGO Live.'
    )
  }

  try {
    setError('')
    setIsOffline(false)
    setConnecting(true)
    setConnected(false)

    currentFacingMode =
      'user'

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            ideal: 1280,
          },

          height: {
            ideal: 720,
          },

          facingMode:
            currentFacingMode,
        },

        audio: {
          echoCancellation:
            true,

          noiseSuppression:
            true,

          autoGainControl:
            true,
        },
      })

    streamRef.current =
      stream

    if (videoRef.current) {
      videoRef.current.srcObject =
        stream

      videoRef.current.muted =
        true

      await videoRef.current
        .play()
        .catch(() => {
          console.warn(
            'Local camera autoplay was blocked.'
          )
        })
    }

    setCameraOn(true)

    return stream
  } catch (err) {
    if (!navigator.onLine) {
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)

      throw err
    }

    console.error(
      'StreetGO camera startup error:',
      err
    )

    setCameraOn(false)
    setConnected(false)
    setConnecting(false)

    setError(
      err instanceof Error
        ? err.message
        : 'Unable to access your camera and microphone.'
    )

    throw err
  }
}

/*
 * ============================================================
 * SWITCH FRONT / BACK CAMERA
 * ============================================================
 */

export async function switchBroadcasterCamera({
  videoRef,
  streamRef,
  peer,
}: Pick<
  BroadcasterMediaOptions,
  'videoRef' | 'streamRef'
> & {
  peer: RTCPeerConnection | null
}): Promise<void> {
  const stream =
    streamRef.current

  if (!stream) {
    throw new Error(
      'Camera stream is not active.'
    )
  }

  if (!peer) {
    throw new Error(
      'Live connection is not ready.'
    )
  }

  if (
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new Error(
      'Camera switching is not supported on this device.'
    )
  }

  const oldVideoTrack =
    stream.getVideoTracks()[0]

  if (!oldVideoTrack) {
    throw new Error(
      'No active camera track was found.'
    )
  }

  const nextFacingMode =
    currentFacingMode === 'user'
      ? 'environment'
      : 'user'

  let newStream: MediaStream | null =
    null

  try {
    newStream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            ideal: 1280,
          },

          height: {
            ideal: 720,
          },

          facingMode:
            nextFacingMode,
        },

        audio: false,
      })

    const newVideoTrack =
      newStream.getVideoTracks()[0]

    if (!newVideoTrack) {
      throw new Error(
        'The other camera could not be opened.'
      )
    }

    const videoSender =
      peer
        .getSenders()
        .find(
          sender =>
            sender.track?.kind ===
            'video'
        )

    if (!videoSender) {
      throw new Error(
        'Live video sender was not found.'
      )
    }

    await videoSender.replaceTrack(
      newVideoTrack
    )

    stream.removeTrack(
      oldVideoTrack
    )

    stream.addTrack(
      newVideoTrack
    )

    oldVideoTrack.stop()

    currentFacingMode =
      nextFacingMode

    if (videoRef.current) {
      videoRef.current.srcObject =
        stream

      videoRef.current.muted =
        true

      await videoRef.current
        .play()
        .catch(() => {})
    }

    newStream = null

    console.log(
      `StreetGO: switched to ${nextFacingMode === 'user' ? 'front' : 'back'} camera.`
    )
  } catch (err) {
    if (newStream) {
      newStream
        .getTracks()
        .forEach(track => {
          try {
            track.stop()
          } catch {}
        })
    }

    console.error(
      'StreetGO camera switch error:',
      err
    )

    throw err
  }
}

/*
 * ============================================================
 * STOP CAMERA + MICROPHONE
 * ============================================================
 */

export function stopBroadcasterMedia({
  videoRef,
  streamRef,
  setCameraOn,
  setConnecting,
  setConnected,
}: Pick<
  BroadcasterMediaOptions,
  | 'videoRef'
  | 'streamRef'
  | 'setCameraOn'
  | 'setConnecting'
  | 'setConnected'
>) {
  const stream =
    streamRef.current

  if (stream) {
    stream
      .getTracks()
      .forEach(
        track => {
          try {
            track.stop()
          } catch {
            // Ignore cleanup errors.
          }
        }
      )
  }

  streamRef.current =
    null

  currentFacingMode =
    'user'

  if (videoRef.current) {
    videoRef.current.pause()

    videoRef.current.srcObject =
      null
  }

  setCameraOn(false)
  setConnected(false)
  setConnecting(false)
}