'use client'

import { Wallet } from 'lucide-react'

interface Props {
  profile: any
}

export default function ProfileWallet({ profile }: Props) {
  return (
    <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">

      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-emerald-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
          StreetGO Credit
        </h3>
      </div>

      <div className="space-y-3">

        <div>
          <p className="text-[11px] text-zinc-500 uppercase">
            Balance
          </p>

          <p className="text-2xl font-black text-white">
            KSh 0
          </p>
        </div>

<div className="grid grid-cols-3 gap-2 mt-4">

  <button className="rounded-lg border border-emerald-800 bg-emerald-500/10 py-2 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition">
    Top Up
  </button>

  <button className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-[11px] font-semibold text-white hover:bg-zinc-800 transition">
    Transfer
  </button>

  <button className="rounded-lg border border-zinc-800 bg-zinc-900 py-2 text-[11px] font-semibold text-white hover:bg-zinc-800 transition">
    History
  </button>

</div>


        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-xs text-zinc-400">
            Top up your StreetGO Credit using M-Pesa to unlock premium features.
          </p>
        </div>

      </div>

    </div>
  )
}