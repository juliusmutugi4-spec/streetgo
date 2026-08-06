'use client'

import ProfileContact from "./ProfileContact"
import ProfileWallet from "./ProfileWallet"

import {
  Calendar,
  CheckCircle2,
} from "lucide-react"

interface Props {
  profile: any
  isOwner: boolean
  wallet: any
  refreshWallet: () => Promise<void>
  onTopUp: () => void
  onSend: () => void
}

export default function ProfileInfo({
  profile,
  isOwner,
  wallet,
  refreshWallet,
  onTopUp,
  onSend,
}: Props) {
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Jul 2026"

  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 font-sans antialiased text-zinc-300 selection:bg-sky-500/20 shadow-md">

      {/* ========================================== */}
      {/* MICRO HEADER ACTION RIBBON */}
      {/* ========================================== */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-2">

        <div className="flex items-center gap-1">

          {/* Compact Trust Badge */}
          <div className="flex items-center gap-0.5 bg-sky-500/5 border border-sky-500/20 rounded px-1.5 py-0.5 text-sky-400">
            <CheckCircle2
              size={9}
              className="fill-sky-400 text-zinc-950 shrink-0"
            />
            <span className="text-[8px] font-bold uppercase tracking-wider">
              {profile?.role === "driver"
                ? "Verified Pro"
                : "Verified"}
            </span>
          </div>

          {/* Secure Ping Indicator */}
          <div className="flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 rounded px-1 py-0.5 text-emerald-400 text-[8px] font-semibold uppercase tracking-wider">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
            </span>

            <span className="text-zinc-500 text-[7px]">
              Secure
            </span>
          </div>

        </div>

        {/* Join Date */}
        <div className="flex items-center gap-0.5 text-[9px] text-zinc-500 font-medium">
          <Calendar
            size={10}
            className="shrink-0 text-zinc-600"
          />
          <span>{joinDate}</span>
        </div>

      </div>

      {/* ========================================== */}
      {/* BODY */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">

        {/* Contact */}
        <div
          className={
            isOwner
              ? "md:col-span-7"
              : "md:col-span-12"
          }
        >
          <ProfileContact profile={profile} />
        </div>

        {/* Wallet (Owner Only) */}
        {isOwner && (
          <ProfileWallet
            profile={profile}
            wallet={wallet}
            refreshWallet={refreshWallet}
            onTopUp={onTopUp}
            onSend={onSend}
          />
        )}

      </div>

    </div>
  )
}