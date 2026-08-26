"use client"

import {
  MapPin,
  ShieldCheck,
} from "lucide-react"

interface MatchIdentityProps {
  name: string
  age?: number
  location?: string
  reputation?: number
}

export default function MatchIdentity({
  name,
  age,
  location,
  reputation = 0,
}: MatchIdentityProps) {
  const isTrusted = reputation >= 20

  return (
    <div className="min-w-0">

      {/* NAME */}

      <div className="flex items-center gap-2">

        <h2
          className="
            truncate
            text-3xl
            font-black
            tracking-tight
            text-white
            drop-shadow-lg
          "
        >
          {name}
        </h2>

        {isTrusted && (
          <span
            className="
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-emerald-400
            "
          >
            <ShieldCheck
              className="
                h-3.5
                w-3.5
                text-black
              "
            />
          </span>
        )}

      </div>


      {/* AGE + LOCATION */}

      {(age || location) && (
        <div
          className="
            mt-1
            flex
            flex-wrap
            items-center
            gap-2
            text-sm
            text-white/80
          "
        >

          {age && (
            <span>
              {age}
            </span>
          )}

          {age && location && (
            <span className="text-white/40">
              •
            </span>
          )}

          {location && (
            <span
              className="
                flex
                items-center
                gap-1
              "
            >
              <MapPin
                className="h-3.5 w-3.5"
              />

              {location}
            </span>
          )}

        </div>
      )}

    </div>
  )
}