'use client'

import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react'
import { recoverViewer } from './viewerRecovery'
import { prepareViewerPlayer, attachViewerStream, ensureViewerPlayback } from './viewerPlayer'
import { startViewerPlaybackWatchdog } from './viewerPlayback'
import { attachViewerTrack } from './viewerMedia'
import { startViewerStatsMonitor, statsMonitors, syncViewerReceivers } from './viewerSupport'

const API_URL = process.env.NEXT_PUBLIC_ENGINE_URL!

export interface ViewerConnectionOptions {
  peerRef: MutableRefObject<RTCPeerConnection | null>
  remoteStreamRef: MutableRefObject<MediaStream | null>
  videoRef: RefObject<HTMLVideoElement | null>
  playbackPromiseRef: MutableRefObject<Promise<void> | null>
  cancelledRef: MutableRefObject<boolean>
  mountedRef: MutableRefObject<boolean>
  retryTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  setConnected: Dispatch<SetStateAction<boolean>>
  setConnecting: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<string>>
  setHasVideo: Dispatch<SetStateAction<boolean>>
  setIsOffline: Dispatch<SetStateAction<boolean>>
}

export async function createViewerConnection(options: ViewerConnectionOptions): Promise<{ peer: RTCPeerConnection; remoteStream: MediaStream }> {
  const {
    peerRef, remoteStreamRef, videoRef, playbackPromiseRef, cancelledRef, mountedRef,
    retryTimerRef, setConnected, setConnecting, setError, setHasVideo, setIsOffline,
  } = options

  const iceResponse = await fetch(`${API_URL}/live/webrtc/ice-servers`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (cancelledRef.current || !mountedRef.current) throw new Error('Viewer connection cancelled.')
  if (!iceResponse.ok) {
    const text = await iceResponse.text()
    throw new Error(`Unable to get WebRTC ICE servers (${iceResponse.status}): ${text}`)
  }

  const iceData = await iceResponse.json()
  if (!Array.isArray(iceData?.iceServers) || !iceData.iceServers.length) {
    throw new Error('WebRTC ICE server list is empty.')
  }

  console.log('=== STREETGO VIEWER ICE SERVERS RECEIVED ===', iceData.iceServers)

  const peer = new RTCPeerConnection({ iceServers: iceData.iceServers })
  const remoteStream = new MediaStream()
  peerRef.current = peer
  remoteStreamRef.current = remoteStream

  prepareViewerPlayer({ videoRef, remoteStreamRef, playbackPromiseRef, cancelledRef, mountedRef })
  peer.addTransceiver('video', { direction: 'recvonly' })
  peer.addTransceiver('audio', { direction: 'recvonly' })

  startViewerPlaybackWatchdog({
    peerRef, videoRef, cancelledRef, mountedRef, setHasVideo,
    onStall: () => recoverViewer({
      peerRef, videoRef, retryTimerRef, cancelledRef, mountedRef,
      reason: 'playback-stall',
      reconnect: () => window.dispatchEvent(new CustomEvent('streetgo-viewer-reconnect')),
    }),
  })

  const stopStatsMonitor = startViewerStatsMonitor(peer, mountedRef, cancelledRef)
  statsMonitors.set(peer, stopStatsMonitor)

  const video = videoRef.current
  if (video) {
    video.autoplay = true
    video.playsInline = true
    video.muted = true
    video.preload = 'auto'

    video.onloadedmetadata = () => {
      if (cancelledRef.current) return
      setHasVideo(true)
      setError('')
      attachViewerStream(videoRef, remoteStream)
      void ensureViewerPlayback({ videoRef, playbackPromiseRef, cancelledRef, mountedRef })
    }

    video.oncanplay = () => {
      if (cancelledRef.current) return
      setHasVideo(true)
      setError('')
      attachViewerStream(videoRef, remoteStream)
      void ensureViewerPlayback({ videoRef, playbackPromiseRef, cancelledRef, mountedRef })
    }

    video.onplaying = () => {
      if (cancelledRef.current) return
      setHasVideo(true)
      setConnected(true)
      setConnecting(false)
      setError('')
      setIsOffline(false)
    }

    video.onerror = () => console.warn('STREETGO VIEWER VIDEO ELEMENT ERROR:', video.error)
  }

  peer.ontrack = (event) => {
    if (cancelledRef.current || !mountedRef.current) return

    if (event.streams.length) {
      const sourceStream = event.streams[0]
      for (const track of sourceStream.getTracks()) {
        attachViewerTrack(sourceStream, videoRef, remoteStreamRef, setHasVideo, setConnected, setConnecting, setError)
        if (!remoteStream.getTracks().some((existing) => existing.id === track.id)) remoteStream.addTrack(track)
      }
    } else if (!remoteStream.getTracks().some((existing) => existing.id === event.track.id)) {
      remoteStream.addTrack(event.track)
    }

    if (event.track.kind === 'video') {
      setHasVideo(true)
      setError('')
    }

    console.log('STREETGO VIEWER TRACK RECEIVED:', event.track.kind, event.track.id)
    attachViewerStream(videoRef, remoteStream)
    void ensureViewerPlayback({ videoRef, playbackPromiseRef, cancelledRef, mountedRef })
  }

  peer.onconnectionstatechange = () => {
    if (cancelledRef.current || !mountedRef.current) return
    console.log('=== STREETGO VIEWER CONNECTION STATE ===', peer.connectionState)

    if (peer.connectionState === 'connected') {
      setConnected(true)
      setConnecting(false)
      setError('')
      setIsOffline(false)
      syncViewerReceivers(peer, remoteStream, setHasVideo, setError)
      attachViewerStream(videoRef, remoteStream)
      void ensureViewerPlayback({ videoRef, playbackPromiseRef, cancelledRef, mountedRef })
      return
    }

    if (peer.connectionState === 'connecting') {
      setConnected(false)
      setConnecting(true)
      setError('')
      return
    }

    if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
      setConnected(false)
      if (!navigator.onLine) {
        setIsOffline(true)
        setConnecting(false)
        setError('')
        return
      }
      setConnecting(true)
      setError('Reconnecting to StreetGO Live...')
      recoverViewer({
        peerRef, videoRef, retryTimerRef, cancelledRef, mountedRef,
        reason: peer.connectionState === 'failed' ? 'connection-failed' : 'connection-disconnected',
        reconnect: () => window.dispatchEvent(new CustomEvent('streetgo-viewer-reconnect')),
      })
      return
    }

    if (peer.connectionState === 'closed') {
      setConnected(false)
      setConnecting(false)
    }
  }

  peer.oniceconnectionstatechange = () => {
    if (cancelledRef.current || !mountedRef.current) return

    console.log('=== STREETGO VIEWER ICE STATE ===', {
      iceConnectionState: peer.iceConnectionState,
      connectionState: peer.connectionState,
      signalingState: peer.signalingState,
      iceGatheringState: peer.iceGatheringState,
    })

    if (peer.iceConnectionState === 'connected' || peer.iceConnectionState === 'completed') setError('')

    if (peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'disconnected') {
      if (!navigator.onLine) {
        setIsOffline(true)
        setConnected(false)
        setConnecting(false)
        setError('')
        return
      }

      setConnected(false)
      setConnecting(true)
      recoverViewer({
        peerRef, videoRef, retryTimerRef, cancelledRef, mountedRef,
        reason: peer.iceConnectionState === 'failed' ? 'ice-failed' : 'ice-disconnected',
        reconnect: () => window.dispatchEvent(new CustomEvent('streetgo-viewer-reconnect')),
      })
    }
  }

  peer.onicegatheringstatechange = () => console.log('STREETGO VIEWER ICE GATHERING:', peer.iceGatheringState)
  peer.onsignalingstatechange = () => console.log('STREETGO VIEWER SIGNALING:', peer.signalingState)

  return { peer, remoteStream }
}
