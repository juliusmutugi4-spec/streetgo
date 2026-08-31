"use client";

import type { MutableRefObject, RefObject } from "react";

export interface ViewerProps {
  liveId: string;
}

export interface ViewerRefs {
  videoRef: RefObject<HTMLVideoElement | null>;
  peerRef: MutableRefObject<RTCPeerConnection | null>;
  remoteStreamRef: MutableRefObject<MediaStream | null>;
  playbackPromiseRef: MutableRefObject<Promise<void> | null>;
  cancelledRef: MutableRefObject<boolean>;
  mountedRef: MutableRefObject<boolean>;
  retryTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  connectingRef: MutableRefObject<boolean>;
}