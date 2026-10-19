"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, ChevronRight, Users, UserPlus, CircleDot, Loader2 } from "lucide-react"
import { getSupabaseBrowser } from "@/app/lib/supabase-browser"

type Group = {
  id: string
  name: string
  status: string
}

export default function ContributionsPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowser()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroups()
  }, [])

  async function loadGroups() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push("/login")
        return
      }

      const { data: members, error: memberError } = await supabase
        .from("contribution_members")
        .select("group_id")
        .eq("user_id", session.user.id)
        .eq("status", "active")

      if (memberError) throw memberError

      const groupIds = [
        ...new Set(
          (members || []).map(
            (member: { group_id: string }) => member.group_id
          )
        ),
      ]

      if (groupIds.length === 0) {
        setGroups([])
        return
      }

      const { data, error } = await supabase
        .from("contribution_groups")
        .select("id, name, status")
        .in("id", groupIds)
        .in("status", ["forming", "active"])
        .order("created_at", { ascending: false })

      if (error) throw error
      setGroups(data || [])
    } catch (error) {
      console.error("Failed to load contribution groups:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] font-sans antialiased text-white">
      {/* Header (Premium Minimal Safaricom Style) */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 transition active:scale-95 hover:bg-white/10"
            >
              <ArrowLeft size={18} className="text-slate-300" />
            </button>
            <div>
              <h1 className="text-sm font-black tracking-wider text-emerald-400">
                STREETGO
              </h1>
              <p className="text-[11px] font-medium text-slate-400">
                Contributions Hub
              </p>
            </div>
          </div>
          <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      <section className="mx-auto max-w-xl px-4 py-6">
{/* Welcome Area Header */}
<div className="mb-6">
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">
      Dashboard
    </span>
    <span className="h-1 w-1 rounded-full bg-slate-700" />
    <span className="text-[10px] text-slate-500">Contributions</span>
  </div>
  <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-100">
    My Contributions
  </h2>
  <p className="mt-1 text-xs text-slate-400">
    Manage your group merry-go-rounds, secure payouts, and member status.
  </p>
</div>

{/* Professional Micro-Action Grid */}
<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
  {/* Create Chama */}
  <button 
    onClick={() => router.push("/contributions/merry-go-round")} 
    className="group flex flex-col justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-left transition-all duration-200 active:scale-[0.99] hover:bg-emerald-500/[0.08] hover:border-emerald-500/30"
  >
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
      <Plus size={16} strokeWidth={2.5} />
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500/80">Start New</p>
      <p className="text-xs font-semibold text-slate-200 mt-0.5">Create Chama</p>
    </div>
  </button>

  {/* Join Group */}
  <button 
    onClick={() => router.push("/contributions/merry-go-round/join")} 
    className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-left transition-all duration-200 active:scale-[0.99] hover:bg-slate-900/80 hover:border-slate-700"
  >
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors group-hover:bg-slate-700 group-hover:text-slate-300">
      <UserPlus size={15} />
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Have a Link?</p>
      <p className="text-xs font-semibold text-slate-300 mt-0.5">Join Group</p>
    </div>
  </button>

  {/* Fundraiser */}
  <button 
    onClick={() => router.push("/fund")} 
    className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-left transition-all duration-200 active:scale-[0.99] hover:bg-slate-900/80 hover:border-slate-700 sm:col-span-1 col-span-2"
  >
    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition-colors group-hover:bg-slate-700 group-hover:text-slate-300">
      <CircleDot size={15} />
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Raise Money</p>
      <p className="text-xs font-semibold text-slate-300 mt-0.5">Fundraiser</p>
    </div>
  </button>
</div>

        {/* Section Divider Line */}
        <div className="mb-6 h-[1px] w-full bg-white/5" />

        {/* Current Groups Section Header */}
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Active Memberships
            </h3>
          </div>
          {!loading && (
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
              {groups.length} {groups.length === 1 ? "Group" : "Groups"}
            </span>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div 
                key={i} 
                className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.01] px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
                  <div className="h-4 w-12 rounded-full bg-white/5 animate-pulse" />
                </div>
                <Loader2 size={16} className="animate-spin text-slate-600" />
              </div>
            ))}
          </div>
        )}

        {/* Group List Display */}
        {!loading && groups.length > 0 && (
          <div className="space-y-2">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() =>
                  router.push(
                    `/contributions/merry-go-round/group?groupId=${group.id}`
                  )
                }
                className="group flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3.5 text-left transition active:scale-[0.99] hover:border-emerald-400/30 hover:bg-emerald-400/[0.04]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="truncate text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {group.name}
                  </span>
                  
                  {/* Status Indicator Tag */}
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    group.status === "active" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-amber-500/10 text-amber-400"
                  }`}>
                    <CircleDot size={8} />
                    {group.status}
                  </span>
                </div>
                
                <ChevronRight
                  size={16}
                  className="text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-400"
                />
              </button>
            ))}
          </div>
        )}

        {/* Empty State Illustration */}
        {!loading && groups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/5 text-emerald-400">
              <Users size={20} />
            </div>
            <h4 className="mt-4 text-sm font-bold text-slate-200">
              No contribution groups found
            </h4>
            <p className="mx-auto mt-1 max-w-xs text-xs text-slate-400 leading-relaxed">
              You are not a member of any active Chamas. Tap **Create Chama** above or ask a coordinator for an invite link.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
