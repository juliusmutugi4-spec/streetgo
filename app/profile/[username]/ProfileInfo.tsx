'use client'

import { Calendar, MapPin, Link2, Mail, Phone, ShieldCheck } from "lucide-react"

interface Props {
  profile: any
}

export default function ProfileInfo({ profile }: Props) {
  // Cleanly format the membership date (e.g., "Jul 2026")
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : "Jul 2026"

  // Process a raw phone input into a neat international link structure
  const rawPhone = profile?.phone || "+254700000000"
  const cleanPhone = rawPhone.replace(/\s+/g, '')

  return (
    <div className="w-full p-0 m-0">
      {/* High-density horizontal ribbon that wraps flawlessly on small mobile viewports */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium text-zinc-400 select-none">
        
        {/* 1. Account Tier/Type Badge */}
        <div className="flex items-center gap-1 shrink-0 bg-zinc-900/60 border border-zinc-800/40 rounded px-1.5 py-0.5 text-zinc-300">
          <ShieldCheck size={11} className="text-cyan-400 shrink-0" />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {profile?.role === 'driver' ? 'Driver Partner' : 'Creator Account'}
          </span>
        </div>

        {/* 2. Live Availability Tracker */}
        <div className="flex items-center gap-1 shrink-0 bg-emerald-950/30 border border-emerald-900/30 rounded px-1.5 py-0.5 text-emerald-400">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold">Active Now</span>
        </div>

        {/* Separator Pipe Line */}
        <span className="text-[10px] text-zinc-800 hidden sm:inline">|</span>

        {/* 3. Location Tracker */}
        <div className="flex items-center gap-1 min-w-0">
          <MapPin size={11} className="text-zinc-500 shrink-0" />
          <span className="text-zinc-300 truncate">
            {profile?.location || "Nairobi, Kenya"}
          </span>
        </div>

        {/* Separator Pipe Line */}
        <span className="text-[10px] text-zinc-800 hidden sm:inline">|</span>

        {/* 4. Interactive Call Utility Node */}
        <div className="flex items-center gap-1 min-w-0">
          <Phone size={11} className="text-zinc-500 shrink-0" />
          <a 
            href={`tel:${cleanPhone}`}
            className="text-zinc-300 hover:text-cyan-400 transition-colors truncate font-semibold"
          >
            {rawPhone}
          </a>
        </div>

        {/* Separator Pipe Line */}
        <span className="text-[10px] text-zinc-800 hidden sm:inline">|</span>

        {/* 5. Website Anchor Link */}
        <div className="flex items-center gap-1 min-w-0">
          <Link2 size={11} className="text-zinc-500 shrink-0" />
          <a 
            href={profile?.website ? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) : '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cyan-400 hover:text-cyan-300 transition-colors truncate max-w-[110px] sm:max-w-none"
          >
            {profile?.website || "streetgo.app"}
          </a>
        </div>

        {/* Separator Pipe Line */}
        <span className="text-[10px] text-zinc-800 hidden sm:inline">|</span>

        {/* 6. Contact Email Node */}
        <div className="flex items-center gap-1 min-w-0">
          <Mail size={11} className="text-zinc-500 shrink-0" />
          <a 
            href={`mailto:${profile?.email || 'support@streetgo.app'}`}
            className="text-zinc-300 hover:text-zinc-200 transition-colors truncate max-w-[110px] sm:max-w-none"
          >
            {profile?.email || "you@streetgo.app"}
          </a>
        </div>

        {/* Separator Pipe Line */}
        <span className="text-[10px] text-zinc-800 hidden sm:inline">|</span>

        {/* 7. Creation Join Timestamp */}
        <div className="flex items-center gap-1 shrink-0">
          <Calendar size={11} className="text-zinc-500 shrink-0" />
          <span>Joined {joinDate}</span>
        </div>

      </div>
    </div>
  )
}
