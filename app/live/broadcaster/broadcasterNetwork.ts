'use client'

import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'

interface BroadcasterNetworkOptions {
  cameraOn: boolean

  liveIdRef: MutableRefObject<
    string | null
  >

  stoppingRef: MutableRefObject<boolean>

  mountedRef: MutableRefObject<boolean>

  peerRef: MutableRefObject<
    RTCPeerConnection | null
  >

  streamRef: MutableRefObject<
    MediaStream | null
  >

  reconnectTimerRef: MutableRefObject<
    ReturnType<typeof setTimeout> | null
  >

  setIsOffline: Dispatch<
    SetStateAction<boolean>
  >

  setConnected: Dispatch<
    SetStateAction<boolean>
  >

  setConnecting: Dispatch<
    SetStateAction<boolean>
  >

  clearReconnectTimer: () => void

  reconnect: (
    liveId: string,
    stream: MediaStream
  ) => void
}

/*
 * ============================================================
 * SETUP BROADCASTER NETWORK
 * ============================================================
 *
 * Responsibilities:
 *
 * 1. Detect internet loss.
 * 2. Keep camera + microphone alive.
 * 3. Close WebRTC when internet disappears.
 * 4. Detect internet restoration.
 * 5. Reconnect WebRTC using the existing MediaStream.
 *
 * IMPORTANT:
 *
 * This module NEVER stops the camera when the
 * internet goes offline.
 *
 * Camera tracks are owned by broadcasterMedia.ts.
 *
 * WebRTC is owned by broadcasterWebRTC.ts.
 * ============================================================
 */

export function setupBroadcasterNetwork({
  cameraOn,
  liveIdRef,
  stoppingRef,
  mountedRef,
  peerRef,
  streamRef,
  reconnectTimerRef,
  setIsOffline,
  setConnected,
  setConnecting,
  clearReconnectTimer,
  reconnect,
}: BroadcasterNetworkOptions) {
  /*
   * ============================================================
   * OFFLINE
   * ============================================================
   */

  const handleOffline = () => {
    if (
      stoppingRef.current ||
      !mountedRef.current
    ) {
      return
    }

    console.log(
      'StreetGO Live: internet connection lost.'
    )

    /*
     * Mark network offline.
     */

    setIsOffline(true)

    /*
     * WebRTC is no longer connected.
     */

    setConnected(false)

    /*
     * The camera remains active.
     */

    if (cameraOn) {
      setConnecting(false)

      console.log(
        'StreetGO Live: camera remains active while waiting for internet.'
      )
    }

    /*
     * Cancel any pending reconnect.
     */

    clearReconnectTimer()

    /*
     * ========================================================
     * CLOSE WEBRTC ONLY
     * ========================================================
     *
     * DO NOT stop MediaStream tracks.
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
        // Ignore WebRTC cleanup errors.
      }

      peerRef.current =
        null
    }
  }

  /*
   * ============================================================
   * ONLINE
   * ============================================================
   */

  const handleOnline = () => {
    if (
      stoppingRef.current ||
      !mountedRef.current
    ) {
      return
    }

    console.log(
      'StreetGO Live: internet connection restored.'
    )

    setIsOffline(false)

    /*
     * Get the current Live ID.
     */

    const liveId =
      liveIdRef.current

    /*
     * Reuse the existing camera
     * and microphone stream.
     */

    const stream =
      streamRef.current

    /*
     * If broadcasting was active before
     * the network went offline, reconnect.
     */

    if (
      liveId &&
      stream
    ) {
      setConnecting(true)
      setConnected(false)

      clearReconnectTimer()

      /*
       * Give the browser a short moment
       * to stabilize the network.
       */

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

          console.log(
            'StreetGO Live: reconnecting WebRTC after internet restoration.'
          )

          reconnect(
            liveId,
            stream
          )
        }, 500)
    }
  }

  /*
   * ============================================================
   * REGISTER NETWORK EVENTS
   * ============================================================
   */

  window.addEventListener(
    'offline',
    handleOffline
  )

  window.addEventListener(
    'online',
    handleOnline
  )

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  return () => {
    window.removeEventListener(
      'offline',
      handleOffline
    )

    window.removeEventListener(
      'online',
      handleOnline
    )
  }
}