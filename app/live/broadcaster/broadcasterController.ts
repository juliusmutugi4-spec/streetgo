'use client'

import type {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
} from 'react'

import {
  prepareLiveSession,
  stopLiveSession,
} from './broadcasterSession'

import {
  startBroadcasterMedia,
  stopBroadcasterMedia,
  switchBroadcasterCamera,
} from './broadcasterMedia'

import {
  startScreenCapture,
  stopScreenCapture,
} from './broadcasterScreen'

import {
  connectBroadcasterWebRTC,
} from './broadcasterWebRTC'

import {
  scheduleBroadcasterReconnect,
} from './broadcasterReconnect'

type CaptureMode =
  | 'camera'
  | 'screen'

interface BroadcasterControllerOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  streamRef: MutableRefObject<MediaStream | null>
  peerRef: MutableRefObject<RTCPeerConnection | null>
  liveIdRef: MutableRefObject<string | null>
  stoppingRef: MutableRefObject<boolean>
  startingRef: MutableRefObject<boolean>
  reconnectingRef: MutableRefObject<boolean>
  reconnectTimerRef: MutableRefObject<
    ReturnType<typeof setTimeout> | null
  >
  mountedRef: MutableRefObject<boolean>
  setCameraOn: Dispatch<SetStateAction<boolean>>
  setConnecting: Dispatch<SetStateAction<boolean>>
  setConnected: Dispatch<SetStateAction<boolean>>
  setIsOffline: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<string>>
  clearReconnectTimer: () => void
}

