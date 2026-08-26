"use client"

import { useEffect, useState } from "react"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { Bell, Check, Heart, X } from "lucide-react"
import { supabase } from "../../lib/supabase"

export interface DatingRequest {
  id: string
  status: string
  created_at?: string
  sender: {
    id: string
    username: string
    avatar_url: string | null
    headline?: string | null
  }
}

interface DatingRequestsProps {
  onAccepted?: (request: DatingRequest) => void
}

export default function DatingRequests({
  onAccepted,
}: DatingRequestsProps) {
  const [requests, setRequests] = useState<DatingRequest[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function loadRequests() {
    try {
      const response = await fetch("/api/connections/incoming", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to load connection requests")
      }

      const data = await response.json()

      setRequests(data.requests || [])
    } catch (error) {
      console.error("Dating requests error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()

    const channel = supabase
      .channel("dating-connection-requests")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "connections",
        },
        (payload: RealtimePostgresChangesPayload<{
          id: string
          sender_id: string
          receiver_id: string
          status: string
          created_at: string
        }>) => {
          

          loadRequests()
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connections",
        },
        (payload: RealtimePostgresChangesPayload<{
          id: string
          sender_id: string
          receiver_id: string
          status: string
          created_at: string
        }>) => {
          

          loadRequests()
        }
      )
      .subscribe((status: string) => {
        
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function acceptRequest(request: DatingRequest) {
    setProcessingId(request.id)

    try {
      const response = await fetch("/api/connections/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionId: request.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept request")
      }

      setRequests(previous =>
        previous.filter(item => item.id !== request.id)
      )

      onAccepted?.(request)
    } catch (error) {
      console.error("Accept request error:", error)
      alert(
        error instanceof Error
          ? error.message
          : "Failed to accept request"
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function rejectRequest(id: string) {
    setProcessingId(id)

    try {
      const response = await fetch("/api/connections/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionId: id,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to decline request"
        )
      }

      setRequests(previous =>
        previous.filter(item => item.id !== id)
      )
    } catch (error) {
      console.error("Reject request error:", error)

      alert(
        error instanceof Error
          ? error.message
          : "Failed to decline request"
      )
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="relative">

      {/* =====================================================
          NOTIFICATION BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setOpen(previous => !previous)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
        aria-label="Dating requests"
      >
        <Bell className="h-5 w-5" />

        {requests.length > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-950 bg-rose-500 px-1 text-[10px] font-black text-white">
            {requests.length > 99
              ? "99+"
              : requests.length}
          </span>
        )}
      </button>

      {/* =====================================================
          DROPDOWN
      ===================================================== */}

      {open && (
        <div className="absolute right-0 top-12 z-[80] w-[340px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-black/50">

          {/* HEADER */}

          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">

            <div>
              <h3 className="text-sm font-bold text-white">
                Connection requests
              </h3>

              <p className="mt-0.5 text-[11px] text-slate-500">
                People who want to connect with you
              </p>
            </div>

            {requests.length > 0 && (
              <span className="rounded-full bg-rose-500/10 px-2 py-1 text-[10px] font-bold text-rose-400">
                {requests.length} new
              </span>
            )}

          </div>

          {/* LOADING */}

          {loading && (
            <div className="space-y-3 p-4">

              {[1, 2].map(item => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-3"
                >
                  <div className="h-11 w-11 rounded-full bg-slate-800" />

                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 rounded bg-slate-800" />
                    <div className="h-3 w-40 rounded bg-slate-800" />
                  </div>
                </div>
              ))}

            </div>
          )}

          {/* EMPTY */}

          {!loading && requests.length === 0 && (
            <div className="flex flex-col items-center px-6 py-10 text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900">
                <Bell className="h-5 w-5 text-slate-600" />
              </div>

              <h4 className="mt-4 text-sm font-semibold text-slate-300">
                No new requests
              </h4>

              <p className="mt-1 max-w-[230px] text-xs leading-5 text-slate-600">
                When someone wants to connect with you,
                their request will appear here.
              </p>

            </div>
          )}

          {/* REQUESTS */}

          {!loading && requests.length > 0 && (
            <div className="max-h-[430px] overflow-y-auto">

              {requests.map(request => {
                const processing =
                  processingId === request.id

                return (
                  <div
                    key={request.id}
                    className="border-b border-slate-800/70 p-4 last:border-b-0"
                  >

                    <div className="flex items-start gap-3">

                      {/* AVATAR */}

                      {request.sender.avatar_url ? (
                        <img
                          src={request.sender.avatar_url}
                          alt={request.sender.username}
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-purple-600 text-xs font-black text-white">
                          {request.sender.username
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}

                      {/* INFORMATION */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2">

                          <p className="truncate text-sm font-bold text-white">
                            {request.sender.username}
                          </p>

                          <Heart className="h-3.5 w-3.5 shrink-0 fill-rose-500 text-rose-500" />

                        </div>

                        {request.sender.headline && (
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {request.sender.headline}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-slate-400">
                          Wants to connect with you
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-3 grid grid-cols-2 gap-2">

                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          acceptRequest(request)
                        }
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-bold text-black transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" />

                        {processing
                          ? "Processing..."
                          : "Accept"}
                      </button>

                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          rejectRequest(request.id)
                        }
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />

                        Decline
                      </button>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </div>
      )}

    </div>
  )
}