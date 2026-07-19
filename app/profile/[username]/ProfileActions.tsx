'use client'

import {
  UserPlus,
  MessageCircle,
  Share2,
  Pencil,
  Car,
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
}

function ActionButton({
  icon,
  title,
  gradient,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  gradient: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
className={`
  group
  relative
  overflow-hidden

  flex
  items-center
  justify-center
  gap-3

  rounded-2xl

  px-7
  py-4

  font-bold
  text-white

  backdrop-blur-xl

  border
  border-white/10

  transition-all
  duration-300

  hover:scale-105
  hover:-translate-y-1

  hover:border-cyan-400/50
  hover:shadow-[0_0_30px_rgba(34,211,238,.35)]

  ${gradient}
`}
    >
      <span className="relative z-10 flex items-center gap-3">
        {icon}
        {title}
      </span>

<div
  className="
    absolute
    inset-0

    bg-gradient-to-r
    from-white/15
    via-transparent
    to-white/5

    opacity-0
    group-hover:opacity-100

    transition-all
    duration-500
  "
/>
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
  return (
    <div className="px-8 mt-8">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {currentUser?.id !== profile.id && (
          <>
            <ActionButton
              title={
                isFollowing
                  ? "Following"
                  : "Follow"
              }
              onClick={onFollow}
gradient="
  bg-gradient-to-r
  from-cyan-400
  via-sky-500
  to-blue-700
"
              icon={<UserPlus size={20} />}
            />

            <ActionButton
              title="Message"
              onClick={onMessage}
gradient="
  bg-zinc-900/80

  border
  border-cyan-500/20
"
              icon={<MessageCircle size={20} />}
            />

            <ActionButton
              title="Share Profile"
              onClick={() =>
                navigator.share?.({
                  title: profile.username,
                  url: window.location.href,
                })
              }
              gradient="
                bg-zinc-900
                border
                border-zinc-700
              "
              icon={<Share2 size={20} />}
            />
          </>
        )}

        {currentUser?.id === profile.id && (
          <>
            <ActionButton
              title={
                editing
                  ? "Cancel Editing"
                  : "Edit Profile"
              }
              onClick={() =>
                setEditing(!editing)
              }
              gradient="
                bg-gradient-to-r
                from-cyan-500
                to-blue-600
              "
              icon={<Pencil size={20} />}
            />

            <ActionButton
              title="Become Driver"
              onClick={onBecomeDriver}
              gradient="
                bg-gradient-to-r
                from-orange-500
                to-red-500
              "
              icon={<Car size={20} />}
            />

            <ActionButton
              title="Share Profile"
              onClick={() =>
                navigator.share?.({
                  title: profile.username,
                  url: window.location.href,
                })
              }
              gradient="
                bg-zinc-900
                border
                border-zinc-700
              "
              icon={<Share2 size={20} />}
            />
          </>
        )}

      </div>

    </div>
  )
}