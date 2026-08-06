'use client'

import { useState } from "react"

import WalletHeader from "./WalletHeader"
import WalletBalance from "./WalletBalance"
import WalletActions from "./WalletActions"
import WalletSecurity from "./WalletSecurity"
import WalletModals from "./WalletModals"

interface Props {
  profile: any
  wallet: any
  refreshWallet: () => Promise<void>
  onTopUp: () => void
  onSend: () => void
}

export default function ProfileWallet({
  profile,
  wallet,
  refreshWallet,
  onTopUp,
  onSend,
}: Props) {
  const [showTopUpReax, setShowTopUpReax] = useState(false)
  const [showWithdrawReax, setShowWithdrawReax] = useState(false)

  return (
    <>
      <div className="md:col-span-5 rounded-2xl border border-slate-700/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-6 shadow-2xl shadow-slate-950/50 backdrop-blur-md">

        <WalletHeader />

        <WalletBalance wallet={wallet} />

        <WalletActions
          onTopUp={onTopUp}
          onSend={onSend}
          onTopUpReax={() => setShowTopUpReax(true)}
          onWithdrawReax={() => setShowWithdrawReax(true)}
        />

        <WalletSecurity />

      </div>

      <WalletModals
        profile={profile}
        refreshWallet={refreshWallet}
        showTopUpReax={showTopUpReax}
        setShowTopUpReax={setShowTopUpReax}
        showWithdrawReax={showWithdrawReax}
        setShowWithdrawReax={setShowWithdrawReax}
      />
    </>
  )
}