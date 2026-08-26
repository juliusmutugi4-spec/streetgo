'use client'

import { useState } from "react"

import WalletHeader from "./WalletHeader"
import WalletBalance from "./WalletBalance"
import WalletActions from "./WalletActions"
import WalletSecurity from "./WalletSecurity"
import WalletModals from "./WalletModals"
import Withdrawal from "./withdrawal"
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
  // REAX system
  const [showTopUpReax, setShowTopUpReax] = useState(false)
  const [showWithdrawReax, setShowWithdrawReax] = useState(false)

  // Real money withdrawal system
  const [showWithdraw, setShowWithdraw] = useState(false)

  return (
    <>
      <WalletHeader />

      <WalletBalance wallet={wallet} />

      <WalletActions
        onTopUp={onTopUp}
        onSend={onSend}
        onWithdraw={() => setShowWithdraw(true)}
        onTopUpReax={() => setShowTopUpReax(true)}
        onWithdrawReax={() => setShowWithdrawReax(true)}
      />

      <WalletSecurity />

      <WalletModals
        profile={profile}
        refreshWallet={refreshWallet}
        showTopUpReax={showTopUpReax}
        setShowTopUpReax={setShowTopUpReax}
        showWithdrawReax={showWithdrawReax}
        setShowWithdrawReax={setShowWithdrawReax}
      />

<Withdrawal
  open={showWithdraw}
  onClose={() => setShowWithdraw(false)}
  userId={profile.id}
  wallet={wallet}
  onSuccess={refreshWallet}
/>
    </>
  )
}