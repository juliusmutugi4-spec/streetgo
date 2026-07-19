'use client'

import { BadgeCheck, Zap, Camera, Award } from "lucide-react"

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
    <div className="relative px-4 sm:px-6 w-full select-none">
      {/* -------------------- AVATAR BLOCK -------------------- */}
      <div className="-mt-14 sm:-mt-16 relative inline-block group z-20">
        {/* Subdued ambient glow to optimize performance on mobile GPUs */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 blur-xl pointer-events-none" />
        
        {/* Exact Ring Outline Ratio matching your reference image */}
        <div className="p-[3px] rounded-full bg-gradient-to-tr from-emerald-400 via-cyan-400 to-indigo-500 shadow-lg shadow-black/50">
          <img 
            src={avatarFile ? URL.createObjectURL(avatarFile) : (profile.avatar_url || "/avatar-placeholder.png")} 
            alt="Profile portrait" 
            className="w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover border-[4px] border-[#070b12]" 
          />
        </div>

        {/* Precise Online Status Indicator Anchor */}
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#22C55E] border-[2.5px] border-[#070b12] shadow-sm" />

        {/* Micro Upload Camera Trigger */}
        {editing && (
          <label className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center cursor-pointer transition-opacity active:bg-black/80">
            <Camera className="w-5 h-5 text-white/90" />
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} 
            />
          </label>
        )}
      </div>

      {/* -------------------- USER IDENTITY INFO -------------------- */}
      <div className="mt-3 space-y-1">
        {/* Name and Verification Inline Flow */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-none">
            {profile.username || "Julius Mutugi"}
          </h1>
          <BadgeCheck className="w-3.5 h-3.5 text-[#3B82F6] fill-white stroke-[#070b12] stroke-[1.5]" />
        </div>

        {/* Professional Handle Tag */}
        <p className="text-[11px] text-zinc-400 font-medium">
          @{profile.username?.toLowerCase().replace(/\s+/g, '') || "juliusmutugi"}
        </p>

        {/* Micro Badges Horizontal Matrix */}
        <div className="pt-1 flex flex-wrap gap-1.5 items-center">
          {/* Level Tracker */}
          <div className="inline-flex items-center gap-1 h-5 rounded px-1.5 bg-cyan-950/40 border border-cyan-500/20 text-[9px] font-bold text-cyan-400">
            <Zap className="w-2.5 h-2.5 fill-cyan-400/20" />
            <span>Level 18</span>
          </div>

          {/* Elite Mini Status Badge */}
          <div className="inline-flex items-center gap-1 h-5 rounded px-1.5 bg-amber-500 text-[9px] font-black uppercase tracking-wider text-black">
            <Award className="w-2.5 h-2.5 stroke-[2]" />
            <span>Elite</span>
          </div>
        </div>
      </div>

      {/* -------------------- BIO / EDITING INTERFACE -------------------- */}
      <div className="mt-4">
        {editing ? (
          <div className="space-y-3 w-full max-w-md">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Username</label>
              <input 
                type="text"
                value={newUsername} 
                onChange={(e) => setNewUsername(e.target.value)} 
                className="w-full h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-xs px-3 text-white focus:outline-none focus:border-cyan-500/50" 
                placeholder="Edit profile handle..."
              />
            </div>
            
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Biography</label>
              <textarea 
                rows={3} 
                value={newBio} 
                onChange={(e) => setNewBio(e.target.value)} 
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 text-xs p-3 text-zinc-300 resize-none focus:outline-none focus:border-cyan-500/50" 
                placeholder="Write your bio statement..."
              />
            </div>

            <button 
              onClick={saveProfile} 
              className="w-full h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-xs text-white active:scale-[0.98] transition-transform shadow-md shadow-cyan-950/50"
            >
              Save Profile Changes
            </button>
          </div>
        ) : (
          <p className="max-w-xl text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed tracking-wide antialiased">
            {profile.bio || "Building StreetGO into Africa's biggest social platform. Tech lover. Creator. Dreamer."}
          </p>
        )}
      </div>
    </div>
  )
}
