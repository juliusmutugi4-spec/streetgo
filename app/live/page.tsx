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
  process.env.NEXT_PUBLIC_ENGINE_URL!;

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
   * IMPORTANT:
   *
   * Do NOT use navigator.onLine directly
   * inside JSX.
   *
   * Initial value must be deterministic
   * so SSR and the first client render
   * produce the same HTML.
   */
  const [isOffline, setIsOffline] =
    useState(false);

  /*
   * ========================================================
   * NETWORK STATUS
   * ========================================================
   */

  useEffect(() => {
    const updateNetworkStatus =
      () => {
        setIsOffline(
          !navigator.onLine
        );
      };

    /*
     * This runs only after hydration.
     */
    updateNetworkStatus();

    window.addEventListener(
      "online",
      updateNetworkStatus
    );

    window.addEventListener(
      "offline",
      updateNetworkStatus
    );

    return () => {
      window.removeEventListener(
        "online",
        updateNetworkStatus
      );

      window.removeEventListener(
        "offline",
        updateNetworkStatus
      );
    };
  }, []);

  /*
   * ========================================================
   * BROADCASTER
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

        const {
          data: {
            session,
          },
          error: authError,
        } =
          await supabase.auth.getSession();

        const user =
          session?.user ?? null;

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

        /*
         * ====================================================
         * GET REAL STREETGO PROFILE
         * ====================================================
         */

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

        /*
         * ====================================================
         * CREATE LIVE SESSION
         * ====================================================
         */

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

                host_id:
                  user.id,

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

        const createdLive =
          createResult.live as LiveSession;

        if (
          !createdLive?.live_id
        ) {
          throw new Error(
            "Backend did not return a live_id."
          );
        }

        /*
         * ====================================================
         * START LIVE SESSION
         * ====================================================
         */

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

        const startedLive =
          startResult.live as LiveSession;

        if (cancelled) {
          return;
        }

        /*
         * ====================================================
         * FORCE REAL PROFILE INFORMATION
         * ====================================================
         */

        const finalLive:
          LiveSession = {
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

        setLive(
          finalLive
        );

        setViewerCount(
          finalLive.viewer_count ??
            0
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        /*
         * Network failure during offline mode
         * should be handled as connectivity state.
         */
        if (
          !navigator.onLine
        ) {
          setIsOffline(true);
          setError("");
          setLive(null);

          return;
        }

        console.error(
          "StreetGO broadcaster startup error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to start StreetGO Live."
        );

        setLive(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setCreatingLive(false);
        }
      }
    }

    void createAndStartLive();

    return () => {
      cancelled = true;
    };
  }, [isBroadcaster]);

  /*
   * ========================================================
   * VIEWER
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

        /*
         * Check connection only inside an effect,
         * never during SSR rendering.
         */
        if (!navigator.onLine) {
          setIsOffline(true);

          setError(
            "You are offline. Waiting for your internet connection..."
          );

          setLive(null);

          return;
        }

        setIsOffline(false);

        const response =
          await fetch(
            `${API_URL}/live`,
            {
              cache:
                "no-store",
            }
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
            (
              session
            ) =>
              session.status ===
              "live"
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

        setLive(
          activeSession
        );

        setViewerCount(
          activeSession.viewer_count ??
            0
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        if (
          !navigator.onLine
        ) {
          setIsOffline(true);

          setError(
            "You are offline. Waiting for your internet connection..."
          );

          return;
        }

        console.warn(
          "StreetGO Live: session discovery failed:",
          err
        );

        setError(
          "Unable to connect to the StreetGO Live server."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void findLiveSession();

    return () => {
      cancelled = true;
    };
  }, [isBroadcaster]);

  /*
   * ========================================================
   * STATUS WEBSOCKET
   *
   * This socket is ONLY for:
   * - viewer count
   * - live status
   *
   * Actual video is WebRTC.
   * ========================================================
   */

  useEffect(() => {
    if (!live?.live_id) {
      return;
    }

    let cancelled = false;

    let reconnectTimer:
      ReturnType<typeof setTimeout> |
      null = null;

    let ws:
      WebSocket | null = null;

    let connectingSocket =
      false;

    /*
     * ======================================================
     * CLEAR RECONNECT TIMER
     * ======================================================
     */

    const clearReconnectTimer =
      () => {
        if (
          reconnectTimer
        ) {
          clearTimeout(
            reconnectTimer
          );

          reconnectTimer =
            null;
        }
      };

    /*
     * ======================================================
     * CONNECT
     * ======================================================
     */

    const connectWebSocket =
      () => {
        if (
          cancelled ||
          connectingSocket
        ) {
          return;
        }

        if (
          !navigator.onLine
        ) {
          setConnected(false);
          return;
        }

        /*
         * Avoid duplicate sockets.
         */
        if (
          ws &&
          (
            ws.readyState ===
              WebSocket.OPEN ||
            ws.readyState ===
              WebSocket.CONNECTING
          )
        ) {
          return;
        }

        connectingSocket =
          true;

        try {
          const wsProtocol =
            window.location.protocol ===
            "https:"
              ? "wss:"
              : "ws:";

          const apiUrl =
            new URL(API_URL);

          const wsHost =
            apiUrl.host;

          const socketUrl =
            `${wsProtocol}//${wsHost}/live/${live.live_id}/ws`;

          ws =
            new WebSocket(
              socketUrl
            );

          ws.onopen = () => {
            connectingSocket =
              false;

            if (cancelled) {
              return;
            }

            setConnected(true);

            console.log(
              "StreetGO Live WebSocket connected"
            );
          };

          ws.onmessage = (
            event
          ) => {
            if (cancelled) {
              return;
            }

            try {
              const message =
                JSON.parse(
                  event.data
                );

              if (
                message.type ===
                  "viewer_count" ||
                message.type ===
                  "connected"
              ) {
                setViewerCount(
                  Number(
                    message.viewer_count
                  ) || 0
                );
              }
            } catch (err) {
              console.warn(
                "StreetGO Live: invalid status message.",
                err
              );
            }
          };

          /*
           * IMPORTANT:
           *
           * Do NOT console.error here.
           * A browser WebSocket error is often
           * an expected network transition.
           */
          ws.onerror = () => {
            connectingSocket =
              false;

            if (cancelled) {
              return;
            }

            setConnected(false);

            if (
              !navigator.onLine
            ) {
              setIsOffline(true);
              return;
            }

            console.warn(
              "StreetGO Live: status connection unavailable; waiting for reconnect."
            );
          };

          ws.onclose = () => {
            connectingSocket =
              false;

            if (cancelled) {
              return;
            }

            setConnected(false);

            if (
              !navigator.onLine
            ) {
              return;
            }

            if (
              reconnectTimer
            ) {
              return;
            }

            reconnectTimer =
              setTimeout(
                () => {
                  reconnectTimer =
                    null;

                  if (
                    cancelled ||
                    !navigator.onLine
                  ) {
                    return;
                  }

                  connectWebSocket();
                },
                3000
              );
          };
        } catch (err) {
          connectingSocket =
            false;

          setConnected(false);

          if (
            !navigator.onLine
          ) {
            setIsOffline(true);
            return;
          }

          console.warn(
            "StreetGO Live: unable to create status connection.",
            err
          );

          if (
            !reconnectTimer
          ) {
            reconnectTimer =
              setTimeout(
                () => {
                  reconnectTimer =
                    null;

                  if (
                    !cancelled &&
                    navigator.onLine
                  ) {
                    connectWebSocket();
                  }
                },
                3000
              );
          }
        }
      };

    /*
     * ======================================================
     * OFFLINE
     * ======================================================
     */

    const handleOffline =
      () => {
        if (cancelled) {
          return;
        }

        setIsOffline(true);
        setConnected(false);

        clearReconnectTimer();

        if (
          ws &&
          (
            ws.readyState ===
              WebSocket.OPEN ||
            ws.readyState ===
              WebSocket.CONNECTING
          )
        ) {
          try {
            ws.close();
          } catch {
            // Ignore offline close errors.
          }
        }

        ws = null;
        connectingSocket =
          false;
      };

    /*
     * ======================================================
     * ONLINE
     * ======================================================
     */

    const handleOnline =
      () => {
        if (cancelled) {
          return;
        }

        setIsOffline(false);

        clearReconnectTimer();

        reconnectTimer =
          setTimeout(
            () => {
              reconnectTimer =
                null;

              if (
                cancelled ||
                !navigator.onLine
              ) {
                return;
              }

              connectWebSocket();
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
     * Initial connection.
     */
    connectWebSocket();

    return () => {
      cancelled = true;

      clearReconnectTimer();

      window.removeEventListener(
        "offline",
        handleOffline
      );

      window.removeEventListener(
        "online",
        handleOnline
      );

      if (ws) {
        try {
          ws.close();
        } catch {
          // Ignore cleanup errors.
        }

        ws = null;
      }

      connectingSocket =
        false;
    };
  }, [live?.live_id]);

  /*
   * ========================================================
   * VIEWER OFFLINE RECOVERY
   * ========================================================
   */

  useEffect(() => {
    if (isBroadcaster) {
      return;
    }

    const handleOnline =
      () => {
        setIsOffline(false);

        /*
         * When no session was loaded because
         * the browser was offline, reload once
         * the connection is available.
         */
        if (!live) {
          setLoading(true);
          setError("");

          window.location.reload();
        }
      };

    window.addEventListener(
      "online",
      handleOnline
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );
    };
  }, [
    isBroadcaster,
    live,
  ]);

  /*
   * ========================================================
   * LOADING
   *
   * IMPORTANT:
   *
   * Use isOffline state here.
   * NEVER navigator.onLine directly in JSX.
   * ========================================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              p-8
              text-center
            "
          >
            <div className="mb-4 text-4xl">
              📡
            </div>

            <h1 className="text-2xl font-bold">
              StreetGo Live
            </h1>

            <p className="mt-3 text-sm text-zinc-400">
              {creatingLive
                ? "Preparing your live broadcast..."
                : isOffline
                  ? "Waiting for your internet connection..."
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
          <div
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              p-8
              text-center
            "
          >
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

            {isOffline && (
              <div
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-yellow-500/20
                  bg-yellow-500/5
                  px-4
                  py-2
                  text-xs
                  text-yellow-300
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-yellow-400
                  "
                />

                Waiting for connection...
              </div>
            )}
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

        {/* =================================================
            HEADER
            ================================================= */}

        <div
          className="
            mb-6
            flex
            items-center
            justify-between
          "
        >
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

          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <span
              className={`
                h-3
                w-3
                rounded-full

                ${
                  connected
                    ? "bg-red-500"
                    : isOffline
                      ? "bg-yellow-400"
                      : "bg-zinc-600"
                }
              `}
            />

            <span
              className="
                text-sm
                font-medium
              "
            >
              {connected
                ? "LIVE"
                : isOffline
                  ? "OFFLINE"
                  : "RECONNECTING..."}
            </span>
          </div>
        </div>

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

        {/* =================================================
            LIVE INFORMATION
            ================================================= */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >
          <h2
            className="
              text-lg
              font-semibold
            "
          >
            {live.title}
          </h2>

          {live.description && (
            <p
              className="
                mt-1
                text-sm
                text-zinc-400
              "
            >
              {live.description}
            </p>
          )}

          <div
            className="
              mt-5
              flex
              flex-wrap
              gap-8
            "
          >
            {/* STATUS */}

            <div>
              <p
                className="
                  text-xs
                  text-zinc-500
                "
              >
                STATUS
              </p>

              <p
                className="
                  mt-1
                  font-semibold
                "
              >
                {connected
                  ? "Connected"
                  : isOffline
                    ? "Offline"
                    : "Reconnecting"}
              </p>
            </div>

            {/* VIEWERS */}

            <div>
              <p
                className="
                  text-xs
                  text-zinc-500
                "
              >
                VIEWERS
              </p>

              <p
                className="
                  mt-1
                  font-semibold
                "
              >
                {viewerCount}
              </p>
            </div>

            {/* HOST */}

            <div>
              <p
                className="
                  text-xs
                  text-zinc-500
                "
              >
                HOST
              </p>

              <p
                className="
                  mt-1
                  font-semibold
                "
              >
                {live.host_name}
              </p>
            </div>

            {/* LOCATION */}

            {live.location && (
              <div>
                <p
                  className="
                    text-xs
                    text-zinc-500
                  "
                >
                  LOCATION
                </p>

                <p
                  className="
                    mt-1
                    font-semibold
                  "
                >
                  {live.location}
                </p>
              </div>
            )}

            {/* MODE */}

            <div>
              <p
                className="
                  text-xs
                  text-zinc-500
                "
              >
                MODE
              </p>

              <p
                className="
                  mt-1
                  font-semibold
                "
              >
                {isBroadcaster
                  ? "Broadcaster"
                  : "Viewer"}
              </p>
            </div>
          </div>

          {/* OFFLINE NOTICE */}

          {isOffline && (
            <div
              className="
                mt-5
                rounded-lg
                border
                border-yellow-500/20
                bg-yellow-500/5
                px-4
                py-3
                text-xs
                text-yellow-300
              "
            >
              Internet connection lost.
              StreetGO Live will reconnect
              automatically when the connection
              returns.
            </div>
          )}
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
            <div
              className="
                rounded-2xl
                border
                border-zinc-800
                bg-zinc-950
                p-8
                text-center
              "
            >
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
  );
}