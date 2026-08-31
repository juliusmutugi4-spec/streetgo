"use client";

import {
  useEffect,
} from "react";

import {
  createAndStartLive,
  type LiveSession,
} from "./broadcasterSession";

interface UseBroadcasterOptions {
  isBroadcaster: boolean;

  setLive: (
    live: LiveSession | null
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setCreatingLive: (
    creating: boolean
  ) => void;

  setError: (
    error: string
  ) => void;
}

export function useBroadcaster({
  isBroadcaster,
  setLive,
  setLoading,
  setCreatingLive,
  setError,
}: UseBroadcasterOptions) {
  useEffect(() => {
    if (!isBroadcaster) {
      return;
    }

    let cancelled = false;

    async function startBroadcasterSession() {
      try {
        setLoading(true);
        setCreatingLive(true);
        setError("");

        if (!navigator.onLine) {
          setError("");
          setLive(null);
          return;
        }

        const startedLive =
          await createAndStartLive();

        if (cancelled) {
          return;
        }

        setLive(startedLive);

      } catch (err) {
        if (cancelled) {
          return;
        }

        if (!navigator.onLine) {
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
            : "Unable to start StreetGo Live."
        );

        setLive(null);

      } finally {
        if (!cancelled) {
          setLoading(false);
          setCreatingLive(false);
        }
      }
    }

    void startBroadcasterSession();

    return () => {
      cancelled = true;
    };
  }, [
    isBroadcaster,
    setLive,
    setLoading,
    setCreatingLive,
    setError,
  ]);
}