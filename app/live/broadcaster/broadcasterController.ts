'use client'

import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react'
import { prepareLiveSession, stopLiveSession } from './broadcasterSession'
import { startBroadcasterMedia, stopBroadcasterMedia } from './broadcasterMedia'
import { connectBroadcasterWebRTC } from './broadcasterWebRTC'
import { scheduleBroadcasterReconnect } from './broadcasterReconnect'

interface BroadcasterControllerOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  streamRef: MutableRefObject<MediaStream | null>
  peerRef: MutableRefObject<RTCPeerConnection | null>
  liveIdRef: MutableRefObject<string | null>
  stoppingRef: MutableRefObject<boolean>
  startingRef: MutableRefObject<boolean>
  reconnectingRef: MutableRefObject<boolean>
  reconnectTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
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
  function reconnect(liveId: string, stream: MediaStream) {
    if (stoppingRef.current || !mountedRef.current) return
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

  function scheduleReconnect(liveId: string) {
    scheduleBroadcasterReconnect({
      liveId,
      stoppingRef,
      mountedRef,
      streamRef,
      reconnectTimerRef,
      setConnected,
      setConnecting,
      setIsOffline,
      connect: (reconnectLiveId, stream) => {
        void reconnect(reconnectLiveId, stream)
      },
    })
  }

  async function startCamera() {
    if (startingRef.current || streamRef.current) return
    if (!navigator.onLine) {
      setIsOffline(true)
      setError('You are offline. Connect to the internet to start StreetGO Live.')
      return
    }

    startingRef.current = true
    stoppingRef.current = false

    try {
      setError('')
      setIsOffline(false)
      setConnecting(true)
      setConnected(false)

      const liveId = await prepareLiveSession(liveIdRef.current)
      if (stoppingRef.current || !mountedRef.current) return

      liveIdRef.current = liveId

      const stream = await startBroadcasterMedia({
        videoRef,
        streamRef,
        setCameraOn,
        setConnecting,
        setConnected,
        setIsOffline,
        setError,
      })

      if (stoppingRef.current || !mountedRef.current) return

      await reconnect(liveId, stream)
    } catch (err) {
      if (stoppingRef.current || !mountedRef.current) return

      if (!navigator.onLine) {
        setIsOffline(true)
        setConnected(false)
        setConnecting(false)
        return
      }

      console.error('StreetGO broadcaster startup error:', err)

      const peer = peerRef.current
      if (peer) {
        try {
          peer.onconnectionstatechange = null
          peer.oniceconnectionstatechange = null
          peer.onicegatheringstatechange = null
          peer.onsignalingstatechange = null
          peer.close()
        } catch {}
      }

      peerRef.current = null
      reconnectingRef.current = false

      stopBroadcasterMedia({
        videoRef,
        streamRef,
        setCameraOn,
        setConnecting,
        setConnected,
      })

      setIsOffline(false)
      setError(err instanceof Error ? err.message : 'Unable to start StreetGO Live.')
    } finally {
      startingRef.current = false
      if (!stoppingRef.current && mountedRef.current && !navigator.onLine) {
        setIsOffline(true)
        setConnecting(false)
      }
    }
  }

  async function stopCamera() {
    if (stoppingRef.current) return

    stoppingRef.current = true
    clearReconnectTimer()

    try {
      setError('')

      const peer = peerRef.current
      if (peer) {
        try {
          peer.onconnectionstatechange = null
          peer.oniceconnectionstatechange = null
          peer.onicegatheringstatechange = null
          peer.onsignalingstatechange = null
          peer.close()
        } catch {}
      }

      peerRef.current = null
      reconnectingRef.current = false

      stopBroadcasterMedia({
        videoRef,
        streamRef,
        setCameraOn,
        setConnecting,
        setConnected,
      })

      const liveId = liveIdRef.current
      if (liveId) {
        try {
          await stopLiveSession(liveId)
        } catch (err) {
          console.error('StreetGO Live stop request failed:', err)
        }
      }

      liveIdRef.current = null
      setCameraOn(false)
      setConnected(false)
      setConnecting(false)
      setIsOffline(false)
    } catch (err) {
      console.error('StreetGO stop camera error:', err)
      setError(err instanceof Error ? err.message : 'Unable to stop StreetGO Live.')
      setCameraOn(false)
      setConnected(false)
      setConnecting(false)
    } finally {
      stoppingRef.current = false
    }
  }

  function cleanup() {
    clearReconnectTimer()

    const peer = peerRef.current
    if (peer) {
      try {
        peer.onconnectionstatechange = null
        peer.oniceconnectionstatechange = null
        peer.onicegatheringstatechange = null
        peer.onsignalingstatechange = null
        peer.close()
      } catch {}
    }

    peerRef.current = null
    reconnectingRef.current = false

    stopBroadcasterMedia({
      videoRef,
      streamRef,
      setCameraOn,
      setConnecting,
      setConnected,
    })
  }

  return { startCamera, stopCamera, reconnect, scheduleReconnect, cleanup }
}