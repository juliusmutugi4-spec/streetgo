"use client"

import MatchCard from "./MatchCard"
import type { MatchCardPerson } from "./MatchCard"

interface MatchGridProps {
  matches: MatchCardPerson[]
  sendingId: string | null
  onConnect: (id: string) => void
  onViewProfile: (person: MatchCardPerson) => void
}

export default function MatchGrid({
  matches,
  sendingId,
  onConnect,
  onViewProfile,
}: MatchGridProps) {
  return (
    <div
      className="
        mt-7
        grid
        grid-cols-3
        gap-3
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
      "
    >
      {matches.map((person) => (
        <MatchCard
          key={person.id}
          person={person}
          sending={sendingId === person.id}
          onConnect={onConnect}
          onViewProfile={onViewProfile}
        />
      ))}
    </div>
  )
}