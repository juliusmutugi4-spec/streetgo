'use client'

import { 
  Calendar, MapPin, Link2, Mail, Phone, ShieldCheck, 
  Wallet, Plus, Send, History 
} from "lucide-react"

interface Props {
  profile: any
}

export default function ProfileInfo({ profile }: Props) {
  const joinDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : "Jul 2026"

  const rawPhone = profile?.phone || "+254700000000"
  const cleanPhone = rawPhone.replace(/\s+/g, '')
  const websiteUrl = profile?.website || "streetgo.app"
  const formattedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
  const userEmail = profile?.email || "support@streetgo.app"

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 font-sans selection:bg-sky-500/30">
      
      {/* ========================================== */}
      {/* HEADER ACTION RIBBON */}
      {/* ========================================== */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5">
          {/* Role Badge */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-zinc-200">
            <ShieldCheck size={11} className="text-sky-400 shrink-0" />
            <span className="text-[9px] uppercase font-bold tracking-wider">
              {profile?.role === 'driver' ? 'Driver Partner' : 'Creator'}
            </span>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-1 bg-emerald-950/20 border border-emerald-900/30 rounded px-1.5 py-0.5 text-emerald-400">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Active</span>
          </div>
        </div>
        
        {/* Registration Stamp */}
        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
          <Calendar size={11} className="shrink-0" />
          <span>Joined {joinDate}</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* BALANCED GRID BODY */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* LEFT COLUMN: PERFECTLY ALIGNED DATA BLOCK (7 Columns) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
          {/* Location */}
          <div className="flex items-center gap-2 min-w-0 h-5">
            <MapPin size={12} className="text-zinc-500 shrink-0" />
            <span className="text-zinc-300 truncate">{profile?.location || "Kirinyaga baricho"}</span>
          </div>

          {/* Website */}
          <div className="flex items-center gap-2 min-w-0 h-5">
            <Link2 size={12} className="text-zinc-500 shrink-0" />
            <a href={formattedUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors truncate font-medium">
              {websiteUrl}
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-2 min-w-0 h-5">
            <Phone size={12} className="text-zinc-500 shrink-0" />
            <a href={`tel:${cleanPhone}`} className="text-zinc-300 hover:text-sky-400 transition-colors truncate">
              {rawPhone}
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 min-w-0 h-5">
            <Mail size={12} className="text-zinc-500 shrink-0" />
            <a href={`mailto:${userEmail}`} className="text-zinc-300 hover:text-zinc-100 transition-colors truncate">
              {userEmail}
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: REFINED WALLET EMBED (5 Columns) */}
        <div className="md:col-span-5 bg-zinc-900/30 border border-zinc-900/80 rounded-lg p-2.5">
          {/* Top Row: Meta Descriptor */}
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Wallet size={11} className="text-zinc-400" />
              <span>StreetGO Wallet</span>
            </div>
            <span className="font-mono tracking-tight text-zinc-400">SG••4821</span>
          </div>

          {/* Center Row: Financial Status */}
          <div className="flex items-baseline justify-between mt-1 mb-2">
            <div className="text-xl font-black text-white tracking-tight">KSh 0</div>
            <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono">
              <span className="bg-zinc-900 px-1 rounded text-zinc-300">0 CR</span>
              <span className="bg-emerald-950/40 text-emerald-400 px-1 rounded border border-emerald-900/20">0 PTS</span>
            </div>
          </div>

          {/* Bottom Row: Micro-Action Block */}
          <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-zinc-900/60">
            <button className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded py-1 text-[10px] font-bold transition-all shadow-sm">
              <Plus size={10} strokeWidth={3} /> Top Up
            </button>
            <button className="flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 rounded py-1 text-[10px] font-semibold transition-all">
              <Send size={10} /> Send
            </button>
            <button className="flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded py-1 text-[10px] font-semibold transition-all">
              <History size={10} /> History
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
