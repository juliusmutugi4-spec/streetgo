"use client";

import {
  useEffect,
  useState,
} from "react";

export function useNetworkStatus() {
  const [isOffline, setIsOffline] =
    useState(false);

  useEffect(() => {
    const updateNetworkStatus =
      () => {
        setIsOffline(
          !navigator.onLine
        );
      };

    // Check immediately.
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

  return {
    isOffline,
  };
}