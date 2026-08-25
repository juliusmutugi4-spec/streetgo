"use client";

import { useEffect, useState } from "react";
import Viewer from "../live/Viewer";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

interface LiveSession {
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
}

export default function LiveFeed() {
  const [lives, setLives] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLives() {
    try {
      const response = await fetch(
        `${API_URL}/live`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load live sessions: ${response.status}`
        );
      }

      const result = await response.json();

      const activeLives = (
        result.live ?? []
      ).filter(
        (live: LiveSession) =>
          live.status === "live"
      );

      setLives(activeLives);
    } catch (error) {
      console.error(
        "StreetGO Live Feed error:",
        error
      );

      setLives([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLives();

    // Refresh the live list periodically.
    const interval = setInterval(
      loadLives,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // -------------------------------------------------------
  // Nothing live
  // -------------------------------------------------------

  if (!loading && lives.length === 0) {
    return null;
  }

  return (
    <section className="mb-5 w-full">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />

            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
          </span>

          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Live Now
          </h2>
        </div>

        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {lives.length}{" "}
          {lives.length === 1
            ? "broadcast"
            : "broadcasts"}
        </span>
      </div>

      {/* LIVE CARDS */}
      <div className="space-y-4">
        {lives.map((live) => (
          <article
            key={live.live_id}
            className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            {/* LIVE HEADER */}
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
                    LIVE
                  </span>

                  <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {live.title}
                  </h3>
                </div>

                <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {live.host_name}
                  {live.location
                    ? ` · ${live.location}`
                    : ""}
                </p>
              </div>

              <div className="ml-3 flex shrink-0 items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span>👁</span>
                <span>
                  {live.viewer_count}
                </span>
              </div>
            </div>

            {/* REAL WEBRTC VIEWER */}
            <div className="aspect-video w-full bg-black">
              <Viewer
                liveId={live.live_id}
              />
            </div>

            {/* DESCRIPTION */}
            {live.description && (
              <div className="px-4 py-3">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {live.description}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}