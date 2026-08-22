"use client"

import {
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  X,
} from "lucide-react"

import type { MatchCardPerson } from "../components/MatchCard"

interface DatingProfileModalProps {
  person: MatchCardPerson & {
    personality?: string | null
    lookingFor?: string | null
  }
  sending?: boolean
  onClose: () => void
  onConnect: (id: string) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(word =>
      word.charAt(0).toUpperCase()
    )
    .join("")
}

export default function DatingProfileModal({
  person,
  sending = false,
  onClose,
  onConnect,
}: DatingProfileModalProps) {
  const connected =
    person.connectionStatus ===
    "accepted"

  const pending =
    person.connectionStatus ===
    "pending"

  const trusted =
    (person.reputation ?? 0) >= 20

  const score = Math.max(
    0,
    Math.min(
      100,
      person.score
    )
  )

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
        onClick={event =>
          event.stopPropagation()
        }
        className="
          max-h-[92vh]
          w-full
          max-w-xl
          overflow-y-auto
          rounded-[30px]
          border
          border-white/10
          bg-[#0b101c]
          shadow-2xl
        "
      >

        {/* PHOTO */}

        <div className="
          relative
          h-[380px]
          overflow-hidden
          bg-slate-900
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
            <div className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-rose-950
              via-purple-950
              to-slate-950
            ">
              <span className="
                text-6xl
                font-black
                text-white/80
              ">
                {getInitials(
                  person.name
                )}
              </span>
            </div>
          )}

          <div className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-52
            bg-gradient-to-t
            from-black
            via-black/40
            to-transparent
          " />

          <button
            type="button"
            onClick={onClose}
            className="
              absolute
              right-5
              top-5
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-white/10
              bg-black/50
              text-white
              backdrop-blur-xl
            "
            aria-label="Close profile"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="
            absolute
            bottom-6
            left-6
            right-6
          ">

            <div className="
              flex
              items-center
              gap-2
            ">
              <h2 className="
                text-3xl
                font-black
                text-white
              ">
                {person.name}
              </h2>

              {trusted && (
                <span className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-400
                ">
                  <ShieldCheck
                    className="
                      h-4
                      w-4
                      text-black
                    "
                  />
                </span>
              )}
            </div>

            <div className="
              mt-2
              flex
              flex-wrap
              gap-3
              text-sm
              text-white/80
            ">

              {person.age && (
                <span>
                  {person.age} years
                </span>
              )}

              {person.location && (
                <span className="
                  flex
                  items-center
                  gap-1
                ">
                  <MapPin className="
                    h-3.5
                    w-3.5
                  " />

                  {person.location}
                </span>
              )}

            </div>

          </div>

        </div>

        {/* BODY */}

        <div className="p-6">

          {/* HEADLINE */}

          {person.headline && (
            <p className="
              text-sm
              leading-6
              text-slate-300
            ">
              {person.headline}
            </p>
          )}

          {/* COMPATIBILITY */}

          <div className="
            mt-6
            rounded-2xl
            border
            border-emerald-400/10
            bg-emerald-400/[0.04]
            p-5
          ">

            <div className="
              flex
              items-end
              justify-between
            ">

              <div>
                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-slate-500
                ">
                  Compatibility
                </p>

                <p className="
                  mt-1
                  text-3xl
                  font-black
                  text-emerald-400
                ">
                  {score}%
                </p>
              </div>

              <span className="
                text-xs
                font-bold
                text-emerald-400
              ">
                {score >= 90
                  ? "Exceptional"
                  : score >= 80
                    ? "Strong"
                    : score >= 60
                      ? "Good"
                      : "Potential"}
              </span>

            </div>

            <div className="
              mt-4
              h-2
              overflow-hidden
              rounded-full
              bg-slate-800
            ">
              <div
                className="
                  h-full
                  rounded-full
                  bg-emerald-400
                "
                style={{
                  width: `${score}%`,
                }}
              />
            </div>

          </div>

          {/* REASONS */}

          {person.reasons.length > 0 && (
            <section className="mt-7">

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-500
              ">
                Why you matched
              </p>

              <div className="
                mt-3
                space-y-2
              ">
                {person.reasons.map(
                  (reason, index) => (
                    <div
                      key={`${reason}-${index}`}
                      className="
                        flex
                        gap-3
                        rounded-xl
                        border
                        border-white/5
                        bg-white/[0.025]
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

            </section>
          )}

          {/* INTERESTS */}

          {person.interests &&
            person.interests.length > 0 && (
              <section className="mt-7">

                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-slate-500
                ">
                  Interests
                </p>

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
                          border
                          border-white/10
                          bg-white/[0.03]
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

              </section>
            )}

          {/* PERSONALITY */}

          {person.personality && (
            <section className="mt-7">

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-500
              ">
                Personality
              </p>

              <p className="
                mt-3
                rounded-2xl
                border
                border-white/5
                bg-white/[0.025]
                p-4
                text-sm
                leading-6
                text-slate-400
              ">
                {person.personality}
              </p>

            </section>
          )}

          {/* LOOKING FOR */}

          {person.lookingFor && (
            <section className="mt-7">

              <p className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-slate-500
              ">
                Looking for
              </p>

              <p className="
                mt-3
                rounded-2xl
                border
                border-white/5
                bg-white/[0.025]
                p-4
                text-sm
                leading-6
                text-slate-400
              ">
                {person.lookingFor}
              </p>

            </section>
          )}

          {/* ACTION */}

          {connected ? (
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  `/messages?user=${person.id}`
              }}
              className="
                mt-8
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-400
                py-4
                text-sm
                font-black
                text-black
              "
            >
              <MessageCircle className="h-4 w-4" />
              Continue conversation
            </button>
          ) : pending ? (
            <button
              type="button"
              disabled
              className="
                mt-8
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white/5
                py-4
                text-sm
                font-bold
                text-slate-500
              "
            >
              Connection requested
            </button>
          ) : (
            <button
              type="button"
              disabled={sending}
              onClick={() =>
                onConnect(person.id)
              }
              className="
                mt-8
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-white
                py-4
                text-sm
                font-black
                text-black
                transition
                hover:bg-slate-200
                disabled:opacity-50
              "
            >
              <Heart className="h-4 w-4" />
              {sending
                ? "Sending..."
                : "Request connection"}
            </button>
          )}

          <p className="
            mt-4
            text-center
            text-[10px]
            leading-5
            text-slate-600
          ">
            Connection is mutual.
            You remain in control of
            who you communicate with.
          </p>

        </div>
      </div>
    </div>
  )
}