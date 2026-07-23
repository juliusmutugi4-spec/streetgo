'use client'



import { useState } from "react"

import {
  Plus,
  Check,
  MessageSquare,
  Share2,
  Pencil,
  Car,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface Props {
  currentUser: any
  profile: any
  editing: boolean
  setEditing: React.Dispatch<React.SetStateAction<boolean>>
  isFollowing: boolean
  onFollow: () => void
  onMessage: () => void
  onBecomeDriver: () => void

  hasWallet: boolean
  onRegisterWallet: () => void
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
  const styles = {
    primary: "bg-gradient-to-r from-[#2da5f3] to-[#12c5de] hover:opacity-90 text-white border-transparent font-semibold shadow-[0_2px_10px_rgba(18,197,222,0.1)]",
    secondary: "bg-[#0b121f]/40 border-zinc-800/60 text-zinc-300 hover:text-white hover:bg-[#121c2f]/60 hover:border-zinc-700",
    danger: "bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-900/30"
  }



  
  return (
    <button 
      onClick={onClick} 
      type="button"
className={`
  w-full flex items-center justify-center gap-1.5
  rounded-lg border h-9 px-3
  text-xs font-medium
        transition-all duration-200 active:scale-[0.97] outline-none
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
  hasWallet,
  onRegisterWallet,
}: Props) {
  const isOwnProfile = currentUser?.id === profile?.id
const [expanded, setExpanded] = useState(false)
  return (
    <div className="w-full p-0 m-0">
      {/* Hyper-dense vertical column stack with minimized row gaps */}
      <div className="flex flex-col gap-2 w-full justify-start">
        {!isOwnProfile && (
          <>
            {/* Primary Action Call: Follow Toggle */}
            <ActionButton 
              title={isFollowing ? "Following" : "Follow"} 
              onClick={onFollow} 
              variant={isFollowing ? "secondary" : "primary"}
              icon={isFollowing ? <Check size={12} className="text-cyan-400" /> : <Plus size={12} strokeWidth={2.5} />} 
            />

            {/* Core Message Action Panel */}
            <ActionButton 
              title="Message" 
              onClick={onMessage} 
              variant="secondary"
              icon={<MessageSquare size={12} strokeWidth={2} className="opacity-80" />} 
            />

            {/* Native OS Share Sheet Proxy Trigger */}
            <ActionButton 
              title="Share" 
              onClick={() => navigator.share?.({ title: profile?.username, url: window.location.href })} 
              variant="secondary"
              icon={<Share2 size={12} strokeWidth={2} className="opacity-80" />} 
            />
          </>
        )}
{isOwnProfile && (
  <div className="w-full flex flex-col gap-2">
    {/* Micro-Sized Expand/Collapse Control Bar */}
    <button
      onClick={() => setExpanded(!expanded)}
      type="button"
      className="
        w-full h-7 rounded-[8px] border border-zinc-900/80 
        bg-gradient-to-b from-[#0b121f]/40 to-[#050910]/60
        flex items-center justify-center gap-1.5
        text-[10px] font-semibold uppercase tracking-wider text-zinc-500
        hover:text-cyan-400 hover:border-cyan-500/20
        transition-all duration-300 active:scale-[0.98] outline-none group
      "
    >
      <span>{expanded ? "Less Options" : "More Options"}</span>
      <div className={`
        transform transition-transform duration-300 ease-out text-zinc-500 group-hover:text-cyan-400
        ${expanded ? "rotate-180" : "rotate-0"}
      `}>
        {/* Using a tight crisp icon metric layout for smartphone viewports */}
        <svg 
          width="10" 
          height="6" 
          viewBox="0 0 10 6" 
          fill="none" 
          xmlns="http://w3.org"
          className="stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1L5 5L9 1" />
        </svg>
      </div>
    </button>

    {/* Content Area Section Wrapper */}
    <div className={`
      grid transition-all duration-300 ease-in-out
      ${expanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 pointer-events-none"}
    `}>
      <div className="overflow-hidden flex flex-col gap-1.5 w-full">
        <ActionButton 
          title={editing ? "Cancel Editing" : "Edit Profile"} 
          onClick={() => setEditing(!editing)} 
          variant={editing ? "danger" : "primary"}
          icon={editing ? <X size={12} /> : <Pencil size={12} />} 
        />
        
        <ActionButton 
          title="Become Driver" 
          onClick={onBecomeDriver} 
          variant="secondary"
          icon={<Car size={12} className="opacity-80" />} 
        />
        
{!hasWallet && (
  <ActionButton
    title="Register Wallet"
    onClick={onRegisterWallet}
    variant="primary"
    icon={<Plus size={12} strokeWidth={2.5} />}
  />
)}


        <ActionButton 
          title="Share Profile" 
          onClick={() => navigator.share?.({ title: profile?.username, url: window.location.href })} 
          variant="secondary"
          icon={<Share2 size={12} className="opacity-80" />} 
        />
      </div>
    </div>
  </div>
)}


      </div>
    </div>
  )
}
