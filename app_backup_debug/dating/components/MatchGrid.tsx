"use client"

import MatchCard, {
  type MatchCardPerson,
} from "./MatchCard"

interface MatchGridProps {
  matches: MatchCardPerson[]
  sendingId: string | null
  datingActive: boolean
  onConnect: (id: string) => void
  onViewProfile: (person: MatchCardPerson) => void
}

export default function MatchGrid({
  matches,
  sendingId,
  datingActive,
  onConnect,
  onViewProfile,
}: MatchGridProps) {
  return (
    <section
      className="
        grid
        grid-cols-1
        gap-5
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {matches.map((person) => (
        <MatchCard
          key={person.id}
          person={person}
          sending={sendingId === person.id}
          datingActive={datingActive}
          onConnect={onConnect}
          onViewProfile={onViewProfile}
        />
      ))}
    </section>
  )
}