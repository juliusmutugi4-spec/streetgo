"use client";

import {
  useEffect,
} from "react";

import {
  findLiveSession,
  type LiveSession,
} from "./viewerSession";

interface UseViewerOptions {
  isBroadcaster: boolean;

  setLive: (
    live: LiveSession | null
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string
  ) => void;
}

export function useViewer({
  isBroadcaster,
  setLive,
  setLoading,
  setError,
}: UseViewerOptions) {
  useEffect(() => {
    if (isBroadcaster) {
      return;
    }

    let cancelled = false;

    async function loadLiveSession() {
      try {
        setLoading(true);
        setError("");

        if (!navigator.onLine) {
          setError(
            "You are offline. Waiting for your internet connection..."
          );

          setLive(null);
          return;
        }

        const activeSession =
          await findLiveSession();

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

      } catch (err) {
        if (cancelled) {
          return;
        }

        if (!navigator.onLine) {
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

    void loadLiveSession();

    return () => {
      cancelled = true;
    };
  }, [
    isBroadcaster,
    setLive,
    setLoading,
    setError,
  ]);
}