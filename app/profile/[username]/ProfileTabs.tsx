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
  <div className="w-full sticky bottom-0 bg-[#02050a] border-t border-zinc-900/60">
    <div className="flex w-full overflow-x-auto no-scrollbar snap-x snap-mandatory">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
className={`
  relative
  flex-1
  flex
  flex-col
  items-center
  justify-center
  py-3
  min-w-[90px]
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
  <>
    <div className="absolute inset-0 rounded-xl bg-cyan-500/10" />
    <div className="absolute left-4 right-4 bottom-0 h-[3px] rounded-full bg-cyan-400" />
  </>
)}
        </button>
      ))}

    </div>
  </div>
)
}