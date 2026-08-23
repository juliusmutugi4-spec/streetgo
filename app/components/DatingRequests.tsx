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
  <div className="fixed right-3 top-3 z-50 select-none font-sans text-white antialiased">
    {/* FLOATING MICRO TRIGGER BUTTON */}
    <button
      type="button"
      onClick={() => setOpen((value) => !value)}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full text-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all active:scale-95 ${config.buttonBg}`}
      aria-label={config.title}
    >
      <span className="text-sm">{config.icon}</span>

      {requests.length > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 font-mono text-[8px] font-black text-white ring-2 ring-black">
          {requests.length}
        </span>
      )}
    </button>

    {/* OVERLAY PANEL MODAL DRAWER */}
    {open && (
      <div className="fixed inset-x-3 top-14 z-50 max-h-[75vh] max-w-md overflow-hidden rounded-2xl border border-white/5 bg-zinc-950 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl mx-auto flex flex-col">
        {/* DROPDOWN NAVIGATION TRACK */}
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            {config.title}
          </h3>
          <span className="font-mono text-[9px] font-bold text-zinc-600 uppercase">
            Active Stack
          </span>
        </div>

        {/* INNER DATA PANEL LAYER */}
        <div className="mt-2 overflow-y-auto pr-0.5 space-y-2 flex-1 scrollbar-none">
          {isLoading && (
            <p className="py-6 text-center font-medium text-[10px] uppercase tracking-wider text-zinc-500 animate-pulse">
              Loading payload...
            </p>
          )}

          {!isLoading && requests.length === 0 && (
            <div className="py-8 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-600">
              No new requests
            </div>
          )}

          {!isLoading &&
            requests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-white/[0.02] bg-white/[0.01] p-2.5"
              >
                {/* ACCOUNT PROFILE SEGMENT */}
                <div className="flex items-center gap-2.5">
                  {request.sender.avatar_url ? (
                    <img
                      src={request.sender.avatar_url}
                      alt={request.sender.username}
                      className="h-8 w-8 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 border border-white/5 font-mono text-[10px] font-black text-zinc-400">
                      {request.sender.username.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black tracking-wide text-zinc-200">
                      {request.sender.username}
                    </p>
                    <p className="truncate text-[9px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
                      {config.subtext}
                    </p>
                  </div>
                </div>

                {/* DENSE TARGET ACTIONS PANEL */}
                <div className="mt-2.5 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => acceptRequest(request.id)}
                    className="flex h-7 flex-1 items-center justify-center rounded-lg bg-white text-[10px] font-black uppercase tracking-wider text-black transition-all active:scale-[0.97]"
                  >
                    {config.accept}
                  </button>

                  <button
                    type="button"
                    onClick={() => rejectRequest(request.id)}
                    className="flex h-7 flex-1 items-center justify-center rounded-lg border border-white/5 bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-400 transition-all active:scale-[0.97] active:bg-zinc-800 active:text-zinc-200"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    )}
  </div>
)

}