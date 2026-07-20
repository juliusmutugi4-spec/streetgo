'use client'

import { BadgeCheck, Zap, Camera } from "lucide-react"

interface Props {
  profile: any
  editing: boolean
  newUsername: string
  setNewUsername: React.Dispatch<React.SetStateAction<string>>
  newBio: string
  setNewBio: React.Dispatch<React.SetStateAction<string>>
  avatarFile: File | null
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>
  saveProfile: () => void
}

export default function ProfileHeader({
  profile,
  editing,
  newUsername,
  setNewUsername,
  newBio,
  setNewBio,
  avatarFile,
  setAvatarFile,
  saveProfile,
}: Props) {
  return (
    <div className="w-full select-none px-1">
      {/* 1. Split-Row Avatar & Identity Header Block */}
      <div className="flex flex-row items-end gap-3.5 sm:gap-5">
        
        {/* Left Aspect: Profile Avatar Frame */}
        <div className="relative shrink-0 z-20">
          <div className="p-[2px] rounded-full bg-zinc-800/60 shadow-xl">
            <img 
              src={avatarFile ? URL.createObjectURL(avatarFile) : (profile.avatar_url || "/avatar-placeholder.png")} 
              alt="User profile portrait" 
              className="w-[84px] h-[84px] sm:w-[100px] sm:h-[100px] rounded-full object-cover border-[3px] border-[#02050a]" 
            />
          </div>

          {/* Precision Active Indicator Dot */}
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-[2.5px] border-[#02050a] shadow-md" />

          {/* Editing Camera Trigger Mask */}
          {editing && (
            <label className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center cursor-pointer active:bg-black/80">
              <Camera size={16} className="text-white/90" />
              <input type="file" accept="image/*" hidden onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </label>
          )}
        </div>

        {/* Right Aspect: Identity Text Data Panel Block */}
        <div className="flex flex-col pb-1 min-w-0">
          {/* Name Header and Verified Check Combo */}
          <div className="flex items-center gap-1 min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-100 truncate leading-tight">
              {profile.username || "Julius Mutugi"}
            </h1>
            <BadgeCheck size={15} className="text-sky-400 fill-sky-400/10 shrink-0" />
          </div>

          {/* User Universal Handle identifier */}
          <p className="text-[11px] text-zinc-500 font-medium truncate mt-0.5">
            @{profile.username?.toLowerCase().replace(/\s+/g, '') || "juliusmutugi"}
          </p>

          {/* Micro XP Level Identifier Tracker Block */}
          <div className="mt-1.5 self-start">
            <div className="inline-flex items-center gap-1 h-[18px] rounded-md px-1.5 bg-[#12253a]/40 border border-sky-500/10 text-[9px] font-bold text-sky-400">
              <Zap size={10} className="fill-sky-400/20" />
              <span>Level 18</span>
            </div>
          </div>
        </div>

      </div>

      {/* 2. User Bio Description / Profile Settings Custom Editor Form */}
      <div className="mt-3.5">
        {editing ? (
          <div className="space-y-3 w-full max-w-sm bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-900/60">
            <div>
              <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Username Handle</label>
              <input 
                type="text" 
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} 
                className="w-full h-8 rounded-md bg-zinc-900/60 border border-zinc-800 text-[11px] px-2.5 text-white focus:outline-none focus:border-cyan-500/40" 
                placeholder="Edit profile handle..." 
              />
            </div>
            
            <div>
              <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Bio Text Block</label>
              <textarea 
                rows={2} 
                value={newBio} 
                onChange={(e) => setNewBio(e.target.value)} 
                className="w-full rounded-md bg-zinc-900/60 border border-zinc-800 text-[11px] p-2.5 text-zinc-300 resize-none focus:outline-none focus:border-cyan-500/40" 
                placeholder="Write your bio statement..." 
              />
            </div>

            <button 
              onClick={saveProfile} 
              className="w-full h-8 rounded-md bg-gradient-to-r from-sky-500 to-cyan-500 font-semibold text-[11px] text-white active:scale-[0.98] transition-all shadow-md shadow-cyan-950/20"
            >
              Save Profile Changes
            </button>
          </div>
        ) : (
          <p className="max-w-xl text-[11px] sm:text-xs text-zinc-400 font-normal leading-relaxed tracking-wide antialiased">
            {profile.bio || "Building StreetGO into Africa's biggest social platform. Tech lover. Creator. Dreamer."}
          </p>
        )}
      </div>
    </div>
  )
}
