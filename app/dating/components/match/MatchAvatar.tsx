"use client"

interface MatchAvatarProps {
  name: string
  avatar: string | null
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join("")
    .toUpperCase()
}

export default function MatchAvatar({
  name,
  avatar,
}: MatchAvatarProps) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={`${name}'s profile`}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
          transition
          duration-700
          group-hover:scale-[1.03]
        "
      />
    )
  }

  return (
    <div
      className="
        absolute
        inset-0
        flex
        items-center
        justify-center
        bg-gradient-to-br
        from-rose-950
        via-purple-950
        to-slate-950
      "
    >
      <div
        className="
          flex
          h-28
          w-28
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-white/10
          text-4xl
          font-black
          text-white
          backdrop-blur-sm
        "
      >
        {getInitials(name)}
      </div>
    </div>
  )
}