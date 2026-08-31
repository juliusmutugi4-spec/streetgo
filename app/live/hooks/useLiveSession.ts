"use client";

import {
  useEffect,
} from "react";

interface UseLiveSessionOptions {
  isBroadcaster: boolean;
  live: unknown;
  setLoading: (
    loading: boolean
  ) => void;
  setError: (
    error: string
  ) => void;
}

export function useLiveSession({
  isBroadcaster,
  live,
  setLoading,
  setError,
}: UseLiveSessionOptions) {
  useEffect(() => {
    if (isBroadcaster) {
      return;
    }

    const handleOnline = () => {
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
    setLoading,
    setError,
  ]);
}