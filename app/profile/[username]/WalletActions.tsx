'use client'

import ReaxMenu from "./ReaxMenu"
import { Plus, ArrowUpRight, WalletCards } from "lucide-react"

interface Props {
  onTopUp: () => void
  onSend: () => void
  onWithdraw: () => void
  onTopUpReax: () => void
  onWithdrawReax: () => void
}

export default function WalletActions({
  onTopUp,
  onSend,
  onWithdraw,
  onTopUpReax,
  onWithdrawReax,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-1.5">

      {/* TOP UP */}
      <button
        onClick={onTopUp}
        className="group flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 py-2 text-[10px] font-bold tracking-wide transition-all duration-200 shadow-md shadow-emerald-950/20 cursor-pointer"
      >
        <Plus
          size={12}
          strokeWidth={2.5}
          className="transition-transform group-hover:scale-110"
        />
        <span className="truncate">Top Up</span>
      </button>

      {/* TRANSFER */}
      <button
        onClick={onSend}
        className="group flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 active:scale-[0.98] border border-slate-800 hover:border-slate-700/80 text-slate-200 py-2 text-[10px] font-semibold tracking-wide transition-all duration-200 cursor-pointer"
      >
        <ArrowUpRight
          size={11}
          strokeWidth={2.5}
          className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
        <span className="truncate">Transfer</span>
      </button>

      {/* WITHDRAW */}
      <button
        onClick={onWithdraw}
        className="group flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] border border-zinc-800 hover:border-zinc-700 text-zinc-200 py-2 text-[10px] font-semibold tracking-wide transition-all duration-200 cursor-pointer"
      >
        <WalletCards
          size={11}
          strokeWidth={2.3}
          className="text-zinc-400 transition-transform group-hover:scale-110"
        />
        <span className="truncate">Withdraw</span>
      </button>

      {/* REAX MENU */}
      <div className="relative col-span-3">
        <ReaxMenu
          onTopUpReax={onTopUpReax}
          onWithdrawToWallet={onWithdrawReax}
          onViewProgress={() => {
            window.location.href = "/reax"
          }}
        />
      </div>

    </div>
  )
}