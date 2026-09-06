'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { BroadcasterProps } from './broadcaster/broadcasterTypes'
import { setupBroadcasterNetwork } from './broadcaster/broadcasterNetwork'
import { createBroadcasterController } from './broadcaster/broadcasterController'
import BroadcasterUI from './broadcaster/BroadcasterUI'

export default function Broadcaster({
  liveId: initialLiveId,
}: BroadcasterProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null)

  const streamRef =
    useRef<MediaStream | null>(null)

  const peerRef =
    useRef<RTCPeerConnection | null>(null)

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
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    )

  const mountedRef =
    useRef(true)

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

  function clearReconnectTimer() {
    if (reconnectTimerRef.current) {
      clearTimeout(
        reconnectTimerRef.current
      )

      reconnectTimerRef.current =
        null
    }
  }

  const controller = useMemo(
    () =>
      createBroadcasterController({
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
      }),
    []
  )

  useEffect(() => {
    mountedRef.current = true

    const cleanup =
      setupBroadcasterNetwork({
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
        reconnect: (
          liveId,
          stream
        ) => {
          void controller.reconnect(
            liveId,
            stream
          )
        },
      })

    return cleanup
  }, [cameraOn, controller])

  useEffect(() => {
    return () => {
      mountedRef.current = false
      controller.cleanup()
    }
  }, [controller])

  return (
    <BroadcasterUI
      videoRef={videoRef}
      cameraOn={cameraOn}
      connecting={connecting}
      connected={connected}
      isOffline={isOffline}
      error={error}
      liveId={liveIdRef.current}
      stopping={stoppingRef.current}
      onStart={() =>
        void controller.startCamera()
      }
      onStartScreen={() => {
        console.log(
          'StreetGO: Screen Live button clicked'
        )

        void controller.startScreen()
      }}
      onSwitchCamera={() => {
        void controller.switchCamera()
      }}
      onStop={() =>
        void controller.stopBroadcast()
      }
    />
  )
}