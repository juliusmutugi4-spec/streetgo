'use client'

import type { Dispatch, MutableRefObject, RefObject, SetStateAction } from 'react'
import { recoverViewer, cancelViewerRecovery, resetViewerRecovery } from './viewerRecovery'
import { attachViewerStream, ensureViewerPlayback } from './viewerPlayer'
import { clearViewerMedia } from './viewerMedia'
import { stopViewerPlaybackWatchdog } from './viewerPlayback'
import { createViewerConnection } from './viewerConnection'
import { clearViewerRetry, scheduleViewerRetry, stoppingOrCancelled, waitForIceGathering, statsMonitors } from './viewerSupport'

const API_URL = process.env.NEXT_PUBLIC_ENGINE_URL!

export interface ViewerWebRTCOptions {
  liveId: string
  videoRef: RefObject<HTMLVideoElement | null>
  peerRef: MutableRefObject<RTCPeerConnection | null>
  remoteStreamRef: MutableRefObject<MediaStream | null>
  playbackPromiseRef: MutableRefObject<Promise<void> | null>
  cancelledRef: MutableRefObject<boolean>
  mountedRef: MutableRefObject<boolean>
  retryTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>
  connectingRef: MutableRefObject<boolean>
  setConnecting: Dispatch<SetStateAction<boolean>>
  setConnected: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<string>>
  setHasVideo: Dispatch<SetStateAction<boolean>>
  setIsOffline: Dispatch<SetStateAction<boolean>>
}

export async function connectViewerWebRTC(options: ViewerWebRTCOptions): Promise<void> {
  const {
    liveId, videoRef, peerRef, remoteStreamRef, playbackPromiseRef, cancelledRef, mountedRef,
    retryTimerRef, connectingRef, setConnecting, setConnected, setError, setHasVideo, setIsOffline,
  } = options

  if (cancelledRef.current || !mountedRef.current || connectingRef.current) return
  if (!navigator.onLine) {
    setIsOffline(true)
    setConnected(false)
    setConnecting(false)
    return
  }

  connectingRef.current = true
  resetViewerRecovery()
  clearViewerRetry(retryTimerRef)

  const oldPeer = peerRef.current
  if (oldPeer) {
    stopViewerMonitors(oldPeer)
    try {
      oldPeer.ontrack = null
      oldPeer.onconnectionstatechange = null
      oldPeer.oniceconnectionstatechange = null
      oldPeer.onicegatheringstatechange = null
      oldPeer.onsignalingstatechange = null
      oldPeer.close()
    } catch {}
    peerRef.current = null
  }

  try {
    setError('')
    setConnecting(true)
    setConnected(false)
    setHasVideo(false)
    setIsOffline(false)
    clearViewerMedia({ videoRef, remoteStreamRef })
    playbackPromiseRef.current = null

    if (cancelledRef.current || !mountedRef.current) return

    const { peer, remoteStream } = await createViewerConnection({
      peerRef, remoteStreamRef, videoRef, playbackPromiseRef, cancelledRef, mountedRef,
      retryTimerRef, setConnected, setConnecting, setError, setHasVideo, setIsOffline,
    })

    if (cancelledRef.current || !mountedRef.current) {
      stopViewerMonitors(peer)
      return
    }

    const offer = await peer.createOffer()
    if (cancelledRef.current || !mountedRef.current) {
      stopViewerMonitors(peer)
      return
    }

    await peer.setLocalDescription(offer)
    await waitForIceGathering(peer, 1500)

    if (cancelledRef.current || !mountedRef.current) {
      stopViewerMonitors(peer)
      return
    }

    if (!navigator.onLine) {
      stopViewerMonitors(peer)
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      return
    }

    const localDescription = peer.localDescription
    if (!localDescription?.sdp) throw new Error('Viewer local description was not created.')

    console.log('WEBRTC VIEWER REQUEST:', {
      liveId,
      apiUrl: API_URL,
      sdpType: localDescription.type,
      hasSdp: !!localDescription.sdp,
    })

    const response = await fetch(`${API_URL}/live/webrtc/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        live_id: liveId,
        sdp: localDescription.sdp,
        type: localDescription.type,
        role: 'viewer',
      }),
    })

    if (cancelledRef.current || !mountedRef.current) {
      stopViewerMonitors(peer)
      return
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`WebRTC server error ${response.status}: ${text}`)
    }

    const answer = await response.json()
    console.log('=== WEBRTC ANSWER RECEIVED ===', answer)

    if (answer?.type !== 'answer' || typeof answer?.sdp !== 'string' || !answer.sdp) {
      throw new Error('WebRTC server returned an invalid SDP answer.')
    }

    if (peer.signalingState !== 'have-local-offer') {
      throw new Error(`Cannot apply WebRTC answer in signaling state: ${peer.signalingState}`)
    }

    await peer.setRemoteDescription({ type: 'answer', sdp: answer.sdp })

    if (cancelledRef.current || !mountedRef.current) {
      stopViewerMonitors(peer)
      return
    }

    console.log('STREETGO VIEWER ANSWER APPLIED')
    attachViewerStream(videoRef, remoteStream)
    setError('')
    void ensureViewerPlayback({ videoRef, playbackPromiseRef, cancelledRef, mountedRef })
  } catch (err) {
    const currentPeer = peerRef.current
    if (currentPeer) stopViewerMonitors(currentPeer)

    if (cancelledRef.current || !mountedRef.current) return

    if (!navigator.onLine) {
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      setError('')
      return
    }

    console.warn('StreetGO Viewer WebRTC connection attempt failed. Retrying...', err)
    setConnected(false)
    setConnecting(true)
    setError(err instanceof Error ? err.message : 'Unable to connect to the live stream.')
    scheduleViewerRetry(retryTimerRef)
  } finally {
    connectingRef.current = false

    if (!stoppingOrCancelled(cancelledRef, mountedRef)) {
      if (!navigator.onLine) {
        setIsOffline(true)
        setConnecting(false)
      } else if (peerRef.current?.connectionState === 'connected') {
        setConnected(true)
        setConnecting(false)
      } else {
        setConnecting(false)
      }
    }
  }
}

export function cleanupViewerWebRTC({
  peerRef, remoteStreamRef, retryTimerRef, videoRef,
}: Pick<ViewerWebRTCOptions, 'peerRef' | 'remoteStreamRef' | 'retryTimerRef' | 'videoRef'>) {
  clearViewerRetry(retryTimerRef)
  cancelViewerRecovery(retryTimerRef)
  closeViewerPeer(peerRef)
  clearViewerMedia({ videoRef, remoteStreamRef })
}

function closeViewerPeer(peerRef: MutableRefObject<RTCPeerConnection | null>) {
  const peer = peerRef.current
  if (!peer) return

  stopViewerMonitors(peer)
  try {
    peer.ontrack = null
    peer.onconnectionstatechange = null
    peer.oniceconnectionstatechange = null
    peer.onicegatheringstatechange = null
    peer.onsignalingstatechange = null
    peer.close()
  } catch {}
  peerRef.current = null
}

function stopViewerMonitors(peer: RTCPeerConnection) {
  const stopStats = statsMonitors.get(peer)
  if (stopStats) {
    stopStats()
    statsMonitors.delete(peer)
  }
  stopViewerPlaybackWatchdog(peer)
}