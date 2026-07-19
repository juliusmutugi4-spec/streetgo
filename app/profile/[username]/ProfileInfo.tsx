'use client'

import {
  Calendar,
  MapPin,
  Globe,
  Trophy,
  ShieldCheck,
  Star,
  Medal,
  Sparkles,
  ChevronRight,
} from "lucide-react"

interface Props {
  profile: any
}

function Badge({
  icon,
  title,
  color,
}: {
  icon: React.ReactNode
  title: string
  color: string
}) {
  return (
    <div
      className="
        group
        flex
        items-center
        gap-4

        rounded-3xl

        border
        border-white/10

        bg-white/[0.03]

        p-5

        transition

        hover:border-cyan-500/40
      "
    >
      <div
        className={`
          w-14
          h-14

          rounded-2xl

          flex
          items-center
          justify-center

          ${color}
        `}
      >
        {icon}
      </div>

      <div>

        <h3 className="font-bold">
          {title}
        </h3>

        <p className="text-zinc-400 text-sm">
          Achievement unlocked
        </p>

      </div>

    </div>
  )
}

export default function ProfileInfo({
  profile,
}: Props) {
  return (
    <div className="px-8 py-10">

      {/* INFO CARD */}

      <div
        className="
          rounded-[32px]

          border
          border-white/10

          bg-white/[0.03]

          p-8
        "
      >

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-black">
            Profile Information
          </h2>

          <ChevronRight />
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-8">

          <div className="flex gap-4">

            <Calendar className="text-cyan-400"/>

            <div>

              <p className="text-zinc-500 text-sm">
                Joined
              </p>

              <p className="font-semibold">
                {profile.created_at
                  ? new Date(
                      profile.created_at
                    ).toLocaleDateString()
                  : "Unknown"}
              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <MapPin className="text-cyan-400"/>

            <div>

              <p className="text-zinc-500 text-sm">
                Location
              </p>

              <p className="font-semibold">
                {profile.location || "Kenya"}
              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <Globe className="text-cyan-400"/>

            <div>

              <p className="text-zinc-500 text-sm">
                Website
              </p>

              <p className="font-semibold truncate">
                {profile.website || "streetgo.app"}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ACHIEVEMENTS */}

      <div className="mt-10">

        <div className="flex justify-between items-center">

          <h2 className="text-2xl font-black">
            Achievements
          </h2>

          <button className="text-cyan-400">
            View all
          </button>

        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-6">

          <Badge
            title="Verified Creator"
            color="bg-cyan-500/20"
            icon={<ShieldCheck className="text-cyan-400"/>}
          />

          <Badge
            title="Top Reputation"
            color="bg-yellow-500/20"
            icon={<Trophy className="text-yellow-400"/>}
          />

          <Badge
            title="Community Star"
            color="bg-violet-500/20"
            icon={<Star className="text-violet-400"/>}
          />

          <Badge
            title="Elite Member"
            color="bg-emerald-500/20"
            icon={<Medal className="text-emerald-400"/>}
          />

        </div>

      </div>

    </div>
  )
}