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
  const rawPhone = profile?.phone || "+254700000000"
  const cleanPhone = rawPhone.replace(/\s+/g, "")

  const websiteUrl = profile?.website || "streetgo.app"
  const formattedUrl = websiteUrl.startsWith("http")
    ? websiteUrl
    : `https://${websiteUrl}`

  const userEmail = profile?.email || "support@streetgo.app"

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-[10px]">

      <div className="flex items-center gap-1.5 min-w-0 group">
        <MapPin
          size={11}
          className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors"
        />
        <span className="text-zinc-400 truncate">
          {profile?.location || "Kirinyaga baricho"}
        </span>
      </div>

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
          {websiteUrl}
        </a>
      </div>

      <div className="flex items-center gap-1.5 min-w-0 group">
        <Phone
          size={11}
          className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors"
        />
        <a
          href={`tel:${cleanPhone}`}
          className="text-zinc-400 hover:text-sky-400 transition-colors truncate"
        >
          {rawPhone}
        </a>
      </div>

      <div className="flex items-center gap-1.5 min-w-0 group">
        <Mail
          size={11}
          className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors"
        />
        <a
          href={`mailto:${userEmail}`}
          className="text-zinc-400 hover:text-zinc-100 transition-colors truncate"
        >
          {userEmail}
        </a>
      </div>

    </div>
  )
}