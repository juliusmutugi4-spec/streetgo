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

    /*
     * ========================================================
     * GET CAMERA + MICROPHONE
     * ========================================================
     */

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
            'user',
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

    /*
     * ========================================================
     * SAVE STREAM
     * ========================================================
     */

    streamRef.current =
      stream

    /*
     * ========================================================
     * LOCAL CAMERA PREVIEW
     * ========================================================
     */

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
      'StreetGo camera startup error:',
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
        (
          track
        ) => {
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

  if (videoRef.current) {
    videoRef.current.pause()

    videoRef.current.srcObject =
      null
  }

  setCameraOn(false)
  setConnected(false)
  setConnecting(false)
}