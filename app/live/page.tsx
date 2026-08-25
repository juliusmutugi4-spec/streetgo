"use client";

import { getSupabaseBrowser } from "../lib/supabase-browser";
import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import Broadcaster from "./Broadcaster";
import Viewer from "./Viewer";

const API_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL ||
  "http://127.0.0.1:8000";

type LiveSession = {
  live_id: string;
  title: string;
  description?: string | null;
  host_id: string;
  host_name: string;
  location?: string | null;
  status: string;
  viewer_count: number;
  created_at: string;
  started_at?: string | null;
  ended_at?: string | null;
};

type Profile = {
  id: string;
  username: string;
  avatar_url?: string | null;
};

function LivePageContent() {
  const searchParams = useSearchParams();

  const isBroadcaster =
    searchParams.get("broadcast") === "1";

  const [live, setLive] =
    useState<LiveSession | null>(null);

  const [connected, setConnected] =
    useState(false);

  const [viewerCount, setViewerCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [creatingLive, setCreatingLive] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ========================================================
   * BROADCASTER
   *
   * Automatically create and start a live session.
   *
   * The broadcaster identity comes from:
   *
   * Supabase Auth
   *       ↓
   * authenticated user.id
   *       ↓
   * profiles.id
   *       ↓
   * real username
   *
   * ========================================================
   */

  useEffect(() => {
    if (!isBroadcaster) {
      return;
    }

    let cancelled = false;

    async function createAndStartLive() {
      try {
        setLoading(true);
        setCreatingLive(true);
        setError("");

        /*
         * ====================================================
         * GET AUTHENTICATED STREETGO USER
         * ====================================================
         */

        const supabase =
          getSupabaseBrowser();

        console.log(
          "STREETGO: GETTING CURRENT USER"
        );

        const {
          data: {
            user,
          },
          error: authError,
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw new Error(
            `Unable to get current user: ${authError.message}`
          );
        }

        if (!user) {
          throw new Error(
            "You must be logged in to start a live broadcast."
          );
        }

        console.log(
          "STREETGO AUTH USER:",
          {
            id: user.id,
            email: user.email,
          }
        );

        /*
         * ====================================================
         * GET REAL STREETGO PROFILE
         * ====================================================
         */

        console.log(
          "STREETGO: LOADING BROADCASTER PROFILE"
        );

        const {
          data: profile,
          error: profileError,
        } =
          await supabase
            .from("profiles")
            .select(`
              id,
              username,
              avatar_url
            `)
            .eq(
              "id",
              user.id
            )
            .single();

        if (profileError) {
          throw new Error(
            `Unable to load your StreetGO profile: ${profileError.message}`
          );
        }

        if (!profile) {
          throw new Error(
            "StreetGO profile not found for the logged-in user."
          );
        }

        if (
          !profile.username ||
          profile.username.trim() === ""
        ) {
          throw new Error(
            "Your StreetGO profile does not have a username."
          );
        }

        const broadcasterProfile =
          profile as Profile;

        console.log(
          "STREETGO BROADCASTER PROFILE:",
          {
            id:
              broadcasterProfile.id,

            username:
              broadcasterProfile.username,

            avatar:
              broadcasterProfile.avatar_url,
          }
        );

        /*
         * ====================================================
         * CREATE LIVE SESSION
         * ====================================================
         */

        console.log(
          "STREETGO: CREATING LIVE SESSION"
        );

        const createResponse =
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
                  `${broadcasterProfile.username}'s Live`,

                description:
                  "StreetGO real-time live video",

                /*
                 * REAL SUPABASE USER ID
                 */
                host_id:
                  user.id,

                /*
                 * REAL STREETGO USERNAME
                 */
                host_name:
                  broadcasterProfile.username,

                location:
                  "Nairobi, Kenya",
              }),
            }
          );

        if (!createResponse.ok) {
          const text =
            await createResponse.text();

          throw new Error(
            `Live creation failed ${createResponse.status}: ${text}`
          );
        }

        const createResult =
          await createResponse.json();

        console.log(
          "STREETGO LIVE CREATED:",
          createResult
        );

        const createdLive =
          createResult.live as LiveSession;

        if (!createdLive?.live_id) {
          throw new Error(
            "Backend did not return a live_id."
          );
        }

        /*
         * ====================================================
         * START LIVE SESSION
         * ====================================================
         */

        console.log(
          "STREETGO: STARTING LIVE SESSION:",
          createdLive.live_id
        );

        const startResponse =
          await fetch(
            `${API_URL}/live/${createdLive.live_id}/start`,
            {
              method: "POST",
            }
          );

        if (!startResponse.ok) {
          const text =
            await startResponse.text();

          throw new Error(
            `Live start failed ${startResponse.status}: ${text}`
          );
        }

        const startResult =
          await startResponse.json();

        console.log(
          "STREETGO LIVE STARTED:",
          startResult
        );

        const startedLive =
          startResult.live as LiveSession;

        if (cancelled) {
          return;
        }

        /*
         * ====================================================
         * FORCE REAL PROFILE INFORMATION
         *
         * Even if the backend returns an old/default
         * host_name, keep the authenticated profile name
         * in the frontend.
         * ====================================================
         */

        const finalLive: LiveSession = {
          ...startedLive,

          host_id:
            user.id,

          host_name:
            broadcasterProfile.username,
        };

        /*
         * ====================================================
         * STORE ACTIVE SESSION
         * ====================================================
         */

        setLive(finalLive);

        setViewerCount(
          finalLive.viewer_count ?? 0
        );

        console.log(
          "STREETGO BROADCASTER READY:",
          {
            liveId:
              finalLive.live_id,

            userId:
              user.id,

            username:
              broadcasterProfile.username,
          }
        );

      } catch (err) {
        console.error(
          "StreetGo broadcaster startup error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to start StreetGo Live."
          );

          setLive(null);
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
          setCreatingLive(false);
        }
      }
    }

    createAndStartLive();

    return () => {
      cancelled = true;
    };
  }, [isBroadcaster]);

  /*
   * ========================================================
   * VIEWER
   *
   * Viewer only searches for an existing live session.
   * ========================================================
   */

  useEffect(() => {
    if (isBroadcaster) {
      return;
    }

    let cancelled = false;

    async function findLiveSession() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/live`
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load live sessions: ${response.status}`
          );
        }

        const result =
          await response.json();

        const sessions:
          LiveSession[] =
          result.live ?? [];

        const activeSession =
          sessions.find(
            (session) =>
              session.status === "live"
          );

        if (cancelled) {
          return;
        }

        if (!activeSession) {
          setLive(null);

          setError(
            "There is currently no active live session."
          );

          return;
        }

        setLive(activeSession);

        setViewerCount(
          activeSession.viewer_count ?? 0
        );

        console.log(
          "STREETGO ACTIVE LIVE:",
          {
            liveId:
              activeSession.live_id,

            hostId:
              activeSession.host_id,

            hostName:
              activeSession.host_name,
          }
        );

      } catch (err) {
        console.error(
          "Live session discovery error:",
          err
        );

        if (!cancelled) {
          setError(
            "Unable to connect to the StreetGo Live server."
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    findLiveSession();

    return () => {
      cancelled = true;
    };
  }, [isBroadcaster]);

  /*
   * ========================================================
   * WEBSOCKET
   *
   * Used for connection status + viewer count.
   * ========================================================
   */

  useEffect(() => {
    if (!live?.live_id) {
      return;
    }

const wsProtocol =
  window.location.protocol === "https:"
    ? "wss:"
    : "ws:";

const apiUrl =
  new URL(API_URL);

const wsHost =
  apiUrl.host;

const ws =
  new WebSocket(
    `${wsProtocol}//${wsHost}/live/${live.live_id}/ws`
  );
    ws.onopen = () => {
      console.log(
        "STREETGO LIVE WEBSOCKET CONNECTED"
      );

      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message =
          JSON.parse(event.data);

        console.log(
          "STREETGO LIVE EVENT:",
          message
        );

        if (
          message.type ===
            "viewer_count" ||
          message.type ===
            "connected"
        ) {
          setViewerCount(
            message.viewer_count ?? 0
          );
        }

      } catch (err) {
        console.error(
          "Live WebSocket event error:",
          err
        );
      }
    };

    ws.onerror = (event) => {
      console.error(
        "StreetGo Live WebSocket error:",
        event
      );

      setConnected(false);
    };

    ws.onclose = () => {
      console.log(
        "STREETGO LIVE WEBSOCKET DISCONNECTED"
      );

      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [live?.live_id]);

  /*
   * ========================================================
   * LOADING
   * ========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">

        <div className="mx-auto max-w-5xl px-4 py-8">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">

            <div className="mb-4 text-4xl">
              📡
            </div>

            <h1 className="text-2xl font-bold">
              StreetGo Live
            </h1>

            <p className="mt-3 text-sm text-zinc-400">
              {creatingLive
                ? "Preparing your live broadcast..."
                : "Loading StreetGo Live..."}
            </p>

          </div>

        </div>

      </main>
    );
  }

  /*
   * ========================================================
   * NO LIVE
   * ========================================================
   */

  if (!live) {
    return (
      <main className="min-h-screen bg-black text-white">

        <div className="mx-auto max-w-5xl px-4 py-8">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">

            <div className="mb-4 text-4xl">
              📡
            </div>

            <h1 className="text-2xl font-bold">
              StreetGo Live
            </h1>

            <p className="mt-3 text-sm text-zinc-400">
              {error ||
                "There is currently no active live session."}
            </p>

          </div>

        </div>

      </main>
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

        {/* HEADER */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              StreetGo Live
            </h1>

            <p className="mt-1 text-sm text-zinc-400">
              {isBroadcaster
                ? "Live Broadcasting"
                : "Live Coverage"}
            </p>

          </div>

          <div className="flex items-center gap-3">

            <span
              className={`h-3 w-3 rounded-full ${
                connected
                  ? "bg-red-500"
                  : "bg-zinc-600"
              }`}
            />

            <span className="text-sm font-medium">
              {connected
                ? "LIVE"
                : "DISCONNECTED"}
            </span>

          </div>

        </div>

        {/* BROADCASTER OR VIEWER */}

        {isBroadcaster ? (

          <Broadcaster
            liveId={live.live_id}
          />

        ) : (

          <Viewer
            liveId={live.live_id}
          />

        )}

        {/* LIVE INFORMATION */}

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

          <h2 className="text-lg font-semibold">
            {live.title}
          </h2>

          {live.description && (
            <p className="mt-1 text-sm text-zinc-400">
              {live.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-8">

            <div>

              <p className="text-xs text-zinc-500">
                STATUS
              </p>

              <p className="mt-1 font-semibold">
                {connected
                  ? "Connected"
                  : "Disconnected"}
              </p>

            </div>

            <div>

              <p className="text-xs text-zinc-500">
                VIEWERS
              </p>

              <p className="mt-1 font-semibold">
                {viewerCount}
              </p>

            </div>

            <div>

              <p className="text-xs text-zinc-500">
                HOST
              </p>

              <p className="mt-1 font-semibold">
                {live.host_name}
              </p>

            </div>

            {live.location && (
              <div>

                <p className="text-xs text-zinc-500">
                  LOCATION
                </p>

                <p className="mt-1 font-semibold">
                  {live.location}
                </p>

              </div>
            )}

            <div>

              <p className="text-xs text-zinc-500">
                MODE
              </p>

              <p className="mt-1 font-semibold">
                {isBroadcaster
                  ? "Broadcaster"
                  : "Viewer"}
              </p>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default function LivePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <div className="mb-4 text-4xl">
                📡
              </div>

              <h1 className="text-2xl font-bold">
                StreetGo Live
              </h1>

              <p className="mt-3 text-sm text-zinc-400">
                Loading StreetGo Live...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <LivePageContent />
    </Suspense>
  )
}
