'use client'

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "../../lib/supabase-browser"
import { checkAdmin } from "../../lib/isAdmin"
import useFinance from "./hooks/useFinance"

import RevenueChart from "./components/RevenueChart"
import FinanceCards from "./components/FinanceCards"
import TransactionDrawer from "./components/TransactionDrawer"
import WalletDrawer from "./components/WalletDrawer"
import TransactionsTable from "./components/TransactionsTable"

import {
  copyReference,
  getWalletByTransaction,
  freezeWallet
} from "./actions/financeActions"

export default function FinancePage() {
  const supabase = getSupabaseBrowser()
  const router = useRouter()

  // State Management
  const [authorized, setAuthorized] = useState(false)
  const [adminId, setAdminId] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<any>(null)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  const authChecked = useRef(false)
  
  // Custom Hook invocation
  const { summary, transactions, chartData, extraFinance, loading } = useFinance(authorized)

  // 1. Secure Access Verification Flow
  useEffect(() => {
    if (authChecked.current) return
    authChecked.current = true

    async function verifyFinanceAccess() {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (error || !data.user) {
          if (error) console.error("Access Control Security Exception:", error)
          router.push("/login")
          return
        }

        setAdminId(data.user.id)
        const admin = await checkAdmin(data.user.id)

        if (!admin) {
          router.push("/")
          return
        }

        if (admin.role !== "super_admin" && admin.role !== "finance_admin") {
          router.push("/admin")
          return
        }

        setAuthorized(true)
      } catch (err) {
        console.error("Critical authentication pipeline failure:", err)
        router.push("/")
      }
    }

    verifyFinanceAccess()
  }, [router, supabase.auth])

  // 2. High-Performance Client-Side Filters
  const filteredTransactions = transactions.filter((tx) => {
    const searchString = search.toLowerCase()
    const matchesSearch =
      String(tx.reference || "").toLowerCase().includes(searchString) ||
      String(tx.profiles?.username || "").toLowerCase().includes(searchString)

    const matchesFilter =
      filter === "all" || tx.type === filter || tx.status === filter

    return matchesSearch && matchesFilter
  })

  // 3. Operational Logic Actions
  async function viewWallet() {
    if (!selectedTransaction?.wallet_id) return
    try {
      const wallet = await getWalletByTransaction(selectedTransaction.wallet_id)
      if (wallet) {
        setSelectedWallet(wallet)
      }
    } catch (error) {
      console.error("Failed to retrieve target wallet instance:", error)
    }
  }

  async function handleFreezeWallet() {
    const targetWalletId = selectedWallet?.id || selectedTransaction?.wallet_id
    if (!targetWalletId) return

    const confirmFreeze = confirm(
      "CONFIRM ACCOUNT SANCTION:\nAre you sure you want to freeze this wallet? The user will instantly lose payment capability."
    )
    if (!confirmFreeze) return

    try {
      const success = await freezeWallet(targetWalletId, adminId)

      if (success) {
        alert("Wallet structure locked successfully.")
        
        // Update local object states immediately
        if (selectedWallet) {
          setSelectedWallet({
            ...selectedWallet,
            money_wallet_active: false
          })
        }
        if (selectedTransaction && selectedTransaction.wallet_id === targetWalletId) {
          setSelectedTransaction({
            ...selectedTransaction,
            wallet_active_status: false // Synchronized context fallback
          })
        }
      }
    } catch (error) {
      console.error("Critical wallet mitigation failure:", error)
    }
  }

  // 4. Gatekeeper Middleware Screens
  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-3 antialiased">
        <div className="w-5 h-5 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-zinc-500 tracking-widest font-mono uppercase">
          Verifying Core Credentials...
        </p>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-3 antialiased">
        <div className="w-5 h-5 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-zinc-500 tracking-widest font-mono uppercase">
          Compiling Secure Financial Data...
        </p>
      </main>
    )
  }

  // 5. Main Functional Dashboard Workspace
  return (


    <main className="min-h-screen bg-[#09090b] text-zinc-50 antialiased selection:bg-zinc-800 selection:text-white">
      <div className="max-w-[1600px] mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Core Administrative Header */}
<header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/75 backdrop-blur-lg">
  <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
    
    {/* Left Side: Brand & Context */}
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-3">
        {/* Terminal/Security Icon Container */}
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/60 bg-gradient-to-b from-zinc-800 to-zinc-900 shadow-sm">
          <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        
        {/* Brand Title */}
        <h1 className="bg-gradient-to-r from-zinc-50 to-zinc-300 bg-clip-text text-xl font-semibold tracking-tight text-transparent">
          StreetGO <span className="font-light text-zinc-400">Finance</span>
        </h1>
        
        {/* Status Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider text-emerald-400 uppercase">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
          Authorized
        </span>
      </div>
      
      {/* Subtitle description */}
      <p className="max-w-xl text-xs text-zinc-400/80 leading-relaxed hidden sm:block">
        Supervise commercial payment allocations, configure account restrictions, and run immediate fraud security parameters.
      </p>
    </div>

    {/* Right Side: Proactive Action/Status Area Placeholder */}
    <div className="flex items-center gap-3 self-end sm:self-auto">
      <div className="text-right font-mono text-[11px] text-zinc-500">
        SECURE NODE // <span className="text-zinc-400">01</span>
      </div>
    </div>

  </div>
</header>



        {/* Dashboard Operational Grid */}
        <div className="space-y-6">
          {/* Top Metric Cards Strip */}
          <section aria-label="High-level Metrics Summary">
            <FinanceCards summary={summary} extraFinance={extraFinance} />
          </section>

          {/* Primary Splitting Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Left Hand Block: Audited Transaction Logs */}
            <div className="xl:col-span-2 bg-zinc-900/10 border border-zinc-800/60 rounded-xl p-5 shadow-2xl shadow-black/20">
              <TransactionsTable
                transactions={filteredTransactions}
                search={search}
                setSearch={setSearch}
                filter={filter}
                setFilter={setFilter}
                onSelect={setSelectedTransaction}
              />
            </div>

            {/* Right Hand Block: Visual Flow Data Charting */}
            <div className="bg-zinc-900/10 border border-zinc-800/60 rounded-xl p-5 shadow-2xl shadow-black/20">
              <div className="mb-4">
                <h3 className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  Gross Revenue Curves
                </h3>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5 uppercase tracking-tight">
                  Historical progression trends timeline
                </p>
              </div>
              <RevenueChart data={chartData} />
            </div>

          </div>
        </div>

        {/* Drawer Ingress Framework Portals */}
        <TransactionDrawer
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onCopy={() => copyReference(selectedTransaction?.reference)}
          onViewWallet={viewWallet}
          onFreezeWallet={handleFreezeWallet}
        />

        <WalletDrawer
          wallet={selectedWallet}
          onClose={() => setSelectedWallet(null)}
          onFreeze={handleFreezeWallet}
        />

      </div>
    </main>
  )
}
