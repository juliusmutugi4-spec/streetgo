"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL = process.env.NEXT_PUBLIC_ENGINE_URL!;

interface ViewerProps {
  liveId: string;
}

export default function Viewer({
  liveId,
}: ViewerProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const peerRef =
    useRef<RTCPeerConnection | null>(null);

  const remoteStreamRef =
    useRef<MediaStream | null>(null);

  const playbackStreamRef =
    useRef<MediaStream | null>(null);

  const playbackPromiseRef =
    useRef<Promise<void> | null>(null);

  const cancelledRef =
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

  /*
   * =========================================================
   * PLAY REMOTE VIDEO
   * =========================================================
   *
   * IMPORTANT:
   * We never call video.load().
   *
   * We attach srcObject once and wait for the browser to
   * receive metadata before starting playback.
   */

  async function playRemoteVideo() {
    const video =
      videoRef.current;

    const stream =
      remoteStreamRef.current;

    if (!video || !stream) {
      return;
    }

    if (cancelledRef.current) {
      return;
    }

    const videoTracks =
      stream.getVideoTracks();

    if (videoTracks.length === 0) {
      return;
    }

    const activeVideoTrack =
      videoTracks.find(
        (track) =>
          track.readyState !== "ended"
      );

    if (!activeVideoTrack) {
      return;
    }

    /*
     * Attach the stream ONLY if it changed.
     */
    if (
      video.srcObject !== stream
    ) {
      video.srcObject = stream;

      
    }

    video.muted = true;

    /*
     * If another play() is already running,
     * wait for it instead of starting another one.
     */
    if (playbackPromiseRef.current) {
      try {
        await playbackPromiseRef.current;
      } catch {
        // Ignore an old playback failure.
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

     /*
     * Do not wait forever for loadedmetadata.
     * WebRTC metadata can arrive after the remote track.
     */
    if (cancelledRef.current) {
      return;
    }

    console.log(
      "=== STREETGO VIEWER PLAY ATTEMPT ===",
      {
        readyState: video.readyState,
        paused: video.paused,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        trackState: activeVideoTrack.readyState,
        trackEnabled: activeVideoTrack.enabled,
        trackMuted: activeVideoTrack.muted,
      }
    );
    /*
     * Start playback exactly once.
     */
    const promise =
      video.play();

    playbackPromiseRef.current =
      promise;

    try {
      await promise;

      if (cancelledRef.current) {
        return;
      }

      
    } catch (err) {
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
  }

  /*
   * =========================================================
   * ATTACH REMOTE TRACKS
   * =========================================================
   */

  function attachTrack(
    track: MediaStreamTrack
  ) {
    const stream =
      remoteStreamRef.current;

    if (!stream) {
      return;
    }

    if (
      track.readyState === "ended"
    ) {
      return;
    }

    const exists =
      stream
        .getTracks()
        .some(
          (existingTrack) =>
            existingTrack.id ===
            track.id
        );

    if (!exists) {
      stream.addTrack(track);

      
    }
  }

  /*
   * =========================================================
   * SYNC RECEIVER TRACKS
   * =========================================================
   */

  function syncReceiverTracks(
    peer: RTCPeerConnection
  ) {
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
        track.readyState === "ended"
      ) {
        continue;
      }

      attachTrack(track);
    }

    const videoTracks =
      stream.getVideoTracks();

    const audioTracks =
      stream.getAudioTracks();

    

    if (
      videoTracks.length > 0
    ) {
      setHasVideo(true);

      
    }

    if (
      audioTracks.length > 0
    ) {
      
    }
  }

  /*
   * =========================================================
   * START VIEWER
   * =========================================================
   */

  useEffect(() => {
    let cancelled =
      false;

    cancelledRef.current =
      false;

    async function startViewer() {
      try {
        setError("");
        setConnecting(true);
        setConnected(false);
        setHasVideo(false);
        setMuted(true);

        /*
         * -----------------------------------------------------
         * CLEAN OLD VIDEO
         * -----------------------------------------------------
         */

        const oldVideo =
          videoRef.current;

        if (oldVideo) {
          oldVideo.pause();

          /*
           * Do NOT call load().
           */
          oldVideo.srcObject =
            null;

          oldVideo.muted =
            true;
        }

        remoteStreamRef.current =
          null;

        playbackStreamRef.current =
          null;

        playbackPromiseRef.current =
          null;

        

        /*
         * =====================================================
         * PEER CONNECTION
         * =====================================================
         */

        const iceResponse = await fetch(
          `${API_URL}/live/webrtc/ice-servers`,
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
          }
        );

        if (!iceResponse.ok) {
          const text = await iceResponse.text();

          console.error(
            "=== WEBRTC ICE SERVERS FAILED ==="
          );
          console.error(
            "STATUS:",
            iceResponse.status
          );
          console.error(
            "SERVER RESPONSE:",
            text
          );

          throw new Error(
            `Unable to get WebRTC ICE servers (${iceResponse.status})`
          );
        }

        const iceData = await iceResponse.json();

        if (
          !iceData ||
          !Array.isArray(iceData.iceServers) ||
          iceData.iceServers.length === 0
        ) {
          throw new Error(
            "WebRTC ICE server list is empty."
          );
        }

        console.log(
          "=== STREETGO VIEWER ICE SERVERS RECEIVED ===",
          iceData.iceServers.map(
            (server: {
              urls?: string | string[];
            }) => ({
              urls: server.urls,
            })
          )
        );

        const peer =
          new RTCPeerConnection({
            iceServers:
              iceData.iceServers,
          });

        peerRef.current =
          peer;

        /*
         * =====================================================
         * REMOTE STREAM
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
              

              /*
               * Metadata is now available.
               * Start playback.
               */
              void playRemoteVideo();
            };

          video.oncanplay =
            () => {
              
            };

          video.onplaying =
            () => {
              
            };

          video.onerror =
            () => {
              console.error(
                "STREETGO VIEWER VIDEO ELEMENT ERROR:",
                video.error
              );
            };
        }

        /*
         * =====================================================
         * WEBRTC ONTRACK
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
             * Prefer browser supplied stream tracks.
             */
            if (
              event.streams &&
              event.streams.length > 0
            ) {
              const browserStream =
                event.streams[0];

              for (
                const track of
                browserStream.getTracks()
              ) {
                attachTrack(track);
              }
            }

            /*
             * Always attach the actual received track.
             */
            attachTrack(
              event.track
            );

            /*
             * Make sure video points to our
             * stable remote stream.
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
             * Update UI.
             */
            if (
              event.track.kind ===
              "video"
            ) {
              setHasVideo(true);

              
            }

            if (
              event.track.kind ===
              "audio"
            ) {
              
            }

            /*
             * IMPORTANT:
             * We DO NOT call load().
             *
             * We DO NOT repeatedly call play().
             *
             * loadedmetadata will handle playback.
             */

            void playRemoteVideo();
          };

        /*
         * =====================================================
         * TRACK EVENTS
         * =====================================================
         */

        peer.addEventListener(
          "track",
          (event) => {
            event.track.addEventListener(
              "ended",
              () => {
                
              }
            );

            event.track.addEventListener(
              "mute",
              () => {
                
              }
            );

            event.track.addEventListener(
              "unmute",
              () => {
                

                /*
                 * A video track becoming unmuted
                 * is a good time to ensure playback.
                 */
                if (
                  event.track.kind ===
                  "video"
                ) {
                  void playRemoteVideo();
                }
              }
            );
          }
        );

        /*
         * =====================================================
         * CONNECTION STATE
         * =====================================================
         */
peer.onconnectionstatechange =
  () => {
    

console.log(
  "=== STREETGO VIEWER CONNECTION STATE ===",
  peer.connectionState
);


    if (
      cancelled ||
      cancelledRef.current
    ) {
      return;
    }

    if (
      peer.connectionState ===
      "connected"
    ) {
      setConnected(true);
      setConnecting(false);

      

      syncReceiverTracks(peer);

      void playRemoteVideo();
    }

    /*
     * IMPORTANT:
     * WebRTC disconnected/failed does NOT automatically
     * mean the StreetGO live session has ended.
     */

    if (
      peer.connectionState ===
      "failed" ||
      peer.connectionState ===
      "disconnected"
    ) {
      setConnected(false);
      setConnecting(false);

      console.warn(
        "STREETGO VIEWER WEBRTC CONNECTION LOST:",
        peer.connectionState
      );

      setError(
        "Live connection interrupted. The broadcaster may still be live."
      );
    }

    if (
      peer.connectionState ===
      "closed"
    ) {
      setConnected(false);
      setConnecting(false);

      
    }
  };
        /*
         * =====================================================
         * ICE STATE
         * =====================================================
         */

     peer.oniceconnectionstatechange = () => {
  if (cancelled || cancelledRef.current) {
    return;
  }

  console.log(
    "=== STREETGO VIEWER ICE STATE ===",
    {
      iceConnectionState: peer.iceConnectionState,
      connectionState: peer.connectionState,
      signalingState: peer.signalingState,
      iceGatheringState: peer.iceGatheringState,
    }
  );
};

        /*
         * =====================================================
         * ICE GATHERING
         * =====================================================
         */

        peer.onicegatheringstatechange =
          () => {
            
          };

        /*
         * =====================================================
         * SIGNALING
         * =====================================================
         */

        peer.onsignalingstatechange =
          () => {
            
          };

        /*
         * =====================================================
         * CREATE OFFER
         * =====================================================
         */

        const offer =
          await peer.createOffer();

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

        if (cancelled) {
          return;
        }

        const localDescription =
          peer.localDescription;

        if (!localDescription) {
          throw new Error(
            "Viewer local description was not created."
          );
        }

        

        

        /*
         * =====================================================
         * SEND OFFER
         * =====================================================
         */

        

console.log("WEBRTC VIEWER REQUEST:", {
  liveId,
  apiUrl: API_URL,
  sdpType: localDescription.type,
  hasSdp: !!localDescription.sdp,
})




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

if (!response.ok) {
  const text = await response.text();

  console.error("=== WEBRTC OFFER FAILED ===");
  console.error("STATUS:", response.status);
  console.error("STATUS TEXT:", response.statusText);
  console.error("URL:", `${API_URL}/live/webrtc/offer`);
  console.error("SERVER RESPONSE:", text);

  throw new Error(
    `WebRTC server error ${response.status}: ${text}`
  );
}
const answer = await response.json();

console.log("=== WEBRTC ANSWER RECEIVED ===");
console.log("ANSWER:", answer);

        



      if (
  cancelled ||
  peer.connectionState === "closed" ||
  peer.signalingState === "closed"
) {
  
  return
}  




        /*
         * =====================================================
         * APPLY ANSWER
         * =====================================================
         */

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

        if (!cancelled) {
          syncReceiverTracks(
            peer
          );

          /*
           * Do NOT call load().
           * Do NOT force another play().
           *
           * ontrack / loadedmetadata handle playback.
           */
          void playRemoteVideo();
        }
      } catch (err) {
        console.error(
          "StreetGo Viewer WebRTC error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to connect to the live stream."
          );

          setConnecting(false);
          setConnected(false);
        }
      }
    }

    startViewer();

    /*
     * =========================================================
     * CLEANUP
     * =========================================================
     */

    return () => {
      cancelled = true;

      cancelledRef.current =
        true;

      

      const peer =
        peerRef.current;

      if (peer) {
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
      }

      peerRef.current =
        null;

      const remoteStream =
        remoteStreamRef.current;

      if (remoteStream) {
        remoteStream
          .getTracks()
          .forEach(
            (track) => {
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

        video.onerror =
          null;
      }
    };
  }, [liveId]);

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
        video.srcObject !== stream
      ) {
        video.srcObject =
          stream;
      }

      video.muted =
        false;

      await video.play();

      setMuted(false);

      
    } catch (err) {
      console.error(
        "Unable to enable viewer sound:",
        err
      );

      video.muted =
        true;

      setMuted(true);

      try {
        await video.play();
      } catch {
        // Browser may require another user interaction.
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

    setMuted(true);

    
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white">

      {/* HEADER */}

      <div className="mb-4 flex items-center justify-between">

        <div>
          <h2 className="text-lg font-semibold">
            StreetGo Live Camera
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Live video
          </p>
        </div>

        <div className="flex items-center gap-2">

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected
                ? "bg-red-500"
                : connecting
                  ? "bg-yellow-500"
                  : "bg-zinc-600"
            }`}
          />

          <span className="text-xs font-medium text-zinc-400">
            {connected
              ? "LIVE"
              : connecting
                ? "CONNECTING..."
                : "OFFLINE"}
          </span>

        </div>
      </div>

      {/* VIDEO */}

      <div className="relative overflow-hidden rounded-xl bg-black">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          controls={false}
          className="aspect-video w-full object-cover"
        />

        {/* ENABLE SOUND */}

        {hasVideo && muted && (
          <button
            type="button"
            onClick={enableSound}
            className="absolute bottom-4 left-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg hover:bg-zinc-200"
          >
            ðŸ”Š Enable Sound
          </button>
        )}

        {/* MUTE */}

        {hasVideo && !muted && (
          <button
            type="button"
            onClick={muteVideo}
            className="absolute bottom-4 left-4 rounded-lg bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-black"
          >
            ðŸ”‡ Mute
          </button>
        )}

        {/* WAITING */}

        {!hasVideo && connecting && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg bg-black/70 px-4 py-2 text-sm text-zinc-300">
              Connecting to StreetGo Live...
            </div>
          </div>
        )}

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* STATUS */}

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">

        <span>
          WebRTC:{" "}
          {connected
            ? "CONNECTED"
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

      let timer:
        ReturnType<typeof setTimeout> |
        undefined;

      let finished = false;

      const finish = () => {

        if (finished) {
          return;
        }

        finished = true;

        if (timer) {
          clearTimeout(timer);
        }

        peer.removeEventListener(
          "icegatheringstatechange",
          checkState
        );

        resolve();
      };

      const checkState = () => {

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

      if (
        peer.iceGatheringState ===
        "complete"
      ) {
        resolve();
        return;
      }

      peer.addEventListener(
        "icegatheringstatechange",
        checkState
      );

      timer = setTimeout(
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

