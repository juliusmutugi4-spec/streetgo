"use client"

import MatchAvatar from "./match/MatchAvatar"
import MatchIdentity from "./match/MatchIdentity"
import MatchCompatibility from "./match/MatchCompatibility"
import MatchReasons from "./match/MatchReasons"
import MatchInterests from "./match/MatchInterests"
import MatchActions from "./match/MatchActions"

export interface MatchCardPerson {
  id: string
  name: string
  avatar: string | null

  score: number
  reasons: string[]

  connectionStatus:
    | "none"
    | "pending"
    | "accepted"

  headline?: string | null
  location?: string | null
  age?: number | null
  gender?: string | null

  interests?: string[]
  reputation?: number | null

  profileType?:
    | "Dating"
    | "Business"
    | "Job"

  lastSeen?: string | null
  isOnline?: boolean
}

interface MatchCardProps {
  person: MatchCardPerson

  onConnect: (id: string) => void

  onViewProfile: (
    person: MatchCardPerson
  ) => void

  sending?: boolean
}

export default function MatchCard({
  person,
  onConnect,
  onViewProfile,
  sending = false,
}: MatchCardProps) {
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-[28px]
        border
        border-slate-800
        bg-slate-950
        shadow-xl
        shadow-black/20
        transition
        duration-300
        hover:-translate-y-1
        hover:border-slate-700
      "
    >

      {/* =====================================================
          PROFILE PHOTO
      ===================================================== */}

      <div
        className="
          relative
          h-[430px]
          w-full
          overflow-hidden
          bg-slate-900
        "
      >
        <MatchAvatar
          name={person.name}
          avatar={person.avatar}
        />

        {/* PROFILE TYPE */}

        <div
          className="
            absolute
            left-4
            top-4
            rounded-full
            border
            border-white/15
            bg-black/45
            px-3
            py-1.5
            text-xs
            font-semibold
            text-white
            backdrop-blur-xl
          "
        >
          ❤️ {person.profileType || "Dating"}
        </div>

        {/* ONLINE */}

        {person.isOnline && (
          <div
            className="
              absolute
              right-4
              top-4
              flex
              items-center
              gap-1.5
              rounded-full
              border
              border-emerald-400/20
              bg-black/45
              px-3
              py-1.5
              text-xs
              font-semibold
              text-emerald-300
              backdrop-blur-xl
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-emerald-400
              "
            />

            Online
          </div>
        )}

        {/* IMAGE GRADIENT */}

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-48
            bg-gradient-to-t
            from-black
            via-black/50
            to-transparent
          "
        />
      </div>

      {/* =====================================================
          CARD INFORMATION
      ===================================================== */}

      <div className="p-5">

        {/* IDENTITY */}

<MatchIdentity
  name={person.name}
  age={person.age ?? undefined}
  location={person.location ?? undefined}
  reputation={person.reputation ?? undefined}
/>

        {/* HEADLINE */}

        {person.headline && (
          <p
            className="
              mt-2
              line-clamp-2
              text-sm
              leading-5
              text-slate-500
            "
          >
            {person.headline}
          </p>
        )}

        {/* COMPATIBILITY */}

        <MatchCompatibility
          score={person.score}
        />

        {/* REASONS */}

        <MatchReasons
          reasons={person.reasons}
        />

        {/* INTERESTS */}

        <MatchInterests
          interests={
            person.interests || []
          }
        />

        {/* ACTIONS */}

        <MatchActions
          userId={person.id}
          connectionStatus={
            person.connectionStatus
          }
          sending={sending}
          onConnect={onConnect}
          onViewProfile={() =>
            onViewProfile(person)
          }
        />

      </div>
    </article>
  )
}