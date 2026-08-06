'use client'

import TopUpReaxModal from "./TopUpReaxModal"
import WithdrawReaxModal from "./WithdrawReaxModal"

interface Props {
  profile: any
  refreshWallet: () => Promise<void>

  showTopUpReax: boolean
  setShowTopUpReax: React.Dispatch<React.SetStateAction<boolean>>

  showWithdrawReax: boolean
  setShowWithdrawReax: React.Dispatch<React.SetStateAction<boolean>>
}

export default function WalletModals({
  profile,
  refreshWallet,
  showTopUpReax,
  setShowTopUpReax,
  showWithdrawReax,
  setShowWithdrawReax,
}: Props) {
  return (
    <>
      <TopUpReaxModal
        open={showTopUpReax}
        onClose={() => setShowTopUpReax(false)}
        userId={profile.id}
        onSuccess={refreshWallet}
      />

      <WithdrawReaxModal
        open={showWithdrawReax}
        onClose={() => setShowWithdrawReax(false)}
        userId={profile.id}
      />
    </>
  )
}