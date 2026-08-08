'use client'

import {
  Mail,
  MessageCircle,
  Copy,
  MoreHorizontal,
  X,
  Check,
} from 'lucide-react'
import { useState } from 'react'

interface DispatchMenuProps {
  onClose: () => void
  postUrl: string
  postTitle?: string
}

export default function DispatchMenu({
  onClose,
  postUrl,
  postTitle = 'Check this out on StreetGO',
}: DispatchMenuProps) {
  const [copied, setCopied] = useState(false)

  // -----------------------------------------
  // WHATSAPP
  // -----------------------------------------
  const handleWhatsAppShare = async () => {
    let targetPhone = ''

    const supportsContacts =
      'contacts' in navigator && 'ContactsManager' in window

    if (supportsContacts) {
      try {
        const props = ['tel']

        const contacts = await (navigator as any).contacts.select(
          props,
          { multiple: false }
        )

        if (
          contacts &&
          contacts.length > 0 &&
          contacts[0].tel &&
          contacts[0].tel.length > 0
        ) {
          targetPhone = contacts[0].tel[0].replace(/[^0-9+]/g, '')
        }
      } catch (err) {
        console.warn('Contact picker cancelled:', err)
      }
    }

    const shareText = encodeURIComponent(
      `${postTitle}\n\n${postUrl}`
    )

    const whatsappUrl = targetPhone
      ? `https://wa.me/${targetPhone.replace('+', '')}?text=${shareText}`
      : `https://wa.me/?text=${shareText}`

    window.open(
      whatsappUrl,
      '_blank',
      'noopener,noreferrer'
    )

    onClose()
  }

  // -----------------------------------------
  // EMAIL
  // -----------------------------------------
  const handleEmailShare = () => {
    const subject = encodeURIComponent(postTitle)

    const body = encodeURIComponent(
      `Hello,\n\nI found something interesting on StreetGO and thought you might want to see it.\n\nOpen the post:\n${postUrl}\n\n— StreetGO`
    )

    window.location.href = `mailto:?subject=${subject}&body=${body}`

    onClose()
  }

  // -----------------------------------------
  // COPY LINK
  // -----------------------------------------
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
        onClose()
      }, 900)
    } catch (error) {
      console.error('COPY LINK ERROR:', error)
    }
  }

  // -----------------------------------------
  // NATIVE SHARE
  // -----------------------------------------
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StreetGO',
          text: postTitle,
          url: postUrl,
        })

        onClose()
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('NATIVE SHARE ERROR:', err)
        }
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-end
        justify-center
        bg-black/60
        backdrop-blur-[3px]
        animate-in
        fade-in
        duration-200
      "
      onClick={onClose}
    >
      {/* BOTTOM SHEET */}
      <div
        className="
          relative
          w-full
          max-w-2xl
          h-[25vh]
          min-h-[230px]
          max-h-[300px]
          rounded-t-[28px]
          bg-[#090b10]
          shadow-[0_-20px_70px_rgba(0,0,0,0.75)]
          animate-in
          slide-in-from-bottom
          duration-300
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP HANDLE */}
        <div className="flex justify-center pt-2.5">
          <div
            className="
              h-1
              w-10
              rounded-full
              bg-zinc-700
            "
          />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 pt-3 pb-3">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-white">
              Dispatch
            </h2>

            <p className="mt-0.5 text-[11px] text-zinc-500">
              Send this StreetGO post
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dispatch menu"
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-white/[0.05]
              text-zinc-500
              transition-all
              duration-200
              hover:bg-white/[0.09]
              hover:text-white
              active:scale-90
            "
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* SHARE OPTIONS */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-4">

          {/* WHATSAPP */}
          <button
            onClick={handleWhatsAppShare}
            className="
              group
              flex
              flex-col
              items-center
              justify-center
              gap-1.5
              rounded-2xl
              py-2.5
              transition-all
              duration-200
              hover:bg-emerald-500/[0.07]
              active:scale-95
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-emerald-500/10
                ring-1
                ring-emerald-500/10
                transition-all
                duration-200
                group-hover:scale-105
                group-hover:bg-emerald-500/20
                group-hover:ring-emerald-500/20
              "
            >
              <MessageCircle
                size={19}
                strokeWidth={2}
                className="text-emerald-400"
              />
            </div>

            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-200">
              WhatsApp
            </span>
          </button>

          {/* EMAIL */}
          <button
            onClick={handleEmailShare}
            className="
              group
              flex
              flex-col
              items-center
              justify-center
              gap-1.5
              rounded-2xl
              py-2.5
              transition-all
              duration-200
              hover:bg-cyan-500/[0.07]
              active:scale-95
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-cyan-500/10
                ring-1
                ring-cyan-500/10
                transition-all
                duration-200
                group-hover:scale-105
                group-hover:bg-cyan-500/20
                group-hover:ring-cyan-500/20
              "
            >
              <Mail
                size={19}
                strokeWidth={2}
                className="text-cyan-400"
              />
            </div>

            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-200">
              Email
            </span>
          </button>

          {/* COPY */}
          <button
            onClick={handleCopyLink}
            className="
              group
              flex
              flex-col
              items-center
              justify-center
              gap-1.5
              rounded-2xl
              py-2.5
              transition-all
              duration-200
              hover:bg-violet-500/[0.07]
              active:scale-95
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-violet-500/10
                ring-1
                ring-violet-500/10
                transition-all
                duration-200
                group-hover:scale-105
                group-hover:bg-violet-500/20
                group-hover:ring-violet-500/20
              "
            >
              {copied ? (
                <Check
                  size={19}
                  strokeWidth={2.5}
                  className="text-emerald-400"
                />
              ) : (
                <Copy
                  size={19}
                  strokeWidth={2}
                  className="text-violet-400"
                />
              )}
            </div>

            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-200">
              {copied ? 'Copied' : 'Copy link'}
            </span>
          </button>

          {/* MORE */}
          <button
            onClick={handleNativeShare}
            className="
              group
              flex
              flex-col
              items-center
              justify-center
              gap-1.5
              rounded-2xl
              py-2.5
              transition-all
              duration-200
              hover:bg-zinc-800/40
              active:scale-95
            "
          >
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-white/[0.04]
                ring-1
                ring-white/[0.05]
                transition-all
                duration-200
                group-hover:scale-105
                group-hover:bg-white/[0.08]
              "
            >
              <MoreHorizontal
                size={19}
                strokeWidth={2}
                className="text-zinc-400"
              />
            </div>

            <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-200">
              More
            </span>
          </button>
        </div>

        {/* SUBTLE BOTTOM LINE */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.04]" />
      </div>
    </div>
  )
}