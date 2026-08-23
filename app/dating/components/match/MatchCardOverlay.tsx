"use client"

import {
  MapPin,
  ShieldCheck,
} from "lucide-react"

import type { MatchCardPerson } from "../MatchCard"

interface MatchCardOverlayProps {
  person: MatchCardPerson
}

export default function MatchCardOverlay({
  person,
}: MatchCardOverlayProps) {
  const isTrusted =
    (person.reputation ?? 0) >= 20

  return (
    <>
      {/* ===================================================
          DARK GRADIENT
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-black/95
          via-black/20
          to-transparent
        "
      />

      {/* ===================================================
          PROFILE TYPE
      =================================================== */}

      <div
        className="
          absolute
          left-2.5
          top-2.5
          rounded-full
          border
          border-white/15
          bg-black/40
          px-2
          py-1
          text-[9px]
          font-bold
          text-white
          backdrop-blur-md
          sm:px-2.5
          sm:text-[10px]
        "
      >
        ❤️{" "}
        {person.profileType || "Dating"}
      </div>

      {/* ===================================================
          ONLINE
      =================================================== */}

      {person.isOnline && (
        <div
          className="
            absolute
            right-2.5
            top-2.5
            flex
            items-center
            gap-1
            rounded-full
            border
            border-emerald-400/20
            bg-black/40
            px-2
            py-1
            text-[9px]
            font-bold
            text-emerald-300
            backdrop-blur-md
            sm:text-[10px]
          "
        >
          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-400
              shadow-[0_0_8px_rgba(52,211,153,0.8)]
            "
          />

          Online
        </div>
      )}

      {/* ===================================================
          BOTTOM INFORMATION
      =================================================== */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          p-2.5
          sm:p-3
        "
      >
        {/* SCORE */}

        <div
          className="
            mb-1.5
            inline-flex
            items-center
            rounded-full
            border
            border-emerald-400/20
            bg-black/40
            px-2
            py-0.5
            text-[10px]
            font-black
            text-emerald-300
            backdrop-blur-md
            sm:text-xs
          "
        >
          {person.score}%

          <span
            className="
              ml-1
              text-[8px]
              font-semibold
              text-emerald-400/70
            "
          >
            match
          </span>
        </div>

        {/* NAME */}

        <div
          className="
            flex
            items-center
            gap-1
          "
        >
          <h2
            className="
              truncate
              text-base
              font-black
              tracking-tight
              text-white
              drop-shadow-lg
              sm:text-lg
            "
          >
            {person.name}
          </h2>

          {isTrusted && (
            <span
              className="
                flex
                h-4
                w-4
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-emerald-400
              "
            >
              <ShieldCheck
                className="
                  h-3
                  w-3
                  text-black
                "
              />
            </span>
          )}
        </div>

        {/* AGE + LOCATION */}

        <div
          className="
            mt-0.5
            flex
            min-w-0
            items-center
            gap-1
            text-[10px]
            text-white/75
            sm:text-xs
          "
        >
          {person.age != null && (
            <span>
              {person.age}
            </span>
          )}

          {person.age != null &&
            person.location && (
              <span className="text-white/40">
                •
              </span>
            )}

          {person.location && (
            <span
              className="
                flex
                min-w-0
                items-center
                gap-0.5
              "
            >
              <MapPin
                className="
                  h-3
                  w-3
                  shrink-0
                "
              />

              <span className="truncate">
                {person.location}
              </span>
            </span>
          )}
        </div>
      </div>
    </>
  )
}