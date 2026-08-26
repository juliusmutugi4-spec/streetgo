'use client'

import React from "react"
import { Grid, Play, Target, Heart, User } from "lucide-react"

interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface ProfileTabsProps {
  activeTab: string
  setActiveTab: (id: string) => void
}

// Extracted outside component to prevent re-creation on every render
const TABS: TabItem[] = [
  { id: "posts", label: "Posts", icon: <Grid size={16} strokeWidth={2.25} /> },
  { id: "videos", label: "Videos", icon: <Play size={16} strokeWidth={2.25} /> },
  { id: "predictions", label: "Predictions", icon: <Target size={16} strokeWidth={2.25} /> },
  { id: "likes", label: "Likes", icon: <Heart size={16} strokeWidth={2.25} /> },
  { id: "about", label: "About", icon: <User size={16} strokeWidth={2.25} /> },
]

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  return (
    <nav 
      className="sticky bottom-0 z-40 w-full border-t border-zinc-800/80 bg-[#02050a]/90 backdrop-blur-md"
      role="tablist"
      aria-label="Profile navigation"
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between overflow-x-auto px-2 no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex min-w-[76px] flex-1 flex-col items-center justify-center gap-1.5 py-3.5
                text-center transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50
                ${isActive 
                  ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]" 
                  : "text-zinc-400 hover:text-zinc-200"
                }
              `}
            >
              {/* Icon Container */}
              <div className={`transition-transform duration-200 ${isActive ? "scale-105" : "scale-100"}`}>
                {tab.icon}
              </div>

              {/* Label */}
              <span className="text-[10px] font-medium tracking-wide uppercase">
                {tab.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <div 
                  className="absolute bottom-0 h-[2px] w-8 rounded-full bg-cyan-400 shadow-[0_-2px_10px_rgba(34,211,238,0.6)]" 
                  style={{ contentVisibility: 'auto' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
