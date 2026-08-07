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
{/* Container Frame: Rendered as a zero-weight invisible layer that only acts as a micro-structural layout grid */}
<div className="md:col-span-5 flex flex-col gap-2 w-full max-w-sm bg-transparent border-none p-0 shadow-none backdrop-blur-none transition-none">
  
  {/* Segment Header */}
  <div className="w-full opacity-90 transition-opacity duration-200 hover:opacity-100">
    <WalletHeader />
  </div>

  {/* Balance Matrix */}
  <div className="w-full">
    <WalletBalance wallet={wallet} />
  </div>

  {/* Control System Matrix */}
  <div className="w-full mt-0.5">
    <WalletActions
      onTopUp={onTopUp}
      onSend={onSend}
      onTopUpReax={() => setShowTopUpReax(true)}
      onWithdrawReax={() => setShowWithdrawReax(true)}
    />
  </div>

  {/* Footer Security Baseline */}
  <div className="w-full mt-1 border-t border-[#1a1a1a]/40 pt-2 opacity-60">
    <WalletSecurity />
  </div>

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