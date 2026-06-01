"use client"
import Header from "./components/Header"
import { useState, useEffect } from 'react'
import Broadcast from "./components/Broadcast"
import { createClient } from '@supabase/supabase-js'
import { Wallet, Plus, User, ArrowDownToLine, ArrowUpFromLine, Send, X, Loader2 } from "lucide-react"
import Card from "./components/Card"
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type UserType = { id: string; email?: string }
type WalletType = { balance: number; escrow_balance: number; phone: string | null }

export default function StreetMarket() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'profile'>('wallet')
  const [user, setUser] = useState<UserType | null>(null)
  const [wallet, setWallet] = useState<WalletType>({ balance: 0, escrow_balance: 0, phone: null })
  const [showBroadcast, setShowBroadcast] = useState(false)
  // Auth states
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [awaitingOtp, setAwaitingOtp] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  // Modals
  const [showBottomNav, setShowBottomNav] = useState(true)

  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [depositPhone, setDepositPhone] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawPhone, setWithdrawPhone] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendPhone, setSendPhone] = useState('')
  const [loading, setLoading] = useState(false)
const [tips, setTips] = useState<any[]>([])
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setActiveTab('wallet')
  }
const fetchTips = async () => {
  setLoading(true)

  const { data, error } = await supabase
    .from('betting_tips')
    .select('*')
    .order('created_at', { ascending: false })

  console.log("BETTING TIPS:", data)
  console.log("ERROR:", error)

  setTips(data || [])
  setLoading(false)
}


  const closeAuthModal = () => {
    setShowAuthModal(false)
    setAwaitingOtp(false)
    setOtpCode('')
    setAuthEmail('')
    setAuthError('')
    setAuthSuccess('')
  }

  const handleEmailAuth = async () => {
    setLoading(true)
    setAuthError('')
    setAuthSuccess('')
    try {
      if (!awaitingOtp) {
        const { error } = await supabase.auth.signInWithOtp({ 
          email: authEmail,
          options: { shouldCreateUser: true }
        })
        if (error) throw error
        setAwaitingOtp(true)
        setAuthSuccess('Check your email for the 6-digit code')
      } else {
        const { error } = await supabase.auth.verifyOtp({
          email: authEmail,
          token: otpCode,
          type: 'email'
        })
        if (error) throw error
        setShowAuthModal(false)
        setAwaitingOtp(false)
        setOtpCode('')
        setAuthEmail('')
      }
    } catch (e: any) {
      setAuthError(e.message)
    } finally {
      setLoading(false)
    }
  }




  // Auth listener
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
console.log(tips)
    if (session?.user) {
      fetchWallet(session.user.id)
    }
  })

  fetchTips() // ← ADD THIS LINE

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        fetchWallet(session.user.id)
      }
    })

  return () => subscription?.unsubscribe()
}, [])

  const fetchWallet = async (userId: string) => {
    const { data } = await supabase
      .from('wallets')
      .select('balance, escrow_balance, phone')
      .eq('user_id', userId)
      .maybeSingle()
    setWallet(data || { balance: 0, escrow_balance: 0, phone: null })
  }

  // FAKE DEPOSIT FOR TESTING
  const handleDeposit = async () => {
    if (!depositAmount || !depositPhone || !user) {
      alert('Enter amount + phone number')
      return
    }
    if (Number(depositAmount) < 10) {
      alert('Minimum deposit is KSh 10')
      return
    }
    
    setLoading(true)
    try {
      const newBalance = wallet.balance + Number(depositAmount)
      
      const { error } = await supabase
        .from('wallets')
        .upsert({ 
          user_id: user.id, 
          balance: newBalance,
          phone: depositPhone 
        }, { onConflict: 'user_id' })
      
      if (error) throw error
      
      setWallet({ ...wallet, balance: newBalance, phone: depositPhone })
      alert(`Test deposit successful! +KSh ${depositAmount}`)
      setShowDepositModal(false)
      setDepositAmount('')
      setDepositPhone('')
    } catch (e: any) {
      alert('Deposit failed: ' + e.message)
    } finally {
      setLoading(false)
    }

console.log('Tips from DB:', tips)

  }
