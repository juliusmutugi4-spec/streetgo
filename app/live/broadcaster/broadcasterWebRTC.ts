'use client'

import { getBroadcasterIceServers } from './broadcasterIceServers'

const API_URL = process.env.NEXT_PUBLIC_ENGINE_URL!

export interface BroadcasterWebRTCOptions {
  liveId: string
  stream: MediaStream
  peerRef: React.MutableRefObject<RTCPeerConnection | null>
  stoppingRef: React.MutableRefObject<boolean>
  mountedRef: React.MutableRefObject<boolean>
  reconnectingRef: React.MutableRefObject<boolean>
  setConnecting: (value: boolean) => void
  setConnected: (value: boolean) => void
  setIsOffline: (value: boolean) => void
  setError: (value: string) => void
  clearReconnectTimer: () => void
  scheduleReconnect: (liveId: string) => void
}

export async function connectBroadcasterWebRTC({
  liveId,stream,peerRef,stoppingRef,mountedRef,reconnectingRef,
  setConnecting,setConnected,setIsOffline,setError,
  clearReconnectTimer,scheduleReconnect,
}: BroadcasterWebRTCOptions): Promise<void> {
  if (stoppingRef.current || !mountedRef.current) return

  if (!navigator.onLine) {
    setIsOffline(true)
    setConnected(false)
    setConnecting(false)
    return
  }

  if (reconnectingRef.current) return

  reconnectingRef.current = true
  clearReconnectTimer()

  const oldPeer = peerRef.current

  if (oldPeer) {
    try {
      oldPeer.onconnectionstatechange = null
      oldPeer.oniceconnectionstatechange = null
      oldPeer.onicegatheringstatechange = null
      oldPeer.onsignalingstatechange = null
      oldPeer.close()
    } catch {}

    peerRef.current = null
  }

  try {
    setConnecting(true)
    setConnected(false)
    setIsOffline(false)
    setError('')

    const iceServers =
      await getBroadcasterIceServers()

    if (
      stoppingRef.current ||
      !mountedRef.current
    ) return

    const videoTracks =
      stream.getVideoTracks()

    const audioTracks =
      stream.getAudioTracks()

    console.log(
      'StreetGO media tracks:',
      {
        video: videoTracks.length,
        audio: audioTracks.length,
        videoStates: videoTracks.map(
          (track) => track.readyState,
        ),
        audioStates: audioTracks.map(
          (track) => track.readyState,
        ),
      },
    )

    if (!videoTracks.length) {
      throw new Error(
        'StreetGO camera stream contains no video track.',
      )
    }

    const peer =
      new RTCPeerConnection({
        iceServers,
      })

    peerRef.current = peer

    const videoTransceiver =
      peer.addTransceiver(
        'video',
        {
          direction: 'sendonly',
        },
      )

    await videoTransceiver.sender.replaceTrack(
      videoTracks[0],
    )

    if (audioTracks.length) {
      const audioTransceiver =
        peer.addTransceiver(
          'audio',
          {
            direction: 'sendonly',
          },
        )

      await audioTransceiver.sender.replaceTrack(
        audioTracks[0],
      )
    }

    console.log(
      'StreetGO transceivers:',
      peer.getTransceivers().map(
        (transceiver) => ({
          kind: transceiver.receiver.track.kind,
          direction: transceiver.direction,
          mid: transceiver.mid,
          senderTrack:
            transceiver.sender.track?.kind ??
            null,
        }),
      ),
    )

    peer.onconnectionstatechange = () => {
      if (
        !mountedRef.current ||
        stoppingRef.current
      ) return

      console.log(
        'StreetGO WebRTC connection:',
        peer.connectionState,
      )

      if (
        peer.connectionState ===
        'connected'
      ) {
        reconnectingRef.current = false
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
          'disconnected' ||
        peer.connectionState ===
          'failed'
      ) {
        setConnected(false)

        if (!navigator.onLine) {
          setIsOffline(true)
          setConnecting(false)
          return
        }

        setConnecting(true)
        scheduleReconnect(liveId)
        return
      }

      if (
        peer.connectionState ===
        'closed'
      ) {
        setConnected(false)
        setConnecting(false)
      }
    }

    peer.oniceconnectionstatechange = () => {
      if (
        !mountedRef.current ||
        stoppingRef.current
      ) return

      console.log(
        'StreetGO ICE state:',
        peer.iceConnectionState,
      )

      if (
        peer.iceConnectionState ===
          'failed' ||
        peer.iceConnectionState ===
          'disconnected'
      ) {
        if (!navigator.onLine) {
          setIsOffline(true)
          setConnected(false)
          setConnecting(false)
          return
        }

        scheduleReconnect(liveId)
      }
    }

peer.onicecandidate = (event) => {
  if (!event.candidate) {
    console.log('StreetGO ICE candidate gathering complete.')
    return
  }

  console.log(
    'StreetGO ICE candidate:',
    event.candidate.candidate,
  )
}

peer.onicegatheringstatechange = () => {
  console.log(
    'StreetGO ICE gathering:',
    peer.iceGatheringState,
  )
}

    peer.onsignalingstatechange = () => {
      console.log(
        'StreetGO signaling:',
        peer.signalingState,
      )
    }

    const offer =
      await peer.createOffer()

    await peer.setLocalDescription(
      offer,
    )

    await waitForIceGathering(
      peer,
      1500,
    )

    if (
      stoppingRef.current ||
      !mountedRef.current
    ) return

    if (!navigator.onLine) {
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      return
    }

    const localDescription =
      peer.localDescription

    if (!localDescription?.sdp) {
      throw new Error(
        'WebRTC local SDP was not created.',
      )
    }

    const offerSdp =
      localDescription.sdp

    const mediaSections =
      offerSdp.match(
        /^m=(audio|video)/gm,
      ) ?? []

    const mids =
      [
        ...offerSdp.matchAll(
          /^a=mid:([^\r\n]+)$/gm,
        ),
      ].map(
        (match) => match[1],
      )

    const bundleMatch =
      offerSdp.match(
        /^a=group:BUNDLE[^\r\n]*$/m,
      )

    console.log(
      '========== STREETGO WEBRTC OFFER =========='
    )

    console.log(
      'StreetGO offer type:',
      localDescription.type,
    )

    console.log(
      'StreetGO offer SDP length:',
      offerSdp.length,
    )

    console.log(
      'StreetGO offer media:',
      mediaSections,
    )

    console.log(
      'StreetGO offer MIDs:',
      mids,
    )

    console.log(
      'StreetGO offer BUNDLE:',
      bundleMatch?.[0] ?? 'NONE',
    )

    console.log(
      'STREETGO FULL OFFER SDP:',
      offerSdp,
    )

    console.log(
      '==========================================='
    )

    if (!mediaSections.length) {
      throw new Error(
        'Browser created an SDP offer without audio/video media sections.',
      )
    }

    if (!mids.length) {
      throw new Error(
        'Browser created an SDP offer without media MIDs.',
      )
    }

    const response =
      await fetch(
        `${API_URL}/live/webrtc/offer`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            live_id: liveId,
            sdp: offerSdp,
            type: localDescription.type,
            role: 'broadcaster',
          }),
        },
      )

    const text =
      await response.text()

    if (!response.ok) {
      throw new Error(
        `WebRTC server error ${response.status}: ${text}`,
      )
    }

    let answer: {
      type?: string
      sdp?: string
    }

    try {
      answer = JSON.parse(text)
    } catch {
      throw new Error(
        'WebRTC server returned invalid JSON.',
      )
    }

    const answerSdp =
      typeof answer.sdp === 'string'
        ? answer.sdp
        : ''

    if (
      answer.type !== 'answer' ||
      !answerSdp
    ) {
      throw new Error(
        'WebRTC server returned an invalid SDP answer.',
      )
    }

    console.log(
      '========== STREETGO WEBRTC ANSWER =========='
    )

    console.log(
      'StreetGO answer type:',
      answer.type,
    )

    console.log(
      'StreetGO answer SDP length:',
      answerSdp.length,
    )

    console.log(
      'STREETGO FULL ANSWER SDP:',
      answerSdp,
    )

    console.log(
      '============================================'
    )

    if (
      peer.signalingState !==
      'have-local-offer'
    ) {
      throw new Error(
        `Cannot apply WebRTC answer in signaling state: ${peer.signalingState}`,
      )
    }

    await peer.setRemoteDescription({
      type: 'answer',
      sdp: answerSdp,
    })

    console.log(
      'StreetGO remote SDP accepted.',
    )

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
    ) return

    if (!navigator.onLine) {
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      return
    }

    console.error(
      'StreetGO WebRTC error:',
      err,
    )

    setConnected(false)
    scheduleReconnect(liveId)
  } finally {
    reconnectingRef.current = false

    if (
      !stoppingRef.current &&
      mountedRef.current
    ) {
      if (!navigator.onLine) {
        setIsOffline(true)
        setConnecting(false)
      } else if (
        peerRef.current?.connectionState ===
        'connected'
      ) {
        setConnected(true)
        setConnecting(false)
      } else {
        setConnecting(false)
      }
    }
  }
}

function waitForIceGathering(
  peer: RTCPeerConnection,
  timeoutMs = 1500,
): Promise<void> {
  if (
    peer.iceGatheringState ===
    'complete'
  ) {
    return Promise.resolve()
  }

  return new Promise(
    (resolve) => {
      let finished = false

      const timer =
        setTimeout(
          finish,
          timeoutMs,
        )

      function finish() {
        if (finished) return

        finished = true
        clearTimeout(timer)

        peer.removeEventListener(
          'icegatheringstatechange',
          check,
        )

        resolve()
      }

      function check() {
        if (
          peer.iceGatheringState ===
          'complete'
        ) {
          finish()
        }
      }

      peer.addEventListener(
        'icegatheringstatechange',
        check,
      )

      check()
    },
  )
}