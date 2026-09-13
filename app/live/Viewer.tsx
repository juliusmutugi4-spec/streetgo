"use client";

import { useEffect, useRef, useState } from "react";

import {
  connectViewerWebRTC,
  cleanupViewerWebRTC,
} from "./viewer/viewerWebRTC";

import {
  enableViewerSound,
  muteViewerVideo,
} from "./viewer/viewerMedia";

import type { ViewerProps } from "./viewer/viewerTypes";

export default function Viewer({ liveId }: ViewerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const playbackPromiseRef = useRef<Promise<void> | null>(null);

  const cancelledRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectingRef = useRef<boolean>(false);

  /*
   * Remembers whether this viewer has successfully received
   * video at least once during the current live session.
   *
   * This lets us show a small "Reconnecting" indicator instead
   * of replacing the entire video with the loading screen.
   */
  const hasEverPlayedRef = useRef<boolean>(false);

  const [connecting, setConnecting] = useState<boolean>(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasVideo, setHasVideo] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  /*
   * Start WebRTC connection.
   */
  useEffect(() => {
    mountedRef.current = true;
    cancelledRef.current = false;

    void connectViewerWebRTC({
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
    });

    return () => {
      cancelledRef.current = true;
      mountedRef.current = false;

      cleanupViewerWebRTC({
        peerRef,
        remoteStreamRef,
        retryTimerRef,
        videoRef,
      });
    };
  }, [liveId]);

  /*
   * Once video has successfully appeared, remember it.
   *
   * We intentionally keep this as a ref so losing the stream does
   * not immediately force the large initial loading screen back in.
   */
  useEffect(() => {
    if (hasVideo) {
      hasEverPlayedRef.current = true;
    }
  }, [hasVideo]);

  /*
   * Enable audio.
   */
  const handleSound = async (): Promise<void> => {
    try {
      await enableViewerSound({
        videoRef,
        remoteStreamRef,
        setHasVideo,
        setConnected,
        setConnecting,
        setError,
      });

      setMuted(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize audio.",
      );
    }
  };

  /*
   * Mute audio.
   */
  const handleMute = (): void => {
    muteViewerVideo({
      videoRef,
      setMuted,
    });
  };

  /*
   * Fullscreen.
   */
  const handleFullscreen = async (): Promise<void> => {
    const viewer = videoRef.current?.parentElement;

    if (!viewer) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await viewer.requestFullscreen();
      }
    } catch (err) {
      console.warn(
        "StreetGo Viewer: fullscreen unavailable.",
        err,
      );
    }
  };

  return (
    <section
      className="
        group
        relative
        aspect-video
        w-full
        overflow-hidden
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        text-zinc-50
        shadow-2xl
        transition-all
        duration-300
        select-none
        hover:border-zinc-700/80
      "
    >
      {/* =========================================================
          VIDEO CANVAS
          ========================================================= */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        controls={false}
        className="h-full w-full object-cover"
        aria-label="StreetGo Camera Live Video Stream"
      />

      {/* =========================================================
          CINEMATIC AMBIENT GRADIENTS
          ========================================================= */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-24
          bg-gradient-to-b
          from-black/60
          via-black/20
          to-transparent
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-28
          bg-gradient-to-t
          from-black/70
          via-black/20
          to-transparent
        "
      />

      {/* =========================================================
          HEADER
          ========================================================= */}
      <div
        className="
          absolute
          inset-x-0
          top-0
          flex
          items-start
          justify-between
          p-6
        "
      >
        <div className="space-y-0.5">
          <h2
            className="
              text-sm
              font-semibold
              tracking-wide
              text-zinc-100
              drop-shadow-md
              sm:text-base
            "
          >
            StreetGo Live Camera
          </h2>

          <p className="text-xs font-medium text-zinc-400">
            Secure WebRTC Feed
          </p>
        </div>

        {/* =====================================================
            LIVE STATUS BADGE
            ===================================================== */}
        <div
          className={`
            flex
            items-center
            gap-2
            rounded-full
            border
            px-3
            py-1.5
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            backdrop-blur-xl
            transition-all
            duration-300

            ${
              connected
                ? "border-emerald-400/20 bg-black/35 text-emerald-300 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                : isOffline
                  ? "border-rose-400/20 bg-black/35 text-rose-300"
                  : "border-white/10 bg-black/35 text-zinc-300"
            }
          `}
        >
          {connected ? (
            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-emerald-400
                  opacity-50
                "
              />

              <span
                className="
                  relative
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-400
                  shadow-[0_0_8px_rgba(52,211,153,0.7)]
                "
              />
            </span>
          ) : isOffline ? (
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-rose-400
                shadow-[0_0_8px_rgba(251,113,133,0.45)]
              "
            />
          ) : (
            <span className="relative flex h-2 w-2">
              <span
                className="
                  absolute
                  inline-flex
                  h-full
                  w-full
                  animate-ping
                  rounded-full
                  bg-zinc-400
                  opacity-30
                "
              />

              <span
                className="
                  relative
                  h-2
                  w-2
                  rounded-full
                  bg-zinc-400
                "
              />
            </span>
          )}

          <span>
            {connected
              ? "LIVE"
              : isOffline
                ? "OFFLINE"
                : connecting
                  ? "CONNECTING"
                  : "WAITING"}
          </span>
        </div>
      </div>

      {/* =========================================================
          INITIAL CONNECTION SCREEN
          
          IMPORTANT:
          This disappears permanently after the first successful
          video connection. If the stream temporarily drops later,
          we keep the video area clean and show a small reconnect
          indicator instead.
          ========================================================= */}
      {!hasVideo && !hasEverPlayedRef.current && (
        <div
          className="
            absolute
            inset-0
            z-10
            flex
            flex-col
            items-center
            justify-center
            bg-zinc-950/90
            backdrop-blur-md
          "
        >
          <div className="relative flex h-12 w-12 items-center justify-center">
            <span
              className={`
                absolute
                inline-flex
                h-full
                w-full
                animate-ping
                rounded-full
                opacity-20

                ${
                  isOffline
                    ? "bg-rose-500"
                    : "bg-zinc-500"
                }
              `}
            />

            <span
              className={`
                relative
                inline-flex
                h-2
                w-2
                rounded-full

                ${
                  isOffline
                    ? "bg-rose-500"
                    : "bg-zinc-400"
                }
              `}
            />
          </div>

          <p
            className="
              mt-4
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-zinc-400
            "
          >
            {isOffline
              ? "Waiting for stream connection"
              : connecting
                ? "Establishing Secure Gateway"
                : "Waiting for live video"}
          </p>
        </div>
      )}

      {/* =========================================================
          RECONNECTING INDICATOR
          
          Small and non-intrusive. The existing video surface is
          not replaced by a giant loading screen.
          ========================================================= */}
      {!hasVideo &&
        hasEverPlayedRef.current &&
        !isOffline && (
          <div
            className="
              absolute
              bottom-5
              left-1/2
              z-20
              -translate-x-1/2
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-white/10
                bg-black/50
                px-3.5
                py-2
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-zinc-200
                shadow-lg
                backdrop-blur-xl
              "
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="
                    absolute
                    inline-flex
                    h-full
                    w-full
                    animate-ping
                    rounded-full
                    bg-amber-400
                    opacity-50
                  "
                />

                <span
                  className="
                    relative
                    h-2
                    w-2
                    rounded-full
                    bg-amber-400
                  "
                />
              </span>

              <span>Reconnecting</span>
            </div>
          </div>
        )}

      {/* =========================================================
          ERROR
          ========================================================= */}
      {error && !isOffline && !connected && (
        <div
          className="
            absolute
            bottom-16
            left-6
            right-6
            z-20
            max-w-sm
            animate-in
            rounded-lg
            border
            border-rose-500/20
            bg-zinc-900/90
            p-4
            shadow-xl
            backdrop-blur-md
            fade-in
            slide-in-from-bottom-3
            duration-300
          "
        >
          <div className="flex gap-2.5">
            <svg
              className="h-4 w-4 shrink-0 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>

            <p
              className="
                text-xs
                font-medium
                leading-normal
                text-zinc-300
              "
            >
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          MEDIA CONTROLLER
          ========================================================= */}
      {hasVideo && (
        <div
          className="
            absolute
            bottom-5
            left-5
            z-20
            flex
            items-center
            gap-2
          "
        >
          {/* =====================================================
              SOUND
              ===================================================== */}
          {muted ? (
            <button
              type="button"
              onClick={handleSound}
              aria-label="Enable sound"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-black/45
                text-zinc-100
                shadow-lg
                backdrop-blur-xl
                transition-all
                duration-200
                hover:scale-105
                hover:bg-black/65
                active:scale-95
              "
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMute}
              aria-label="Mute stream"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-black/45
                text-zinc-100
                shadow-lg
                backdrop-blur-xl
                transition-all
                duration-200
                hover:scale-105
                hover:bg-black/65
                active:scale-95
              "
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 9l4 6m0-6l-4 6"
                />
              </svg>
            </button>
          )}

          {/* =====================================================
              FULLSCREEN
              ===================================================== */}
          <button
            type="button"
            onClick={handleFullscreen}
            aria-label="Enter fullscreen"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-black/45
              text-zinc-100
              shadow-lg
              backdrop-blur-xl
              transition-all
              duration-200
              hover:scale-105
              hover:bg-black/65
              active:scale-95
            "
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"
              />
            </svg>
          </button>
        </div>
      )}

      {/* =========================================================
          TELEMETRY
          ========================================================= */}
      <div
        className="
          absolute
          bottom-6
          right-6
          z-20
          hidden
          items-center
          gap-5
          text-[10px]
          font-bold
          uppercase
          tracking-wider
          text-zinc-500
          select-none
          sm:flex
        "
      >
        {/* RTC */}
        <div className="flex items-center gap-2">
          <span
            className={`
              h-1
              w-1
              rounded-full
              ${
                connected
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }
            `}
          />

          <span>
            RTC:{" "}
            <span
              className={
                connected
                  ? "text-zinc-300"
                  : "text-zinc-600"
              }
            >
              {connected ? "SECURE" : "IDLE"}
            </span>
          </span>
        </div>

        {/* VIDEO */}
        <div className="flex items-center gap-2">
          <span
            className={`
              h-1
              w-1
              rounded-full
              ${
                hasVideo
                  ? "bg-emerald-400"
                  : "bg-zinc-600"
              }
            `}
          />

          <span>
            VIDEO:{" "}
            <span
              className={
                hasVideo
                  ? "text-zinc-300"
                  : "text-zinc-600"
              }
            >
              {hasVideo
                ? "DECODING"
                : hasEverPlayedRef.current
                  ? "RECONNECTING"
                  : "WAITING"}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}