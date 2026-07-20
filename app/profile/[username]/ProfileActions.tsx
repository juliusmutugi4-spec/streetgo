'use client'

import { Plus, Check, MessageSquare, Share2, Pencil, Car, X } from "lucide-react"

interface Props {
  currentUser: any
  profile: any
  editing: boolean
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
  isFollowing: boolean
  onFollow: () => void
  onMessage: () => void
  onBecomeDriver: () => void
}

function ActionButton({ 
  icon, 
  title, 
  variant = "secondary", 
  onClick, 
}: { 
  icon: React.ReactNode 
  title: string 
  variant?: "primary" | "secondary" | "danger"
  onClick: () => void 
}) {
  // Exact visual color mapping extracted directly from your reference screen design
  const styles = {
    primary: "bg-gradient-to-r from-[#2da5f3] to-[#12c5de] hover:opacity-90 text-white border-transparent font-semibold shadow-[0_4px_20px_rgba(18,197,222,0.15)]",
    secondary: "bg-[#0b121f]/40 border-zinc-800/80 text-zinc-200 hover:text-white hover:bg-[#121c2f]/60 hover:border-zinc-700",
    danger: "bg-red-950/30 border-red-900/60 text-red-400 hover:bg-red-900/40"
  }

  return (
    <button 
      onClick={onClick} 
      className={`
        w-full flex items-center justify-center gap-2 
        rounded-[12px] border h-[42px] px-4
        text-xs tracking-wide font-medium
        transition-all duration-200 active:scale-[0.97]
        ${styles[variant]}
      `}
    >
      {icon}
      <span>{title}</span>
    </button>
  )
}

export default function ProfileActions({ 
  currentUser, 
  profile, 
  editing, 
  setEditing, 
  isFollowing, 
  onFollow, 
  onMessage, 
  onBecomeDriver, 
}: Props) {
  const isOwnProfile = currentUser?.id === profile?.id

  return (
    <div className="w-full p-0 m-0">
      <div className="flex flex-col gap-2.5 w-full">
        {!isOwnProfile && (
          <>
            {/* Primary Action Call: Follow Toggle */}
            <ActionButton 
              title={isFollowing ? "Following" : "Follow"} 
              onClick={onFollow} 
              variant={isFollowing ? "secondary" : "primary"}
              icon={isFollowing ? <Check size={14} className="text-cyan-400" /> : <Plus size={14} strokeWidth={2.5} />} 
            />

            {/* Core Message Action Panel */}
            <ActionButton 
              title="Message" 
              onClick={onMessage} 
              variant="secondary"
              icon={<MessageSquare size={14} strokeWidth={2} className="opacity-80" />} 
            />

            {/* Native OS Share Sheet Proxy Trigger */}
            <ActionButton 
              title="Share Profile" 
              onClick={() => navigator.share?.({ title: profile?.username, url: window.location.href })} 
              variant="secondary"
              icon={<Share2 size={14} strokeWidth={2} className="opacity-80" />} 
            />
          </>
        )}

        {isOwnProfile && (
          <>
            {/* Owner Operational Toggles */}
            <ActionButton 
              title={editing ? "Cancel Editing" : "Edit Profile"} 
              onClick={() => setEditing(!editing)} 
              variant={editing ? "danger" : "primary"}
              icon={editing ? <X size={14} /> : <Pencil size={14} />} 
            />

            {/* Ancillary Marketplace Entry Trigger */}
            <ActionButton 
              title="Become Driver" 
              onClick={onBecomeDriver} 
              variant="secondary"
              icon={<Car size={14} className="opacity-80" />} 
            />

            {/* Profile Card External Link Export */}
            <ActionButton 
              title="Share Profile" 
              onClick={() => navigator.share?.({ title: profile?.username, url: window.location.href })} 
              variant="secondary"
              icon={<Share2 size={14} className="opacity-80" />} 
            />
          </>
        )}
      </div>
    </div>
  )
}
