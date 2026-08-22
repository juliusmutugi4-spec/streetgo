"use client"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import DatingRequests from "../components/DatingRequests"

interface Match {
  id: string
  name: string
  avatar: string | null
  score: number
  reasons: string[]

  headline?: string
  location?: string

  profileType: "Dating" | "Business" | "Job"

  connectionStatus:
    | "none"
    | "pending"
    | "accepted"
}

type Tab = "All" | "Dating" | "Business" | "Job"

export default function DatingPage() {
  const [matches, setMatches] = useState<Match[]>([])

  const [activeTab, setActiveTab] = useState<Tab>("All")

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState("")


  // =====================================================
  // GET CONNECTION STATUS
  // =====================================================

  async function getConnectionStatus(userId: string) {
    try {
      const res = await fetch(
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

      if (!res.ok) {
        return "none"
      }

      const data = await res.json()

      return data.status || "none"
    } catch (error) {
      console.error(
        "CONNECTION STATUS ERROR:",
        error
      )

      return "none"
    }
  }


  // =====================================================
  // LOAD MATCHES
  // =====================================================

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError("")


        // -----------------------------------------------
        // AUTH
        // -----------------------------------------------

        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser()


        console.log(
          "AUTH USER ID:",
          user?.id
        )


        if (!user) {
          setError(
            "Please log in to use StreetGO Hub."
          )

          setLoading(false)

          return
        }


        // -----------------------------------------------
        // PROFILE
        // -----------------------------------------------

        const {
          data: profile,
          error: profileError,
        } = await supabase

          .from("profiles")

          .select(
            `
              dating_active,
              profile_mode,
              headline,
              profession,
              location,
              skills,
              experience,
              education,
              availability
            `
          )

          .eq(
            "id",
            user.id
          )

          .single()


        if (profileError) {
          console.error(
            "PROFILE ERROR:",
            profileError
          )
        }


        // -----------------------------------------------
        // DATING ACTIVATION
        // -----------------------------------------------

        if (!profile?.dating_active) {
          window.location.href =
            "/dating/setup"

          return
        }


        // -----------------------------------------------
        // MATCH ENGINE
        // -----------------------------------------------

        const engineUrl =
          process.env.NEXT_PUBLIC_MATCH_ENGINE_URL


        console.log(
          "MATCH ENGINE URL:",
          engineUrl
        )


        if (!engineUrl) {
          throw new Error(
            "NEXT_PUBLIC_MATCH_ENGINE_URL is missing."
          )
        }


        const res = await fetch(
          `${engineUrl}/matches/${user.id}`,
          {
            cache: "no-store",
          }
        )


        if (!res.ok) {
          throw new Error(
            `Match engine returned ${res.status}`
          )
        }


        const data = await res.json()


        console.log(
          "MATCH DATA FROM PYTHON:",
          data
        )


        // -----------------------------------------------
        // BUILD MATCHES
        // -----------------------------------------------

        const updated = await Promise.all(

          (data.matches || []).map(
            async (person: any) => {

              const status =
                await getConnectionStatus(
                  person.id
                )


              // -----------------------------------------
              // NORMALIZE PROFILE TYPE
              // -----------------------------------------

              let profileType:
                | "Dating"
                | "Business"
                | "Job" =
                "Dating"


              const rawType =
                person.profileType ||
                person.profile_mode ||
                "dating"


              if (
                rawType === "Business" ||
                rawType === "business"
              ) {
                profileType = "Business"
              }

              else if (
                rawType === "Job" ||
                rawType === "job"
              ) {
                profileType = "Job"
              }

              else {
                profileType = "Dating"
              }


              return {

                id:
                  person.id,

                name:
                  person.name ||
                  person.username ||
                  "StreetGO User",

                avatar:
                  person.avatar ||
                  person.avatar_url ||
                  null,

                score:
                  Number(person.score || 0),

                reasons:
                  Array.isArray(
                    person.reasons
                  )
                    ? person.reasons
                    : [],

                connectionStatus:
                  status as
                    | "none"
                    | "pending"
                    | "accepted",

                headline:
                  person.headline ||
                  "Building meaningful connections",

                location:
                  person.location ||
                  "Nairobi, Kenya",

                profileType,

              } satisfies Match
            }
          )
        )


        setMatches(updated)

      }

      catch (error) {

        console.error(
          "DATING PAGE ERROR:",
          error
        )

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load StreetGO Hub."
        )

      }

      finally {

        setLoading(false)

      }
    }


    load()

  }, [])


  // =====================================================
  // SEND CONNECTION
  // =====================================================

  async function sendConnection(
    id: string
  ) {

    try {

      const res =
        await fetch(
          "/api/connections",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              receiver_id: id,
            }),
          }
        )


      const data =
        await res.json()


      console.log(
        "CONNECTION:",
        data
      )


      if (!res.ok) {

        alert(
          data.error ||
          "Unable to send connection request."
        )

        return
      }


      setMatches(
        prev =>
          prev.map(
            person =>
              person.id === id
                ? {
                    ...person,

                    connectionStatus:
                      "pending",
                  }
                : person
          )
      )

    }

    catch (error) {

      console.error(
        "SEND CONNECTION ERROR:",
        error
      )

      alert(
        "Connection request failed."
      )

    }

  }


  // =====================================================
  // FILTER
  // =====================================================

  const filtered =
    matches.filter(
      person => {

        if (
          activeTab === "All"
        ) {
          return true
        }


        return (
          person.profileType ===
          activeTab
        )

      }
    )


  // =====================================================
  // UI
  // =====================================================

  return (

    <main
      className="
        min-h-screen
        bg-slate-950
        text-white
        pb-20
      "
    >

      {/* ================================================
          HEADER
      ================================================= */}

      <header
        className="
          sticky
          top-0
          z-40
          backdrop-blur-xl
          bg-slate-950/80
          border-b
          border-slate-800
          p-6
        "
      >

        <div
          className="
            max-w-6xl
            mx-auto
            flex
            justify-between
            items-center
          "
        >

          <div>

            <h1
              className="
                text-3xl
                font-black
                bg-gradient-to-r
                from-pink-500
                via-purple-500
                to-green-400
                bg-clip-text
                text-transparent
              "
            >
              StreetGO Hub
            </h1>


            <p
              className="
                text-slate-400
                text-sm
              "
            >
              Dating • Business • Careers
            </p>

          </div>


          {/* CONNECTION REQUESTS */}
          <DatingRequests />

        </div>

      </header>


      {/* ================================================
          CONTENT
      ================================================= */}

      <div
        className="
          max-w-6xl
          mx-auto
          p-6
        "
      >


        {/* ==============================================
            TABS
        =============================================== */}

        <div
          className="
            flex
            gap-3
            bg-slate-900
            p-2
            rounded-2xl
            mb-8
          "
        >

          {(
            [
              "All",
              "Dating",
              "Business",
              "Job",
            ] as Tab[]
          ).map(
            tab => (

              <button
                key={tab}

                onClick={() =>
                  setActiveTab(tab)
                }

                className={`
                  flex-1
                  py-3
                  rounded-xl
                  font-bold
                  transition
                  ${
                    activeTab === tab
                      ? "bg-white text-black shadow-lg"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }
                `}
              >

                {tab === "Dating"
                  ? "❤️ Dating"
                  : tab === "Business"
                  ? "💼 Business"
                  : tab === "Job"
                  ? "🎯 Jobs"
                  : "✨ All"}

              </button>

            )
          )}

        </div>


        {/* ==============================================
            LOADING
        =============================================== */}

        {loading && (

          <div
            className="
              text-center
              py-20
              text-slate-400
            "
          >

            <div
              className="
                text-4xl
                mb-4
              "
            >
              ✨
            </div>

            Loading StreetGO Hub...

          </div>

        )}


        {/* ==============================================
            ERROR
        =============================================== */}

        {!loading && error && (

          <div
            className="
              rounded-2xl
              border
              border-red-900
              bg-red-950/40
              p-6
              text-red-300
            "
          >

            <p className="font-bold mb-2">
              Unable to load Hub
            </p>

            <p className="text-sm">
              {error}
            </p>

          </div>

        )}


        {/* ==============================================
            EMPTY
        =============================================== */}

        {!loading &&
          !error &&
          filtered.length === 0 && (

            <div
              className="
                text-center
                py-20
                text-slate-400
              "
            >

              <div
                className="
                  text-5xl
                  mb-4
                "
              >
                🔎
              </div>

              <h2
                className="
                  text-xl
                  font-bold
                  text-white
                  mb-2
                "
              >
                No connections found
              </h2>

              <p>
                Try another section of StreetGO Hub.
              </p>

            </div>

          )}


        {/* ==============================================
            MATCH CARDS
        =============================================== */}

        {!loading &&
          !error &&
          filtered.length > 0 && (

            <div
              className="
                grid
                md:grid-cols-2
                lg:grid-cols-3
                gap-6
              "
            >

              {filtered.map(
                person => (

                  <div
                    key={person.id}

                    className="
                      rounded-3xl
                      bg-slate-900
                      border
                      border-slate-800
                      p-6
                      hover:border-purple-500
                      hover:-translate-y-1
                      transition
                      duration-200
                    "
                  >


                    {/* =================================
                        PROFILE HEADER
                    ================================== */}

                    <div
                      className="
                        flex
                        gap-4
                        items-center
                      "
                    >

                      <img
                        src={
                          person.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            person.name
                          )}`
                        }

                        alt={
                          person.name
                        }

                        className="
                          w-20
                          h-20
                          rounded-2xl
                          object-cover
                          border
                          border-slate-700
                        "
                      />


                      <div>

                        <h2
                          className="
                            text-xl
                            font-bold
                          "
                        >
                          {person.name}
                        </h2>


                        <p
                          className="
                            text-slate-400
                            text-sm
                          "
                        >
                          {person.location}
                        </p>


                        <span
                          className="
                            inline-block
                            mt-2
                            text-xs
                            font-bold
                            px-2
                            py-1
                            rounded-full
                            bg-slate-800
                            text-slate-300
                          "
                        >
                          {person.profileType}
                        </span>

                      </div>

                    </div>


                    {/* =================================
                        HEADLINE
                    ================================== */}

                    <div
                      className="
                        mt-5
                        text-sm
                        text-slate-300
                        min-h-[40px]
                      "
                    >
                      {person.headline}
                    </div>


                    {/* =================================
                        SCORE
                    ================================== */}

                    <div
                      className="
                        mt-5
                        text-green-400
                        font-black
                        text-3xl
                      "
                    >
                      {person.score}%
                    </div>


                    <p
                      className="
                        text-slate-400
                        text-sm
                      "
                    >
                      Compatibility
                    </p>


                    {/* =================================
                        REASONS
                    ================================== */}

                    <div
                      className="
                        mt-4
                        space-y-2
                      "
                    >

                      {person.reasons.map(
                        (reason, index) => (

                          <div
                            key={`${reason}-${index}`}
                            className="
                              text-sm
                              text-slate-300
                            "
                          >
                            ✓ {reason}
                          </div>

                        )
                      )}

                    </div>


                    {/* =================================
                        ACTION
                    ================================== */}

                    <button

                      disabled={
                        person.connectionStatus ===
                        "pending"
                      }

                      onClick={() => {

                        if (
                          person.connectionStatus ===
                          "accepted"
                        ) {

                          window.location.href =
                            `/messages?user=${person.id}`

                          return
                        }


                        sendConnection(
                          person.id
                        )

                      }}

                      className="
                        mt-6
                        w-full
                        rounded-xl
                        py-3
                        font-bold
                        bg-white
                        text-black
                        hover:bg-slate-200
                        disabled:bg-slate-700
                        disabled:text-slate-400
                        transition
                      "
                    >

                      {person.connectionStatus ===
                      "pending"

                        ? "⏳ Request Sent"

                        : person.connectionStatus ===
                          "accepted"

                        ? "💬 Open Chat"

                        : person.profileType ===
                          "Business"

                        ? "🤝 Network"

                        : person.profileType ===
                          "Job"

                        ? "🎯 Apply"

                        : "❤️ Connect"}

                    </button>


                  </div>

                )
              )}

            </div>

          )}

      </div>

    </main>

  )
}