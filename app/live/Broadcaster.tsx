'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { useAuth } from '../hooks/useAuth'

const API_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL!

interface BroadcasterProps {
  liveId?: string
}

interface LiveSession {
  live_id: string
  title: string
  description?: string | null
  host_id: string
  host_name: string
  location?: string | null
  status: string
  viewer_count: number
  created_at?: string
  started_at?: string | null
  ended_at?: string | null
}

interface LiveResponse {
  success: boolean
  live: LiveSession
}

export default function Broadcaster({
  liveId: initialLiveId,
}: BroadcasterProps) {
  const {
    user,
    profile,
  } = useAuth()

  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    )

  const streamRef =
    useRef<MediaStream | null>(
      null
    )

  const peerRef =
    useRef<RTCPeerConnection | null>(
      null
    )

  const liveIdRef =
    useRef<string | null>(
      initialLiveId &&
        initialLiveId !== '1' &&
        initialLiveId !== 'unknown'
        ? initialLiveId
        : null
    )

  const stoppingRef =
    useRef(false)

  const startingRef =
    useRef(false)

  const reconnectingRef =
    useRef(false)

  const reconnectTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null)

  const mountedRef =
    useRef(true)

  const offlineRef =
    useRef(false)

  const [cameraOn, setCameraOn] =
    useState(false)

  const [connecting, setConnecting] =
    useState(false)

  const [connected, setConnected] =
    useState(false)

  const [isOffline, setIsOffline] =
    useState(false)

  const [error, setError] =
    useState('')

  /*
   * ============================================================
   * CLEAN RECONNECT TIMER
   * ============================================================
   */

  function clearReconnectTimer() {
    if (
      reconnectTimerRef.current
    ) {
      clearTimeout(
        reconnectTimerRef.current
      )

      reconnectTimerRef.current =
        null
    }
  }

  /*
   * ============================================================
   * GET LIVE SESSION
   * ============================================================
   */

  async function getLiveSession(
    id: string
  ): Promise<LiveSession> {
    const response =
      await fetch(
        `${API_URL}/live/${id}`,
        {
          method: 'GET',
          cache: 'no-store',
        }
      )

    if (!response.ok) {
      const text =
        await response.text()

      throw new Error(
        `Unable to get live session ${response.status}: ${text}`
      )
    }

    const result =
      (await response.json()) as LiveResponse

    if (
      !result?.success ||
      !result?.live
    ) {
      throw new Error(
        'Backend did not return a valid live session.'
      )
    }

    return result.live
  }

  /*
   * ============================================================
   * CREATE LIVE SESSION
   * ============================================================
   */

  async function createLiveSession(): Promise<string> {
    if (!user?.id) {
      throw new Error(
        'You must be logged in to start a live broadcast.'
      )
    }

    if (!profile?.username) {
      throw new Error(
        'Your StreetGO username could not be loaded.'
      )
    }

    const response =
      await fetch(
        `${API_URL}/live/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title:
              'StreetGo Live Camera',

            description:
              '',

            host_id:
              user.id,

            host_name:
              profile.username,

            location:
              null,
          }),
        }
      )

    if (!response.ok) {
      const text =
        await response.text()

      throw new Error(
        `Unable to create live session ${response.status}: ${text}`
      )
    }

    const result =
      await response.json()

    const newLiveId =
      result?.live?.live_id

    if (!newLiveId) {
      throw new Error(
        'Backend created the live session but did not return a live_id.'
      )
    }

    liveIdRef.current =
      newLiveId

    return newLiveId
  }

  /*
   * ============================================================
   * START LIVE SESSION
   * ============================================================
   */

  async function startLiveSession(
    id: string
  ) {
    const response =
      await fetch(
        `${API_URL}/live/${id}/start`,
        {
          method: 'POST',
        }
      )

    if (!response.ok) {
      const text =
        await response.text()

      throw new Error(
        `Unable to start live session ${response.status}: ${text}`
      )
    }

    await response.json()
  }

  /*
   * ============================================================
   * PREPARE LIVE SESSION
   * ============================================================
   */

  async function prepareLiveSession(): Promise<string> {
    let liveId =
      liveIdRef.current

    /*
     * No valid ID.
     */

    if (!liveId) {
      liveId =
        await createLiveSession()

      await startLiveSession(
        liveId
      )

      return liveId
    }

    /*
     * Check existing session.
     */

    let session: LiveSession

    try {
      session =
        await getLiveSession(
          liveId
        )
    } catch (err) {
      console.warn(
        'STREETGO: EXISTING LIVE SESSION COULD NOT BE LOADED.',
        err
      )

      liveId =
        await createLiveSession()

      await startLiveSession(
        liveId
      )

      return liveId
    }

    /*
     * Already live.
     */

    if (
      session.status === 'live'
    ) {
      return liveId
    }

    /*
     * Created but not started.
     */

    if (
      session.status === 'created'
    ) {
      await startLiveSession(
        liveId
      )

      return liveId
    }

    /*
     * Ended session cannot be reused.
     */

    if (
      session.status === 'ended'
    ) {
      liveId =
        await createLiveSession()

      await startLiveSession(
        liveId
      )

      return liveId
    }

    throw new Error(
      `Unsupported live session status: ${session.status}`
    )
  }

  /*
   * ============================================================
   * CREATE WEBRTC CONNECTION
   *
   * This can be called:
   * - during initial broadcast
   * - after temporary network loss
   * ============================================================
   */

  async function connectWebRTC(
    liveId: string,
    stream: MediaStream
  ) {
    if (
      stoppingRef.current ||
      !mountedRef.current
    ) {
      return
    }

    /*
     * Never create a WebRTC connection
     * while offline.
     */

    if (!navigator.onLine) {
      offlineRef.current = true
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      return
    }

    offlineRef.current = false
    setIsOffline(false)

    /*
     * Prevent duplicate simultaneous
     * connection attempts.
     */

    if (
      reconnectingRef.current
    ) {
      return
    }

    reconnectingRef.current =
      true

    clearReconnectTimer()

    /*
     * Close previous peer if there is one.
     */

    const oldPeer =
      peerRef.current

    if (oldPeer) {
      try {
        oldPeer.onconnectionstatechange =
          null

        oldPeer.oniceconnectionstatechange =
          null

        oldPeer.onicegatheringstatechange =
          null

        oldPeer.onsignalingstatechange =
          null

        oldPeer.close()
      } catch {
        // Ignore old peer cleanup errors.
      }

      peerRef.current =
        null
    }

    try {
      setConnecting(true)
      setConnected(false)
      setError('')

      /*
       * ======================================================
       * PEER CONNECTION
       * ======================================================
       */

      const peer =
        new RTCPeerConnection({
          iceServers: [
            {
              urls:
                'stun:stun.l.google.com:19302',
            },
            {
              urls:
                'stun:stun1.l.google.com:19302',
            },
          ],
        })

      peerRef.current =
        peer

      console.log(
        '=== STREETGO BROADCASTER ICE SERVERS ===',
        peer
          .getConfiguration()
          .iceServers
      )

      /*
       * ======================================================
       * ADD EXISTING CAMERA + MICROPHONE
       *
       * IMPORTANT:
       * We reuse streamRef instead of asking for
       * camera permission again.
       * ======================================================
       */

      stream
        .getTracks()
        .forEach(
          (
            track
          ) => {
            if (
              track.readyState ===
              'ended'
            ) {
              return
            }

            peer.addTrack(
              track,
              stream
            )
          }
        )

      /*
       * ======================================================
       * CONNECTION STATE
       * ======================================================
       */

      peer.onconnectionstatechange =
        () => {
          if (
            !mountedRef.current ||
            stoppingRef.current
          ) {
            return
          }

          console.log(
            '=== STREETGO BROADCASTER CONNECTION STATE ===',
            peer.connectionState
          )

          if (
            peer.connectionState ===
            'connected'
          ) {
            reconnectingRef.current =
              false

            setConnected(true)
            setConnecting(false)
            setIsOffline(false)
            setError('')

            return
          }

          if (
            peer.connectionState ===
            'connecting'
          ) {
            setConnected(false)
            setConnecting(true)

            return
          }

          if (
            peer.connectionState ===
            'disconnected'
          ) {
            setConnected(false)

            /*
             * A disconnected peer does NOT
             * automatically mean the broadcast
             * has ended.
             */

            if (
              !navigator.onLine
            ) {
              setIsOffline(true)
              setConnecting(false)

              console.log(
                'StreetGO Live: broadcaster offline, keeping camera alive.'
              )

              return
            }

            setConnecting(true)

            scheduleReconnect(
              liveId
            )

            return
          }

          if (
            peer.connectionState ===
            'failed'
          ) {
            setConnected(false)

            if (
              !navigator.onLine
            ) {
              setIsOffline(true)
              setConnecting(false)

              return
            }

            setConnecting(true)

            scheduleReconnect(
              liveId
            )

            return
          }

          if (
            peer.connectionState ===
            'closed'
          ) {
            setConnected(false)

            if (
              !navigator.onLine
            ) {
              setIsOffline(true)
              setConnecting(false)

              return
            }

            /*
             * Closed can happen during
             * our own reconnect cleanup.
             */
          }
        }

      /*
       * ======================================================
       * ICE STATE
       * ======================================================
       */

      peer.oniceconnectionstatechange =
        () => {
          if (
            !mountedRef.current ||
            stoppingRef.current
          ) {
            return
          }

          console.log(
            '=== STREETGO BROADCASTER ICE STATE ===',
            {
              iceConnectionState:
                peer.iceConnectionState,

              connectionState:
                peer.connectionState,

              signalingState:
                peer.signalingState,

              iceGatheringState:
                peer.iceGatheringState,
            }
          )

          if (
            peer.iceConnectionState ===
              'failed' ||
            peer.iceConnectionState ===
              'disconnected'
          ) {
            if (
              !navigator.onLine
            ) {
              setIsOffline(true)
              setConnected(false)
              return
            }

            scheduleReconnect(
              liveId
            )
          }
        }

      /*
       * ======================================================
       * ICE GATHERING
       * ======================================================
       */

      peer.onicegatheringstatechange =
        () => {
          console.log(
            '=== STREETGO BROADCASTER ICE GATHERING ===',
            peer.iceGatheringState
          )
        }

      /*
       * ======================================================
       * SIGNALING
       * ======================================================
       */

      peer.onsignalingstatechange =
        () => {
          console.log(
            '=== STREETGO BROADCASTER SIGNALING ===',
            peer.signalingState
          )
        }

      /*
       * ======================================================
       * CREATE SDP OFFER
       * ======================================================
       */

      const offer =
        await peer.createOffer()

      await peer.setLocalDescription(
        offer
      )

      /*
       * ======================================================
       * WAIT FOR ICE
       * ======================================================
       */

      await waitForIceGatheringComplete(
        peer
      )

      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        return
      }

      if (!navigator.onLine) {
        setIsOffline(true)
        setConnected(false)
        return
      }

      const localDescription =
        peer.localDescription

      if (
        !localDescription
      ) {
        throw new Error(
          'WebRTC local description was not created.'
        )
      }

      /*
       * ======================================================
       * SEND OFFER TO FASTAPI
       * ======================================================
       */

      const webrtcUrl =
        `${API_URL}/live/webrtc/offer`

      console.log(
        'WEBRTC BROADCASTER REQUEST:',
        {
          liveId,
          apiUrl: API_URL,
          sdpType:
            localDescription.type,
          hasSdp:
            !!localDescription.sdp,
        }
      )

      const response =
        await fetch(
          webrtcUrl,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              live_id:
                liveId,

              sdp:
                localDescription.sdp,

              type:
                localDescription.type,

              role:
                'broadcaster',
            }),
          }
        )

      if (!response.ok) {
        const text =
          await response.text()

        throw new Error(
          `WebRTC server error ${response.status}: ${text}`
        )
      }

      const answer =
        await response.json()

      /*
       * ======================================================
       * VALIDATE ANSWER
       * ======================================================
       */

      if (
        !answer?.type ||
        !answer?.sdp
      ) {
        throw new Error(
          'WebRTC server returned an invalid SDP answer.'
        )
      }

      /*
       * ======================================================
       * APPLY SERVER ANSWER
       * ======================================================
       */

      await peer.setRemoteDescription(
        {
          type:
            answer.type,

          sdp:
            answer.sdp,
        }
      )

      /*
       * ======================================================
       * FINAL STATE
       * ======================================================
       */

      if (
        peer.connectionState ===
        'connected'
      ) {
        setConnected(true)
        setConnecting(false)
      }
    } catch (err) {
      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        return
      }

      /*
       * Offline errors are expected.
       */

      if (
        !navigator.onLine
      ) {
        setIsOffline(true)
        setConnected(false)
        setConnecting(false)

        console.log(
          'StreetGO Live: WebRTC connection paused because device is offline.'
        )

        return
      }

      console.error(
        'StreetGo WebRTC error:',
        err
      )

      setConnected(false)

      /*
       * A temporary network/WebRTC failure
       * should attempt recovery.
       */
      scheduleReconnect(
        liveId
      )
    } finally {
      reconnectingRef.current =
        false

      if (
        !stoppingRef.current &&
        mountedRef.current
      ) {
        /*
         * If we are still offline,
         * don't show a hard error.
         */
        if (
          !navigator.onLine
        ) {
          setIsOffline(true)
          setConnecting(false)
        } else if (
          peerRef.current?.connectionState ===
          'connected'
        ) {
          setConnecting(false)
        } else {
          setConnecting(false)
        }
      }
    }
  }

  /*
   * ============================================================
   * SCHEDULE RECONNECT
   * ============================================================
   */

  function scheduleReconnect(
    liveId: string
  ) {
    if (
      stoppingRef.current ||
      !mountedRef.current
    ) {
      return
    }

    if (
      !navigator.onLine
    ) {
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      return
    }

    if (
      reconnectTimerRef.current
    ) {
      return
    }

    setConnected(false)
    setConnecting(true)
    setIsOffline(false)

    console.log(
      'StreetGO Live: scheduling WebRTC reconnect...'
    )

    reconnectTimerRef.current =
      setTimeout(() => {
        reconnectTimerRef.current =
          null

        if (
          stoppingRef.current ||
          !mountedRef.current ||
          !navigator.onLine
        ) {
          return
        }

        const stream =
          streamRef.current

        if (!stream) {
          return
        }

        void connectWebRTC(
          liveId,
          stream
        )
      }, 3000)
  }

  /*
   * ============================================================
   * START CAMERA
   * ============================================================
   */

  async function startCamera() {
    if (
      startingRef.current
    ) {
      return
    }

    if (cameraOn) {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)

      setError(
        'You are offline. Connect to the internet to start StreetGO Live.'
      )

      return
    }

    startingRef.current =
      true

    stoppingRef.current =
      false

    try {
      setError('')
      setIsOffline(false)
      setConnecting(true)
      setConnected(false)

      /*
       * ======================================================
       * PREPARE BACKEND SESSION
       * ======================================================
       */

      const liveId =
        await prepareLiveSession()

      liveIdRef.current =
        liveId

      /*
       * ======================================================
       * GET CAMERA + MICROPHONE
       * ======================================================
       */

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
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
          }
        )

      streamRef.current =
        stream

      /*
       * ======================================================
       * LOCAL CAMERA PREVIEW
       * ======================================================
       */

      if (
        videoRef.current
      ) {
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

      /*
       * ======================================================
       * WEBRTC CONNECTION
       * ======================================================
       */

      await connectWebRTC(
        liveId,
        stream
      )
    } catch (err) {
      if (
        !navigator.onLine
      ) {
        setIsOffline(true)
        setConnected(false)
        setConnecting(false)

        return
      }

      console.error(
        'StreetGo WebRTC error:',
        err
      )

      /*
       * Close WebRTC.
       */

      const peer =
        peerRef.current

      if (peer) {
        try {
          peer.close()
        } catch {
          // Ignore cleanup errors.
        }
      }

      peerRef.current =
        null

      /*
       * Stop camera + microphone
       * because initial startup failed.
       */

      stopMediaOnly()

      setCameraOn(false)
      setConnected(false)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start StreetGo Live.'
      )
    } finally {
      startingRef.current =
        false

      if (
        !navigator.onLine
      ) {
        setIsOffline(true)
        setConnecting(false)
      }
    }
  }

  /*
   * ============================================================
   * STOP MEDIA ONLY
   * ============================================================
   */

  function stopMediaOnly() {
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

    if (
      videoRef.current
    ) {
      videoRef.current.pause()

      videoRef.current.srcObject =
        null
    }
  }

  /*
   * ============================================================
   * STOP LIVE
   * ============================================================
   */

  async function stopCamera() {
    if (
      stoppingRef.current
    ) {
      return
    }

    stoppingRef.current =
      true

    clearReconnectTimer()

    try {
      setError('')

      /*
       * ======================================================
       * CLOSE WEBRTC
       * ======================================================
       */

      const peer =
        peerRef.current

      if (peer) {
        try {
          peer.onconnectionstatechange =
            null

          peer.oniceconnectionstatechange =
            null

          peer.onicegatheringstatechange =
            null

          peer.onsignalingstatechange =
            null

          peer.close()
        } catch {
          // Ignore cleanup errors.
        }
      }

      peerRef.current =
        null

      reconnectingRef.current =
        false

      /*
       * ======================================================
       * STOP CAMERA + MICROPHONE
       * ======================================================
       */

      stopMediaOnly()

      /*
       * ======================================================
       * END BACKEND SESSION
       * ======================================================
       */

      const liveId =
        liveIdRef.current

      if (liveId) {
        try {
          const response =
            await fetch(
              `${API_URL}/live/${liveId}/stop`,
              {
                method:
                  'POST',
              }
            )

          if (!response.ok) {
            const text =
              await response.text()

            console.warn(
              'StreetGo Live stop server response:',
              response.status,
              text
            )
          } else {
            await response.json()
          }
        } catch (err) {
          /*
           * If offline while stopping,
           * don't block local cleanup.
           */
          console.error(
            'StreetGo Live stop request failed:',
            err
          )
        }
      }

      /*
       * ======================================================
       * CLEAR STATE
       * ======================================================
       */

      liveIdRef.current =
        null

      setCameraOn(false)
      setConnected(false)
      setConnecting(false)
      setIsOffline(false)
    } catch (err) {
      console.error(
        'StreetGo stop camera error:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to stop StreetGO Live.'
      )

      setCameraOn(false)
      setConnected(false)
      setConnecting(false)
    } finally {
      stoppingRef.current =
        false
    }
  }

  /*
   * ============================================================
   * ONLINE / OFFLINE
   * ============================================================
   */

  useEffect(() => {
    mountedRef.current =
      true

    const handleOffline =
      () => {
        if (
          stoppingRef.current
        ) {
          return
        }

        offlineRef.current =
          true

        setIsOffline(true)
        setConnected(false)

        if (
          cameraOn
        ) {
          setConnecting(false)

          console.log(
            'StreetGO Live: device is offline. Camera remains active; waiting for connection.'
          )
        }

        clearReconnectTimer()

        /*
         * Close only the WebRTC peer.
         *
         * DO NOT stop camera tracks.
         */

        const peer =
          peerRef.current

        if (
          peer &&
          (
            peer.connectionState ===
              'connected' ||
            peer.connectionState ===
              'connecting'
          )
        ) {
          try {
            peer.close()
          } catch {
            // Ignore offline cleanup errors.
          }

          peerRef.current =
            null
        }
      }

    const handleOnline =
      () => {
        if (
          stoppingRef.current ||
          !mountedRef.current
        ) {
          return
        }

        offlineRef.current =
          false

        setIsOffline(false)

        console.log(
          'StreetGO Live: internet connection restored.'
        )

        const liveId =
          liveIdRef.current

        const stream =
          streamRef.current

        /*
         * If the camera was running,
         * reconnect WebRTC using the
         * existing camera/microphone tracks.
         */

        if (
          liveId &&
          stream
        ) {
          setConnecting(true)
          setConnected(false)

          clearReconnectTimer()

          reconnectTimerRef.current =
            setTimeout(() => {
              reconnectTimerRef.current =
                null

              if (
                stoppingRef.current ||
                !mountedRef.current ||
                !navigator.onLine
              ) {
                return
              }

              void connectWebRTC(
                liveId,
                stream
              )
            }, 500)
        }
      }

    window.addEventListener(
      'offline',
      handleOffline
    )

    window.addEventListener(
      'online',
      handleOnline
    )

    return () => {
      mountedRef.current =
        false

      window.removeEventListener(
        'offline',
        handleOffline
      )

      window.removeEventListener(
        'online',
        handleOnline
      )
    }
  }, [cameraOn])

  /*
   * ============================================================
   * CLEANUP ON UNMOUNT
   * ============================================================
   */

  useEffect(() => {
    return () => {
      mountedRef.current =
        false

      clearReconnectTimer()

      const peer =
        peerRef.current

      if (peer) {
        try {
          peer.onconnectionstatechange =
            null

          peer.oniceconnectionstatechange =
            null

          peer.onicegatheringstatechange =
            null

          peer.onsignalingstatechange =
            null

          peer.close()
        } catch {
          // Ignore cleanup errors.
        }
      }

      peerRef.current =
        null

      stopMediaOnly()
    }
  }, [])

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <section
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-950
        p-5
        text-white
      "
    >
      {/* HEADER */}

      <div className="mb-4">
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <div>
            <h2
              className="
                text-lg
                font-semibold
              "
            >
              StreetGo Live Camera
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Live video broadcaster
            </p>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className={`
                h-2.5
                w-2.5
                rounded-full
                ${
                  connected
                    ? 'bg-red-500'
                    : isOffline
                      ? 'bg-yellow-500'
                      : cameraOn
                        ? 'bg-yellow-500'
                        : 'bg-zinc-600'
                }
              `}
            />

            <span
              className="
                text-xs
                font-medium
                text-zinc-400
              "
            >
              {connected
                ? 'BROADCASTING'
                : isOffline
                  ? 'WAITING FOR CONNECTION...'
                  : connecting
                    ? 'CONNECTING...'
                    : cameraOn
                      ? 'RECONNECTING...'
                      : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      {/* VIDEO */}

      <div
        className="
          relative
          overflow-hidden
          rounded-xl
          bg-black
        "
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="
            aspect-video
            w-full
            object-cover
          "
        />

        {/* OFFLINE OVERLAY */}

        {isOffline &&
          cameraOn && (
            <div
              className="
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-center
                bg-black/45
                backdrop-blur-[1px]
              "
            >
              <div
                className="
                  mb-3
                  h-9
                  w-9
                  animate-spin
                  rounded-full
                  border-2
                  border-zinc-700
                  border-t-yellow-400
                "
              />

              <p
                className="
                  text-sm
                  font-medium
                  text-white
                "
              >
                Waiting for connection...
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-400
                "
              >
                Your camera remains on
              </p>
            </div>
          )}

        {/* RECONNECTING OVERLAY */}

        {!isOffline &&
          cameraOn &&
          !connected &&
          connecting && (
            <div
              className="
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-center
                bg-black/35
              "
            >
              <div
                className="
                  mb-3
                  h-8
                  w-8
                  animate-spin
                  rounded-full
                  border-2
                  border-zinc-700
                  border-t-red-500
                "
              />

              <p
                className="
                  text-sm
                  font-medium
                  text-white
                "
              >
                Reconnecting Live...
              </p>
            </div>
          )}
      </div>

      {/* ERROR */}

      {error && !isOffline && (
        <div
          className="
            mt-4
            rounded-lg
            border
            border-red-900
            bg-red-950/30
            px-4
            py-3
          "
        >
          <p
            className="
              text-sm
              text-red-400
            "
          >
            {error}
          </p>
        </div>
      )}

      {/* BUTTON */}

      <div
        className="
          mt-4
          flex
          gap-3
        "
      >
        {!cameraOn ? (
          <button
            type="button"
            onClick={() =>
              void startCamera()
            }
            disabled={
              connecting ||
              isOffline
            }
            className="
              rounded-lg
              bg-red-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:bg-red-500
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isOffline
              ? 'Waiting for Internet...'
              : connecting
                ? 'Starting Live...'
                : 'Start Live'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              void stopCamera()
            }
            disabled={
              stoppingRef.current
            }
            className="
              rounded-lg
              bg-zinc-800
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              hover:bg-zinc-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Stop Live
          </button>
        )}
      </div>

      {/* STATUS */}

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-4
          text-xs
          text-zinc-500
        "
      >
        <span>
          Camera:{' '}
          {cameraOn
            ? 'ON'
            : 'OFF'}
        </span>

        <span>
          Network:{' '}
          {isOffline
            ? 'OFFLINE'
            : 'ONLINE'}
        </span>

        <span>
          WebRTC:{' '}
          {connected
            ? 'CONNECTED'
            : connecting
              ? 'CONNECTING'
              : isOffline
                ? 'WAITING'
                : 'NOT CONNECTED'}
        </span>

        {liveIdRef.current && (
          <span>
            Live ID:{' '}
            {liveIdRef.current}
          </span>
        )}
      </div>
    </section>
  )
}

/*
 * ============================================================
 * WAIT FOR ICE GATHERING
 * ============================================================
 */

function waitForIceGatheringComplete(
  peer: RTCPeerConnection
): Promise<void> {
  return new Promise(
    (resolve) => {
      if (
        peer.iceGatheringState ===
        'complete'
      ) {
        resolve()
        return
      }

      let finished =
        false

      function finish() {
        if (finished) {
          return
        }

        finished =
          true

        peer.removeEventListener(
          'icegatheringstatechange',
          checkState
        )

        resolve()
      }

      function checkState() {
        if (
          peer.iceGatheringState ===
          'complete'
        ) {
          console.log(
            'STREETGO BROADCASTER ICE GATHERING: COMPLETE'
          )

          finish()
        }
      }

      peer.addEventListener(
        'icegatheringstatechange',
        checkState
      )
    }
  )
}