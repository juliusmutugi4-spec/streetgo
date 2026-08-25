"use client";

"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../hooks/useAuth";

const API_URL = process.env.NEXT_PUBLIC_ENGINE_URL!;

interface BroadcasterProps {
  liveId?: string;
}

interface LiveSession {
  live_id: string;
  title: string;
  description?: string | null;
  host_id: string;
  host_name: string;
  location?: string | null;
  status: string;
  viewer_count: number;
  created_at?: string;
  started_at?: string | null;
  ended_at?: string | null;
}

interface LiveResponse {
  success: boolean;
  live: LiveSession;
}

export default function Broadcaster({
  liveId: initialLiveId,
}: BroadcasterProps) {

    const { user, profile } = useAuth();

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const peerRef =
    useRef<RTCPeerConnection | null>(null);

  const liveIdRef =
    useRef<string | null>(
      initialLiveId &&
      initialLiveId !== "1" &&
      initialLiveId !== "unknown"
        ? initialLiveId
        : null
    );

  const stoppingRef =
    useRef(false);

  const startingRef =
    useRef(false);

  const [cameraOn, setCameraOn] =
    useState(false);

  const [connecting, setConnecting] =
    useState(false);

  const [connected, setConnected] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ============================================================
   * GET LIVE SESSION
   * ============================================================
   */

  async function getLiveSession(
    id: string
  ): Promise<LiveSession> {
    console.log(
      "STREETGO: CHECKING LIVE SESSION:",
      id
    );

    const response =
      await fetch(
        `${API_URL}/live/${id}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        `Unable to get live session ${response.status}: ${text}`
      );
    }

    const result =
      (await response.json()) as LiveResponse;

    if (
      !result?.success ||
      !result?.live
    ) {
      throw new Error(
        "Backend did not return a valid live session."
      );
    }

    console.log(
      "STREETGO: LIVE SESSION STATUS:",
      result.live.status
    );

    return result.live;
  }

  /*
   * ============================================================
   * CREATE LIVE SESSION
   * ============================================================
   */

  async function createLiveSession(): Promise<string> {

    if (!user?.id) {
      throw new Error(
        "You must be logged in to start a live broadcast."
      );
    }

    if (!profile?.username) {
      throw new Error(
        "Your StreetGO username could not be loaded."
      );
    }




    console.log(
      "STREETGO: CREATING LIVE SESSION..."
    );

    const response =
      await fetch(
        `${API_URL}/live/create`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },
body: JSON.stringify({
  title:
    "StreetGo Live Camera",

  description:
    "",

  host_id:
    user.id,

  host_name:
    profile.username,

location:
  null,
}),
        }
      );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        `Unable to create live session ${response.status}: ${text}`
      );
    }

    const result =
      await response.json();

    console.log(
      "STREETGO LIVE SESSION CREATED:",
      result
    );

    const newLiveId =
      result?.live?.live_id;

    if (!newLiveId) {
      throw new Error(
        "Backend created the live session but did not return a live_id."
      );
    }

    liveIdRef.current =
      newLiveId;

    return newLiveId;
  }

  /*
   * ============================================================
   * START LIVE SESSION
   * ============================================================
   */

  async function startLiveSession(
    id: string
  ) {
    console.log(
      "STREETGO: STARTING LIVE SESSION:",
      id
    );

    const response =
      await fetch(
        `${API_URL}/live/${id}/start`,
        {
          method: "POST",
        }
      );

    if (!response.ok) {
      const text =
        await response.text();

      throw new Error(
        `Unable to start live session ${response.status}: ${text}`
      );
    }

    const result =
      await response.json();

    console.log(
      "STREETGO LIVE SESSION STARTED:",
      result
    );
  }

  /*
   * ============================================================
   * PREPARE LIVE SESSION
   *
   * Possible states:
   *
   * created -> start it
   * live    -> use it
   * ended   -> create a NEW session
   * ============================================================
   */

  async function prepareLiveSession(): Promise<string> {
    let liveId =
      liveIdRef.current;

    /*
     * No valid ID.
     *
     * Create a brand-new session.
     */

    if (!liveId) {
      console.log(
        "STREETGO: NO LIVE ID."
      );

      liveId =
        await createLiveSession();

      await startLiveSession(
        liveId
      );

      return liveId;
    }

    /*
     * Check existing session.
     */

    let session: LiveSession;

    try {
      session =
        await getLiveSession(
          liveId
        );
    } catch (err) {
      console.warn(
        "STREETGO: EXISTING LIVE SESSION COULD NOT BE LOADED.",
        err
      );

      /*
       * If the supplied ID is invalid,
       * create a fresh session.
       */

      liveId =
        await createLiveSession();

      await startLiveSession(
        liveId
      );

      return liveId;
    }

    /*
     * Already live.
     */

    if (
      session.status ===
      "live"
    ) {
      console.log(
        "STREETGO: SESSION IS ALREADY LIVE."
      );

      return liveId;
    }

    /*
     * Created but not started.
     */

    if (
      session.status ===
      "created"
    ) {
      console.log(
        "STREETGO: SESSION EXISTS BUT IS NOT LIVE."
      );

      await startLiveSession(
        liveId
      );

      return liveId;
    }

    /*
     * Ended session cannot be reused.
     */

    if (
      session.status ===
      "ended"
    ) {
      console.log(
        "STREETGO: SESSION HAS ENDED."
      );

      liveId =
        await createLiveSession();

      await startLiveSession(
        liveId
      );

      return liveId;
    }

    /*
     * Unknown state.
     */

    throw new Error(
      `Unsupported live session status: ${session.status}`
    );
  }

  /*
   * ============================================================
   * START CAMERA
   * ============================================================
   */

  async function startCamera() {
    if (startingRef.current) {
      console.log(
        "STREETGO: START ALREADY IN PROGRESS."
      );

      return;
    }

    if (cameraOn) {
      console.log(
        "STREETGO: CAMERA IS ALREADY ON."
      );

      return;
    }

    startingRef.current =
      true;

    stoppingRef.current =
      false;

    try {
      setError("");
      setConnecting(true);
      setConnected(false);

      console.log(
        "======================================"
      );

      console.log(
        "STREETGO START LIVE"
      );

      console.log(
        "======================================"
      );

      /*
       * ========================================================
       * PREPARE BACKEND SESSION
       * ========================================================
       */

      const liveId =
        await prepareLiveSession();

      liveIdRef.current =
        liveId;

      console.log(
        "STREETGO ACTIVE LIVE ID:",
        liveId
      );

      /*
       * ========================================================
       * GET CAMERA + MICROPHONE
       * ========================================================
       */

      console.log(
        "STREETGO: REQUESTING CAMERA + MICROPHONE..."
      );

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: {
                ideal: 1280,
              },

              height: {
                ideal: 720,
              },

              facingMode:
                "user",
            },

            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          }
        );

      streamRef.current =
        stream;

      /*
       * Show local camera.
       */

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;

        videoRef.current.muted =
          true;

        await videoRef.current
          .play()
          .catch(() => {
            console.warn(
              "Local camera autoplay was blocked."
            );
          });
      }

      setCameraOn(true);

      console.log(
        "STREETGO CAMERA STARTED"
      );

      console.log(
        "Video tracks:",
        stream.getVideoTracks()
      );

      console.log(
        "Audio tracks:",
        stream.getAudioTracks()
      );

      /*
       * ========================================================
       * CREATE WEBRTC CONNECTION
       * ========================================================
       */

      const peer =
        new RTCPeerConnection();

      peerRef.current =
        peer;

      /*
       * ========================================================
       * ADD CAMERA + MICROPHONE
       * ========================================================
       */

      stream
        .getTracks()
        .forEach(
          (track) => {
            console.log(
              "STREETGO: ADDING TRACK:",
              track.kind,
              track.id
            );

            peer.addTrack(
              track,
              stream
            );
          }
        );

      /*
       * ========================================================
       * CONNECTION STATE
       * ========================================================
       */

      peer.onconnectionstatechange =
        () => {
          console.log(
            "STREETGO WEBRTC STATE:",
            peer.connectionState
          );

          if (
            peer.connectionState ===
            "connected"
          ) {
            setConnected(true);
            setConnecting(false);

            console.log(
              "STREETGO BROADCAST IS CONNECTED"
            );
          }

          if (
            peer.connectionState ===
              "failed" ||
            peer.connectionState ===
              "closed"
          ) {
            setConnected(false);

            console.log(
              "STREETGO BROADCAST WEBRTC FAILED/CLOSED"
            );
          }

          if (
            peer.connectionState ===
            "disconnected"
          ) {
            console.log(
              "STREETGO BROADCAST WEBRTC DISCONNECTED"
            );
          }
        };

      /*
       * ========================================================
       * ICE STATE
       * ========================================================
       */

      peer.oniceconnectionstatechange =
        () => {
          console.log(
            "STREETGO BROADCAST ICE STATE:",
            peer.iceConnectionState
          );
        };

      /*
       * ========================================================
       * ICE GATHERING
       * ========================================================
       */

      peer.onicegatheringstatechange =
        () => {
          console.log(
            "STREETGO BROADCAST ICE GATHERING:",
            peer.iceGatheringState
          );
        };

      /*
       * ========================================================
       * SIGNALING STATE
       * ========================================================
       */

      peer.onsignalingstatechange =
        () => {
          console.log(
            "STREETGO BROADCAST SIGNALING:",
            peer.signalingState
          );
        };

      /*
       * ========================================================
       * CREATE SDP OFFER
       * ========================================================
       */

      console.log(
        "STREETGO: CREATING WEBRTC OFFER..."
      );

      const offer =
        await peer.createOffer();

      await peer.setLocalDescription(
        offer
      );

      /*
       * ========================================================
       * WAIT FOR ICE
       * ========================================================
       */

      console.log(
        "STREETGO: WAITING FOR ICE..."
      );

      await waitForIceGatheringComplete(
        peer
      );

      const localDescription =
        peer.localDescription;

      if (!localDescription) {
        throw new Error(
          "WebRTC local description was not created."
        );
      }

      console.log(
        "STREETGO WEBRTC OFFER CREATED"
      );

      /*
       * ========================================================
       * SEND OFFER TO FASTAPI
       * ========================================================
       */

      const webrtcUrl =
        `${API_URL}/live/webrtc/offer`;

      console.log(
        "STREETGO WEBRTC API:",
        webrtcUrl
      );

      const response =
        await fetch(
          webrtcUrl,
          {
            method: "POST",

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
                "broadcaster",
            }),
          }
        );

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          `WebRTC server error ${response.status}: ${text}`
        );
      }

      const answer =
        await response.json();

      console.log(
        "STREETGO WEBRTC ANSWER:",
        answer
      );

      /*
       * ========================================================
       * VALIDATE ANSWER
       * ========================================================
       */

      if (
        !answer?.type ||
        !answer?.sdp
      ) {
        throw new Error(
          "WebRTC server returned an invalid SDP answer."
        );
      }

      /*
       * ========================================================
       * APPLY SERVER ANSWER
       * ========================================================
       */

      await peer.setRemoteDescription(
        {
          type:
            answer.type,

          sdp:
            answer.sdp,
        }
      );

      console.log(
        "STREETGO WEBRTC ANSWER APPLIED"
      );

      /*
       * ========================================================
       * FINAL STATE
       * ========================================================
       */

      if (
        peer.connectionState ===
        "connected"
      ) {
        setConnected(true);
      }

    } catch (err) {
      console.error(
        "StreetGo WebRTC error:",
        err
      );

      /*
       * Close WebRTC.
       */

      const peer =
        peerRef.current;

      if (peer) {
        try {
          peer.close();
        } catch {
          // Ignore cleanup errors.
        }
      }

      peerRef.current =
        null;

      /*
       * Stop camera + microphone.
       */

      stopMediaOnly();

      setCameraOn(false);
      setConnected(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to start StreetGo Live."
      );

    } finally {
      startingRef.current =
        false;

      setConnecting(false);
    }
  }

  /*
   * ============================================================
   * STOP MEDIA ONLY
   * ============================================================
   */

  function stopMediaOnly() {
    const stream =
      streamRef.current;

    if (stream) {
      console.log(
        "STREETGO: STOPPING MEDIA TRACKS..."
      );

      stream
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

    streamRef.current =
      null;

    if (videoRef.current) {
      videoRef.current.pause();

      videoRef.current.srcObject =
        null;
    }
  }

  /*
   * ============================================================
   * STOP LIVE
   * ============================================================
   */

  async function stopCamera() {
    if (stoppingRef.current) {
      return;
    }

    stoppingRef.current =
      true;

    try {
      setError("");

      console.log(
        "STREETGO: STOPPING LIVE..."
      );

      /*
       * ========================================================
       * CLOSE WEBRTC
       * ========================================================
       */

      const peer =
        peerRef.current;

      if (peer) {
        try {
          peer.close();
        } catch {
          // Ignore cleanup errors.
        }
      }

      peerRef.current =
        null;

      /*
       * ========================================================
       * STOP CAMERA + MICROPHONE
       * ========================================================
       */

      stopMediaOnly();

      /*
       * ========================================================
       * END BACKEND SESSION
       * ========================================================
       */

      const liveId =
        liveIdRef.current;

      if (liveId) {
        try {
          const response =
            await fetch(
              `${API_URL}/live/${liveId}/stop`,
              {
                method: "POST",
              }
            );

          if (!response.ok) {
            const text =
              await response.text();

            /*
             * If it is already ended, that is not
             * a fatal frontend error.
             */

            console.warn(
              "StreetGo Live stop server response:",
              response.status,
              text
            );
          } else {
            const result =
              await response.json();

            console.log(
              "STREETGO LIVE SESSION STOPPED:",
              result
            );
          }
        } catch (err) {
          console.error(
            "StreetGo Live stop request failed:",
            err
          );
        }
      }

      /*
       * ========================================================
       * CLEAR STATE
       * ========================================================
       */

      liveIdRef.current =
        null;

      setCameraOn(false);
      setConnected(false);
      setConnecting(false);

      console.log(
        "STREETGO CAMERA STOPPED"
      );

    } catch (err) {
      console.error(
        "StreetGo stop camera error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to stop StreetGo Live."
      );

      setCameraOn(false);
      setConnected(false);
      setConnecting(false);

    } finally {
      stoppingRef.current =
        false;
    }
  }

  /*
   * ============================================================
   * CLEANUP ON UNMOUNT
   * ============================================================
   */

  useEffect(() => {
    return () => {
      console.log(
        "STREETGO BROADCASTER UNMOUNTING"
      );

      const peer =
        peerRef.current;

      if (peer) {
        try {
          peer.close();
        } catch {
          // Ignore cleanup errors.
        }
      }

      peerRef.current =
        null;

      stopMediaOnly();
    };
  }, []);

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white">

      {/* HEADER */}

      <div className="mb-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-semibold">
              StreetGo Live Camera
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Live video broadcaster
            </p>

          </div>

          <div className="flex items-center gap-2">

            <span
              className={`h-2.5 w-2.5 rounded-full ${
                connected
                  ? "bg-red-500"
                  : cameraOn
                    ? "bg-yellow-500"
                    : "bg-zinc-600"
              }`}
            />

            <span className="text-xs font-medium text-zinc-400">

              {connected
                ? "BROADCASTING"
                : cameraOn
                  ? "CAMERA ON"
                  : "OFFLINE"}

            </span>

          </div>

        </div>

      </div>

      {/* VIDEO */}

      <div className="overflow-hidden rounded-xl bg-black">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full object-cover"
        />

      </div>

      {/* ERROR */}

      {error && (
        <div className="mt-4 rounded-lg border border-red-900 bg-red-950/30 px-4 py-3">

          <p className="text-sm text-red-400">
            {error}
          </p>

        </div>
      )}

      {/* BUTTON */}

      <div className="mt-4 flex gap-3">

        {!cameraOn ? (

          <button
            type="button"
            onClick={startCamera}
            disabled={connecting}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {connecting
              ? "Starting Live..."
              : "Start Live"}

          </button>

        ) : (

          <button
            type="button"
            onClick={stopCamera}
            disabled={stoppingRef.current}
            className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            Stop Live

          </button>

        )}

      </div>

      {/* STATUS */}

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">

        <span>
          Camera:{" "}
          {cameraOn
            ? "ON"
            : "OFF"}
        </span>

        <span>
          WebRTC:{" "}
          {connected
            ? "CONNECTED"
            : connecting
              ? "CONNECTING"
              : "NOT CONNECTED"}
        </span>

        {liveIdRef.current && (
          <span>
            Live ID:{" "}
            {liveIdRef.current}
          </span>
        )}

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

      function checkState() {
        if (
          peer.iceGatheringState ===
          "complete"
        ) {
          peer.removeEventListener(
            "icegatheringstatechange",
            checkState
          );

          resolve();
        }
      }

      peer.addEventListener(
        "icegatheringstatechange",
        checkState
      );

    }
  );
}
