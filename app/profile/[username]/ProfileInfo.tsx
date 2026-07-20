'use client'

import { Calendar, MapPin, Link2 } from "lucide-react"

interface Props {
  profile: any
}

export default function ProfileInfo({ profile }: Props) {
  // Format the membership date cleanly (e.g., "July 2026")
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : "July 2026"

  return (
    <div className="w-full flex flex-col gap-4 text-xs">
      {/* Join Date Row */}
      <div className="flex items-start gap-2.5 py-1">
        <Calendar size={15} className="text-zinc-500 mt-0.5 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-zinc-500">Member since</span>
          <span className="font-medium text-zinc-200 mt-0.5">{joinDate}</span>
        </div>
      </div>

      {/* Website Row */}
      <div className="flex items-start gap-2.5 py-1">
        <Link2 size={15} className="text-zinc-500 mt-0.5 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-zinc-500">Website</span>
          <a 
            href={profile?.website ? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) : '#'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors mt-0.5 break-all truncate"
          >
            {profile?.website || "streetgo.app"}
          </a>
        </div>
      </div>

      {/* Location Row */}
      <div className="flex items-start gap-2.5 py-1">
        <MapPin size={15} className="text-zinc-500 mt-0.5 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-zinc-500">Location</span>
          <span className="font-medium text-zinc-200 mt-0.5 truncate">
            {profile?.location || "Nairobi, Kenya 🇰🇪"}
          </span>
        </div>
      </div>
    </div>
  )
}
