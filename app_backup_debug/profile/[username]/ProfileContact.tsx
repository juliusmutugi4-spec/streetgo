"use client"

interface Props {
  profile: any
}

import {
  MapPin,
  Link2,
  Mail,
  Phone,
} from "lucide-react"

export default function ProfileContact({ profile }: Props) {
  const phone = profile?.phone?.trim()
  const website = profile?.website?.trim()
  const email = profile?.email?.trim()
  const location = profile?.location?.trim()

  const formattedUrl = website
    ? website.startsWith("http://") || website.startsWith("https://")
      ? website
      : `https://${website}`
    : ""

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-[10px]">

      {location && (
        <div className="flex items-center gap-1.5 min-w-0 group">
          <MapPin
            size={11}
            className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors"
          />
          <span className="text-zinc-400 truncate">
            {location}
          </span>
        </div>
      )}

      {website && (
        <div className="flex items-center gap-1.5 min-w-0 group">
          <Link2
            size={11}
            className="text-zinc-600 shrink-0 group-hover:text-sky-400 transition-colors"
          />
          <a
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 transition-colors truncate font-medium underline-offset-2 hover:underline"
          >
            {website}
          </a>
        </div>
      )}

      {phone && (
        <div className="flex items-center gap-1.5 min-w-0 group">
          <Phone
            size={11}
            className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors"
          />
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className="text-zinc-400 hover:text-sky-400 transition-colors truncate"
          >
            {phone}
          </a>
        </div>
      )}

      {email && (
        <div className="flex items-center gap-1.5 min-w-0 group">
          <Mail
            size={11}
            className="text-zinc-600 shrink-0 group-hover:text-zinc-100 transition-colors"
          />
          <a
            href={`mailto:${email}`}
            className="text-zinc-400 hover:text-zinc-100 transition-colors truncate"
          >
            {email}
          </a>
        </div>
      )}

    </div>
  )
}