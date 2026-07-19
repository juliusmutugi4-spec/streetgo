'use client'

import { ArrowLeft, MoreHorizontal, Crown } from "lucide-react"

interface Props {
  coverUrl?: string | null
}

export default function ProfileCover({
  coverUrl,
}: Props) {
  return (
    <div className="relative h-[360px] overflow-hidden">

   <img
  src={coverUrl || "/cover.jpg"}
  alt="cover"
  className="
    absolute
    inset-0
    w-full
    h-full
    object-cover
    scale-110
    brightness-75
    saturate-150
    contrast-125
    transition-all
    duration-700
  "
/>

      <div className="absolute inset-0 bg-black/45" />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070b12]" />

      <div className="absolute top-6 left-6">

        <button
          className="
            w-12
            h-12
            rounded-full
            bg-black/40
            backdrop-blur-md
            flex
            items-center
            justify-center
            border
            border-white/10
          "
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

      </div>

      <div className="absolute top-6 right-6">

        <button
          className="
            w-12
            h-12
            rounded-full
            bg-black/40
            backdrop-blur-md
            flex
            items-center
            justify-center
            border
            border-white/10
          "
        >
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>

      </div>

      <div
        className="
          absolute
          left-8
          bottom-20
          inline-flex
          items-center
          gap-2
          rounded-full
          bg-yellow-500
          px-4
          py-2
          text-black
          font-bold
          shadow-xl
        "
      >
        <Crown className="w-4 h-4" />

        Elite Creator

      </div>

      <svg
        className="absolute bottom-0 w-full"
        viewBox="0 0 1440 170"
        preserveAspectRatio="none"
      >
        <path
          fill="#070b12"
          d="
            M0,80
            C250,170
            500,0
            720,80
            C950,170
            1200,20
            1440,120
            L1440,170
            L0,170
            Z
          "
        />
      </svg>

    </div>
  )
}