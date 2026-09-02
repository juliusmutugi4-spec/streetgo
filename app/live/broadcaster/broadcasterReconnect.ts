'use client'

export interface BroadcasterReconnectOptions {
  liveId: string

  stoppingRef: React.MutableRefObject<boolean>
  mountedRef: React.MutableRefObject<boolean>

  streamRef: React.MutableRefObject<MediaStream | null>

  reconnectTimerRef:
    React.MutableRefObject<
      ReturnType<typeof setTimeout> | null
    >

  setConnected: (
    value: boolean,
  ) => void

  setConnecting: (
    value: boolean,
  ) => void

  setIsOffline: (
    value: boolean,
  ) => void

  connect: (
    liveId: string,
    stream: MediaStream,
  ) => void
}

/*
 * Keep reconnect attempts controlled.
 *
 * A temporary WebRTC disconnect should not
 * immediately create a new peer connection.
 */
const RECONNECT_DELAY = 3000

/*
 * Prevent the same reconnect cycle from
 * being scheduled repeatedly.
 */
export function scheduleBroadcasterReconnect({
  liveId,
  stoppingRef,
  mountedRef,
  streamRef,
  reconnectTimerRef,
  setConnected,
  setConnecting,
  setIsOffline,
  connect,
}: BroadcasterReconnectOptions) {
  /*
   * ============================================================
   * STOPPED / UNMOUNTED
   * ============================================================
   */

  if (
    stoppingRef.current ||
    !mountedRef.current
  ) {
    return
  }

  /*
   * ============================================================
   * OFFLINE
   *
   * Do not start a reconnect timer while
   * the browser has no network connection.
   * ============================================================
   */

  if (!navigator.onLine) {
    setIsOffline(true)
    setConnected(false)
    setConnecting(false)

    console.log(
      'StreetGO Live: browser is offline. Reconnect paused.',
    )

    return
  }

  /*
   * ============================================================
   * ALREADY SCHEDULED
   *
   * Connection-state and ICE-state events can
   * fire almost simultaneously.
   *
   * Only allow one reconnect timer.
   * ============================================================
   */

  if (
    reconnectTimerRef.current !== null
  ) {
    return
  }

  /*
   * ============================================================
   * RECONNECTING UI
   * ============================================================
   */

  setConnected(false)
  setConnecting(true)
  setIsOffline(false)

  console.log(
    `StreetGO Live: WebRTC reconnect scheduled in ${RECONNECT_DELAY}ms.`,
  )

  /*
   * ============================================================
   * DELAYED RECONNECT
   *
   * The delay gives a temporarily disconnected
   * WebRTC connection a chance to recover before
   * we create another peer connection.
   * ============================================================
   */

  reconnectTimerRef.current =
    setTimeout(() => {
      reconnectTimerRef.current =
        null

      /*
       * ========================================================
       * VERIFY CURRENT STATE
       * ========================================================
       */

      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        return
      }

      /*
       * Network may have disappeared
       * during the reconnect delay.
       */

      if (!navigator.onLine) {
        setIsOffline(true)
        setConnected(false)
        setConnecting(false)

        console.log(
          'StreetGO Live: network went offline during reconnect delay.',
        )

        return
      }

      /*
       * ========================================================
       * REUSE EXISTING MEDIA
       *
       * Do NOT call getUserMedia() again.
       *
       * This keeps the camera/microphone alive and
       * prevents unnecessary permission prompts,
       * camera flickering, and device switching.
       * ========================================================
       */

      const stream =
        streamRef.current

      if (!stream) {
        setConnecting(false)

        console.warn(
          'StreetGO Live: reconnect aborted because the media stream is unavailable.',
        )

        return
      }

      /*
       * Make sure the stream still contains
       * usable media tracks.
       */

      const videoTracks =
        stream.getVideoTracks()

      const audioTracks =
        stream.getAudioTracks()

      const hasLiveVideo =
        videoTracks.some(
          (track) =>
            track.readyState ===
            'live',
        )

      const hasLiveAudio =
        audioTracks.some(
          (track) =>
            track.readyState ===
            'live',
        )

      /*
       * Video is required for StreetGO Live.
       */

      if (!hasLiveVideo) {
        setConnecting(false)

        console.warn(
          'StreetGO Live: reconnect aborted because the video track is no longer live.',
        )

        return
      }

      console.log(
        'StreetGO Live: reconnecting with existing media stream.',
        {
          videoTracks:
            videoTracks.length,
          audioTracks:
            audioTracks.length,
          hasLiveVideo,
          hasLiveAudio,
        },
      )

      /*
       * ========================================================
       * START NEW WEBRTC CONNECTION
       * ========================================================
       *
       * broadcasterWebRTC.ts is responsible for:
       *
       * - creating the RTCPeerConnection
       * - attaching tracks
       * - codec preferences
       * - encoder parameters
       * - adaptive quality
       * - SDP negotiation
       * - ICE handling
       *
       * This module only controls the reconnect timing.
       */

      try {
        connect(
          liveId,
          stream,
        )
      } catch (error) {
        /*
         * connect() is normally asynchronous and
         * reports its own errors. This catch protects
         * against synchronous failures.
         */

        console.error(
          'StreetGO Live: reconnect attempt failed to start.',
          error,
        )

        if (
          !stoppingRef.current &&
          mountedRef.current
        ) {
          setConnected(false)
          setConnecting(false)
        }
      }
    }, RECONNECT_DELAY)
}

/*
 * ==============================================================
 * CLEAR RECONNECT
 *
 * Useful when:
 *
 * - the broadcaster stops
 * - the connection recovers
 * - the component unmounts
 * - the user switches capture mode
 * ==============================================================
 */

export function clearBroadcasterReconnect(
  reconnectTimerRef:
    React.MutableRefObject<
      ReturnType<typeof setTimeout> | null
    >,
) {
  const timer =
    reconnectTimerRef.current

  if (timer === null) {
    return
  }

  clearTimeout(timer)

  reconnectTimerRef.current =
    null

  console.log(
    'StreetGO Live: pending WebRTC reconnect cancelled.',
  )
}