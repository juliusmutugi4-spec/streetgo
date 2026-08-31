"use client";

import LiveUnavailable from "./components/LiveUnavailable";
import LiveLoading from "./components/LiveLoading";
import LiveInfo from "./components/LiveInfo";
import LiveHeader from "./components/LiveHeader";

import {
  useLiveSession,
} from "./hooks/useLiveSession";

import {
  useLiveStatusSocket,
} from "./hooks/useLiveStatusSocket";

import {
  useNetworkStatus,
} from "./hooks/useNetworkStatus";

import {
  useBroadcaster,
} from "./broadcaster/useBroadcaster";

import {
  useViewer,
} from "./viewer/useViewer";

import {
  Suspense,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import Broadcaster from "./Broadcaster";
import Viewer from "./Viewer";

import type {
  LiveSession,
} from "./broadcaster/broadcasterSession";









function LivePageContent() {
  const searchParams =
    useSearchParams();

  const isBroadcaster =
    searchParams.get("broadcast") === "1";

  const [live, setLive] =
    useState<LiveSession | null>(
      null
    );

  /*
   * ========================================================
   * CONNECTION / STATUS
   * ========================================================
   */



  const [loading, setLoading] =
    useState(true);

  const [creatingLive, setCreatingLive] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * IMPORTANT:
   *
   * Do NOT use navigator.onLine directly
   * inside JSX.
   *
   * Initial value must be deterministic
   * so SSR and the first client render
   * produce the same HTML.
   */
const {
  isOffline,
} = useNetworkStatus();
useBroadcaster({
  isBroadcaster,
  setLive,
  setLoading,
  setCreatingLive,
  setError,
});

/*
 * ========================================================
 * VIEWER SESSION
 * ========================================================
 */

useViewer({
  isBroadcaster,
  setLive,
  setLoading,
  setError,
});

const {
  viewerCount,
  connected,
} = useLiveStatusSocket({
  liveId: live?.live_id ?? null,
});



useLiveSession({
  isBroadcaster,
  live,
  setLoading,
  setError,
});


if (loading) {
  return (
    <LiveLoading
      creatingLive={creatingLive}
      isOffline={isOffline}
    />
  );
}
/*
 * ========================================================
 * NO LIVE
 * ========================================================
 */

if (!live) {
  return (
    <LiveUnavailable
      error={error}
      isOffline={isOffline}
    />
  );
}

  /*
   * ========================================================
   * LIVE PAGE
   * ========================================================
   */

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">




<LiveHeader
  isBroadcaster={isBroadcaster}
  connected={connected}
  isOffline={isOffline}
/>

        {/* =================================================
            BROADCASTER / VIEWER
            ================================================= */}

        {isBroadcaster ? (
          <Broadcaster
            liveId={
              live.live_id
            }
          />
        ) : (
          <Viewer
            liveId={
              live.live_id
            }
          />
        )}

<LiveInfo
  title={live.title}
  description={live.description}
  hostName={live.host_name}
  location={live.location}
  connected={connected}
  isOffline={isOffline}
  viewerCount={viewerCount}
  isBroadcaster={isBroadcaster}
/>
      </div>
    </main>
  );
}
export default function LivePage() {
  return (
    <Suspense
      fallback={
        <LiveLoading />
      }
    >
      <LivePageContent />
    </Suspense>
  );
}