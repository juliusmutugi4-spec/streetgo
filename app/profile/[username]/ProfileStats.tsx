'use client'

import {
  Trophy,
  Users,
  UserPlus,
  FileText,
  TrendingUp,
} from "lucide-react"

interface Props {
  reputation: number
  followersCount: number
  followingCount: number
  postsCount: number

  onFollowersClick: () => void
  onPostsClick: () => void
}

function Card({
  icon,
  title,
  value,
  color,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  value: number | string
  color: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="
        group
        relative
        overflow-hidden

        rounded-3xl

        border
        border-white/10

        bg-white/[0.03]
        backdrop-blur-xl

        p-6

        transition-all
        duration-300

        hover:scale-[1.03]
        hover:border-cyan-500/40
      "
    >
      <div
        className={`
          absolute
          inset-0
          opacity-0
          group-hover:opacity-100
          blur-3xl
          transition
          ${color}
        `}
      />

      <div className="relative">

        <div
          className="
            mb-5
            w-14
            h-14

            rounded-2xl

            bg-zinc-900

            flex
            items-center
            justify-center
          "
        >
          {icon}
        </div>

        <p className="text-zinc-400 text-sm">
          {title}
        </p>

        <h2
          className="
            mt-2
            text-3xl
            font-black
          "
        >
          {value}
        </h2>

      </div>

    </button>
  )
}

export default function ProfileStats({
  reputation,
  followersCount,
  followingCount,
  postsCount,
  onFollowersClick,
  onPostsClick,
}: Props) {
  return (
    <div className="px-8 mt-10">

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-5
        "
      >

        <Card
          title="Reputation"
          value={reputation}
          color="bg-cyan-500/20"
          icon={
            <Trophy
              className="
                w-7
                h-7
                text-cyan-400
              "
            />
          }
        />

        <Card
          title="Followers"
          value={followersCount}
          color="bg-blue-500/20"
          onClick={onFollowersClick}
          icon={
            <Users
              className="
                w-7
                h-7
                text-blue-400
              "
            />
          }
        />

        <Card
          title="Following"
          value={followingCount}
          color="bg-violet-500/20"
          icon={
            <UserPlus
              className="
                w-7
                h-7
                text-violet-400
              "
            />
          }
        />

        <Card
          title="Posts"
          value={postsCount}
          color="bg-orange-500/20"
          onClick={onPostsClick}
          icon={
   <FileText
  className="
    w-7
    h-7
    text-orange-400
  "
/>
          }
        />

      </div>

      {/* Reputation Progress */}

      <div
        className="
          mt-8

          rounded-3xl

          border
          border-white/10

          bg-white/[0.03]

          p-6
        "
      >

        <div className="flex justify-between">

          <div>

            <p className="text-zinc-400">
              Reputation Progress
            </p>

            <h2 className="text-2xl font-black mt-2">
              {reputation} XP
            </h2>

          </div>

          <TrendingUp
            className="
              w-8
              h-8
              text-emerald-400
            "
          />

        </div>

        <div
          className="
            mt-6
            h-3

            rounded-full

            bg-zinc-800
            overflow-hidden
          "
        >

          <div
            className="
              h-full

              rounded-full

              bg-gradient-to-r
              from-cyan-500
              to-blue-500
            "
            style={{
              width: `${Math.min(
                reputation,
                100
              )}%`,
            }}
          />

        </div>

      </div>

    </div>
  )
}