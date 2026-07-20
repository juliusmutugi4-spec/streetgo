'use client'

import { Grid, Play, Target, Heart, User } from "lucide-react"

interface ProfileTabsProps {
  activeTab: string
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
}

export default function ProfileTabs({
  activeTab,
  setActiveTab,
}: ProfileTabsProps) {

const tabs = [
  {
    id: "posts",
    label: "Posts",
    icon: <Grid size={16} />,
  },
  {
    id: "videos",
    label: "Videos",
    icon: <Play size={16} />,
  },
  {
    id: "predictions",
    label: "Predictions",
    icon: <Target size={16} />,
  },
  {
    id: "likes",
    label: "Likes",
    icon: <Heart size={16} />,
  },
  {
    id: "about",
    label: "About",
    icon: <User size={16} />,
  },
]

 return (
  <div className="w-full mt-4 border-b border-zinc-900/60">
    <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            relative
            flex
            items-center
            gap-2
            pb-3
            whitespace-nowrap
            transition-all
            duration-200
            ${
              activeTab === tab.id
                ? "text-cyan-400"
                : "text-zinc-500 hover:text-white"
            }
          `}
        >
          {tab.icon}

          <span className="text-sm font-medium">
            {tab.label}
          </span>

          {activeTab === tab.id && (
            <div className="absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full bg-cyan-400" />
          )}
        </button>
      ))}

    </div>
  </div>
)
}