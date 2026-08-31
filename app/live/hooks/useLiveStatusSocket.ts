"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

interface UseLiveStatusSocketOptions {
  liveId: string | null;
}

const API_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL!;

export function useLiveStatusSocket({
  liveId,
}: UseLiveStatusSocketOptions) {
  const [viewerCount, setViewerCount] =
    useState(0);

  const [connected, setConnected] =
    useState(false);

  const [isOffline, setIsOffline] =
    useState(false);

  const socketRef =
    useRef<WebSocket | null>(null);

  const reconnectTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const connectingRef =
    useRef(false);

  useEffect(() => {
    if (!liveId) {
      setConnected(false);
      setViewerCount(0);

      return;
    }

    let cancelled = false;

    /*
     * ========================================================
     * CLEAR RECONNECT TIMER
     * ========================================================
     */

    const clearReconnectTimer = () => {
      if (
        reconnectTimerRef.current
      ) {
        clearTimeout(
          reconnectTimerRef.current
        );

        reconnectTimerRef.current =
          null;
      }
    };

    /*
     * ========================================================
     * CLOSE SOCKET
     * ========================================================
     */

    const closeSocket = () => {
      const socket =
        socketRef.current;

      if (!socket) {
        return;
      }

      try {
        socket.close();
      } catch {
        // Ignore cleanup errors.
      }

      socketRef.current =
        null;

      connectingRef.current =
        false;
    };

    /*
     * ========================================================
     * CONNECT
     * ========================================================
     */

    const connect = () => {
      if (
        cancelled ||
        connectingRef.current
      ) {
        return;
      }

      /*
       * Browser is offline.
       */

      if (!navigator.onLine) {
        setConnected(false);
        setIsOffline(true);

        return;
      }

      /*
       * Internet is available.
       */

      setIsOffline(false);

      /*
       * Avoid duplicate sockets.
       */

      const existingSocket =
        socketRef.current;

      if (
        existingSocket &&
        (
          existingSocket.readyState ===
            WebSocket.OPEN ||
          existingSocket.readyState ===
            WebSocket.CONNECTING
        )
      ) {
        return;
      }

      connectingRef.current =
        true;

      try {
        const wsProtocol =
          window.location.protocol ===
          "https:"
            ? "wss:"
            : "ws:";

        const apiUrl =
          new URL(API_URL);

        const socketUrl =
          `${wsProtocol}//${apiUrl.host}/live/${liveId}/ws`;

        const socket =
          new WebSocket(
            socketUrl
          );

        socketRef.current =
          socket;

        /*
         * ====================================================
         * OPEN
         * ====================================================
         */

        socket.onopen = () => {
          connectingRef.current =
            false;

          if (cancelled) {
            return;
          }

          setConnected(true);
          setIsOffline(false);

          console.log(
            "StreetGO Live WebSocket connected"
          );
        };

        /*
         * ====================================================
         * MESSAGE
         * ====================================================
         */

        socket.onmessage = (
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
         * ====================================================
         * ERROR
         * ====================================================
         */

        socket.onerror = () => {
          connectingRef.current =
            false;

          if (cancelled) {
            return;
          }

          setConnected(false);

          if (!navigator.onLine) {
            setIsOffline(true);

            return;
          }

          console.warn(
            "StreetGO Live: status connection unavailable; waiting for reconnect."
          );
        };

        /*
         * ====================================================
         * CLOSE
         * ====================================================
         */

        socket.onclose = () => {
          connectingRef.current =
            false;

          if (cancelled) {
            return;
          }

          socketRef.current =
            null;

          setConnected(false);

          /*
           * Offline.
           */

          if (!navigator.onLine) {
            setIsOffline(true);

            return;
          }

          /*
           * Internet is available.
           * Wait and reconnect.
           */

          setIsOffline(false);

          if (
            reconnectTimerRef.current
          ) {
            return;
          }

          reconnectTimerRef.current =
            setTimeout(() => {
              reconnectTimerRef.current =
                null;

              if (
                cancelled ||
                !navigator.onLine
              ) {
                return;
              }

              connect();
            }, 3000);
        };
      } catch (err) {
        connectingRef.current =
          false;

        if (cancelled) {
          return;
        }

        setConnected(false);

        if (!navigator.onLine) {
          setIsOffline(true);

          return;
        }

        console.warn(
          "StreetGO Live: unable to create status connection.",
          err
        );

        if (
          !reconnectTimerRef.current
        ) {
          reconnectTimerRef.current =
            setTimeout(() => {
              reconnectTimerRef.current =
                null;

              if (
                !cancelled &&
                navigator.onLine
              ) {
                connect();
              }
            }, 3000);
        }
      }
    };

    /*
     * ========================================================
     * OFFLINE
     * ========================================================
     */

    const handleOffline =
      () => {
        if (cancelled) {
          return;
        }

        clearReconnectTimer();

        setIsOffline(true);
        setConnected(false);

        closeSocket();
      };

    /*
     * ========================================================
     * ONLINE
     * ========================================================
     */

    const handleOnline =
      () => {
        if (cancelled) {
          return;
        }

        setIsOffline(false);

        clearReconnectTimer();

        reconnectTimerRef.current =
          setTimeout(() => {
            reconnectTimerRef.current =
              null;

            if (
              cancelled ||
              !navigator.onLine
            ) {
              return;
            }

            connect();
          }, 500);
      };

    /*
     * ========================================================
     * NETWORK EVENTS
     * ========================================================
     */

    window.addEventListener(
      "offline",
      handleOffline
    );

    window.addEventListener(
      "online",
      handleOnline
    );

    /*
     * ========================================================
     * INITIAL CONNECTION
     * ========================================================
     */

    connect();

    /*
     * ========================================================
     * CLEANUP
     * ========================================================
     */

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

      closeSocket();
    };
  }, [liveId]);

  /*
   * ========================================================
   * RETURN STATUS
   * ========================================================
   */

  return {
    viewerCount,
    connected,
    isOffline,
  };
}