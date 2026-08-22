'use client'

import { useEffect, useState } from "react"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"

export type RequestCategory = 'dating' | 'business' | 'job'

interface Request {
  id: string
  sender: {
    id: string
    username: string
    avatar_url: string | null
    headline?: string // Job title or business bio fallback
  }
}

interface Props {
  type?: RequestCategory
  onAccepted?: () => void
}

export default function ConnectionRequests({ type = 'business', onAccepted }: Props) {
  const [requests, setRequests] = useState<Request[]>([])
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  async function loadRequests() {
    try {
      const res = await fetch("/api/connections/incoming")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setRequests(data.requests || [])
    } catch (err) {
      console.error("Error fetching requests:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
    const channel = supabase
      .channel("connection-requests")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "connections" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("NEW CONNECTION REQUEST", payload)
          loadRequests()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function acceptRequest(id: string) {
    const res = await fetch("/api/connections/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: id })
    })
    if (res.ok) {
      setRequests(prev => prev.filter(item => item.id !== id))
      onAccepted?.()
    }
  }

  async function rejectRequest(id: string) {
    const res = await fetch("/api/connections/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: id })
    })
    if (res.ok) {
      setRequests(prev => prev.filter(item => item.id !== id))
    }
  }

  // Type-specific configuration profiles
  const config = {
    dating: {
      buttonBg: "bg-rose-600 hover:bg-rose-500 focus:ring-rose-500/20",
      icon: "❤️",
      title: "Match Requests",
      subtext: "wants to match with you",
      acceptText: "Accept",
      acceptBg: "bg-rose-600 hover:bg-rose-500 text-white"
    },
    business: {
      buttonBg: "bg-blue-600 hover:bg-blue-500 focus:ring-blue-500/20",
      icon: "🤝",
      title: "Network Invitations",
      subtext: "wants to connect professionally",
      acceptText: "Connect",
      acceptBg: "bg-blue-600 hover:bg-blue-500 text-white"
    },
    job: {
      buttonBg: "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500/20",
      icon: "💼",
      title: "Application Requests",
      subtext: "applied to your listing",
      acceptText: "Review",
      acceptBg: "bg-emerald-600 hover:bg-emerald-500 text-white"
    }
  }[type]

  return (
    <div className="fixed top-5 right-5 z-50 font-sans antialiased text-zinc-100">
      {/* Trigger Button */}
      <button 
        onClick={() => setOpen(!open)} 
        className={`relative flex items-center justify-center p-3 rounded-full text-white shadow-xl transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-4 ${config.buttonBg}`}
        aria-label={`View ${config.title}`}
      >
        <span className="text-xl leading-none">{config.icon}</span>
        {requests.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full font-bold text-[11px] h-5 w-5 flex items-center justify-center border-2 border-zinc-950 animate-pulse">
            {requests.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-88 max-h-[480px] overflow-y-auto bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-semibold text-sm tracking-wide text-zinc-400 uppercase"> 
              {config.title} 
            </h3>
            <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">
              {requests.length} Total
            </span>
          </div>

          {/* Loading Skeleton State */}
          {isLoading && (
            <div className="space-y-4 py-2">
              {[1, 2].map((n) => (
                <div key={n} className="flex flex-col gap-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-zinc-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-zinc-800 rounded w-1/3" />
                      <div className="h-3 bg-zinc-800 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State Layout */}
          {!isLoading && requests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="text-3xl mb-2 opacity-40">Inbox Clean</div>
              <p className="text-xs text-zinc-500 max-w-[200px]">
                You have verified all current pending incoming incoming requests.
              </p>
            </div>
          )}

          {/* Main List Rendering Item Component */}
          {!isLoading && requests.map(request => (
            <div key={request.id} className="group flex flex-col border-b border-zinc-800/60 last:border-0 pb-3 last:pb-0 pt-1">
              <div className="flex items-start gap-3">
                {request.sender.avatar_url ? (
                  <img 
                    src={request.sender.avatar_url} 
                    alt={request.sender.username}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-zinc-700/50 shrink-0" 
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium text-sm shrink-0 border border-zinc-700/40">
                    {request.sender.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-zinc-200 text-sm truncate"> 
                    {request.sender.username} 
                  </p>
                  {request.sender.headline && (
                    <p className="text-xs text-zinc-400 truncate mb-0.5">
                      {request.sender.headline}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 truncate"> 
                    {config.subtext} 
                  </p>
                </div>
              </div>

              {/* Action Choice Group Options */}
              <div className="flex gap-2 mt-3 pl-14">
                <button 
                  onClick={() => acceptRequest(request.id)} 
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none ${config.acceptBg}`}
                > 
                  {config.acceptText} 
                </button>
                <button 
                  onClick={() => rejectRequest(request.id)} 
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-700/60 text-zinc-300 rounded-lg py-1.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none"
                > 
                  Decline 
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
