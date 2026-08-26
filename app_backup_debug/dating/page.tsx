"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"
import { getCurrentUser } from "../lib/auth"
import DatingRequests from "../components/DatingRequests"
import MatchCard from "./components/MatchCard"
import type { MatchCardPerson } from "./components/MatchCard"
import DatingProfileModal from "./components/DatingProfileModal"
import DatingLoading from "./components/DatingLoading"
import DatingBackButton from "./components/DatingBackButton"
import MatchGrid from "./components/MatchGrid"
import { useRouter } from "next/navigation"

type FilterType = "All" | "High Match" | "New"

type Match = MatchCardPerson & {
  personality?: string | null
  lookingFor?: string | null
}

export default function DatingPage() {
const router = useRouter()

  const [matches, setMatches] = useState<Match[]>([])
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [currentUserName, setCurrentUserName] =useState("")
const [datingActive, setDatingActive] = useState(false)
  const [sendingId, setSendingId] =
    useState<string | null>(null)

  const [selectedProfile, setSelectedProfile] =
    useState<Match | null>(null)

  // =========================================================
  // CONNECTION STATUS
  // =========================================================

  async function getConnectionStatus(
    userId: string
  ): Promise<"none" | "pending" | "accepted"> {
    try {
      const response = await fetch(
        "/api/connections/status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            otherUserId: userId,
          }),
        }
      )

      if (!response.ok) {
        return "none"
      }

const data = await response.json()

if (
  data.status === "pending" ||
  data.status === "accepted"
) {
  return data.status
}


      if (
        data.status === "pending" ||
        data.status === "accepted"
      ) {
        return data.status
      }

      return "none"
    } catch (error) {
      console.error(
        "Connection status error:",
        error
      )

      return "none"
    }
  }

  // =========================================================
  // LOAD MATCHES
  // =========================================================

  async function loadMatches() {
    try {
      setLoading(true)
      setError("")

const {
  data: { user },
} = await getCurrentUser()

      if (!user) {
        setError(
          "Please sign in to view your matches."
        )
        return
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(`
          username,
          dating_active
        `)
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error(
          "Profile error:",
          profileError
        )
      }

setCurrentUserName(
  profile?.username || "there"
)

setDatingActive(
  Boolean(profile?.dating_active)
)

const engineUrl =
  process.env.NEXT_PUBLIC_MATCH_ENGINE_URL

      if (!engineUrl) {
        throw new Error(
          "Dating engine is not configured."
        )
      }

      const response = await fetch(
        `${engineUrl}/matches/${user.id}`,
        {
          cache: "no-store",
        }
      )

      if (!response.ok) {
        throw new Error(
          "Unable to contact the dating engine."
        )
      }

const data = await response.json()




if (data.error) {
  throw new Error(data.error)
}

const rawMatches = Array.isArray(
  data.matches
)
  ? data.matches
  : []


  console.table(
  rawMatches.map((person: any) => ({
    username: person.username,
    location: person.location,
  }))
)


      const updatedMatches: Match[] =
        await Promise.all(
          rawMatches.map(
            async (person: any) => {
              const status =
                await getConnectionStatus(
                  person.id
                )

              return {
                id: person.id,

                name:
                  person.name ||
                  person.username ||
                  "StreetGO Member",

                avatar:
                  person.avatar ||
                  person.avatar_url ||
                  null,

                score:
                  Number(person.score) || 0,

                reasons:
                  Array.isArray(
                    person.reasons
                  )
                    ? person.reasons
                    : [],

                connectionStatus:
                  status,

                headline:
                  person.headline ||
                  "Looking for a meaningful connection",

location:
  person.location || null,

                age:
                  typeof person.age ===
                  "number"
                    ? person.age
                    : null,

                gender:
                  person.gender ||
                  undefined,

                interests:
                  Array.isArray(
                    person.interests
                  )
                    ? person.interests
                    : [],

                reputation:
                  Number(
                    person.reputation
                  ) || 0,

                profileType: "Dating",

                personality:
                  person.personality ||
                  null,

                lookingFor:
                  person.looking_for ||
                  person.lookingFor ||
                  null,

                lastSeen:
                  person.lastSeen ||
                  person.last_seen ||
                  undefined,

                isOnline:
                  Boolean(
                    person.isOnline ??
                    person.is_online
                  ),
              }
            }
          )
        )

      setMatches(updatedMatches)
    } catch (error) {
      console.error(
        "Dating load error:",
        error
      )

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load matches."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches()
  }, [])

  // =========================================================
  // SEND CONNECTION
  // =========================================================

  async function sendConnection(
    receiverId: string
  ) {


    if (!datingActive) {
  router.push("/dating/setup")
  return
}

    try {
      setSendingId(receiverId)

      const response = await fetch(
        "/api/connections",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiver_id: receiverId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to send connection request."
        )
      }

      setMatches(prev =>
        prev.map(person =>
          person.id === receiverId
            ? {
                ...person,
                connectionStatus:
                  "pending",
              }
            : person
        )
      )

      setSelectedProfile(prev =>
        prev?.id === receiverId
          ? {
              ...prev,
              connectionStatus:
                "pending",
            }
          : prev
      )
    } catch (error) {
      console.error(
        "Connection error:",
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Unable to send connection request."
      )
    } finally {
      setSendingId(null)
    }
  }

  // =========================================================
  // FILTERING
  // =========================================================

  const filteredMatches = useMemo(() => {
    let result = [...matches]

    if (activeFilter === "High Match") {
      result = result.filter(
        person => person.score >= 80
      )
    }

    if (activeFilter === "New") {
      result = result.filter(
        person =>
          person.connectionStatus ===
          "none"
      )
    }

    const query =
      search.trim().toLowerCase()

    if (query) {
      result = result.filter(person => {
        const searchable = [
          person.name,
          person.location || "",
          person.headline || "",
          ...(person.interests || []),
        ]
          .join(" ")
          .toLowerCase()

        return searchable.includes(query)
      })
    }

    return result.sort(
      (a, b) => b.score - a.score
    )
  }, [
    matches,
    activeFilter,
    search,
  ])

