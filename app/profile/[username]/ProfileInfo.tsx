'use client'

import { Calendar, MapPin, Link2, Mail, Phone, ShieldCheck } from "lucide-react"

interface Props {
  profile: any
}

export default function ProfileInfo({ profile }: Props) {
  // Format membership date dynamically or default safely
  const joinDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : "Jul 2026"

  // Sanitize phone inputs for clean tel protocol links
  const rawPhone = profile?.phone || "+254700000000"
  const cleanPhone = rawPhone.replace(/\s+/g, '')

  return (
    <div className="w-full">
      {/* ========================================== */}
      {/* DESKTOP LAYOUT (Clean Horizontal Ribbon)     */}
      {/* ========================================== */}
      <div className="hidden sm:flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-normal text-zinc-400 select-none border-b border-zinc-800/60 pb-3">
        
        {/* 1. Account Tier Badge */}
        <div className="flex items-center gap-1.5 shrink-0 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-0.5 text-zinc-200">
          <ShieldCheck size={12} className="text-sky-400 shrink-0" />
          <span className="text-[10px] uppercase font-bold tracking-wider">
            {profile?.role === 'driver' ? 'Driver Partner' : 'Creator'}
          </span>
        </div>

        {/* 2. Live Availability Status */}
        <div className="flex items-center gap-1.5 shrink-0 bg-emerald-950/20 border border-emerald-900/30 rounded-md px-2 py-0.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Active</span>
        </div>

        {/* Vertical Divider */}
        <span className="h-3 w-[1px] bg-zinc-800 hidden sm:inline" />

        {/* 3. Location Display */}
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={13} className="text-zinc-500 shrink-0" />
          <span className="text-zinc-300 truncate">
            {profile?.location || "Kirinyaga baricho"}
          </span>
        </div>

        {/* Vertical Divider */}
        <span className="h-3 w-[1px] bg-zinc-800 hidden sm:inline" />

        {/* 4. Phone Utility Link */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Phone size={13} className="text-zinc-500 shrink-0" />
          <a href={`tel:${cleanPhone}`} className="text-zinc-300 hover:text-sky-400 transition-colors truncate">
            {rawPhone}
          </a>
        </div>

        {/* Vertical Divider */}
        <span className="h-3 w-[1px] bg-zinc-800 hidden sm:inline" />

        {/* 5. Website Destination Link */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Link2 size={13} className="text-zinc-500 shrink-0" />
          <a 
            href={profile?.website ? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) : '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sky-400 hover:text-sky-300 transition-colors truncate"
          >
            {profile?.website || "streetgo.app"}
          </a>
        </div>

        {/* Vertical Divider */}
        <span className="h-3 w-[1px] bg-zinc-800 hidden sm:inline" />

        {/* 6. Email Node */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Mail size={13} className="text-zinc-500 shrink-0" />
          <a href={`mailto:${profile?.email || 'support@streetgo.app'}`} className="text-zinc-300 hover:text-zinc-100 transition-colors truncate">
            {profile?.email || "you@streetgo.app"}
          </a>
        </div>

        {/* Vertical Divider */}
        <span className="h-3 w-[1px] bg-zinc-800 hidden sm:inline" />

        {/* 7. Registration Date Card */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Calendar size={13} className="text-zinc-500 shrink-0" />
          <span className="text-zinc-400">Joined {joinDate}</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE LAYOUT (Stacked Clean Card)        */}
      {/* ========================================== */}
      <div className="sm:hidden mt-2 rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 flex flex-col gap-3.5 text-[12px]">
        {/* Status Line Wrapper */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-0.5">
            <ShieldCheck size={12} className="text-sky-400" />
            <span className="text-zinc-200 font-bold text-[10px] uppercase tracking-wider">
              {profile?.role === "driver" ? "Driver Partner" : "Creator"}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 rounded-md px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              Active
            </span>
          </div>
        </div>

        {/* Meta Info Rows */}
        <div className="flex flex-col gap-2.5 px-0.5">
          <div className="flex items-center gap-2.5">
            <MapPin size={14} className="text-zinc-500 shrink-0" />
            <span className="text-zinc-300 font-medium">
              {profile?.location || "Kirinyaga baricho"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link2 size={14} className="text-zinc-500 shrink-0" />
            <a 
              href={profile?.website ? profile.website.startsWith("http") ? profile.website : `https://${profile.website}` : "#"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sky-400 font-medium hover:underline"
            >
              {profile?.website || "streetgo.app"}
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Phone size={14} className="text-zinc-500 shrink-0" />
            <a href={`tel:${cleanPhone}`} className="text-zinc-300 font-medium">
              {rawPhone}
            </a>
          </div>

          <div className="flex items-center gap-2.5 border-t border-zinc-900 pt-2.5 mt-0.5">
            <Calendar size={14} className="text-zinc-500 shrink-0" />
            <span className="text-zinc-400">
              Joined {joinDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
