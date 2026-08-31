"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";

interface ViewerMediaOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  remoteStreamRef: React.MutableRefObject<MediaStream | null>;
  setHasVideo: Dispatch<SetStateAction<boolean>>;
  setConnected: Dispatch<SetStateAction<boolean>>;
  setConnecting: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string>>;
}

export function attachViewerTrack(
  stream: MediaStream,
  videoRef: RefObject<HTMLVideoElement | null>,
  remoteStreamRef: React.MutableRefObject<MediaStream | null>,
  setHasVideo: Dispatch<SetStateAction<boolean>>,
  setConnected: Dispatch<SetStateAction<boolean>>,
  setConnecting: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
) {
  remoteStreamRef.current = stream;

  const video = videoRef.current;
  if (!video) return;

  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;

  setHasVideo(stream.getVideoTracks().length > 0);
  setConnected(true);
  setConnecting(false);
  setError("");

  void video.play().catch((err) => {
    console.warn("StreetGO viewer autoplay:", err);
  });
}

export async function enableViewerSound({
  videoRef,
  remoteStreamRef,
  setHasVideo,
  setConnected,
  setConnecting,
  setError,
}: ViewerMediaOptions) {
  const video = videoRef.current;
  const stream = remoteStreamRef.current;

  if (!video || !stream) return;

  video.srcObject = stream;
  video.muted = false;
  video.volume = 1;

  try {
    await video.play();

    setHasVideo(stream.getVideoTracks().length > 0);
    setConnected(true);
    setConnecting(false);
    setError("");
  } catch (err) {
    console.warn("StreetGO viewer sound playback:", err);
    setError("Tap the video to enable sound.");
  }
}

export function muteViewerVideo({
  videoRef,
  setMuted,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  setMuted: Dispatch<SetStateAction<boolean>>;
}) {
  const video = videoRef.current;
  if (!video) return;

  video.muted = true;
  setMuted(true);
}

export function clearViewerMedia({
  videoRef,
  remoteStreamRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  remoteStreamRef: React.MutableRefObject<MediaStream | null>;
}) {
  const stream = remoteStreamRef.current;

  if (stream) {
    stream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch {}
    });
  }

  remoteStreamRef.current = null;

  const video = videoRef.current;

  if (video) {
    video.pause();
    video.srcObject = null;
  }
}

export function getViewerMediaState(stream: MediaStream | null) {
  if (!stream) {
    return { hasVideo: false, hasAudio: false };
  }

  return {
    hasVideo: stream.getVideoTracks().some(
      (track) => track.readyState !== "ended",
    ),
    hasAudio: stream.getAudioTracks().some(
      (track) => track.readyState !== "ended",
    ),
  };
}