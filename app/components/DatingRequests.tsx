"use client"

import {
  useEffect,
  useState,
} from "react"

import type {
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js"

import { supabase } from "../lib/supabase"

export type RequestCategory =
  | "dating"
  | "business"
  | "job"

interface Request {
  id: string

  sender: {
    id: string
    username: string
    avatar_url: string | null
    headline?: string
  }
}

interface Props {
  type?: RequestCategory
  onAccepted?: () => void
}

export default function ConnectionRequests({
  type = "dating",
  onAccepted,
}: Props) {
  const [requests, setRequests] =
    useState<Request[]>([])

  const [open, setOpen] =
    useState(false)

  const [isLoading, setIsLoading] =
    useState(true)

  // =========================================================
  // LOAD REQUESTS
  // =========================================================

  async function loadRequests() {
    try {
      const res = await fetch(
        "/api/connections/incoming",
        {
          cache: "no-store",
        }
      )

      if (!res.ok) {
        throw new Error(
          "Failed loading requests"
        )
      }

      const data = await res.json()

      setRequests(
        Array.isArray(data.requests)
          ? data.requests
          : []
      )
    } catch (error) {
      console.error(
        "REQUEST LOAD ERROR:",
        error
      )
    } finally {
      setIsLoading(false)
    }
  }

  // =========================================================
  // REALTIME
  // =========================================================

  useEffect(() => {
    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null

    let cancelled = false

    async function startRealtime() {
      try {
        // Read the existing browser session.
        // Do not call getUser() here.
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error(
            "REQUEST AUTH ERROR:",
            sessionError
          )

          return
        }

        if (
          cancelled ||
          !session?.user
        ) {
          return
        }

        const userId =
          session.user.id

        // Load existing requests first.
        await loadRequests()

        if (cancelled) {
          return
        }

        const channelName =
          `connection-request-${userId}`

        // =====================================================
        // IMPORTANT:
        //
        // .on() MUST COME BEFORE .subscribe()
        // =====================================================

        channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "connections",
              filter:
                `receiver_id=eq.${userId}`,
            },
            (
              payload:
                RealtimePostgresChangesPayload<any>
            ) => {
              console.log(
                "NEW CONNECTION REQUEST:",
                payload
              )

              loadRequests()
            }
          )

        if (cancelled) {
          return
        }

await channel.subscribe(
  (status: string) => {
    console.log(
      "CONNECTION REALTIME:",
      status
    )
  }
)
      } catch (error) {
        if (!cancelled) {
          console.error(
            "REALTIME START ERROR:",
            error
          )
        }
      }
    }

    startRealtime()

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      cancelled = true

      if (channel) {
        supabase.removeChannel(
          channel
        )

        channel = null
      }
    }
  }, [])

  // =========================================================
  // ACCEPT
  // =========================================================

  async function acceptRequest(
    id: string
  ) {
    try {
      const res = await fetch(
        "/api/connections/accept",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            connectionId: id,
          }),
        }
      )

      if (!res.ok) {
        throw new Error(
          "Failed to accept request"
        )
      }

      setRequests((old) =>
        old.filter(
          (item) => item.id !== id
        )
      )

      onAccepted?.()
    } catch (error) {
      console.error(
        "ACCEPT REQUEST ERROR:",
        error
      )
    }
  }

  // =========================================================
  // REJECT
  // =========================================================

  async function rejectRequest(
    id: string
  ) {
    try {
      const res = await fetch(
        "/api/connections/reject",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            connectionId: id,
          }),
        }
      )

      if (!res.ok) {
        throw new Error(
          "Failed to reject request"
        )
      }

      setRequests((old) =>
        old.filter(
          (item) => item.id !== id
        )
      )
    } catch (error) {
      console.error(
        "REJECT REQUEST ERROR:",
        error
      )
    }
  }

  // =========================================================
  // CONFIG
  // =========================================================

  const config = {
    dating: {
      buttonBg:
        "bg-rose-600 hover:bg-rose-500",
      icon: "❤️",
      title: "Match Requests",
      subtext:
        "wants to connect with you",
      accept: "Accept",
    },

    business: {
      buttonBg:
        "bg-blue-600 hover:bg-blue-500",
      icon: "🤝",
      title: "Network Invitations",
      subtext:
        "wants to connect professionally",
      accept: "Connect",
    },

    job: {
      buttonBg:
        "bg-emerald-600 hover:bg-emerald-500",
      icon: "💼",
      title: "Job Requests",
      subtext:
        "sent you an opportunity",
      accept: "Review",
    },
  }[type]

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        fixed
        right-5
        top-5
        z-50
      "
    >
      <button
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        className={`
          relative
          rounded-full
          p-3
          text-white
          shadow-xl
          ${config.buttonBg}
        `}
        aria-label={
          config.title
        }
      >
        <span className="text-xl">
          {config.icon}
        </span>

        {requests.length > 0 && (
          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-xs
              font-bold
            "
          >
            {requests.length}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            mt-3
            max-h-[500px]
            w-96
            overflow-y-auto
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
            p-4
            shadow-2xl
          "
        >
          <h3
            className="
              mb-4
              font-bold
              text-zinc-300
            "
          >
            {config.title}
          </h3>

          {isLoading && (
            <p className="text-zinc-500">
              Loading...
            </p>
          )}

          {!isLoading &&
            requests.length === 0 && (
              <div
                className="
                  py-10
                  text-center
                  text-zinc-500
                "
              >
                No new requests
              </div>
            )}

          {requests.map(
            (request) => (
              <div
                key={request.id}
                className="
                  mb-4
                  border-b
                  border-zinc-800
                  pb-4
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  {request.sender
                    .avatar_url ? (
                    <img
                      src={
                        request.sender
                          .avatar_url
                      }
                      alt={
                        request.sender
                          .username
                      }
                      className="
                        h-12
                        w-12
                        rounded-full
                        object-cover
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-zinc-800
                      "
                    >
                      {request.sender.username
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <p className="font-bold">
                      {
                        request.sender
                          .username
                      }
                    </p>

                    <p className="
                      text-xs
                      text-zinc-500
                    ">
                      {config.subtext}
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-3
                    flex
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      acceptRequest(
                        request.id
                      )
                    }
                    className="
                      flex-1
                      rounded-lg
                      bg-white
                      py-2
                      text-sm
                      font-bold
                      text-black
                    "
                  >
                    {config.accept}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      rejectRequest(
                        request.id
                      )
                    }
                    className="
                      flex-1
                      rounded-lg
                      bg-zinc-800
                      py-2
                      text-sm
                    "
                  >
                    Decline
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}