'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Bell,
  UserPlus,
  Heart,
  MessageCircle,
  Mail,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

interface StreetGOUpdateBarProps {
  maxItems?: number
}

export default function StreetGOUpdateBar({
  maxItems = 3,
}: StreetGOUpdateBarProps) {
  const [updates, setUpdates] = useState<Notification[]>([])
  const [visible, setVisible] = useState(true)

  const loadUpdates = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setUpdates([])
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(maxItems)

    if (error) {
      console.error('StreetGO Update Bar:', error)
      return
    }

    setUpdates(data || [])
  }

  useEffect(() => {
    loadUpdates()

    const channel = supabase
      .channel('streetgo-update-bar')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        async () => {
          await loadUpdates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [maxItems])

  const getIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus size={16} />

      case 'like':
        return <Heart size={16} />

      case 'comment':
        return <MessageCircle size={16} />

      case 'message':
        return <Mail size={16} />

      default:
        return <Bell size={16} />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'follow':
        return 'SOCIAL UPDATE'

      case 'like':
        return 'REACTION'

      case 'comment':
        return 'COMMENT'

      case 'message':
        return 'MESSAGE'

      default:
        return 'TOP UPDATE'
    }
  }

  if (!visible || updates.length === 0) {
    return null
  }

  return (
    <div className="fixed left-1/2 top-[76px] z-50 w-[calc(100%-24px)] max-w-xl -translate-x-1/2">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-zinc-950/95 shadow-[0_12px_45px_rgba(0,0,0,0.55)] backdrop-blur-2xl">

        {/* Top scan line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
              Top Updates
            </span>

            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[9px] font-bold text-zinc-400">
              {updates.length}
            </span>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="rounded-lg p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
            aria-label="Dismiss updates"
            title="Dismiss updates"
          >
            <X size={15} />
          </button>
        </div>

        {/* Updates */}
        <div className="divide-y divide-zinc-800/70">
          {updates.map((update) => (
            <div
              key={update.id}
              className="group flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
            >
              {/* Update icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/10 text-emerald-300">
                {getIcon(update.type)}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                  {getTypeLabel(update.type)}
                </div>

                <p className="truncate text-sm font-semibold text-zinc-100">
                  {update.message}
                </p>

                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {new Date(update.created_at).toLocaleString()}
                </p>
              </div>

              {/* Live indicator */}
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
            </div>
          ))}
        </div>

        {/* Bottom accent */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
      </div>
    </div>
  )
}