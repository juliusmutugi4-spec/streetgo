'use client'

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function ReaxPage() {
const [loading, setLoading] = useState(true)
const [reaxBalance, setReaxBalance] = useState(0)
const [todayEarned, setTodayEarned] = useState(0)
const [lifetimeEarned, setLifetimeEarned] = useState(0)
const [transactions, setTransactions] = useState<any[]>([])
useEffect(() => {
  loadWallet()
}, [])

async function loadWallet() {
  setLoading(true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    setLoading(false)
    return
  }

  const { data, error } = await supabase
    .from("wallets")
    .select("reax_balance")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.error(error)
  }

  if (data) {
    setReaxBalance(data.reax_balance ?? 0)
  }

const { data: transactions } = await supabase
  .from("reax_transactions")
  .select("*")
  .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
  .order("created_at", {
    ascending: false
  })


if (transactions) {
setTransactions(transactions)
  const lifetime = transactions.reduce(


    (total, item) => total + Number(item.amount),
    0
  )

  setLifetimeEarned(lifetime)


  const today = new Date()
    .toISOString()
    .slice(0,10)


  const todayTotal = transactions
    .filter(item =>
      item.created_at.startsWith(today)
    )
    .reduce(
      (total,item)=> total + Number(item.amount),
      0
    )


  setTodayEarned(todayTotal)
}



  setLoading(false)
}

  return (
    <main className="min-h-screen bg-black text-white">
<div className="max-w-5xl mx-auto p-6">

  {/* Header */}
  <div className="mb-8">
    <h1 className="text-3xl font-black">
      ⭐ REAX CENTER
    </h1>

    <p className="text-zinc-400 mt-2">
      Your StreetGO rewards, earnings and activity.
    </p>
  </div>

  {/* Balance Card */}
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

    <p className="text-sm uppercase tracking-widest text-zinc-500">
      REAX Balance
    </p>

  <h2 className="mt-3 text-5xl font-black text-emerald-400">
  {loading
    ? "Loading..."
    : `⭐ ${reaxBalance.toLocaleString()} REAX`}
</h2>

    <p className="mt-3 text-sm text-zinc-400">
      Earn REAX by participating on StreetGO.
    </p>

  </div>


{/* Progress */}
<div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

  <div className="flex items-center justify-between mb-3">
    <div>
      <h3 className="font-bold text-white">
        Next Reward
      </h3>

      <p className="text-sm text-zinc-500">
        Reach 100 REAX to unlock your first badge.
      </p>
    </div>

    <span className="text-emerald-400 font-bold">
      0 / 100
    </span>
  </div>

  <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
    <div
      className="h-full rounded-full bg-emerald-500"
      style={{ width: "0%" }}
    />
  </div>

</div>
{/* Daily Missions */}
<div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">

  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-bold text-white">
      Daily Missions
    </h2>

    <span className="text-xs text-emerald-400">
      +50 REAX Available
    </span>
  </div>

  <div className="space-y-3">

    <div className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
      <div>
        <p className="font-semibold text-white">
          Daily Login
        </p>
        <p className="text-xs text-zinc-500">
          Log into StreetGO today.
        </p>
      </div>

      <span className="text-emerald-400 font-bold">
        +5
      </span>
    </div>

    <div className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
      <div>
        <p className="font-semibold text-white">
          Create a Post
        </p>
        <p className="text-xs text-zinc-500">
          Publish your first post today.
        </p>
      </div>

      <span className="text-emerald-400 font-bold">
        +10
      </span>
    </div>

    <div className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
      <div>
        <p className="font-semibold text-white">
          Comment 3 Times
        </p>
        <p className="text-xs text-zinc-500">
          Join conversations.
        </p>
      </div>

      <span className="text-emerald-400 font-bold">
        +10
      </span>
    </div>

    <div className="flex items-center justify-between rounded-lg bg-zinc-950 p-3">
      <div>
        <p className="font-semibold text-white">
          Receive 5 REAX
        </p>
        <p className="text-xs text-zinc-500">
          Earn reactions from other users.
        </p>
      </div>

      <span className="text-emerald-400 font-bold">
        +25
      </span>
    </div>

  </div>

</div>
{/* Statistics */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs uppercase tracking-widest text-zinc-500">
      Today
    </p>

<h3 className="mt-2 text-2xl font-black text-white">
  +{todayEarned}
</h3>

    <p className="text-xs text-zinc-500 mt-1">
      REAX Earned
    </p>
  </div>

  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs uppercase tracking-widest text-zinc-500">
      This Week
    </p>

<h3 className="mt-2 text-2xl font-black text-emerald-400">
  {lifetimeEarned}
</h3>

    <p className="text-xs text-zinc-500 mt-1">
      REAX Earned
    </p>
  </div>

  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs uppercase tracking-widest text-zinc-500">
      Lifetime
    </p>

    <h3 className="mt-2 text-2xl font-black text-emerald-400">
      0
    </h3>

    <p className="text-xs text-zinc-500 mt-1">
      Total REAX
    </p>
  </div>

  <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
    <p className="text-xs uppercase tracking-widest text-zinc-500">
      Rank
    </p>

    <h3 className="mt-2 text-2xl font-black text-yellow-400">
      --
    </h3>

    <p className="text-xs text-zinc-500 mt-1">
      Global Ranking
    </p>
  </div>

</div>

{/* Quick Actions */}
<div className="mt-8">

  <h2 className="text-lg font-bold text-white mb-4">
    Quick Actions
  </h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

    <button className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition p-5 text-left">
      <div className="text-3xl">✨</div>

      <h3 className="mt-3 font-bold text-white">
        Send REAX
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        Transfer REAX to another user.
      </p>
    </button>

    <button className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition p-5 text-left">
      <div className="text-3xl">🎁</div>

      <h3 className="mt-3 font-bold text-white">
        Rewards
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        Claim bonuses and rewards.
      </p>
    </button>

    <button className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition p-5 text-left">
      <div className="text-3xl">📜</div>

      <h3 className="mt-3 font-bold text-white">
        History
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        View all REAX activity.
      </p>
    </button>

    <button className="rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition p-5 text-left">
      <div className="text-3xl">🚀</div>

      <h3 className="mt-3 font-bold text-white">
        Earn REAX
      </h3>

      <p className="mt-1 text-sm text-zinc-400">
        Discover new ways to earn.
      </p>
    </button>

  </div>

</div>
{/* Recent Activity */}
<div className="mt-10">

  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-bold text-white">
      Recent Activity
    </h2>

    <button className="text-sm text-emerald-400 hover:text-emerald-300">
      View All
    </button>
  </div>

  <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">

    {/* Activity Item */}
    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
      <div>
{transactions.length === 0 ? (

  <div className="p-8 text-center">

    <div className="text-5xl mb-3">
      ⭐
    </div>

    <h3 className="text-lg font-bold text-white">
      No REAX activity yet
    </h3>

    <p className="mt-2 text-sm text-zinc-500">
      Your REAX activity will appear here.
    </p>

  </div>

) : (

  transactions.slice(0,5).map((item)=>(
    
    <div
      key={item.id}
      className="flex items-center justify-between p-4 border-b border-zinc-800"
    >

      <div>

        <p className="font-semibold text-white">
          {item.description}
        </p>

        <p className="text-sm text-zinc-500">
          {item.type}
        </p>

      </div>


      <div className="text-right">

        <p className="text-emerald-400 font-bold">
          +{item.amount} REAX
        </p>

        <p className="text-xs text-zinc-600">
          {new Date(item.created_at)
            .toLocaleDateString()}
        </p>

      </div>

    </div>

  ))

)}

        <p className="text-sm text-zinc-500">
          Start earning rewards on StreetGO.
        </p>
      </div>

      <div className="text-right">
        <p className="text-emerald-400 font-bold">
          +0 REAX
        </p>

        <p className="text-xs text-zinc-600">
          Today
        </p>
      </div>
    </div>

    {/* Empty State */}
    <div className="p-8 text-center">

      <div className="text-5xl mb-3">
        ⭐
      </div>

      <h3 className="text-lg font-bold text-white">
        No REAX activity yet
      </h3>

      <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
        As you earn, spend or receive REAX, your activity history will appear here.
      </p>

    </div>

  </div>

</div>
</div>
    </main>
  )
}