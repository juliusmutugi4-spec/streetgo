'use client'

import {
  BadgeCheck,
  Zap,
  Camera,
} from "lucide-react"

interface Props {
  profile: any

  editing: boolean

  newUsername: string
  setNewUsername: React.Dispatch<React.SetStateAction<string>>

  newBio: string
  setNewBio: React.Dispatch<React.SetStateAction<string>>

  avatarFile: File | null
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>

  saveProfile: () => void
}

export default function ProfileHeader({
  profile,

  editing,

  newUsername,
  setNewUsername,

  newBio,
  setNewBio,

  avatarFile,
  setAvatarFile,

  saveProfile,
}: Props) {
  return (
    <div className="relative px-8">

      {/* Avatar */}

      <div className="-mt-32 relative inline-block group">
<div
  className="
    absolute
    -inset-4

    rounded-full

    bg-gradient-to-r
    from-cyan-400
    via-blue-500
    to-violet-500

    opacity-70

    blur-3xl

    animate-pulse
  "
/>

<img
  src={
    profile.avatar_url ||
    "/avatar-placeholder.png"
  }
  alt="avatar"
  className="
    relative

    w-44
    h-44

    rounded-full

    object-cover

    border-[8px]
    border-[#070b12]

    shadow-[0_0_60px_rgba(34,211,238,.45)]

    transition-all
    duration-500

    group-hover:scale-105
  "
/>

  <div
  className="
    absolute

    bottom-5
    right-5

    w-7
    h-7

    rounded-full

    bg-emerald-400

    border-4
    border-[#070b12]

    shadow-[0_0_20px_rgba(74,222,128,.8)]

    animate-pulse
  "
/>

        {editing && (

          <label
            className="
              absolute
              bottom-2
              left-1/2
              -translate-x-1/2

              w-12
              h-12

              rounded-full

              bg-cyan-500

              flex
              items-center
              justify-center

              cursor-pointer

              shadow-xl
            "
          >

            <Camera className="w-5 h-5 text-black"/>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e)=>
                setAvatarFile(
                  e.target.files?.[0] || null
                )
              }
            />

          </label>

        )}

      </div>

      {/* User */}

      <div className="mt-8">
<div className="mt-8 flex flex-wrap items-center gap-4">

  <h1
    className="
      text-5xl
      md:text-6xl
      font-black
      tracking-tight
      text-white
    "
  >
    {profile.username}
  </h1>

  <div
    className="
      flex
      items-center
      justify-center

      w-10
      h-10

      rounded-full

      bg-gradient-to-br
      from-cyan-400
      to-blue-600

      shadow-[0_0_25px_rgba(34,211,238,.6)]
    "
  >
    <BadgeCheck className="w-6 h-6 text-white" />
  </div>

</div>

<p
  className="
    mt-3
    text-xl
    text-zinc-400
  "
>
  @{profile.username}
</p>

<div className="mt-6 flex flex-wrap gap-3">

  <div
    className="
      flex
      items-center
      gap-2

      rounded-full

      bg-cyan-500/10

      border
      border-cyan-500/30

      px-5
      py-2.5
    "
  >
    <Zap className="w-5 h-5 text-cyan-400" />

    <span className="font-semibold">
      Level 42
    </span>
  </div>

  <div
    className="
      rounded-full

      bg-yellow-500/15

      border
      border-yellow-500/30

      px-5
      py-2.5

      font-semibold
      text-yellow-300
    "
  >
    ⭐ Elite Creator
  </div>

</div>

        {editing ? (

          <div className="mt-8 space-y-4 max-w-2xl">

            <input
              value={newUsername}
              onChange={(e)=>
                setNewUsername(e.target.value)
              }
              className="
                w-full
                rounded-2xl
                bg-zinc-900
                border
                border-zinc-700
                px-5
                py-4
              "
            />

            <textarea
              rows={5}
              value={newBio}
              onChange={(e)=>
                setNewBio(e.target.value)
              }
              className="
                w-full
                rounded-2xl
                bg-zinc-900
                border
                border-zinc-700
                px-5
                py-4
              "
            />

            <button
              onClick={saveProfile}
              className="
                rounded-2xl
                px-8
                py-4

                bg-gradient-to-r
                from-cyan-500
                to-blue-600

                font-bold
              "
            >
              Save Profile
            </button>

          </div>

        ) : (

          <p
            className="
              mt-6
              max-w-3xl
              text-zinc-300
              leading-8
              text-lg
            "
          >
            {profile.bio ||
              "Building the future on StreetGO."}
          </p>

        )}

      </div>

    </div>
  )
}