"use client"
interface HeaderProps {
  activeTab: "wallet" | "profile"
  user: any
  wallet: {
    balance: number
    escrow_balance: number
  }
  tipsCount: number
  handleSignOut: () => void
  openAuth: () => void
}

export default function Header({
  activeTab,
  user,
  wallet,
  tipsCount,
  handleSignOut,
  openAuth
}: HeaderProps) {
  return (
    <header className="sticky top-4 z-50 w-[95%] max-w-2xl mx-auto">
      <div
  className="
    bg-black/70
    backdrop-blur-2xl
    border border-red-600/30
    rounded-3xl
    shadow-[0_15px_50px_rgba(0,0,0,0.55)]
    overflow-hidden
  "
>

        {/* Red glow line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent" />

        <div className="max-w-2xl mx-auto px-5 py-4">

          <div className="flex items-center justify-between">

            {/* LEFT */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-red-500 font-bold">
                STREET MARKET
              </p>

              <h1 className="text-2xl font-black text-white">
                {activeTab === "wallet"
                  ? "Trading Feed"
                  : "Wallet Hub"}
              </h1>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-zinc-900 border border-zinc-800">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-zinc-300">
                    Online
                  </span>
                </div>
              )}

              <button
                onClick={user ? handleSignOut : openAuth}
                className="
                  px-4 py-2
                  rounded-xl
                  bg-red-600
                  hover:bg-red-500
                  text-white
                  text-sm
                  font-bold
                  transition
                "
              >
                {user ? "Logout" : "Sign In"}
              </button>

            </div>
          </div>

          {user && (
            <div className="grid grid-cols-3 gap-3 mt-4">

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500">
                  Balance
                </p>
                <p className="text-green-400 font-black">
                  KSh {wallet.balance.toLocaleString()}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500">
                  Escrow
                </p>
                <p className="text-yellow-400 font-black">
                  KSh {wallet.escrow_balance.toLocaleString()}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3">
                <p className="text-[10px] text-zinc-500">
                  Active Tips
                </p>
                <p className="text-red-400 font-black">
                  {tipsCount}
                </p>
              </div>

            </div>
          )}

        </div>

        

      </div>
    </header>
  )
}