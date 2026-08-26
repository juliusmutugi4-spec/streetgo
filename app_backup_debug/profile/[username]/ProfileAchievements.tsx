'use client'

import { ShieldCheck, Trophy, Star, Medal } from "lucide-react"

interface AchievementProps {
  icon: React.ReactNode
  tooltipText: string
  gradient: string
  iconColor: string
}

function Achievement({ icon, tooltipText, gradient, iconColor }: AchievementProps) {
  return (
    <div 
      title={tooltipText} // Native zero-space micro tooltip definition
      className="shrink-0 snap-start group cursor-help select-none"
    >
      {/* Hyper-Compact Premium Glowing Capsule */}
      <div className={`
        relative w-10 h-10 rounded-xl
        flex items-center justify-center border border-white/5 
        bg-gradient-to-b ${gradient} shadow-sm
        transition-all duration-200 group-active:scale-95
      `}>
        <div className={`${iconColor} transition-transform group-hover:scale-110 duration-200`}>
          {icon}
        </div>
        
        {/* Sleek reflection top lighting accent line */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/15 rounded-t-xl pointer-events-none" />
      </div>
    </div>
  )
}

export default function ProfileAchievements() {
  const achievementsList = [
    { 
      id: "verified", 
      tooltipText: "Verified Creator", 
      icon: <ShieldCheck size={16} />, 
      gradient: "from-sky-500/10 to-blue-600/15 border-sky-500/15", 
      iconColor: "text-sky-400" 
    },
    { 
      id: "reputation", 
      tooltipText: "Top Reputation Tier 1", 
      icon: <Trophy size={16} />, 
      gradient: "from-amber-500/10 to-yellow-600/15 border-yellow-500/15", 
      iconColor: "text-amber-400" 
    },
    { 
      id: "star", 
      tooltipText: "Community Star", 
      icon: <Star size={16} />, 
      gradient: "from-purple-500/10 to-indigo-600/15 border-purple-500/15", 
      iconColor: "text-purple-400" 
    },
    { 
      id: "elite", 
      tooltipText: "Elite Member Status", 
      icon: <Medal size={16} />, 
      gradient: "from-emerald-500/10 to-green-600/15 border-emerald-500/15", 
      iconColor: "text-emerald-400" 
    },
  ]

  return (
    <div className="w-full pt-3 mt-1 border-t border-zinc-900/50">
      <div className="flex flex-row items-center gap-3">
        
        {/* Inline Section Title Label (Zero height wasted) */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 whitespace-nowrap">
          Badges ({achievementsList.length})
        </span>

        {/* Dense Inline Horizontal Swiper Row */}
        <div className="flex-1 overflow-x-auto no-scrollbar snap-x snap-mandatory">
          <div className="flex items-center gap-2 pb-0.5 min-w-max">
            {achievementsList.map((item) => (
              <Achievement 
                key={item.id}
                tooltipText={item.tooltipText}
                icon={item.icon}
                gradient={item.gradient}
                iconColor={item.iconColor}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
