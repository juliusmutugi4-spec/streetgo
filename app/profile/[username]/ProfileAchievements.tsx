'use client'

import {
  ShieldCheck,
  Trophy,
  Star,
  Medal,
} from "lucide-react"

function Achievement({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div
      className="
        min-w-[150px]
        rounded-xl
        border
        border-zinc-800
        bg-[#0b1119]
        p-4

        flex
        items-center
        gap-3

        snap-start
      "
    >
      <div
        className="
          w-10
          h-10

          rounded-xl

          flex
          items-center
          justify-center

          bg-cyan-500/10
          text-cyan-400
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="text-xs text-zinc-500">
          Achievement
        </p>
      </div>
    </div>
  )
}

export default function ProfileAchievements() {
  return (
    <div
      className="
        flex
        gap-3

        overflow-x-auto

        pb-2

        snap-x
      "
    >
      <Achievement
        title="Verified Creator"
        icon={<ShieldCheck size={18} />}
      />

      <Achievement
        title="Top Reputation"
        icon={<Trophy size={18} />}
      />

      <Achievement
        title="Community Star"
        icon={<Star size={18} />}
      />

      <Achievement
        title="Elite Member"
        icon={<Medal size={18} />}
      />
    </div>
  )
}