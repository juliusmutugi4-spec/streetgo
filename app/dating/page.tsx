"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../lib/supabase"
import DatingRequests from "../components/DatingRequests"

interface Match {
  id: string
  name: string
  avatar: string | null
  score: number
  reasons: string[]
  connectionStatus: "none" | "pending" | "accepted"
  headline?: string | null
  location?: string | null
  age?: number | null
  gender?: string | null
  interests?: string[]
  personality?: string | null
  lookingFor?: string | null
  reputation?: number
  profileType?: "Dating" | "Business" | "Job"
}

type FilterType = "All" | "High Match" | "New"

export default function DatingPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [activeFilter, setActiveFilter] =
    useState<FilterType>("All")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [currentUserName, setCurrentUserName] =
    useState("")

  const [sendingId, setSendingId] =
    useState<string | null>(null)

  const [selectedProfile, setSelectedProfile] =
    useState<Match | null>(null)

  // --------------------------------------------------
  // CONNECTION STATUS
  // --------------------------------------------------

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

      return "none"
    } catch (error) {
      console.error(
        "Connection status error:",
        error
      )

      return "none"
    }
  }

  // --------------------------------------------------
  // LOAD MATCHES
  // --------------------------------------------------

  async function loadMatches() {
    try {
      setLoading(true)
      setError("")

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError(
          "Please sign in to view your matches."
        )
        setLoading(false)
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

      if (!profile?.dating_active) {
        window.location.href =
          "/dating/setup"
        return
      }

      const engineUrl =
        process.env
          .NEXT_PUBLIC_MATCH_ENGINE_URL

      if (!engineUrl) {
        setError(
          "Dating engine is not configured."
        )
        setLoading(false)
        return
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
                  "StreetGO Member",

                avatar:
                  person.avatar || null,

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
                  person.location ||
                  "Kenya",

                age:
                  typeof person.age ===
                  "number"
                    ? person.age
                    : null,

                gender:
                  person.gender || null,

                interests:
                  Array.isArray(
                    person.interests
                  )
                    ? person.interests
                    : [],

                personality:
                  person.personality ||
                  null,

                lookingFor:
                  person.looking_for ||
                  person.lookingFor ||
                  null,

                reputation:
                  Number(
                    person.reputation
                  ) || 0,

                profileType:
                  "Dating",
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

  // --------------------------------------------------
  // SEND CONNECTION
  // --------------------------------------------------

  async function sendConnection(
    receiverId: string
  ) {
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
            "Unable to send request."
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

      if (
        selectedProfile?.id ===
        receiverId
      ) {
        setSelectedProfile(prev =>
          prev
            ? {
                ...prev,
                connectionStatus:
                  "pending",
              }
            : null
        )
      }
    } catch (error) {
      console.error(
        "Connection error:",
        error
      )

      alert(
        error instanceof Error
          ? error.message
          : "Unable to send request."
      )
    } finally {
      setSendingId(null)
    }
  }

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

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

    if (search.trim()) {
      const query =
        search.toLowerCase().trim()

      result = result.filter(person => {
        const name =
          person.name.toLowerCase()

        const location =
          (
            person.location || ""
          ).toLowerCase()

        const headline =
          (
            person.headline || ""
          ).toLowerCase()

        return (
          name.includes(query) ||
          location.includes(query) ||
          headline.includes(query)
        )
      })
    }

    return result
  }, [
    matches,
    activeFilter,
    search,
  ])

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  function getMatchLabel(
    score: number
  ) {
    if (score >= 90) {
      return "Exceptional match"
    }

    if (score >= 80) {
      return "Strong match"
    }

    if (score >= 70) {
      return "Good match"
    }

    if (score >= 50) {
      return "Potential match"
    }

    return "Explore connection"
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        word =>
          word[0]?.toUpperCase() || ""
      )
      .join("")
  }

  // --------------------------------------------------
  // PAGE
  // --------------------------------------------------

  return (
    <main className="
      min-h-screen
      bg-[#05070d]
      text-white
    ">

      {/* HEADER */}

      <header className="
        sticky
        top-0
        z-40
        border-b
        border-white/10
        bg-[#05070d]/90
        backdrop-blur-xl
      ">
        <div className="
          mx-auto
          flex
          max-w-7xl
          items-center
          justify-between
          px-5
          py-4
          sm:px-8
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-rose-500
              to-pink-700
              text-xl
              shadow-lg
              shadow-rose-500/20
            ">
              ❤️
            </div>

            <div>
              <h1 className="
                text-lg
                font-black
              ">
                StreetGO
              </h1>

              <p className="
                text-[11px]
                text-slate-500
              ">
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

      <section className="
        border-b
        border-white/5
      ">

        <div className="
          mx-auto
          max-w-7xl
          px-5
          py-10
          sm:px-8
        ">

          <div className="max-w-3xl">

            <div className="
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
            ">

<span className="
  h-1.5
  w-1.5
  rounded-full
  bg-emerald-400
"/>

              Private dating space

            </div>

            <h2 className="
              text-3xl
              font-black
              leading-tight
              sm:text-5xl
            ">

              Meaningful connections,

              <span className="
                block
                bg-gradient-to-r
                from-rose-400
                via-pink-400
                to-purple-400
                bg-clip-text
                text-transparent
              ">
                matched with intention.
              </span>

            </h2>

            <p className="
              mt-4
              max-w-2xl
              text-sm
              leading-6
              text-slate-400
              sm:text-base
            ">
              Welcome back,{" "}
              <span className="text-white">
                {currentUserName}
              </span>
              . Discover people whose interests,
              personality and relationship goals
              may align with yours.
            </p>

          </div>

          <div className="
            mt-7
            grid
            gap-3
            sm:grid-cols-3
          ">

            <TrustItem
              icon="🛡️"
              title="Profile-first"
              text="Know who you are connecting with."
            />

            <TrustItem
              icon="🔒"
              title="Your choice"
              text="Connections begin when both people agree."
            />

            <TrustItem
              icon="✨"
              title="Compatibility"
              text="Recommendations use shared signals."
            />

          </div>

        </div>

      </section>

      {/* CONTENT */}

      <section className="
        mx-auto
        max-w-7xl
        px-5
        py-7
        sm:px-8
      ">

        {/* SEARCH */}

        <div className="
          mb-7
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        ">

          <div className="
            flex
            flex-wrap
            gap-2
          ">

            {(
              [
                "All",
                "High Match",
                "New",
              ] as FilterType[]
            ).map(filter => (

              <button
                key={filter}
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
                  ${
                    activeFilter ===
                    filter
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
            onChange={e =>
              setSearch(
                e.target.value
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
          <div className="
            mb-7
            rounded-2xl
            border
            border-red-500/20
            bg-red-500/5
            p-5
          ">

            <p className="
              font-bold
              text-red-300
            ">
              We couldn't load your matches
            </p>

            <p className="
              mt-1
              text-sm
              text-red-300/70
            ">
              {error}
            </p>

            <button
              onClick={loadMatches}
              className="
                mt-3
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
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
          ">

            {[1, 2, 3, 4, 5, 6].map(
              item => (
                <LoadingCard
                  key={item}
                />
              )
            )}

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          filteredMatches.length ===
            0 && (

            <div className="
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
                Try another filter or search.
              </p>

            </div>
          )}

        {/* MATCHES */}

        {!loading &&
          !error &&
          filteredMatches.length >
            0 && (

            <>

              <div className="
                mb-4
              ">

                <p className="
                  text-sm
                  font-semibold
                ">
                  Recommended for you
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-slate-500
                ">
                  {filteredMatches.length} potential{" "}
                  {filteredMatches.length === 1
                    ? "connection"
                    : "connections"}
                </p>

              </div>

              <div className="
                grid
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
              ">

                {filteredMatches.map(
                  person => (
                    <MatchCard
                      key={person.id}
                      person={person}
                      sending={
                        sendingId ===
                        person.id
                      }
                      onConnect={
                        sendConnection
                      }
                      onChat={id =>
                        (window.location.href =
                          `/messages?user=${id}`)
                      }
                      onView={() =>
                        setSelectedProfile(
                          person
                        )
                      }
                      getMatchLabel={
                        getMatchLabel
                      }
                      getInitials={
                        getInitials
                      }
                    />
                  )
                )}

              </div>

            </>
          )}

      </section>

      {/* PROFILE MODAL */}

      {selectedProfile && (
        <ProfileModal
          person={selectedProfile}
          sending={
            sendingId ===
            selectedProfile.id
          }
          onClose={() =>
            setSelectedProfile(null)
          }
          onConnect={
            sendConnection
          }
          onChat={id =>
            (window.location.href =
              `/messages?user=${id}`)
          }
          getInitials={
            getInitials
          }
        />
      )}

    </main>
  )
}

// ==================================================
// TRUST ITEM
// ==================================================

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-white/10
      bg-white/[0.025]
      p-4
    ">

      <div className="
        flex
        items-center
        gap-3
      ">

        <span className="text-lg">
          {icon}
        </span>

        <div>

          <p className="
            text-xs
            font-bold
          ">
            {title}
          </p>

          <p className="
            mt-1
            text-[11px]
            leading-4
            text-slate-500
          ">
            {text}
          </p>

        </div>

      </div>

    </div>
  )
}

// ==================================================
// MATCH CARD
// ==================================================

function MatchCard({
  person,
  sending,
  onConnect,
  onChat,
  onView,
  getMatchLabel,
  getInitials,
}: {
  person: Match
  sending: boolean
  onConnect: (
    id: string
  ) => void
  onChat: (
    id: string
  ) => void
  onView: () => void
  getMatchLabel: (
    score: number
  ) => string
  getInitials: (
    name: string
  ) => string
}) {
  const connected =
    person.connectionStatus ===
    "accepted"

  const pending =
    person.connectionStatus ===
    "pending"

  const score = Math.max(
    0,
    Math.min(
      100,
      person.score
    )
  )

  return (
    <article className="
      overflow-hidden
      rounded-3xl
      border
      border-white/10
      bg-[#0b101c]
      shadow-xl
      transition
      hover:-translate-y-1
      hover:border-rose-400/30
    ">

      {/* COVER */}

      <div className="
        relative
        h-28
        bg-gradient-to-br
        from-rose-950
        via-purple-950
        to-slate-950
      ">

        <div className="
          absolute
          bottom-4
          left-5
          rounded-full
          border
          border-white/10
          bg-black/40
          px-3
          py-1
          text-[10px]
          font-bold
          text-rose-200
          backdrop-blur
        ">
          ❤️ Dating
        </div>

        <div className="
          absolute
          bottom-4
          right-5
          rounded-full
          bg-emerald-400/10
          px-3
          py-1
          text-[10px]
          font-semibold
          text-emerald-300
        ">
          ● Active
        </div>

      </div>

      <div className="px-5 pb-5">

        {/* AVATAR */}

        <div className="
          -mt-10
          flex
          items-end
          justify-between
        ">

          <div className="
            flex
            h-20
            w-20
            items-center
            justify-center
            overflow-hidden
            rounded-2xl
            border-4
            border-[#0b101c]
            bg-slate-800
          ">

            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <span className="
                text-xl
                font-black
                text-slate-300
              ">
                {getInitials(
                  person.name
                )}
              </span>
            )}

          </div>

          <span className="
            rounded-full
            border
            border-white/10
            bg-white/[0.04]
            px-3
            py-1.5
            text-[10px]
            font-bold
            text-slate-400
          ">
            {getMatchLabel(score)}
          </span>

        </div>

        {/* NAME */}

        <div className="mt-4">

          <div className="
            flex
            items-center
            gap-2
          ">

            <h3 className="
              text-xl
              font-black
            ">
              {person.name}
            </h3>

            {person.reputation &&
              person.reputation >= 20 && (
                <span className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-400/10
                  text-xs
                  text-emerald-400
                ">
                  ✓
                </span>
              )}

          </div>

          <p className="
            mt-1
            text-xs
            text-slate-500
          ">
            {[
              person.age
                ? `${person.age} years`
                : null,
              person.location,
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>

        </div>

        {/* HEADLINE */}

        <div className="
          mt-4
          rounded-xl
          border
          border-white/5
          bg-white/[0.025]
          p-3
        ">

          <p className="
            text-xs
            leading-5
            text-slate-300
          ">
            {person.headline}
          </p>

        </div>

        {/* SCORE */}

        <div className="mt-5">

          <div className="
            flex
            items-end
            justify-between
          ">

            <div>

              <p className="
                text-[9px]
                font-bold
                uppercase
                tracking-widest
                text-slate-600
              ">
                Compatibility
              </p>

              <p className="
                mt-1
                text-3xl
                font-black
              ">
                {score}%
              </p>

            </div>

            <span className="
              text-xs
              font-bold
              text-emerald-400
            ">
              {score >= 80
                ? "Strong"
                : score >= 60
                  ? "Good"
                  : "Potential"}
            </span>

          </div>

          <div className="
            mt-3
            h-1.5
            overflow-hidden
            rounded-full
            bg-white/5
          ">

            <div
              className="
                h-full
                rounded-full
                bg-gradient-to-r
                from-rose-500
                to-purple-500
              "
              style={{
                width: `${score}%`,
              }}
            />

          </div>

        </div>

        {/* WHY */}

        <div className="mt-5">

          <p className="
            text-[9px]
            font-bold
            uppercase
            tracking-widest
            text-slate-600
          ">
            Why you may connect
          </p>

          <div className="
            mt-3
            space-y-2
          ">

            {person.reasons
              .slice(0, 4)
              .map(
                (
                  reason,
                  index
                ) => (

                  <div
                    key={`${reason}-${index}`}
                    className="
                      flex
                      gap-2
                      text-xs
                      text-slate-400
                    "
                  >

                    <span className="
                      text-emerald-400
                    ">
                      ✓
                    </span>

                    <span>
                      {reason.replace(
                        "❤️ ",
                        ""
                      )}
                    </span>

                  </div>

                )
              )}

          </div>

        </div>

        {/* INTERESTS */}

        {person.interests &&
          person.interests.length >
            0 && (

            <div className="
              mt-5
              flex
              flex-wrap
              gap-2
            ">

              {person.interests
                .slice(0, 4)
                .map(interest => (

                  <span
                    key={interest}
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.025]
                      px-2.5
                      py-1
                      text-[10px]
                      text-slate-500
                    "
                  >
                    {interest}
                  </span>

                ))}

            </div>

          )}

        {/* VIEW PROFILE */}

        <button
          onClick={onView}
          className="
            mt-5
            w-full
            rounded-xl
            border
            border-white/10
            bg-white/[0.03]
            py-3
            text-xs
            font-bold
            text-slate-300
            transition
            hover:bg-white/[0.07]
            hover:text-white
          "
        >
          View full profile
        </button>

        {/* ACTION */}

        {connected ? (

          <button
            onClick={() =>
              onChat(person.id)
            }
            className="
              mt-2
              w-full
              rounded-xl
              bg-emerald-400/10
              py-3.5
              text-sm
              font-bold
              text-emerald-300
            "
          >
            💬 Continue conversation
          </button>

        ) : pending ? (

          <button
            disabled
            className="
              mt-2
              w-full
              rounded-xl
              bg-white/5
              py-3.5
              text-sm
              font-bold
              text-slate-500
            "
          >
            ⏳ Connection requested
          </button>

        ) : (

          <button
            disabled={sending}
            onClick={() =>
              onConnect(person.id)
            }
            className="
              mt-2
              w-full
              rounded-xl
              bg-white
              py-3.5
              text-sm
              font-black
              text-black
              transition
              hover:bg-rose-50
              disabled:opacity-50
            "
          >
            {sending
              ? "Sending..."
              : "❤️ Request connection"}
          </button>

        )}

        <p className="
          mt-3
          text-center
          text-[9px]
          text-slate-600
        ">
          No conversation starts until both
          people agree to connect.
        </p>

      </div>

    </article>
  )
}

// ==================================================
// PROFILE MODAL
// ==================================================

function ProfileModal({
  person,
  sending,
  onClose,
  onConnect,
  onChat,
  getInitials,
}: {
  person: Match
  sending: boolean
  onClose: () => void
  onConnect: (
    id: string
  ) => void
  onChat: (
    id: string
  ) => void
  getInitials: (
    name: string
  ) => string
}) {
  const connected =
    person.connectionStatus ===
    "accepted"

  const pending =
    person.connectionStatus ===
    "pending"

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/80
        p-4
        backdrop-blur-md
      "
      onClick={onClose}
    >

      <div
        onClick={e =>
          e.stopPropagation()
        }
        className="
          max-h-[90vh]
          w-full
          max-w-lg
          overflow-y-auto
          rounded-3xl
          border
          border-white/10
          bg-[#0b101c]
          shadow-2xl
        "
      >

        {/* COVER */}

        <div className="
          relative
          h-36
          bg-gradient-to-br
          from-rose-950
          via-purple-950
          to-slate-950
        ">

          <button
            onClick={onClose}
            className="
              absolute
              right-4
              top-4
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-black/40
              text-white
              backdrop-blur
            "
          >
            ✕
          </button>

        </div>

        <div className="px-6 pb-6">

          {/* AVATAR */}

          <div className="
            -mt-12
            flex
            h-24
            w-24
            items-center
            justify-center
            overflow-hidden
            rounded-3xl
            border-4
            border-[#0b101c]
            bg-slate-800
          ">

            {person.avatar ? (
              <img
                src={person.avatar}
                alt={person.name}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <span className="
                text-2xl
                font-black
              ">
                {getInitials(
                  person.name
                )}
              </span>
            )}

          </div>

          <h2 className="
            mt-5
            text-2xl
            font-black
          ">
            {person.name}
          </h2>

          <p className="
            mt-1
            text-sm
            text-slate-500
          ">
            {[
              person.age
                ? `${person.age} years`
                : null,
              person.location,
            ]
              .filter(Boolean)
              .join(" • ")}
          </p>

          <div className="
            mt-5
            rounded-2xl
            border
            border-rose-400/10
            bg-rose-400/5
            p-4
          ">

            <p className="
              text-xs
              font-bold
              text-rose-300
            ">
              {person.score}% compatibility
            </p>

            <p className="
              mt-2
              text-sm
              leading-6
              text-slate-400
            ">
              {person.headline}
            </p>

          </div>

          {/* REASONS */}

          <div className="mt-6">

            <h3 className="
              text-sm
              font-bold
            ">
              Why StreetGO matched you
            </h3>

            <div className="
              mt-3
              space-y-3
            ">

              {person.reasons.map(
                (
                  reason,
                  index
                ) => (

                  <div
                    key={`${reason}-${index}`}
                    className="
                      flex
                      gap-3
                      rounded-xl
                      border
                      border-white/5
                      bg-white/[0.02]
                      p-3
                    "
                  >

                    <span className="
                      text-emerald-400
                    ">
                      ✓
                    </span>

                    <span className="
                      text-sm
                      text-slate-400
                    ">
                      {reason.replace(
                        "❤️ ",
                        ""
                      )}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

          {/* INTERESTS */}

          {person.interests &&
            person.interests.length >
              0 && (

              <div className="mt-6">

                <h3 className="
                  text-sm
                  font-bold
                ">
                  Interests
                </h3>

                <div className="
                  mt-3
                  flex
                  flex-wrap
                  gap-2
                ">

                  {person.interests.map(
                    interest => (

                      <span
                        key={interest}
                        className="
                          rounded-full
                          bg-white/5
                          px-3
                          py-1.5
                          text-xs
                          text-slate-400
                        "
                      >
                        {interest}
                      </span>

                    )
                  )}

                </div>

              </div>

            )}

          {/* ACTION */}

          {connected ? (

            <button
              onClick={() =>
                onChat(person.id)
              }
              className="
                mt-7
                w-full
                rounded-xl
                bg-emerald-400
                py-4
                text-sm
                font-black
                text-black
              "
            >
              💬 Continue conversation
            </button>

          ) : pending ? (

            <button
              disabled
              className="
                mt-7
                w-full
                rounded-xl
                bg-white/5
                py-4
                text-sm
                font-bold
                text-slate-500
              "
            >
              ⏳ Request already sent
            </button>

          ) : (

            <button
              disabled={sending}
              onClick={() =>
                onConnect(person.id)
              }
              className="
                mt-7
                w-full
                rounded-xl
                bg-white
                py-4
                text-sm
                font-black
                text-black
              "
            >
              {sending
                ? "Sending..."
                : "❤️ Request connection"}
            </button>

          )}

          <p className="
            mt-4
            text-center
            text-[10px]
            leading-5
            text-slate-600
          ">
            StreetGO connections are mutual.
            You remain in control of who you
            communicate with.
          </p>

        </div>

      </div>

    </div>
  )
}

// ==================================================
// LOADING CARD
// ==================================================
function LoadingCard() {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/5
        bg-[#0b101c]
      "
    >
      <div
        className="
          h-28
          animate-pulse
          bg-white/5
        "
      />

      <div className="p-5">
        <div
          className="
            -mt-10
            h-20
            w-20
            animate-pulse
            rounded-2xl
            bg-slate-800
          "
        />

        <div
          className="
            mt-5
            h-5
            w-32
            animate-pulse
            rounded
            bg-slate-800
          "
        />

        <div
          className="
            mt-3
            h-3
            w-24
            animate-pulse
            rounded
            bg-slate-800
          "
        />

        <div
          className="
            mt-5
            h-16
            animate-pulse
            rounded-xl
            bg-slate-800
          "
        />

        <div
          className="
            mt-5
            h-8
            w-20
            animate-pulse
            rounded
            bg-slate-800
          "
        />

        <div className="mt-4 space-y-2">
          <div
            className="
              h-3
              animate-pulse
              rounded
              bg-slate-800
            "
          />

          <div
            className="
              h-3
              w-4/5
              animate-pulse
              rounded
              bg-slate-800
            "
          />
        </div>

        <div
          className="
            mt-6
            h-12
            animate-pulse
            rounded-xl
            bg-slate-800
          "
        />
      </div>
    </div>
  )
}