"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL!;

interface ViewerProps {
  liveId: string;
}

export default function Viewer({
  liveId,
}: ViewerProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const peerRef =
    useRef<RTCPeerConnection | null>(
      null
    );

  const remoteStreamRef =
    useRef<MediaStream | null>(
      null
    );

  const playbackStreamRef =
    useRef<MediaStream | null>(
      null
    );

  const playbackPromiseRef =
    useRef<Promise<void> | null>(
      null
    );

  const cancelledRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const retryTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const connectingRef =
    useRef(false);

  const [connecting, setConnecting] =
    useState(true);

  const [connected, setConnected] =
    useState(false);

  const [error, setError] =
    useState("");

  const [hasVideo, setHasVideo] =
    useState(false);

  const [muted, setMuted] =
    useState(true);

  const [
    isOffline,
    setIsOffline,
  ] = useState(false);

  /*
   * =========================================================
   * CLEAR RETRY TIMER
   * =========================================================
   */

  const clearRetryTimer =
    useCallback(() => {
      if (
        retryTimerRef.current
      ) {
        clearTimeout(
          retryTimerRef.current
        );

        retryTimerRef.current =
          null;
      }
    }, []);

  /*
   * =========================================================
   * PLAY REMOTE VIDEO
   *
   * We attach the stable remote MediaStream once.
   * We do not use video.load() for WebRTC streams.
   * =========================================================
   */

  const playRemoteVideo =
    useCallback(
      async () => {
        const video =
          videoRef.current;

        const stream =
          remoteStreamRef.current;

        if (
          !video ||
          !stream
        ) {
          return;
        }

        if (
          cancelledRef.current
        ) {
          return;
        }

        const videoTracks =
          stream.getVideoTracks();

        if (
          videoTracks.length === 0
        ) {
          return;
        }

        const activeVideoTrack =
          videoTracks.find(
            (
              track
            ) =>
              track.readyState !==
              "ended"
          );

        if (
          !activeVideoTrack
        ) {
          return;
        }

        /*
         * Attach the remote stream
         * only when necessary.
         */
        if (
          video.srcObject !==
          stream
        ) {
          video.srcObject =
            stream;
        }

        video.muted = true;

        /*
         * Prevent overlapping play()
         * requests.
         */
        if (
          playbackPromiseRef.current
        ) {
          try {
            await playbackPromiseRef.current;
          } catch {
            // Ignore previous playback failure.
          }

          return;
        }

        /*
         * Already playing.
         */
        if (
          !video.paused &&
          video.readyState >= 2
        ) {
          return;
        }

        if (
          cancelledRef.current
        ) {
          return;
        }

        /*
         * Start playback.
         */
        const promise =
          video.play();

        playbackPromiseRef.current =
          promise;

        try {
          await promise;

          if (
            cancelledRef.current
          ) {
            return;
          }

          /*
           * IMPORTANT:
           * Successful playback means
           * the previous connection error
           * is no longer relevant.
           */
          setHasVideo(true);
          setConnected(true);
          setConnecting(false);
          setError("");
          setIsOffline(false);
        } catch (err) {
          /*
           * Browser autoplay may reject.
           * Do not treat this as a WebRTC
           * connection failure.
           */
          console.warn(
            "STREETGO VIEWER PLAYBACK ERROR:",
            err
          );
        } finally {
          if (
            playbackPromiseRef.current ===
            promise
          ) {
            playbackPromiseRef.current =
              null;
          }
        }
      },
      []
    );

  /*
   * =========================================================
   * ATTACH REMOTE TRACK
   * =========================================================
   */

  const attachTrack =
    useCallback(
      (
        track: MediaStreamTrack
      ) => {
        const stream =
          remoteStreamRef.current;

        if (!stream) {
          return;
        }

        if (
          track.readyState ===
          "ended"
        ) {
          return;
        }

        const exists =
          stream
            .getTracks()
            .some(
              (
                existingTrack
              ) =>
                existingTrack.id ===
                track.id
            );

        if (!exists) {
          stream.addTrack(
            track
          );
        }

        if (
          track.kind ===
          "video"
        ) {
          setHasVideo(true);
          setError("");
        }
      },
      []
    );

  /*
   * =========================================================
   * SYNC RECEIVER TRACKS
   * =========================================================
   */

  const syncReceiverTracks =
    useCallback(
      (
        peer: RTCPeerConnection
      ) => {
        const stream =
          remoteStreamRef.current;

        if (!stream) {
          return;
        }

        const receivers =
          peer.getReceivers();

        for (
          const receiver of receivers
        ) {
          const track =
            receiver.track;

          if (!track) {
            continue;
          }

          if (
            track.readyState ===
            "ended"
          ) {
            continue;
          }

          attachTrack(
            track
          );
        }

        const videoTracks =
          stream.getVideoTracks();

        if (
          videoTracks.length > 0
        ) {
          setHasVideo(true);
          setError("");
        }
      },
      [attachTrack]
    );

  /*
   * =========================================================
   * RETRY VIEWER CONNECTION
   * =========================================================
   */

  const scheduleRetry =
    useCallback(
      () => {
        if (
          cancelledRef.current ||
          !mountedRef.current
        ) {
          return;
        }

        if (
          !navigator.onLine
        ) {
          setIsOffline(true);
          setConnected(false);
          setConnecting(false);

          return;
        }

        if (
          retryTimerRef.current
        ) {
          return;
        }

        setConnected(false);
        setConnecting(true);

        retryTimerRef.current =
          setTimeout(
            () => {
              retryTimerRef.current =
                null;

              if (
                cancelledRef.current ||
                !mountedRef.current
              ) {
                return;
              }

              if (
                !navigator.onLine
              ) {
                setIsOffline(true);
                setConnecting(false);
                return;
              }

              /*
               * The main effect will recreate
               * the peer when liveId changes.
               *
               * For a same-live reconnect,
               * trigger the connection function
               * through the custom event.
               */
              window.dispatchEvent(
                new CustomEvent(
                  "streetgo-viewer-reconnect"
                )
              );
            },
            3000
          );
      },
      []
    );

  /*
   * =========================================================
   * START VIEWER
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    cancelledRef.current =
      false;

    mountedRef.current =
      true;

    async function startViewer() {
      /*
       * Prevent duplicate connections.
       */
      if (
        connectingRef.current
      ) {
        return;
      }

      connectingRef.current =
        true;

      try {
        setError("");
        setConnecting(true);
        setConnected(false);
        setHasVideo(false);
        setMuted(true);

        /*
         * =====================================================
         * OFFLINE CHECK
         * =====================================================
         */

        if (
          !navigator.onLine
        ) {
          setIsOffline(true);
          setConnecting(false);

          connectingRef.current =
            false;

          return;
        }

        setIsOffline(false);

        /*
         * =====================================================
         * CLEAN OLD PEER
         * =====================================================
         */

        const oldPeer =
          peerRef.current;

        if (oldPeer) {
          try {
            oldPeer.ontrack =
              null;

            oldPeer.onconnectionstatechange =
              null;

            oldPeer.oniceconnectionstatechange =
              null;

            oldPeer.onicegatheringstatechange =
              null;

            oldPeer.onsignalingstatechange =
              null;

            oldPeer.close();
          } catch {
            // Ignore old peer cleanup errors.
          }
        }

        peerRef.current =
          null;

        /*
         * =====================================================
         * CLEAN OLD STREAM
         * =====================================================
         */

        const oldStream =
          remoteStreamRef.current;

        if (oldStream) {
          oldStream
            .getTracks()
            .forEach(
              (
                track
              ) => {
                try {
                  track.stop();
                } catch {
                  // Ignore cleanup errors.
                }
              }
            );
        }

        remoteStreamRef.current =
          null;

        playbackStreamRef.current =
          null;

        playbackPromiseRef.current =
          null;

        /*
         * =====================================================
         * CLEAN VIDEO ELEMENT
         * =====================================================
         */

        const oldVideo =
          videoRef.current;

        if (oldVideo) {
          oldVideo.pause();

          /*
           * srcObject, not load().
           */
          oldVideo.srcObject =
            null;

          oldVideo.muted =
            true;
        }

        if (
          cancelled ||
          cancelledRef.current
        ) {
          return;
        }

        /*
         * =====================================================
         * GET WEBRTC ICE SERVERS
         * =====================================================
         */

        const iceResponse =
          await fetch(
            `${API_URL}/live/webrtc/ice-servers`,
            {
              method:
                "GET",

              headers: {
                Accept:
                  "application/json",
              },

              cache:
                "no-store",
            }
          );

        if (
          cancelled ||
          cancelledRef.current
        ) {
          return;
        }

        if (
          !iceResponse.ok
        ) {
          const text =
            await iceResponse.text();

          if (
            !navigator.onLine
          ) {
            setIsOffline(true);
            setConnecting(false);

            return;
          }

          throw new Error(
            `Unable to get WebRTC ICE servers (${iceResponse.status}): ${text}`
          );
        }

        const iceData =
          await iceResponse.json();

        if (
          !iceData ||
          !Array.isArray(
            iceData.iceServers
          ) ||
          iceData.iceServers
            .length === 0
        ) {
          throw new Error(
            "WebRTC ICE server list is empty."
          );
        }

        console.log(
          "=== STREETGO VIEWER ICE SERVERS RECEIVED ===",
          iceData.iceServers.map(
            (
              server: {
                urls?:
                  | string
                  | string[];
              }
            ) => ({
              urls:
                server.urls,
            })
          )
        );

        /*
         * =====================================================
         * CREATE PEER
         * =====================================================
         */

        const peer =
          new RTCPeerConnection(
            {
              iceServers:
                iceData.iceServers,
            }
          );

        peerRef.current =
          peer;

        /*
         * =====================================================
         * CREATE REMOTE STREAM
         * =====================================================
         */

        const remoteStream =
          new MediaStream();

        remoteStreamRef.current =
          remoteStream;

        /*
         * =====================================================
         * RECEIVE VIDEO
         * =====================================================
         */

        peer.addTransceiver(
          "video",
          {
            direction:
              "recvonly",
          }
        );

        /*
         * =====================================================
         * RECEIVE AUDIO
         * =====================================================
         */

        peer.addTransceiver(
          "audio",
          {
            direction:
              "recvonly",
          }
        );

        /*
         * =====================================================
         * VIDEO ELEMENT EVENTS
         * =====================================================
         */

        const video =
          videoRef.current;

        if (video) {
          video.muted =
            true;

          video.autoplay =
            true;

          video.playsInline =
            true;

          video.onloadedmetadata =
            () => {
              if (
                cancelled ||
                cancelledRef.current
              ) {
                return;
              }

              /*
               * Metadata means the remote
               * video is available again.
               */
              setHasVideo(
                true
              );

              setError("");

              void playRemoteVideo();
            };

          video.oncanplay =
            () => {
              if (
                cancelled ||
                cancelledRef.current
              ) {
                return;
              }

              setHasVideo(
                true
              );

              setError("");

              void playRemoteVideo();
            };

          video.onplaying =
            () => {
              if (
                cancelled ||
                cancelledRef.current
              ) {
                return;
              }

              /*
               * THIS FIXES THE SCREENSHOT
               *
               * A successfully playing video
               * clears the old interruption error.
               */
              setHasVideo(
                true
              );

              setConnected(
                true
              );

              setConnecting(
                false
              );

              setError("");

              setIsOffline(
                false
              );
            };

          video.onwaiting =
            () => {
              /*
               * Buffering is not the same as
               * a dead WebRTC session.
               */
            };

          video.onerror =
            () => {
              /*
               * Don't turn a normal browser
               * video event into the old
               * "connection interrupted"
               * message.
               */
              console.warn(
                "STREETGO VIEWER VIDEO ELEMENT ERROR:",
                video.error
              );
            };
        }

        /*
         * =====================================================
         * WEBRTC TRACK
         * =====================================================
         */

        peer.ontrack =
          (event) => {
            if (
              cancelled ||
              cancelledRef.current
            ) {
              return;
            }

            /*
             * Browser supplied stream.
             */
            if (
              event.streams &&
              event.streams.length >
                0
            ) {
              const browserStream =
                event.streams[0];

              for (
                const track of
                  browserStream.getTracks()
              ) {
                attachTrack(
                  track
                );
              }
            }

            /*
             * Always attach the
             * actual received track.
             */
            attachTrack(
              event.track
            );

            /*
             * Keep one stable stream
             * attached to the video.
             */
            const currentVideo =
              videoRef.current;

            const currentStream =
              remoteStreamRef.current;

            if (
              currentVideo &&
              currentStream
            ) {
              if (
                currentVideo.srcObject !==
                currentStream
              ) {
                currentVideo.srcObject =
                  currentStream;
              }

              currentVideo.muted =
                true;
            }

            /*
             * Video received.
             */
            if (
              event.track.kind ===
              "video"
            ) {
              setHasVideo(true);

              /*
               * Clear stale error as soon
               * as the video track returns.
               */
              setError("");
            }

            /*
             * Audio received.
             */
            if (
              event.track.kind ===
              "audio"
            ) {
              // Audio will remain muted until
              // the user presses Enable Sound.
            }

            /*
             * Attempt playback.
             */
            void playRemoteVideo();
          };

        /*
         * =====================================================
         * CONNECTION STATE
         * =====================================================
         */

        peer.onconnectionstatechange =
          () => {
            if (
              cancelled ||
              cancelledRef.current
            ) {
              return;
            }

            console.log(
              "=== STREETGO VIEWER CONNECTION STATE ===",
              peer.connectionState
            );

            /*
             * CONNECTED
             */

            if (
              peer.connectionState ===
              "connected"
            ) {
              setConnected(
                true
              );

              setConnecting(
                false
              );

              /*
               * CRITICAL FIX:
               * remove stale connection
               * interrupted message.
               */
              setError("");

              setIsOffline(
                false
              );

              syncReceiverTracks(
                peer
              );

              void playRemoteVideo();

              return;
            }

            /*
             * CONNECTING
             */

            if (
              peer.connectionState ===
              "connecting"
            ) {
              setConnected(
                false
              );

              setConnecting(
                true
              );

              /*
               * Don't display the old
               * interruption error.
               */
              setError("");

              return;
            }

            /*
             * DISCONNECTED
             */

            if (
              peer.connectionState ===
              "disconnected"
            ) {
              setConnected(
                false
              );

              if (
                !navigator.onLine
              ) {
                setIsOffline(
                  true
                );

                setConnecting(
                  false
                );

                /*
                 * Offline mode should not
                 * display a scary error.
                 */
                setError("");

                return;
              }

              setConnecting(
                true
              );

              /*
               * Show a lightweight state.
               * It will be replaced when
               * the connection recovers.
               */
              setError(
                "Reconnecting to StreetGO Live..."
              );

              scheduleRetry();

              return;
            }

            /*
             * FAILED
             */

            if (
              peer.connectionState ===
              "failed"
            ) {
              setConnected(
                false
              );

              if (
                !navigator.onLine
              ) {
                setIsOffline(
                  true
                );

                setConnecting(
                  false
                );

                setError("");

                return;
              }

              setConnecting(
                true
              );

              setError(
                "Reconnecting to StreetGO Live..."
              );

              scheduleRetry();

              return;
            }

            /*
             * CLOSED
             */

            if (
              peer.connectionState ===
              "closed"
            ) {
              setConnected(
                false
              );

              setConnecting(
                false
              );
            }
          };

        /*
         * =====================================================
         * ICE CONNECTION STATE
         * =====================================================
         */

        peer.oniceconnectionstatechange =
          () => {
            if (
              cancelled ||
              cancelledRef.current
            ) {
              return;
            }

            console.log(
              "=== STREETGO VIEWER ICE STATE ===",
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
            );

            if (
              peer.iceConnectionState ===
                "connected" ||
              peer.iceConnectionState ===
                "completed"
            ) {
              /*
               * ICE has recovered.
               */
              setError("");
            }

            if (
              peer.iceConnectionState ===
                "failed" ||
              peer.iceConnectionState ===
                "disconnected"
            ) {
              if (
                !navigator.onLine
              ) {
                setIsOffline(
                  true
                );

                setConnected(
                  false
                );

                setConnecting(
                  false
                );

                setError("");

                return;
              }

              setConnected(
                false
              );

              setConnecting(
                true
              );

              scheduleRetry();
            }
          };

        /*
         * =====================================================
         * ICE GATHERING
         * =====================================================
         */

        peer.onicegatheringstatechange =
          () => {
            console.log(
              "STREETGO VIEWER ICE GATHERING:",
              peer.iceGatheringState
            );
          };

        /*
         * =====================================================
         * SIGNALING
         * =====================================================
         */

        peer.onsignalingstatechange =
          () => {
            console.log(
              "STREETGO VIEWER SIGNALING:",
              peer.signalingState
            );
          };

        /*
         * =====================================================
         * CREATE OFFER
         * =====================================================
         */

        const offer =
          await peer.createOffer();

        if (
          cancelled ||
          cancelledRef.current
        ) {
          return;
        }

        await peer.setLocalDescription(
          offer
        );

        /*
         * =====================================================
         * WAIT FOR ICE
         * =====================================================
         */

        await waitForIceGatheringComplete(
          peer
        );

        if (
          cancelled ||
          cancelledRef.current
        ) {
          return;
        }

        if (
          !navigator.onLine
        ) {
          setIsOffline(true);

          setConnected(
            false
          );

          setConnecting(
            false
          );

          return;
        }

        const localDescription =
          peer.localDescription;

        if (
          !localDescription
        ) {
          throw new Error(
            "Viewer local description was not created."
          );
        }

        /*
         * =====================================================
         * SEND OFFER
         * =====================================================
         */

        console.log(
          "WEBRTC VIEWER REQUEST:",
          {
            liveId,
            apiUrl:
              API_URL,
            sdpType:
              localDescription.type,
            hasSdp:
              !!localDescription.sdp,
          }
        );

        const response =
          await fetch(
            `${API_URL}/live/webrtc/offer`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                live_id:
                  liveId,

                sdp:
                  localDescription.sdp,

                type:
                  localDescription.type,

                role:
                  "viewer",
              }),
            }
          );

        if (
          cancelled ||
          cancelledRef.current
        ) {
          return;
        }

        if (
          !response.ok
        ) {
          const text =
            await response.text();

          if (
            !navigator.onLine
          ) {
            setIsOffline(
              true
            );

            setConnected(
              false
            );

            setConnecting(
              false
            );

            return;
          }

          throw new Error(
            `WebRTC server error ${response.status}: ${text}`
          );
        }

        const answer =
          await response.json();

        console.log(
          "=== WEBRTC ANSWER RECEIVED ===",
          answer
        );

        if (
          !answer?.type ||
          !answer?.sdp
        ) {
          throw new Error(
            "WebRTC server returned an invalid SDP answer."
          );
        }

        /*
         * =====================================================
         * APPLY ANSWER
         * =====================================================
         */

        if (
          cancelled ||
          peer.connectionState ===
            "closed" ||
          peer.signalingState ===
            "closed"
        ) {
          return;
        }

        await peer.setRemoteDescription(
          {
            type:
              answer.type,

            sdp:
              answer.sdp,
          }
        );

        /*
         * =====================================================
         * SYNC RECEIVERS
         * =====================================================
         */

        if (
          !cancelled &&
          !cancelledRef.current
        ) {
          syncReceiverTracks(
            peer
          );

          /*
           * Don't show an old
           * connection error after the
           * answer has been accepted.
           */
          setError("");

          void playRemoteVideo();
        }
      } catch (err) {
        if (
          cancelled ||
          cancelledRef.current
        ) {
          return;
        }

        /*
         * Offline is not an application
         * failure.
         */
        if (
          !navigator.onLine
        ) {
          setIsOffline(
            true
          );

          setConnecting(
            false
          );

          setConnected(
            false
          );

          setError("");

          return;
        }

        console.warn(
          "StreetGO Viewer WebRTC connection attempt failed. Retrying...",
          err
        );

        setConnected(
          false
        );

        setConnecting(
          true
        );

        /*
         * Retry rather than leaving the
         * viewer permanently disconnected.
         */
        scheduleRetry();
      } finally {
        connectingRef.current =
          false;
      }
    }

    void startViewer();

    /*
     * =========================================================
     * MANUAL / AUTOMATIC RECONNECT EVENT
     * =========================================================
     */

    const handleReconnect =
      () => {
        if (
          cancelled ||
          cancelledRef.current ||
          !mountedRef.current
        ) {
          return;
        }

        if (
          !navigator.onLine
        ) {
          return;
        }

        if (
          connectingRef.current
        ) {
          return;
        }

        void startViewer();
      };

    window.addEventListener(
      "streetgo-viewer-reconnect",
      handleReconnect
    );

    /*
     * =========================================================
     * ONLINE / OFFLINE
     * =========================================================
     */

    const handleOffline =
      () => {
        if (
          cancelled
        ) {
          return;
        }

        setIsOffline(
          true
        );

        setConnected(
          false
        );

        setConnecting(
          false
        );

        /*
         * IMPORTANT:
         * Do not show the old red
         * "connection interrupted" message.
         */
        setError("");

        clearRetryTimer();

        /*
         * Close only the WebRTC peer.
         */
        const peer =
          peerRef.current;

        if (peer) {
          try {
            peer.ontrack =
              null;

            peer.onconnectionstatechange =
              null;

            peer.oniceconnectionstatechange =
              null;

            peer.onicegatheringstatechange =
              null;

            peer.onsignalingstatechange =
              null;

            peer.close();
          } catch {
            // Ignore offline cleanup errors.
          }

          peerRef.current =
            null;
        }
      };

    const handleOnline =
      () => {
        if (
          cancelled ||
          cancelledRef.current
        ) {
          return;
        }

        console.log(
          "StreetGO Viewer: internet connection restored."
        );

        setIsOffline(
          false
        );

        setError("");

        setConnecting(
          true
        );

        setConnected(
          false
        );

        clearRetryTimer();

        /*
         * Allow the network a moment
         * to stabilize.
         */
        retryTimerRef.current =
          setTimeout(
            () => {
              retryTimerRef.current =
                null;

              if (
                cancelled ||
                cancelledRef.current ||
                !navigator.onLine
              ) {
                return;
              }

              if (
                connectingRef.current
              ) {
                return;
              }

              window.dispatchEvent(
                new CustomEvent(
                  "streetgo-viewer-reconnect"
                )
              );
            },
            500
          );
      };

    window.addEventListener(
      "offline",
      handleOffline
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    return () => {
      cancelled =
        true;

      cancelledRef.current =
        true;

      mountedRef.current =
        false;

      connectingRef.current =
        false;

      clearRetryTimer();

      window.removeEventListener(
        "streetgo-viewer-reconnect",
        handleReconnect
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.removeEventListener(
        "online",
        handleOnline
      );

      /*
       * Close peer.
       */
      const peer =
        peerRef.current;

      if (peer) {
        try {
          peer.ontrack =
            null;

          peer.onconnectionstatechange =
            null;

          peer.oniceconnectionstatechange =
            null;

          peer.onicegatheringstatechange =
            null;

          peer.onsignalingstatechange =
            null;

          peer.close();
        } catch {
          // Ignore cleanup errors.
        }
      }

      peerRef.current =
        null;

      /*
       * Stop remote tracks.
       */
      const remoteStream =
        remoteStreamRef.current;

      if (
        remoteStream
      ) {
        remoteStream
          .getTracks()
          .forEach(
            (
              track
            ) => {
              try {
                track.stop();
              } catch {
                // Ignore cleanup errors.
              }
            }
          );
      }

      remoteStreamRef.current =
        null;

      playbackStreamRef.current =
        null;

      playbackPromiseRef.current =
        null;

      /*
       * Clear video element.
       */
      const video =
        videoRef.current;

      if (video) {
        video.pause();

        video.srcObject =
          null;

        video.onloadedmetadata =
          null;

        video.oncanplay =
          null;

        video.onplaying =
          null;

        video.onwaiting =
          null;

        video.onerror =
          null;
      }
    };
  }, [
    liveId,
    clearRetryTimer,
    playRemoteVideo,
    scheduleRetry,
    syncReceiverTracks,
  ]);

  /*
   * =========================================================
   * ENABLE SOUND
   * =========================================================
   */

  async function enableSound() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    try {
      const stream =
        remoteStreamRef.current;

      if (
        stream &&
        video.srcObject !==
          stream
      ) {
        video.srcObject =
          stream;
      }

      video.muted =
        false;

      await video.play();

      setMuted(
        false
      );

      /*
       * Successful playback clears
       * any stale connection error.
       */
      setHasVideo(
        true
      );

      setConnected(
        true
      );

      setConnecting(
        false
      );

      setError("");
    } catch (err) {
      console.warn(
        "Unable to enable viewer sound:",
        err
      );

      video.muted =
        true;

      setMuted(
        true
      );

      try {
        await video.play();
      } catch {
        /*
         * Browser may require another
         * user interaction.
         */
      }
    }
  }

  /*
   * =========================================================
   * MUTE
   * =========================================================
   */

  function muteVideo() {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }

    video.muted =
      true;

    setMuted(
      true
    );
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  const showWaiting =
    !hasVideo &&
    (
      connecting ||
      isOffline
    );

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
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          mb-4
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
            Live video
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
                  ? "bg-red-500"
                  : isOffline
                    ? "bg-yellow-400"
                    : connecting
                      ? "bg-yellow-500"
                      : "bg-zinc-600"
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
              ? "LIVE"
              : isOffline
                ? "OFFLINE"
                : connecting
                  ? "CONNECTING..."
                  : "WAITING"}
          </span>
        </div>
      </div>

      {/* =====================================================
          VIDEO
          ===================================================== */}

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
          muted={muted}
          controls={false}
          className="
            aspect-video
            w-full
            object-cover
          "
        />

        {/* ===================================================
            WAITING / OFFLINE
            =================================================== */}

        {showWaiting && (
          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              bg-black/50
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
                border-t-white
              "
            />

            <p
              className="
                text-sm
                font-medium
                text-white
              "
            >
              {isOffline
                ? "Waiting for connection..."
                : "Connecting to StreetGO Live..."}
            </p>
          </div>
        )}

        {/* ===================================================
            RECONNECTING
            =================================================== */}

        {!isOffline &&
          !hasVideo &&
          !connected &&
          !connecting &&
          error && (
            <div
              className="
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-center
                bg-black/60
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
                Reconnecting to StreetGO Live...
              </p>
            </div>
          )}

        {/* ===================================================
            ENABLE SOUND
            =================================================== */}

        {hasVideo &&
          muted && (
            <button
              type="button"
              onClick={
                enableSound
              }
              className="
                absolute
                bottom-4
                left-4
                rounded-lg
                bg-white
                px-4
                py-2
                text-sm
                font-semibold
                text-black
                shadow-lg
                transition
                hover:bg-zinc-200
              "
            >
              🔊 Enable Sound
            </button>
          )}

        {/* ===================================================
            MUTE
            =================================================== */}

        {hasVideo &&
          !muted && (
            <button
              type="button"
              onClick={
                muteVideo
              }
              className="
                absolute
                bottom-4
                left-4
                rounded-lg
                bg-black/80
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                shadow-lg
                transition
                hover:bg-black
              "
            >
              🔇 Mute
            </button>
          )}
      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error &&
        !isOffline &&
        !connected &&
        !hasVideo && (
          <div
            className="
              mt-4
              rounded-lg
              border
              border-yellow-900
              bg-yellow-950/30
              px-4
              py-3
            "
          >
            <p
              className="
                text-sm
                text-yellow-400
              "
            >
              {error}
            </p>
          </div>
        )}

      {/* =====================================================
          STATUS
          ===================================================== */}

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
          WebRTC:{" "}
          {connected
            ? "CONNECTED"
            : isOffline
              ? "OFFLINE"
              : connecting
                ? "CONNECTING"
                : "NOT CONNECTED"}
        </span>

        <span>
          Video:{" "}
          {hasVideo
            ? "RECEIVING"
            : "WAITING"}
        </span>

        <span>
          Audio:{" "}
          {muted
            ? "MUTED"
            : "ON"}
        </span>
      </div>
    </section>
  );
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
        "complete"
      ) {
        resolve();
        return;
      }

      let finished =
        false;

      let timer:
        ReturnType<typeof setTimeout> |
        null = null;

      const finish =
        () => {
          if (
            finished
          ) {
            return;
          }

          finished =
            true;

          if (timer) {
            clearTimeout(
              timer
            );

            timer =
              null;
          }

          peer.removeEventListener(
            "icegatheringstatechange",
            checkState
          );

          resolve();
        };

      const checkState =
        () => {
          if (
            peer.iceGatheringState ===
            "complete"
          ) {
            console.log(
              "STREETGO VIEWER ICE GATHERING: COMPLETE"
            );

            finish();
          }
        };

      peer.addEventListener(
        "icegatheringstatechange",
        checkState
      );

      /*
       * Safety timeout.
       */
      timer =
        setTimeout(
          () => {
            console.warn(
              "STREETGO VIEWER ICE GATHERING TIMEOUT:",
              peer.iceGatheringState
            );

            finish();
          },
          10000
        );
    }
  );
}