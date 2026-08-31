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
    value: boolean
  ) => void

  setConnecting: (
    value: boolean
  ) => void

  setIsOffline: (
    value: boolean
  ) => void

  connect: (
    liveId: string,
    stream: MediaStream
  ) => void
}

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
   * ============================================================
   */

  if (!navigator.onLine) {
    setIsOffline(true)
    setConnected(false)
    setConnecting(false)

    return
  }

  /*
   * ============================================================
   * ALREADY WAITING FOR RECONNECT
   * ============================================================
   */

  if (
    reconnectTimerRef.current
  ) {
    return
  }

  /*
   * ============================================================
   * SHOW RECONNECTING STATE
   * ============================================================
   */

  setConnected(false)
  setConnecting(true)
  setIsOffline(false)

  console.log(
    "StreetGO Live: scheduling WebRTC reconnect..."
  )

  /*
   * ============================================================
   * WAIT 3 SECONDS
   * ============================================================
   */

  reconnectTimerRef.current =
    setTimeout(() => {
      reconnectTimerRef.current =
        null

      /*
       * Check state again after
       * the reconnect delay.
       */

      if (
        stoppingRef.current ||
        !mountedRef.current ||
        !navigator.onLine
      ) {
        return
      }

      /*
       * Reuse the existing camera
       * and microphone stream.
       */

      const stream =
        streamRef.current

      if (!stream) {
        setConnecting(false)

        return
      }

      /*
       * Start a new WebRTC connection.
       */

      void connect(
        liveId,
        stream
      )
    }, 3000)
}