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
} from './broadcasterMedia'

import {
  connectBroadcasterWebRTC,
} from './broadcasterWebRTC'

import {
  scheduleBroadcasterReconnect,
} from './broadcasterReconnect'

interface BroadcasterControllerOptions {
  videoRef: RefObject<
    HTMLVideoElement | null
  >

  streamRef: MutableRefObject<
    MediaStream | null
  >

  peerRef: MutableRefObject<
    RTCPeerConnection | null
  >

  liveIdRef: MutableRefObject<
    string | null
  >

  stoppingRef: MutableRefObject<
    boolean
  >

  startingRef: MutableRefObject<
    boolean
  >

  reconnectingRef: MutableRefObject<
    boolean
  >

  reconnectTimerRef: MutableRefObject<
    ReturnType<typeof setTimeout> | null
  >

  mountedRef: MutableRefObject<
    boolean
  >

  cameraOn: boolean

  setCameraOn: Dispatch<
    SetStateAction<boolean>
  >

  setConnecting: Dispatch<
    SetStateAction<boolean>
  >

  setConnected: Dispatch<
    SetStateAction<boolean>
  >

  setIsOffline: Dispatch<
    SetStateAction<boolean>
  >

  setError: Dispatch<
    SetStateAction<string>
  >

  clearReconnectTimer: () => void
}

/*
 * ============================================================
 * BROADCASTER CONTROLLER
 * ============================================================
 *
 * This module coordinates the broadcaster.
 *
 * It does NOT render UI.
 *
 * It does NOT directly contain:
 *
 * - camera UI
 * - network event listeners
 * - WebRTC implementation
 * - reconnect timer implementation
 *
 * Those responsibilities remain in their own modules.
 *
 * Controller responsibilities:
 *
 * - Start broadcaster
 * - Prepare live session
 * - Start camera
 * - Connect WebRTC
 * - Stop broadcaster
 * - Clean up local resources
 * ============================================================
 */

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
  cameraOn,
  setCameraOn,
  setConnecting,
  setConnected,
  setIsOffline,
  setError,
  clearReconnectTimer,
}: BroadcasterControllerOptions) {
  /*
   * ============================================================
   * RECONNECT
   * ============================================================
   */

  function reconnect(
    liveId: string,
    stream: MediaStream
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

  /*
   * ============================================================
   * SCHEDULE RECONNECT
   * ============================================================
   */

  function scheduleReconnect(
    liveId: string
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
        stream
      ) => {
        void reconnect(
          reconnectLiveId,
          stream
        )
      },
    })
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
       * PREPARE LIVE SESSION
       * ======================================================
       */

      const liveId =
        await prepareLiveSession(
          liveIdRef.current
        )

      if (
        stoppingRef.current ||
        !mountedRef.current
      ) {
        return
      }

      liveIdRef.current =
        liveId

      /*
       * ======================================================
       * START CAMERA
       * ======================================================
       */

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

      /*
       * ======================================================
       * CONNECT WEBRTC
       * ======================================================
       */

      await reconnect(
        liveId,
        stream
      )
    } catch (err) {
      if (
        stoppingRef.current
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

      console.error(
        'StreetGO broadcaster startup error:',
        err
      )

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
       * STOP MEDIA
       * ======================================================
       */

      stopBroadcasterMedia({
        videoRef,
        streamRef,

        setCameraOn,
        setConnecting,
        setConnected,
      })

      setIsOffline(false)

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start StreetGO Live.'
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
   * STOP CAMERA
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
       * STOP MEDIA
       * ======================================================
       */

      stopBroadcasterMedia({
        videoRef,
        streamRef,

        setCameraOn,
        setConnecting,
        setConnected,
      })

      /*
       * ======================================================
       * STOP BACKEND SESSION
       * ======================================================
       */

      const liveId =
        liveIdRef.current

      if (liveId) {
        try {
          await stopLiveSession(
            liveId
          )
        } catch (err) {
          console.error(
            'StreetGO Live stop request failed:',
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
        'StreetGO stop camera error:',
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
   * CLEANUP
   * ============================================================
   */

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

        peer.close()
      } catch {
        // Ignore cleanup errors.
      }
    }

    peerRef.current =
      null

    reconnectingRef.current =
      false

    stopBroadcasterMedia({
      videoRef,
      streamRef,

      setCameraOn,
      setConnecting,
      setConnected,
    })
  }

  /*
   * ============================================================
   * RETURN CONTROLLER API
   * ============================================================
   */

  return {
    startCamera,
    stopCamera,
    reconnect,
    scheduleReconnect,
    cleanup,
  }
}