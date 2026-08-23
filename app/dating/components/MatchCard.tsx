"use client"

import MatchAvatar from "./match/MatchAvatar"
import MatchCardOverlay from "./match/MatchCardOverlay"

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
        relative
        aspect-[3/4]
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-slate-900
        shadow-lg
        shadow-black/30
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-white/20
        hover:shadow-2xl
      "
    >
      {/* =====================================================
          PHOTO CARD
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          onViewProfile(person)
        }
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-pointer
          text-left
        "
        aria-label={`View ${person.name}'s profile`}
      >
        {/* PHOTO */}

        <div
          className="
            absolute
            inset-0
            h-full
            w-full
          "
        >
          <MatchAvatar
            name={person.name}
            avatar={person.avatar}
          />
        </div>

        {/* ALL INFORMATION OVER PHOTO */}

        <MatchCardOverlay
          person={person}
        />
      </button>

      {/* =====================================================
          CONNECTION STATE
      ===================================================== */}

      {person.connectionStatus ===
        "pending" && (
        <div
          className="
            pointer-events-none
            absolute
            bottom-2.5
            right-2.5
            rounded-full
            border
            border-white/10
            bg-black/60
            px-2
            py-1
            text-[8px]
            font-bold
            text-white/70
            backdrop-blur-md
            sm:text-[9px]
          "
        >
          Request sent
        </div>
      )}
    </article>
  )
}