// =========================================================
// PAGE
// =========================================================

return (
  <main
    className="
      min-h-screen
      bg-[#05070d]
      text-white
    "
  >
    {/* HEADER */}

    <header
      className="
        sticky
        top-0
        z-40
        border-b
        border-white/10
        bg-[#05070d]/90
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-5
          py-4
          sm:px-8
        "
      >


<DatingBackButton />

        <div
          className="
            flex
            items-center
            gap-3
          "
        >


          <div>
            <h1
              className="
                text-lg
                font-black
              "
            >
              StreetGO
            </h1>

            <p
              className="
                text-[11px]
                text-slate-500
              "
            >
              Trusted Dating
            </p>
          </div>
        </div>

        <DatingRequests
          type="dating"
          onAccepted={loadMatches}
        />
      </div>
    </header>

    {/* HERO */}

    <section
      className="
        border-b
        border-white/5
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          px-5
          py-10
          sm:px-8
        "
      >
        <div className="max-w-3xl">
          <div
            className="
              mb-4
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-rose-400/20
              bg-rose-500/5
              px-3
              py-1.5
              text-xs
              font-semibold
              text-rose-300
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

            Private dating space
          </div>

          <h2
            className="
              text-3xl
              font-black
              leading-tight
              sm:text-5xl
            "
          >
            Meaningful connections,

            <span
              className="
                block
                bg-gradient-to-r
                from-rose-400
                via-pink-400
                to-purple-400
                bg-clip-text
                text-transparent
              "
            >
              matched with intention.
            </span>
          </h2>

          <p
            className="
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-slate-400
              sm:text-base
            "
          >
            Welcome back,{" "}

            <span className="text-white">
              {currentUserName}
            </span>

            . Discover people whose{" "}
            interests, personality and relationship goals may align with{" "}
            yours.
          </p>
        </div>
      </div>
    </section>

    {/* CONTROLS */}

    <section
      className="
        mx-auto
        max-w-7xl
        px-5
        py-7
        sm:px-8
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div
          className="
            flex
            flex-wrap
            gap-2
          "
        >
          {(
            [
              "All",
              "High Match",
              "New",
            ] as FilterType[]
          ).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setActiveFilter(filter)
              }
              className={`
                rounded-full
                border
                px-4
                py-2
                text-xs
                font-bold
                transition
                ${
                  activeFilter === filter
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white"
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search people..."
          className="
            w-full
            rounded-xl
            border
            border-white/10
            bg-white/[0.03]
            px-4
            py-3
            text-sm
            text-white
            outline-none
            placeholder:text-slate-600
            focus:border-rose-400/50
            lg:w-72
          "
        />
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="
            mt-6
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/5
            p-5
          "
        >
          <p
            className="
              font-bold
              text-red-300
            "
          >
            We couldn't load your matches
          </p>

          <p
            className="
              mt-1
              text-sm
              text-red-300/70
            "
          >
            {error}
          </p>

          <button
            type="button"
            onClick={loadMatches}
            className="
              mt-4
              rounded-lg
              bg-white
              px-4
              py-2
              text-xs
              font-bold
              text-black
            "
          >
            Try again
          </button>
        </div>
      )}

        {/* LOADING */}

        {loading && (
          <div className="
            mt-7
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          ">
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <DatingLoading
                key={index}
              />
            ))}
          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredMatches.length ===
            0 && (
            <div className="
              mt-7
              rounded-3xl
              border
              border-white/10
              bg-white/[0.025]
              px-6
              py-16
              text-center
            ">
              <div className="
                mx-auto
                mb-5
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-white/5
                text-2xl
              ">
                ❤️
              </div>

              <h3 className="
                text-xl
                font-bold
              ">
                No matches found
              </h3>

              <p className="
                mx-auto
                mt-2
                max-w-md
                text-sm
                text-slate-500
              ">
                Try another filter or
                search.
              </p>
            </div>
          )}

{/* MATCH GRID */}

{!loading &&
  !error &&
  filteredMatches.length > 0 && (
<MatchGrid
  matches={filteredMatches}
  sendingId={sendingId}
  datingActive={datingActive}
  onConnect={sendConnection}
  onViewProfile={setSelectedProfile}
/>
  )}

      </section>

      {/* PROFILE */}

{selectedProfile && (
  <DatingProfileModal
    person={selectedProfile}
    sending={
      sendingId ===
      selectedProfile.id
    }
    datingActive={datingActive}
    onClose={() =>
      setSelectedProfile(null)
    }
    onConnect={
      sendConnection
    }
  />
)}

    </main>
  )
}