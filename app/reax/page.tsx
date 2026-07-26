'use client'
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function ReaxPage() {
  const [loading, setLoading] = useState(true)
  const [reaxBalance, setReaxBalance] = useState(0)
  const [todayEarned, setTodayEarned] = useState(0)
  const [lifetimeEarned, setLifetimeEarned] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
const [currentUserId, setCurrentUserId] = useState("")
  useEffect(() => {
    loadWallet()
  }, [])

  async function loadWallet() {
    try {
const { data: { user } } = await supabase.auth.getUser()

if (!user) return

setCurrentUserId(user.id)
const [walletRes, transRes] = await Promise.all([
  supabase
    .from("wallets")
    .select("reax_balance")
    .eq("user_id", user.id)
    .single(),

  supabase
    .from("reax_transactions")
    .select(`
      *,
      sender:profiles!reax_transactions_sender_id_fkey(
        id,
        username,
        avatar_url
      ),
      receiver:profiles!reax_transactions_receiver_id_fkey(
        id,
        username,
        avatar_url
      )
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
])

      if (walletRes.data) setReaxBalance(walletRes.data.reax_balance ?? 0)
      
      if (transRes.data) {
        setTransactions(transRes.data)
        
        let txLifetime = 0
        let txToday = 0
        const todayStr = new Date().toISOString().slice(0, 10)

        transRes.data.forEach(item => {
          const amt = Number(item.amount) || 0
          txLifetime += amt
          if (item.created_at?.startsWith(todayStr)) {
            txToday += amt
          }
        })

        setLifetimeEarned(txLifetime)
        setTodayEarned(txToday)
      }
    } catch (err) {
      console.error("Failed loading wallet metadata:", err)
    } finally {
      setLoading(false)
    }
  }

  const progressPercent = Math.min(100, Math.round((reaxBalance / 100) * 100))
function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";

  return `${days} days ago`;
}




  return (
    <main className="min-h-screen bg-black text-zinc-100 antialiased max-w-md mx-auto selection:bg-emerald-500/30">
      
      {/* WhatsApp-Style Navigation Header */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-zinc-900 px-3 py-3 border-b border-zinc-800 shadow-md">
        <div className="flex items-center gap-2">
          {/* Big Back Arrow Action */}
          <button 
            onClick={() => window.history.back()} 
            className="p-1.5 hover:bg-zinc-800 rounded-full active:scale-95 transition text-zinc-300"
            aria-label="Go back"
          >
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          
          {/* Platform Identity Info */}
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              REAX CENTER
            </h1>
            <p className="text-[11px] text-emerald-400 font-medium leading-none mt-0.5">
              ● StreetGO Hub
            </p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-mono font-bold tracking-wider bg-zinc-950 border border-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
          Rank --
        </span>
      </nav>

      <div className="px-4 py-5">
        {/* Main Asset Display */}
        <section className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-xl p-5 mb-4 shadow-sm">
          <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500">Available Balance</span>
          <h2 className="text-3xl font-black text-white mt-1 flex items-baseline gap-1">
            {loading ? <span className="animate-pulse text-zinc-600 text-2xl">...</span> : reaxBalance.toLocaleString()}
            <span className="text-xs font-semibold text-emerald-400/90 tracking-normal">REAX</span>
          </h2>
          
          {/* Clean Micro Progress Bar */}
          <div className="mt-4 pt-4 border-t border-zinc-800/60">
            <div className="flex justify-between text-[11px] mb-1.5 text-zinc-400 font-medium">
              <span>Next Level Milestone</span>
              <span className="font-mono text-emerald-400">{reaxBalance}/100</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </section>

        {/* Grid Stats */}
        <section className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Collected Today</p>
            <p className="text-lg font-bold text-zinc-200 mt-0.5">+{todayEarned}</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Total Rewards</p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">+{lifetimeEarned}</p>
          </div>
        </section>

        {/* Micro Quick Actions */}
        <section className="mb-6">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Send", icon: "✨" },
              { label: "Claims", icon: "🎁" },
              { label: "History", icon: "📜" },
              { label: "Earn", icon: "🚀" }
            ].map((act, idx) => (
              <button key={idx} className="flex flex-col items-center justify-center p-3 bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 active:scale-95 transition rounded-xl">
                <span className="text-lg mb-1">{act.icon}</span>
                <span className="text-[11px] font-medium text-zinc-300">{act.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Micro Activity Feed */}
       <section className="mt-2">
  {/* Stream Header Tracking */}
  <div className="flex items-center justify-between mb-3 px-1">
    <h3 className="text-xs uppercase tracking-widest font-black text-zinc-500">Activity Stream</h3>
    <span className="text-[10px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full shadow-sm">
      {transactions.length} events
    </span>
  </div>

  {loading ? (
    /* Skeleton Loading State */
    <div className="space-y-2">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex justify-between items-center p-3 bg-zinc-900/20 border border-zinc-900 rounded-xl animate-pulse">
          <div className="space-y-2 w-2/3">
            <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
            <div className="h-2 bg-zinc-800/60 rounded w-1/4"></div>
          </div>
          <div className="h-4 bg-zinc-800 rounded w-12"></div>
        </div>
      ))}
    </div>
  ) : transactions.length === 0 ? (
    /* Empty State fallback Layout */
    <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center bg-zinc-950/40 backdrop-blur-sm">
      <span className="text-2xl filter grayscale opacity-20 block mb-2">⭐</span>
      <p className="text-xs font-semibold text-zinc-400">Zero balance activity logged</p>
      <p className="text-[10px] text-zinc-600 mt-1">Your transfers will update instantly here</p>
    </div>
  ) : (
    /* Ultra-smooth Scroll Container */
    <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1 outline-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent [-webkit-overflow-scrolling:touch]">
      {transactions.map((item) => {
const amount = Number(item.amount) || 0;
const sentByMe = item.sender_id === currentUserId;
const isNegative = sentByMe;

const badge =
  item.type === "bonus"
    ? { text: "BONUS", color: "bg-yellow-500/20 text-yellow-300" }
    : item.type === "reaction"
    ? { text: "REACTION", color: "bg-emerald-500/20 text-emerald-300" }
    : item.type === "transfer"
    ? { text: "TRANSFER", color: "bg-blue-500/20 text-blue-300" }
    : { text: "REAX", color: "bg-zinc-700 text-zinc-300" };



        return (
          <div 
            key={item.id} 
            className="group flex items-center justify-between p-3.5 bg-gradient-to-b from-zinc-900/60 to-zinc-950/40 border border-zinc-900 rounded-xl hover:border-zinc-800 hover:from-zinc-900 hover:to-zinc-900 transition-all duration-200 active:scale-[0.98]"
          >
            {/* Left Data Column: Indicator & Text Context */}
            <div className="min-w-0 flex-1 pr-3 flex items-center gap-3">
              {/* Dynamic Status Indicator Block */}
<div className="flex items-center gap-2 min-w-0 flex-1">
  {/* Ultra-Micro Avatar Container (28px) */}
{/* Avatar */}
<div className="relative shrink-0 select-none">
  {item.sender?.avatar_url || item.receiver?.avatar_url ? (
    <img
      src={item.sender?.avatar_url || item.receiver?.avatar_url}
      alt="avatar"
      className="w-7 h-7 rounded-full object-cover border border-zinc-800/80"
    />
  ) : (
    <div className="w-7 h-7 rounded-full bg-zinc-700 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-white">
      {(item.sender?.username || item.receiver?.username || "S")
        .charAt(0)
        .toUpperCase()}
    </div>
  )}

  {/* Online Status Dot */}
  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-950" />
</div>

  {/* Condensed Metatext Block */}
  <div className="min-w-0 flex-1 leading-tight">
    <p className="text-xs font-bold text-zinc-100 truncate tracking-tight">
      {sentByMe
  ? `You → ${item.receiver?.username ?? "Unknown"}`
  : item.sender?.username ?? "StreetGO"}
    </p>
    <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
      {sentByMe
  ? "You sent REAX"
  : "Sent you REAX"}
    </p>

<span
  className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.color}`}
>
  {badge.text}
</span>



  </div>
</div>

            </div>

            {/* Right Data Column: Financial Balances & Stamps */}
            <div className="text-right shrink-0 flex flex-col items-end justify-center">
<p
  className={`text-xs font-black font-mono tracking-tight ${
    isNegative ? "text-red-400" : "text-emerald-400"
  }`}
>
  {isNegative ? "-" : "+"}
  {Math.abs(amount).toLocaleString()}

  <span className="ml-1 text-[9px] text-zinc-500 uppercase">
    REAX
  </span>
</p>
<p className="text-[9px] font-mono text-zinc-600 mt-0.5 font-bold">
  {item.created_at ? timeAgo(item.created_at) : "Just now"}
</p>
            </div>
          </div>
        );
      })}
    </div>
  )}
</section>

      </div>
    </main>
  )
}
