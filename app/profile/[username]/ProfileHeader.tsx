'use client'

import { BadgeCheck, Zap, Camera } from "lucide-react"

interface Props {
  profile: any
  editing: boolean
  newUsername: string
  setNewUsername: React.Dispatch<React.SetStateAction<string>>
  newBio: string
  setNewBio: React.Dispatch<React.SetStateAction<string>>

newWebsite: string
setNewWebsite: React.Dispatch<React.SetStateAction<string>>
newLocation: string
setNewLocation: React.Dispatch<React.SetStateAction<string>>


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

  newWebsite,
  setNewWebsite,
  newLocation,
  setNewLocation,

  avatarFile,
  setAvatarFile,
  saveProfile,
}: Props) {
  return (
    <div className="w-full select-none px-1">
      {/* 1. Split-Row Avatar & Identity Header Block */}
      <div className="flex items-start gap-4 w-full">
        
        {/* Left Aspect: Profile Avatar Frame */}
        <div className="relative shrink-0 z-20">
          <div className="p-[2px] rounded-full bg-zinc-800/60 shadow-xl">
            <img 
              src={avatarFile ? URL.createObjectURL(avatarFile) : (profile.avatar_url || "/avatar-placeholder.png")} 
              alt="User profile portrait" 
              className="w-[72px] h-[72px] sm:w-[96px] sm:h-[96px] rounded-full object-cover border-[3px] border-[#02050a]" 
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
        <div className="flex-1 min-w-0 w-full">
          {/* Name Header and Verified Check Combo */}
          <div className="flex items-center gap-2 min-w-0 w-full">
            <h1 className="w-full text-[15px] sm:text-xl font-bold tracking-tight text-zinc-100 truncate leading-tight">
              {profile.username || "Julius Mutugi"}
            </h1>
            <BadgeCheck size={15} className="text-sky-400 fill-sky-400/10 shrink-0" />
          </div>

          {/* User Universal Handle identifier */}
          <p className="mt-0.5 text-[10px] sm:text-[11px] text-zinc-500 truncate">
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




<div>
  <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-1">
    Website
  </label>

  <input
    type="text"
    value={newWebsite}
    onChange={(e) => setNewWebsite(e.target.value)}
    className="w-full h-8 rounded-md bg-zinc-900/60 border border-zinc-800 text-[11px] px-2.5 text-white focus:outline-none focus:border-cyan-500/40"
    placeholder="https://streetgo.app"
  />
</div>


<div>
  <label className="block text-[9px] uppercase font-bold tracking-wider text-zinc-500 mb-1">
    Location
  </label>

  <input
    type="text"
    value={newLocation}
    onChange={(e) => setNewLocation(e.target.value)}
    className="w-full h-8 rounded-md bg-zinc-900/60 border border-zinc-800 text-[11px] px-2.5 text-white focus:outline-none focus:border-cyan-500/40"
    placeholder="Nairobi, Kenya"
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
          <p className="w-full text-[11px] sm:text-sm text-zinc-400 font-normal leading-relaxed tracking-wide antialiased">
            {profile.bio || "Building StreetGO into Africa's biggest social platform. Tech lover. Creator. Dreamer."}
          </p>
        )}
      </div>
    </div>
  )
}
