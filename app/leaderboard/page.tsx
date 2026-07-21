'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Clean TypeScript contract for predictable data mapping
interface Profile {
  id: string
  username: string
  avatar_url?: string
  reputation: number
  predictions_correct: number
  predictions_wrong: number
  email?: string
}

// Extracted atomic UI components for optimal performance and cleaner architecture
const MetricBadge = ({ value, label, variant }: { value: number; label: string; variant: 'success' | 'danger' | 'warning' }) => {
  const themes = {
    success: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    danger: 'text-rose-400 bg-rose-500/5 border-rose-500/10',
    warning: 'text-amber-400 bg-amber-500/5 border-amber-500/10'
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs font-medium ${themes[variant]}`}>
      <span>{value.toLocaleString()}</span>
      <span className="text-[10px] text-zinc-500 font-sans tracking-wide lowercase">({label})</span>
    </div>
  )
}

export default function LeaderboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

useEffect(() => {
  fetchLeaderboard()

  const interval = setInterval(() => {
    fetchLeaderboard()
  }, 10000)

  return () => clearInterval(interval)
}, [])

const fetchLeaderboard = async () => {
  try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('reputation', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching leaderboard metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

const getRankTitle = (rep: number) => {
  if (rep >= 500)
    return {
      title: 'ORACLE PRIME',
      style: 'text-purple-400 bg-purple-500/5 border-purple-500/20'
    }

  if (rep >= 200)
    return {
      title: 'MARKET MASTER',
      style: 'text-blue-400 bg-blue-500/5 border-blue-500/20'
    }

  if (rep >= 50)
    return {
      title: 'ALPHA ANALYST',
      style: 'text-cyan-400 bg-cyan-500/5 border-cyan-500/20'
    }

  return {
    title: 'TRAINEE',
    style: 'text-zinc-400 bg-zinc-500/5 border-zinc-500/10'
  }
}

  // Pure logic splits for modular layout processing
const accuracy = (correct: number, wrong: number) => {
  const total = correct + wrong
  if (total === 0) return 0

  return Math.round((correct / total) * 100)
}

  const topThree = profiles.slice(0, 3)
  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] text-zinc-400 flex items-center justify-center font-mono text-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-zinc-400 animate-spin" />
          Synchronizing ledger records...
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#030712] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Engine */}
        <div className="flex flex-col gap-1 border-b border-zinc-900 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Global Platform Rankings
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Leaderboard Performance Index
          </h1>
        </div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Total Users */}
  <div className="group relative rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 transition-all duration-200 hover:border-zinc-700/60">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        Total Users
      </p>
      <span className="text-[9px] font-mono text-zinc-600">SYS//01</span>
    </div>
    <h3 className="mt-2 text-2xl font-bold font-mono tracking-tight text-zinc-100">
      {profiles.length.toLocaleString()}
    </h3>
  </div>

  {/* Reputation Pool */}
  <div className="group relative rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 transition-all duration-200 hover:border-amber-500/30">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        Reputation Pool
      </p>
      <span className="h-1 w-1 rounded-full bg-amber-500/40" />
    </div>
    <h3 className="mt-2 text-2xl font-bold font-mono tracking-tight text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.05)]">
      {profiles.reduce((a, b) => a + (b.reputation || 0), 0).toLocaleString()}
    </h3>
  </div>

  {/* Correct Calls */}
  <div className="group relative rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 transition-all duration-200 hover:border-emerald-500/30">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        Correct Calls
      </p>
      <span className="h-1 w-1 rounded-full bg-emerald-500/40" />
    </div>
    <h3 className="mt-2 text-2xl font-bold font-mono tracking-tight text-emerald-400 drop-shadow-[0_2px_8px_rgba(16,185,129,0.05)]">
      {profiles.reduce((a, b) => a + (b.predictions_correct || 0), 0).toLocaleString()}
    </h3>
  </div>

  {/* Failed Calls */}
  <div className="group relative rounded-xl border border-zinc-800 bg-zinc-950/20 p-5 transition-all duration-200 hover:border-rose-500/30">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        Failed Calls
      </p>
      <span className="h-1 w-1 rounded-full bg-rose-500/40" />
    </div>
    <h3 className="mt-2 text-2xl font-bold font-mono tracking-tight text-rose-400 drop-shadow-[0_2px_8px_rgba(244,63,94,0.05)]">
      {profiles.reduce((a, b) => a + (b.predictions_wrong || 0), 0).toLocaleString()}
    </h3>
  </div>
</div>


        {/* Podium Module (Top 3 Performance Cards) */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topThree.map((user, index) => {
              const rank = index + 1
              const rankMeta = getRankTitle(user.reputation || 0)
              
              // Structured premium color matrix based on exact rank index
const cardStyles =
  rank === 1
    ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-transparent shadow-[0_0_40px_rgba(245,158,11,0.15)]'
    : rank === 2
    ? 'border-zinc-500/40 bg-gradient-to-b from-zinc-400/10 to-transparent shadow-[0_0_30px_rgba(255,255,255,0.08)]'
    : 'border-orange-500/40 bg-gradient-to-b from-orange-500/10 to-transparent shadow-[0_0_30px_rgba(249,115,22,0.10)]'

              const rankBadges = [
                'text-amber-400 bg-amber-500/10 border-amber-500/20',
                'text-zinc-300 bg-zinc-500/10 border-zinc-500/20',
                'text-orange-400 bg-orange-500/10 border-orange-500/20'
              ]

              return (
<div
  key={user.id}
  className={`
    relative rounded-2xl border p-6
    backdrop-blur-sm
    transition-all duration-300
    hover:scale-[1.02]
    hover:shadow-2xl
    hover:shadow-black/40
    ${cardStyles}
  `}
>
                  <div className="flex justify-between items-start mb-4">
<div className="relative">
  {rank === 1 && (
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg animate-bounce">
      👑
    </div>
  )}

  <div
    className={`
      flex items-center justify-center
      w-12 h-12 rounded-xl border text-2xl
      ${rankBadges[index]}
    `}
  >
    {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
  </div>
</div>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold border ${rankMeta.style}`}>
                      {rankMeta.title}
                    </span>
                  </div>
<div className="flex items-center gap-2">
<button
  onClick={() =>
    window.location.href = `/profile/${user.username}`
  }
  className="
    font-bold
    text-xl
    text-zinc-100
    truncate
    hover:text-cyan-400
    transition-colors
    text-left
  "
>
  {user.username || 'Anonymous Analyst'}
</button>

  {accuracy(
    user.predictions_correct || 0,
    user.predictions_wrong || 0
  ) >= 90 &&
    (user.predictions_correct || 0) >= 3 && (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Accuracy Leader
      </span>
    )}
</div>

                  <div className="mt-4 pt-4 border-t border-zinc-900 grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Reputation</span>
                      <span className="text-sm font-mono font-medium text-amber-400">{user.reputation || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Correct</span>
                      <span className="text-sm font-mono font-medium text-emerald-400">{user.predictions_correct || 0}</span>
                    </div>


                    
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Wrong</span>
                      <span className="text-sm font-mono font-medium text-rose-400">{user.predictions_wrong || 0}</span>
                    </div>
               </div>

               <div className="mt-4 pt-4 border-t border-zinc-900">
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase tracking-wider text-zinc-500">
      Accuracy Score
    </span>

    <span className="font-mono text-cyan-400 text-sm font-semibold">
      {accuracy(
        user.predictions_correct || 0,
        user.predictions_wrong || 0
      )}%
    </span>
  </div>

  <div className="mt-2 h-1.5 rounded-full bg-zinc-900 overflow-hidden">
<div
  className={`h-full rounded-full ${
    accuracy(
      user.predictions_correct || 0,
      user.predictions_wrong || 0
    ) >= 80
      ? 'bg-emerald-400'
      : accuracy(
          user.predictions_correct || 0,
          user.predictions_wrong || 0
        ) >= 50
      ? 'bg-amber-400'
      : 'bg-rose-400'
  }`}
  style={{
    width: `${accuracy(
      user.predictions_correct || 0,
      user.predictions_wrong || 0
    )}%`
  }}
/>
  </div>
</div>
                </div>
              )

              
            })}
          </div>
        )}

        {/* Global Standard Performance Ledger (The Remainder Rows) */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 overflow-hidden shadow-xl">
          {/* Strict Contextual Ledger Header */}
          <div className="hidden md:grid grid-cols-12 px-6 py-3.5 bg-zinc-900/30 text-zinc-500 text-xs font-medium uppercase tracking-wider border-b border-zinc-900">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-5">Identity Profile</div>
            <div className="col-span-2">System Tier</div>
            <div className="col-span-4 text-right">Aggregated Evaluation Metrics</div>
          </div>

          {/* Dynamic Map Loop Matrix */}
          <div className="divide-y divide-zinc-900/40">
            {profiles.map((profile, index) => {
              const rank = index + 1
              const rankMeta = getRankTitle(profile.reputation || 0)

              return (
                <div key={profile.id || index} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-0 items-center px-6 py-4 transition-colors duration-150 hover:bg-zinc-900/10">
                  
                  {/* Rank Column */}
                  <div className="col-span-1 flex md:justify-center items-center font-mono text-sm text-zinc-500 font-medium">
                    #{rank.toString().padStart(2, '0')}
                  </div>

                  {/* Identity Row Node */}
                  <div className="col-span-1 md:col-span-5 flex items-center gap-3">
<img
  src={profile.avatar_url || '/avatar-placeholder.png'}
  alt={profile.username}
  className="
    w-8 h-8
    rounded-lg
    object-cover
    border
    border-zinc-800
    bg-zinc-900
  "
/>
                    <div className="flex flex-col min-w-0">
<button
  onClick={() =>
    window.location.href = `/profile/${profile.username}`
  }
  className="
    font-medium
    text-sm
    text-zinc-200
    truncate
    hover:text-cyan-400
    transition-colors
    text-left
  "
>
  {profile.username || 'Anonymous Participant'}
</button>
                    </div>
                  </div>

                  {/* System Tier Column */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-medium border ${rankMeta.style}`}>
                      {rankMeta.title}
                    </span>
                  </div>

                  {/* Evaluation Metrics Dashboard Node */}
                  <div className="col-span-1 md:col-span-4 flex md:justify-end gap-2 items-center pt-2 md:pt-0 border-t border-zinc-900/50 md:border-none">
                    <MetricBadge value={profile.reputation || 0} label="rep" variant="warning" />
                    <MetricBadge value={profile.predictions_correct || 0} label="hits" variant="success" />
                    <MetricBadge value={profile.predictions_wrong || 0} label="miss" variant="danger" />
                  </div>

                </div>
              )
            })}
          </div>
        </div>
        
      </div>


      
    </main>
  )
}
