'use client'

import type {
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
} from 'react'

import {
  recoverViewer,
  cancelViewerRecovery,
  resetViewerRecovery,
} from './viewerRecovery'

import {
  prepareViewerPlayer,
  attachViewerStream,
  ensureViewerPlayback,
} from './viewerPlayer'

import {
  startViewerPlaybackWatchdog,
  stopViewerPlaybackWatchdog,
} from './viewerPlayback'

import {
  attachViewerTrack,
  clearViewerMedia,
} from './viewerMedia'

import {
  collectViewerStats,
  getPacketLossRate,
} from './viewerStats'

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

const statsMonitors = new WeakMap<
  RTCPeerConnection,
  () => void
>()

export async function connectViewerWebRTC({
  liveId,
  videoRef,
  peerRef,
  remoteStreamRef,
  playbackPromiseRef,
  cancelledRef,
  mountedRef,
  retryTimerRef,
  connectingRef,
  setConnecting,
  setConnected,
  setError,
  setHasVideo,
  setIsOffline,
}: ViewerWebRTCOptions): Promise<void> {
  if (
    cancelledRef.current ||
    !mountedRef.current ||
    connectingRef.current
  ) {
    return
  }

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

    clearViewerMedia({
      videoRef,
      remoteStreamRef,
    })

    playbackPromiseRef.current = null

    if (
      cancelledRef.current ||
      !mountedRef.current
    ) {
      return
    }

    const iceResponse = await fetch(
      `${API_URL}/live/webrtc/ice-servers`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    )

    if (
      cancelledRef.current ||
      !mountedRef.current
    ) {
      return
    }

    if (!iceResponse.ok) {
      const text = await iceResponse.text()

      throw new Error(
        `Unable to get WebRTC ICE servers (${iceResponse.status}): ${text}`,
      )
    }

    const iceData =
      await iceResponse.json()

    if (
      !Array.isArray(
        iceData?.iceServers,
      ) ||
      !iceData.iceServers.length
    ) {
      throw new Error(
        'WebRTC ICE server list is empty.',
      )
    }

    console.log(
      '=== STREETGO VIEWER ICE SERVERS RECEIVED ===',
      iceData.iceServers,
    )

    const peer =
      new RTCPeerConnection({
        iceServers:
          iceData.iceServers,
      })

    peerRef.current = peer

    const remoteStream =
      new MediaStream()

    remoteStreamRef.current =
      remoteStream

    prepareViewerPlayer({
      videoRef,
      remoteStreamRef,
      playbackPromiseRef,
      cancelledRef,
      mountedRef,
    })

    peer.addTransceiver(
      'video',
      {
        direction: 'recvonly',
      },
    )

    peer.addTransceiver(
      'audio',
      {
        direction: 'recvonly',
      },
    )

    startViewerPlaybackWatchdog({
      peerRef,
      videoRef,
      cancelledRef,
      mountedRef,
      setHasVideo,
      onStall: () => {
        recoverViewer({
          peerRef,
          videoRef,
          retryTimerRef,
          cancelledRef,
          mountedRef,
          reason: 'playback-stall',
          reconnect: () => {
            window.dispatchEvent(
              new CustomEvent(
                'streetgo-viewer-reconnect',
              ),
            )
          },
        })
      },
    })

    const stopStatsMonitor =
      startViewerStatsMonitor(
        peer,
        mountedRef,
        cancelledRef,
      )

    statsMonitors.set(
      peer,
      stopStatsMonitor,
    )

    const video =
      videoRef.current

    if (video) {
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      video.preload = 'auto'

      video.onloadedmetadata = () => {
        if (
          cancelledRef.current
        ) {
          return
        }

        setHasVideo(true)
        setError('')

        attachViewerStream(
          videoRef,
          remoteStream,
        )

        void ensureViewerPlayback({
          videoRef,
          playbackPromiseRef,
          cancelledRef,
          mountedRef,
        })
      }

      video.oncanplay = () => {
        if (
          cancelledRef.current
        ) {
          return
        }

        setHasVideo(true)
        setError('')

        attachViewerStream(
          videoRef,
          remoteStream,
        )

        void ensureViewerPlayback({
          videoRef,
          playbackPromiseRef,
          cancelledRef,
          mountedRef,
        })
      }

      video.onplaying = () => {
        if (
          cancelledRef.current
        ) {
          return
        }

        setHasVideo(true)
        setConnected(true)
        setConnecting(false)
        setError('')
        setIsOffline(false)
      }

      video.onerror = () => {
        console.warn(
          'STREETGO VIEWER VIDEO ELEMENT ERROR:',
          video.error,
        )
      }
    }

    peer.ontrack = (event) => {
      if (
        cancelledRef.current ||
        !mountedRef.current
      ) {
        return
      }

      if (event.streams.length) {
        const sourceStream =
          event.streams[0]

        for (
          const track of
            sourceStream.getTracks()
        ) {
          attachViewerTrack(
            sourceStream,
            videoRef,
            remoteStreamRef,
            setHasVideo,
            setConnected,
            setConnecting,
            setError,
          )

          if (
            !remoteStream
              .getTracks()
              .some(
                (existing) =>
                  existing.id ===
                  track.id,
              )
          ) {
            remoteStream.addTrack(
              track,
            )
          }
        }
      } else if (
        !remoteStream
          .getTracks()
          .some(
            (existing) =>
              existing.id ===
              event.track.id,
          )
      ) {
        remoteStream.addTrack(
          event.track,
        )
      }

      if (
        event.track.kind ===
        'video'
      ) {
        setHasVideo(true)
        setError('')
      }

      console.log(
        'STREETGO VIEWER TRACK RECEIVED:',
        event.track.kind,
        event.track.id,
      )

      attachViewerStream(
        videoRef,
        remoteStream,
      )

      void ensureViewerPlayback({
        videoRef,
        playbackPromiseRef,
        cancelledRef,
        mountedRef,
      })
    }

    peer.onconnectionstatechange =
      () => {
        if (
          cancelledRef.current ||
          !mountedRef.current
        ) {
          return
        }

        console.log(
          '=== STREETGO VIEWER CONNECTION STATE ===',
          peer.connectionState,
        )

        if (
          peer.connectionState ===
          'connected'
        ) {
          setConnected(true)
          setConnecting(false)
          setError('')
          setIsOffline(false)

          syncViewerReceivers(
            peer,
            remoteStream,
            setHasVideo,
            setError,
          )

          attachViewerStream(
            videoRef,
            remoteStream,
          )

          void ensureViewerPlayback({
            videoRef,
            playbackPromiseRef,
            cancelledRef,
            mountedRef,
          })

          return
        }

        if (
          peer.connectionState ===
          'connecting'
        ) {
          setConnected(false)
          setConnecting(true)
          setError('')
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
            setError('')
            return
          }

          setConnecting(true)
          setError(
            'Reconnecting to StreetGO Live...',
          )

          recoverViewer({
            peerRef,
            videoRef,
            retryTimerRef,
            cancelledRef,
            mountedRef,
            reason:
              peer.connectionState ===
              'failed'
                ? 'connection-failed'
                : 'connection-disconnected',
            reconnect: () => {
              window.dispatchEvent(
                new CustomEvent(
                  'streetgo-viewer-reconnect',
                ),
              )
            },
          })

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

    peer.oniceconnectionstatechange =
      () => {
        if (
          cancelledRef.current ||
          !mountedRef.current
        ) {
          return
        }

        console.log(
          '=== STREETGO VIEWER ICE STATE ===',
          {
            iceConnectionState:
              peer.iceConnectionState,
            connectionState:
              peer.connectionState,
            signalingState:
              peer.signalingState,
            iceGatheringState:
              peer.iceGatheringState,
          },
        )

        if (
          peer.iceConnectionState ===
            'connected' ||
          peer.iceConnectionState ===
            'completed'
        ) {
          setError('')
        }

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
            setError('')
            return
          }

          setConnected(false)
          setConnecting(true)

          recoverViewer({
            peerRef,
            videoRef,
            retryTimerRef,
            cancelledRef,
            mountedRef,
            reason:
              peer.iceConnectionState ===
              'failed'
                ? 'ice-failed'
                : 'ice-disconnected',
            reconnect: () => {
              window.dispatchEvent(
                new CustomEvent(
                  'streetgo-viewer-reconnect',
                ),
              )
            },
          })
        }
      }

    peer.onicegatheringstatechange =
      () => {
        console.log(
          'STREETGO VIEWER ICE GATHERING:',
          peer.iceGatheringState,
        )
      }

    peer.onsignalingstatechange =
      () => {
        console.log(
          'STREETGO VIEWER SIGNALING:',
          peer.signalingState,
        )
      }

    const offer =
      await peer.createOffer()

    if (
      cancelledRef.current ||
      !mountedRef.current
    ) {
      stopViewerMonitors(peer)
      return
    }

    await peer.setLocalDescription(
      offer,
    )

    await waitForIceGathering(
      peer,
      1500,
    )

    if (
      cancelledRef.current ||
      !mountedRef.current
    ) {
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

    const localDescription =
      peer.localDescription

    if (!localDescription?.sdp) {
      throw new Error(
        'Viewer local description was not created.',
      )
    }

    console.log(
      'WEBRTC VIEWER REQUEST:',
      {
        liveId,
        apiUrl: API_URL,
        sdpType:
          localDescription.type,
        hasSdp:
          !!localDescription.sdp,
      },
    )

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
            sdp:
              localDescription.sdp,
            type:
              localDescription.type,
            role: 'viewer',
          }),
        },
      )

    if (
      cancelledRef.current ||
      !mountedRef.current
    ) {
      stopViewerMonitors(peer)
      return
    }

    if (!response.ok) {
      const text =
        await response.text()

      throw new Error(
        `WebRTC server error ${response.status}: ${text}`,
      )
    }

    const answer =
      await response.json()

    console.log(
      '=== WEBRTC ANSWER RECEIVED ===',
      answer,
    )

    if (
      answer?.type !== 'answer' ||
      typeof answer?.sdp !==
        'string' ||
      !answer.sdp
    ) {
      throw new Error(
        'WebRTC server returned an invalid SDP answer.',
      )
    }

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
      sdp: answer.sdp,
    })

    if (
      cancelledRef.current ||
      !mountedRef.current
    ) {
      stopViewerMonitors(peer)
      return
    }

    console.log(
      'STREETGO VIEWER ANSWER APPLIED',
    )

    syncViewerReceivers(
      peer,
      remoteStream,
      setHasVideo,
      setError,
    )

    attachViewerStream(
      videoRef,
      remoteStream,
    )

    setError('')

    void ensureViewerPlayback({
      videoRef,
      playbackPromiseRef,
      cancelledRef,
      mountedRef,
    })
  } catch (err) {
    const currentPeer =
      peerRef.current

    if (currentPeer) {
      stopViewerMonitors(
        currentPeer,
      )
    }

    if (
      cancelledRef.current ||
      !mountedRef.current
    ) {
      return
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setConnected(false)
      setConnecting(false)
      setError('')
      return
    }

    console.warn(
      'StreetGO Viewer WebRTC connection attempt failed. Retrying...',
      err,
    )

    setConnected(false)
    setConnecting(true)

    setError(
      err instanceof Error
        ? err.message
        : 'Unable to connect to the live stream.',
    )

    scheduleViewerRetry(
      retryTimerRef,
    )
  } finally {
    connectingRef.current =
      false

    if (
      !stoppingOrCancelled(
        cancelledRef,
        mountedRef,
      )
    ) {
      if (!navigator.onLine) {
        setIsOffline(true)
        setConnecting(false)
      } else if (
        peerRef.current
          ?.connectionState ===
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

export function cleanupViewerWebRTC({
  peerRef,
  remoteStreamRef,
  retryTimerRef,
  videoRef,
}: Pick<
  ViewerWebRTCOptions,
  | 'peerRef'
  | 'remoteStreamRef'
  | 'retryTimerRef'
  | 'videoRef'
>) {
  clearViewerRetry(
    retryTimerRef,
  )

  cancelViewerRecovery(
    retryTimerRef,
  )

  closeViewerPeer(peerRef)

  clearViewerMedia({
    videoRef,
    remoteStreamRef,
  })
}

function closeViewerPeer(
  peerRef: MutableRefObject<RTCPeerConnection | null>,
) {
  const peer = peerRef.current

  if (!peer) {
    return
  }

  stopViewerMonitors(peer)

  try {
    peer.ontrack = null
    peer.onconnectionstatechange =
      null
    peer.oniceconnectionstatechange =
      null
    peer.onicegatheringstatechange =
      null
    peer.onsignalingstatechange =
      null
    peer.close()
  } catch {}

  peerRef.current = null
}

function stopViewerMonitors(
  peer: RTCPeerConnection,
) {
  const stopStats =
    statsMonitors.get(peer)

  if (stopStats) {
    stopStats()
    statsMonitors.delete(peer)
  }

  stopViewerPlaybackWatchdog(
    peer,
  )
}

function clearViewerRetry(
  timerRef: MutableRefObject<
    ReturnType<typeof setTimeout> | null
  >,
) {
  if (timerRef.current) {
    clearTimeout(
      timerRef.current,
    )

    timerRef.current = null
  }
}

function scheduleViewerRetry(
  timerRef: MutableRefObject<
    ReturnType<typeof setTimeout> | null
  >,
) {
  if (
    timerRef.current ||
    !navigator.onLine
  ) {
    return
  }

  timerRef.current =
    setTimeout(() => {
      timerRef.current = null

      if (!navigator.onLine) {
        return
      }

      window.dispatchEvent(
        new CustomEvent(
          'streetgo-viewer-reconnect',
        ),
      )
    }, 3000)
}

function syncViewerReceivers(
  peer: RTCPeerConnection,
  stream: MediaStream,
  setHasVideo: Dispatch<
    SetStateAction<boolean>
  >,
  setError: Dispatch<
    SetStateAction<string>
  >,
) {
  for (
    const receiver of
      peer.getReceivers()
  ) {
    const track =
      receiver.track

    if (
      !track ||
      track.readyState ===
        'ended'
    ) {
      continue
    }

    if (
      !stream
        .getTracks()
        .some(
          (existing) =>
            existing.id ===
            track.id,
        )
    ) {
      stream.addTrack(track)
    }

    if (
      track.kind === 'video'
    ) {
      setHasVideo(true)
      setError('')
    }
  }
}

function startViewerStatsMonitor(
  peer: RTCPeerConnection,
  mountedRef: MutableRefObject<boolean>,
  cancelledRef: MutableRefObject<boolean>,
) {
  let previousStats:
    | Awaited<
        ReturnType<
          typeof collectViewerStats
        >
      >
    | undefined

  let running = true

  const timer =
    window.setInterval(
      async () => {
        if (
          !running ||
          cancelledRef.current ||
          !mountedRef.current ||
          peer.connectionState ===
            'closed'
        ) {
          return
        }

        try {
          const stats =
            await collectViewerStats(
              peer,
              previousStats,
            )

          previousStats =
            stats

          console.log(
            '=== STREETGO VIEWER STATS ===',
            {
              bitrateMbps:
                Number(
                  (
                    stats.bitrate /
                    1_000_000
                  ).toFixed(2),
                ),
              packetsReceived:
                stats.packetsReceived,
              packetsLost:
                stats.packetsLost,
              packetLossPercent:
                Number(
                  (
                    getPacketLossRate(
                      stats,
                    ) * 100
                  ).toFixed(2),
                ),
              jitterMs:
                Number(
                  (
                    stats.jitter *
                    1000
                  ).toFixed(2),
                ),
              rttMs:
                stats.rtt ===
                null
                  ? null
                  : Number(
                      (
                        stats.rtt *
                        1000
                      ).toFixed(2),
                    ),
              framesReceived:
                stats.framesReceived,
              framesDecoded:
                stats.framesDecoded,
            },
          )
        } catch (err) {
          console.warn(
            'StreetGO viewer stats error:',
            err,
          )
        }
      },
      2000,
    )

  return () => {
    running = false

    window.clearInterval(
      timer,
    )
  }
}

function stoppingOrCancelled(
  cancelledRef: MutableRefObject<boolean>,
  mountedRef: MutableRefObject<boolean>,
) {
  return (
    cancelledRef.current ||
    !mountedRef.current
  )
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

      const finish = () => {
        if (finished) {
          return
        }

        finished = true

        clearTimeout(timer)

        peer.removeEventListener(
          'icegatheringstatechange',
          check,
        )

        resolve()
      }

      const check = () => {
        if (
          peer.iceGatheringState ===
          'complete'
        ) {
          finish()
        }
      }

      const timer =
        setTimeout(
          finish,
          timeoutMs,
        )

      peer.addEventListener(
        'icegatheringstatechange',
        check,
      )

      check()
    },
  )
}