return (
  <div className="relative min-h-screen w-full overflow-x-hidden"
    style={{
      background: `radial-gradient(circle at top left, rgba(59,130,246,0.25), transparent 35%),
                 radial-gradient(circle at bottom right, rgba(37,99,235,0.25), transparent 35%),
                 linear-gradient(180deg, #0f172a 0%, #172554 40%, #1e3a8a 100%)`
    }}
  >
 

<div
  className="
    mx-auto
    max-w-2xl
    min-h-screen
    bg-slate-900
    border-x
    border-slate-800
  "
>
      <Header
        activeTab={activeTab}
        user={user}
        wallet={wallet}
        tipsCount={tips.length}
        handleSignOut={handleSignOut}
        openAuth={() => setShowAuthModal(true)}
      />

      {/* CONTENT - Only this scrolls */}
      <main className="pt-[140px] h-full overflow-y-auto bg-zinc-900">
        {/* WALLET TAB */}
        <div style={{ display: activeTab === 'wallet'? 'block' : 'none' }}>
          <div className="py-6 sm:py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-32">
              {tips.map(tip => (
                <Card key={tip.id} tip={tip} />
              ))}
              {tips.length === 0 &&!loading && (
                <div className="col-span-full text-center text-gray-500 py-12">
                  No tips yet. Be first to broadcast!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4 sm:space-y-6 px-4 pb-32">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 rounded-xl p-4 sm:p-6">
              <p className="font-medium text-sm sm:text-base text-gray-900">My Account</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{user?.email || 'Not signed in'}</p>
            </div>

            <div className="relative overflow-hidden rounded-3xl border-cyan-500/20 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 p-6 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-cyan-300 text-xs tracking-[0.25em] uppercase font-bold">Wallet Balance</p>
                    <h2 className="text-white text-4xl font-black mt-2">KSh {wallet.balance.toLocaleString()}</h2>
                    <p className="text-slate-400 text-sm mt-2">Available for withdrawal</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center border-cyan-500/20">
                    <Wallet className="w-7 h-7 text-cyan-300" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="rounded-2xl bg-white/5 border-white/10 p-4">
                    <p className="text-slate-400 text-xs">Escrow</p>
                    <p className="text-yellow-400 font-black text-xl mt-1">KSh {wallet.escrow_balance.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border-white/10 p-4">
                    <p className="text-slate-400 text-xs">Account</p>
                    <p className="text-emerald-400 font-black text-sm mt-2 truncate">{user?.email || "Guest"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6">
                  <button onClick={() => setShowDepositModal(true)} className="rounded-xl bg-emerald-500 py-3 text-white font-bold text-sm hover:scale-105 transition">Deposit</button>
                  <button onClick={() => setShowWithdrawModal(true)} className="rounded-xl bg-blue-500 py-3 text-white font-bold text-sm hover:scale-105 transition">Withdraw</button>
                  <button onClick={() => setShowSendModal(true)} className="rounded-xl bg-cyan-500 py-3 text-white font-bold text-sm hover:scale-105 transition">Send</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button onClick={() => setShowDepositModal(true)} className="bg-white border-2 border-green-500 rounded-xl p-3 sm:p-4 flex-col items-center gap-1 sm:gap-2 hover:bg-green-50">
                <ArrowDownToLine className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                <span className="text-xs sm:text-sm font-semibold">Deposit</span>
              </button>
              <button onClick={() => setShowWithdrawModal(true)} className="bg-white border-2 border-blue-500 rounded-xl p-3 sm:p-4 flex-col items-center gap-1 sm:gap-2 hover:bg-blue-50">
                <ArrowUpFromLine className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <span className="text-xs sm:text-sm font-semibold">Withdraw</span>
              </button>
              <button onClick={() => setShowSendModal(true)} className="bg-white border-2 border-gray-900 rounded-xl p-3 sm:p-4 flex-col items-center gap-1 sm:gap-2 hover:bg-gray-50">
                <Send className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                <span className="text-xs sm:text-sm font-semibold">Send</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Loading indicator */}
      {loading && (
        <div className="fixed bottom-4 right-4 pointer-events-none bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 shadow-xl z-50">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Syncing Network...
        </div>
      )}

{/* FUTURISTIC QUANTUM NAVIGATION HUBS */}
<div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
  {/* Outer Chassis: Ultra-thin cyber border with deep holographic glow */}
  <div className="flex items-center gap-3 bg-slate-950/40 backdrop-blur-3xl px-4 py-3 rounded-2xl border border-cyan-500/20 shadow-[0_0_50px_-10px_rgba(6,182,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-cyan-500/10 before:to-transparent before:pointer-events-none">
    
    {/* Wallet Node */}
    <button 
      onClick={() => setActiveTab('wallet')} 
      className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 overflow-hidden ${
        activeTab === 'wallet' 
          ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2),inset_0_0_12px_rgba(34,211,238,0.1)]' 
          : 'text-slate-400 hover:text-cyan-200 border border-transparent hover:bg-white/5'
      }`}
    >
      <Wallet className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'wallet' ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-medium tracking-wider uppercase hidden sm:inline">Wallet</span>
      {/* Active Indicator Micro-Line */}
      {activeTab === 'wallet' && <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />}
    </button>

    {/* Center Core: Core Broadcast Trigger */}
    <button 
      onClick={() => setShowBroadcast(true)} 
      className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 font-bold text-xs tracking-widest uppercase shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group"
    >
      {/* Cyber Inner Glare effect */}
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
      <Plus className="w-4 h-4 stroke-[3] transition-transform duration-300 group-hover:rotate-90" />
      <span className="hidden sm:inline">Broadcast</span>
    </button>

    {/* Profile Node */}
    <button 
      onClick={() => setActiveTab('profile')} 
      className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 overflow-hidden ${
        activeTab === 'profile' 
          ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2),inset_0_0_12px_rgba(34,211,238,0.1)]' 
          : 'text-slate-400 hover:text-cyan-200 border border-transparent hover:bg-white/5'
      }`}
    >
      <User className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${activeTab === 'profile' ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-medium tracking-wider uppercase hidden sm:inline">Profile</span>
      {/* Active Indicator Micro-Line */}
      {activeTab === 'profile' && <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />}
    </button>

  </div>
</div>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{awaitingOtp? 'Enter Code' : 'Sign in'}</h2>
              <button onClick={closeAuthModal}><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            {authError && <div className="bg-red-50 border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 text-xs sm:text-sm">{authError}</div>}
            {authSuccess && <div className="bg-green-50 border-green-200 text-green-600 px-3 py-2 rounded-lg mb-4 text-xs sm:text-sm">{authSuccess}</div>}
            {!awaitingOtp? (
              <input type="email" placeholder="you@example.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" disabled={loading} autoFocus />
            ) : (
              <>
                <p className="text-gray-600 text-xs sm:text-sm mb-4">Code sent to <span className="font-medium">{authEmail}</span></p>
                <input type="text" placeholder="000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center text-xl sm:text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500 mb-4" disabled={loading} maxLength={6} autoFocus />
              </>
            )}
            <button onClick={handleEmailAuth} disabled={loading} className="w-full bg-green-600 text-white rounded-xl py-2 sm:py-3 text-sm sm:text-base font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {awaitingOtp? 'Verify Code' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* DEPOSIT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Deposit Money</h2>
              <X onClick={() => setShowDepositModal(false)} className="cursor-pointer text-gray-500 h-5 w-5" />
            </div>
            <input type="number" placeholder="Amount KSh" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="w-full border-gray-300 rounded-xl p-2 sm:p-3 text-sm sm:text-base mb-3 focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="text" placeholder="M-Pesa Phone 254..." value={depositPhone} onChange={e => setDepositPhone(e.target.value)} className="w-full border-gray-300 rounded-xl p-2 sm:p-3 text-sm sm:text-base mb-4 focus:outline-none focus:ring-2 focus:ring-green-500" />
            <button onClick={handleDeposit} disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg rounded-xl p-2 sm:p-3 text-sm sm:text-base font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              {loading? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deposit via M-Pesa'}
            </button>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Withdraw Money</h2>
              <X onClick={() => setShowWithdrawModal(false)} className="cursor-pointer text-gray-500 h-5 w-5" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3">Available: KSh {wallet.balance.toFixed(2)}</p>
            <input type="number" placeholder="Amount KSh" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full border-gray-300 rounded-xl p-2 sm:p-3 text-sm sm:text-base mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="text" placeholder="M-Pesa Phone 254..." value={withdrawPhone} onChange={e => setWithdrawPhone(e.target.value)} className="w-full border-gray-300 rounded-xl p-2 sm:p-3 text-sm sm:text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="w-full bg-blue-500 text-white rounded-xl p-2 sm:p-3 text-sm sm:text-base font-semibold">Withdraw to M-Pesa</button>
          </div>
        </div>
      )}

      {/* BROADCAST MODAL */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 relative">
            <button onClick={() => setShowBroadcast(false)} className="absolute top-3 right-3 text-gray-500 text-2xl">×</button>
            <Broadcast onClose={() => { setShowBroadcast(false); fetchTips(); }} />
          </div>
        </div>
      )}
    </div>
  </div>
)
}