export function createBroadcasterController({
  videoRef,
  streamRef,
  peerRef,
  liveIdRef,
  stoppingRef,
  startingRef,
  reconnectingRef,
  reconnectTimerRef,
  mountedRef,
  setCameraOn,
  setConnecting,
  setConnected,
  setIsOffline,
  setError,
  clearReconnectTimer,
}: BroadcasterControllerOptions) {
  let captureMode: CaptureMode =
    'camera'

  function reconnect(
    liveId: string,
    stream: MediaStream,
  ) {
    if (
      stoppingRef.current ||
      !mountedRef.current
    ) {
      return
    }

    return connectBroadcasterWebRTC({
      liveId,
      stream,
      captureMode,
      peerRef,
      stoppingRef,
      mountedRef,
      reconnectingRef,
      setConnecting,
      setConnected,
      setIsOffline,
      setError,
      clearReconnectTimer,
      scheduleReconnect,
    })
  }

  function scheduleReconnect(
    liveId: string,
  ) {
    scheduleBroadcasterReconnect({
      liveId,
      stoppingRef,
      mountedRef,
      streamRef,
      reconnectTimerRef,
      setConnected,
      setConnecting,
      setIsOffline,
      connect: (
        reconnectLiveId,
        stream,
      ) => {
        void reconnect(
          reconnectLiveId,
          stream,
        )
      },
    })
  }

  async function startCamera() {
    captureMode = 'camera'

    if (
      startingRef.current ||
      streamRef.current
    ) {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setError(
        'You are offline. Connect to the internet to start StreetGO Live.',
      )
      return
    }

    startingRef.current = true
    stoppingRef.current = false

    try {
      setError('')
      setIsOffline(false)
      setConnecting(true)
      setConnected(false)

      const liveId =
        await prepareLiveSession(
          liveIdRef.current,
        )

      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        return
      }

      liveIdRef.current =
        liveId

      const stream =
        await startBroadcasterMedia({
          videoRef,
          streamRef,
          setCameraOn,
          setConnecting,
          setConnected,
          setIsOffline,
          setError,
        })

      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        return
      }

      await reconnect(
        liveId,
        stream,
      )
    } catch (err) {
      handleStartupError(err)
    } finally {
      startingRef.current =
        false

      if (
        !stoppingRef.current &&
        mountedRef.current &&
        !navigator.onLine
      ) {
        setIsOffline(true)
        setConnecting(false)
      }
    }
  }

  async function startScreen() {
    captureMode = 'screen'

    if (
      startingRef.current ||
      streamRef.current
    ) {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setError(
        'You are offline. Connect to the internet to start StreetGO Live.',
      )
      return
    }

    startingRef.current = true
    stoppingRef.current = false

    try {
      setError('')
      setIsOffline(false)
      setConnecting(true)
      setConnected(false)

      const liveId =
        await prepareLiveSession(
          liveIdRef.current,
        )

      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        return
      }

      liveIdRef.current =
        liveId

      const result =
        await startScreenCapture({
          includeAudio: true,
          frameRate: 30,
        })

      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        stopScreenCapture(
          result.stream,
        )
        return
      }

      const stream =
        result.stream

      streamRef.current =
        stream

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream

        videoRef.current.muted =
          true

        await videoRef.current
          .play()
          .catch(() => {})
      }

      setCameraOn(true)
      setConnecting(true)

      const screenTrack =
        result.videoTrack

      screenTrack.addEventListener(
        'ended',
        () => {
          if (
            !mountedRef.current ||
            stoppingRef.current
          ) {
            return
          }

          void stopBroadcast()
        },
        { once: true },
      )

      await reconnect(
        liveId,
        stream,
      )
    } catch (err) {
      handleStartupError(err)
    } finally {
      startingRef.current =
        false

      if (
        !stoppingRef.current &&
        mountedRef.current &&
        !navigator.onLine
      ) {
        setIsOffline(true)
        setConnecting(false)
      }
    }
  }

  function handleStartupError(
    err: unknown,
  ) {
    if (
      stoppingRef.current ||
      !mountedRef.current
    ) {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      return
    }

    console.error(
      'StreetGO broadcaster startup error:',
      err,
    )

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

        peer.onicecandidate =
          null

        peer.close()
      } catch {}
    }

    peerRef.current = null
    reconnectingRef.current =
      false

    if (
      captureMode === 'screen'
    ) {
      stopScreenCapture(
        streamRef.current,
      )

      streamRef.current =
        null

      if (videoRef.current) {
        videoRef.current.srcObject =
          null
      }

      setCameraOn(false)
      setConnecting(false)
      setConnected(false)
    } else {
      stopBroadcasterMedia({
        videoRef,
        streamRef,
        setCameraOn,
        setConnecting,
        setConnected,
      })
    }

    setIsOffline(false)

    setError(
      err instanceof Error
        ? err.message
        : 'Unable to start StreetGO Live.',
    )
  }

  async function stopBroadcast() {
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

          peer.onicecandidate =
            null

          peer.close()
        } catch {}
      }

      peerRef.current = null
      reconnectingRef.current =
        false

      if (
        captureMode === 'screen'
      ) {
        stopScreenCapture(
          streamRef.current,
        )

        streamRef.current =
          null

        if (videoRef.current) {
          videoRef.current.srcObject =
            null
        }

        setCameraOn(false)
        setConnecting(false)
        setConnected(false)
      } else {
        stopBroadcasterMedia({
          videoRef,
          streamRef,
          setCameraOn,
          setConnecting,
          setConnected,
        })
      }

      const liveId =
        liveIdRef.current

      if (liveId) {
        try {
          await stopLiveSession(
            liveId,
          )
        } catch (err) {
          console.error(
            'StreetGO Live stop request failed:',
            err,
          )
        }
      }

      liveIdRef.current =
        null

      setCameraOn(false)
      setConnected(false)
      setConnecting(false)
      setIsOffline(false)
    } catch (err) {
      console.error(
        'StreetGO stop broadcast error:',
        err,
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to stop StreetGO Live.',
      )

      setCameraOn(false)
      setConnected(false)
      setConnecting(false)
    } finally {
      stoppingRef.current =
        false
    }
  }

async function stopCamera() {
  await stopBroadcast()
}

async function switchCamera() {
  if (
    captureMode !== 'camera' ||
    stoppingRef.current ||
    !mountedRef.current ||
    !streamRef.current
  ) {
    return
  }

  try {
    setError('')

    await switchBroadcasterCamera({
      videoRef,
      streamRef,
      peer: peerRef.current,
    })
  } catch (err) {
    console.error(
      'StreetGO camera switch failed:',
      err
    )

    if (
      !stoppingRef.current &&
      mountedRef.current
    ) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to switch camera.'
      )
    }
  }
}

  function cleanup() {
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

        peer.onicecandidate =
          null

        peer.close()
      } catch {}
    }

    peerRef.current = null
    reconnectingRef.current =
      false

    if (
      captureMode === 'screen'
    ) {
      stopScreenCapture(
        streamRef.current,
      )

      streamRef.current =
        null

      if (videoRef.current) {
        videoRef.current.srcObject =
          null
      }

      setCameraOn(false)
      setConnecting(false)
      setConnected(false)
    } else {
      stopBroadcasterMedia({
        videoRef,
        streamRef,
        setCameraOn,
        setConnecting,
        setConnected,
      })
    }
  }

return {
  startCamera,
  startScreen,
  switchCamera,
  stopCamera,
  stopBroadcast,
  reconnect,
  scheduleReconnect,
  cleanup,
}
}