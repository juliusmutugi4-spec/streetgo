'use client'

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "../../lib/supabase-browser"
import { checkAdmin } from "../../lib/isAdmin"
import useFinance from "./hooks/useFinance"
import WithdrawalHistoryDrawer from "./components/WithdrawalHistoryDrawer"
import RevenueChart from "./components/RevenueChart"
import FinanceCards from "./components/FinanceCards"
import TransactionDrawer from "./components/TransactionDrawer"
import WalletDrawer from "./components/WalletDrawer"
import TransactionsTable from "./components/TransactionsTable"
import WithdrawalTable from "./components/WithdrawalTable"
import WithdrawalDrawer from "./components/WithdrawalDrawer"
import {
  copyReference,
  getWalletByTransaction,
  freezeWallet,
  lookupWithdrawal,
} from "./actions/financeActions"

export default function FinancePage() {
  const supabase = getSupabaseBrowser()

console.log(
  "🔥 FINANCE SUPABASE URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL
)
  const router = useRouter()

  // State Management
  const [authorized, setAuthorized] = useState(false)
  const [adminId, setAdminId] = useState("")
  const [selectedWallet, setSelectedWallet] = useState<any>(null)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

const [withdrawalReferenceSearch, setWithdrawalReferenceSearch] =
  useState("")

const [withdrawalLookup, setWithdrawalLookup] =
  useState<any>(null)

const [withdrawalLookupLoading, setWithdrawalLookupLoading] =
  useState(false)

const [withdrawalLookupError, setWithdrawalLookupError] =
  useState("")


  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
const [selectedWithdrawal, setSelectedWithdrawal] =
  useState<{
    id: string
    user_id: string
    wallet_id: string
    amount: number
    phone_number: string
    status: string
    admin_note?: string | null
    rejection_reason?: string | null
    processed_by?: string | null
    created_at: string
    processed_at?: string | null
    username?: string | null
  } | null>(null)
  const authChecked = useRef(false)
  const [selectedWithdrawalHistory, setSelectedWithdrawalHistory] =
  useState<any>(null)
  // Custom Hook invocation
const {
  summary,
  transactions,
  withdrawals,
  withdrawalHistory,
  chartData,
  extraFinance,
  loading,
} = useFinance(authorized)
console.log(
  "🔥 FINANCE WITHDRAWAL HISTORY:",
  withdrawalHistory
)
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
  }, [router])

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

async function handleWithdrawalLookup() {
  const reference = withdrawalReferenceSearch.trim()

  if (!reference) {
    setWithdrawalLookup(null)
    setWithdrawalLookupError(
      "Enter a withdrawal reference."
    )
    return
  }

  setWithdrawalLookupLoading(true)
  setWithdrawalLookupError("")
  setWithdrawalLookup(null)

  try {
    const result = await lookupWithdrawal(
      adminId,
      reference
    )

    if (!result) {
      setWithdrawalLookupError(
        "No withdrawal found with this reference."
      )
      return
    }

    setWithdrawalLookup(result)

  } catch (error: any) {
    console.error(
      "WITHDRAWAL LOOKUP ERROR:",
      error
    )

    setWithdrawalLookupError(
      error?.message ||
        "Unable to look up withdrawal."
    )
  } finally {
    setWithdrawalLookupLoading(false)
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

{/* Withdrawal Reference Tracker */}
<section
  aria-label="Withdrawal Reference Tracker"
  className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5 shadow-2xl shadow-black/20"
>
  <div className="mb-4">
    <h2 className="text-sm font-semibold text-zinc-200">
      Withdrawal Reference Tracker
    </h2>

    <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
      Investigate any StreetGO withdrawal using its official reference
    </p>
  </div>

  <div className="flex flex-col gap-2 sm:flex-row">
    <input
      type="text"
      value={withdrawalReferenceSearch}
      onChange={(e) =>
        setWithdrawalReferenceSearch(
          e.target.value
        )
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleWithdrawalLookup()
        }
      }}
      placeholder="SG-WD-20260809-00010"
      className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 font-mono text-xs text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500"
    />

    <button
      type="button"
      onClick={handleWithdrawalLookup}
      disabled={withdrawalLookupLoading}
      className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {withdrawalLookupLoading
        ? "Searching..."
        : "Track Withdrawal"}
    </button>
  </div>

  {withdrawalLookupError && (
    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs text-red-400">
      {withdrawalLookupError}
    </div>
  )}

  {withdrawalLookup && (
    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Withdrawal Reference
          </p>

          <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
            {withdrawalLookup.withdrawal_reference}
          </p>

          <p className="mt-1 text-xs text-zinc-400">
            {withdrawalLookup.username ||
              "Unknown User"}
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase ${
            withdrawalLookup.status === "paid"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : withdrawalLookup.status === "rejected"
              ? "border-red-500/20 bg-red-500/5 text-red-400"
              : "border-amber-500/20 bg-amber-500/5 text-amber-400"
          }`}
        >
          {withdrawalLookup.status}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-[9px] uppercase text-zinc-500">
            Amount
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            KSh{" "}
            {Number(
              withdrawalLookup.amount || 0
            ).toLocaleString("en-KE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div>
          <p className="text-[9px] uppercase text-zinc-500">
            M-Pesa
          </p>
          <p className="mt-1 font-mono text-xs text-zinc-300">
            {withdrawalLookup.phone_number}
          </p>
        </div>

        <div>
          <p className="text-[9px] uppercase text-zinc-500">
            Requested
          </p>
          <p className="mt-1 text-xs text-zinc-300">
            {new Date(
              withdrawalLookup.created_at
            ).toLocaleString("en-KE")}
          </p>
        </div>
<div>
  <p className="text-[9px] uppercase text-zinc-500">
    Processed
  </p>

  <p className="mt-1 text-xs text-zinc-300">
    {withdrawalLookup.processed_at
      ? new Date(
          withdrawalLookup.processed_at
        ).toLocaleString("en-KE")
      : "Not processed"}
  </p>

  {withdrawalLookup.processed_by_username && (
    <p className="mt-1 font-mono text-[10px] text-emerald-400">
      By: {withdrawalLookup.processed_by_username}
    </p>
  )}
</div>
      </div>

      {withdrawalLookup.mpesa_receipt && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="text-[9px] uppercase text-zinc-500">
            M-Pesa Receipt
          </p>

          <p className="mt-1 font-mono text-xs font-bold text-emerald-400">
            {withdrawalLookup.mpesa_receipt}
          </p>
        </div>
      )}

      {withdrawalLookup.rejection_reason && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="text-[9px] uppercase text-red-400">
            Rejection Reason
          </p>

          <p className="mt-1 text-xs text-zinc-300">
            {withdrawalLookup.rejection_reason}
          </p>
        </div>
      )}

      {withdrawalLookup.mpesa_message && (
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="text-[9px] uppercase text-zinc-500">
            M-Pesa Confirmation
          </p>

          <p className="mt-1 rounded-lg border border-zinc-800 bg-black/30 p-3 font-mono text-xs leading-relaxed text-zinc-300">
            {withdrawalLookup.mpesa_message}
          </p>
        </div>
      )}
    </div>
  )}
</section>


{/* Pending Withdrawal Queue */}
<section aria-label="Pending Withdrawals">
  <WithdrawalTable
    withdrawals={withdrawals}
    onSelect={setSelectedWithdrawal}
  />
</section>
{/* Withdrawal History */}
<section
  aria-label="Withdrawal History"
  className="rounded-xl border border-zinc-800/60 bg-zinc-900/10 p-5 shadow-2xl shadow-black/20"
>
  <div className="mb-5 flex items-center justify-between">
    <div>
      <h2 className="text-sm font-semibold text-zinc-200">
        Withdrawal History
      </h2>

      <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
        Completed and rejected withdrawal operations
      </p>
    </div>

    <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[10px] font-mono text-zinc-500">
      {withdrawalHistory.length} RECORDS
    </span>
  </div>

  {withdrawalHistory.length === 0 ? (
    <div className="rounded-lg border border-dashed border-zinc-800 py-12 text-center">
      <p className="text-xs text-zinc-500">
        No withdrawal history
      </p>
    </div>
  ) : (
 <div className="max-h-[420px] overflow-auto rounded-lg border border-zinc-800/60">
  <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-600">
<th className="px-3 py-3">Reference</th>
<th className="px-3 py-3">User</th>
<th className="px-3 py-3">Amount</th>
<th className="px-3 py-3">Status</th>
<th className="px-3 py-3">M-Pesa Receipt</th>
<th className="px-3 py-3">Processed By</th>
<th className="px-3 py-3">Processed At</th>
          </tr>
        </thead>

        <tbody>
          {withdrawalHistory.map((item) => (
<tr
  key={item.id}
  onClick={() => setSelectedWithdrawalHistory(item)}
  className="cursor-pointer border-b border-zinc-900 hover:bg-zinc-900/40"
>
<td className="px-3 py-4">
  <p className="font-mono text-[11px] font-semibold text-emerald-400">
    {item.withdrawal_reference || "Unknown Reference"}
  </p>
</td>

<td className="px-3 py-4">
  <p className="text-xs font-semibold text-zinc-200">
    {item.username || "Unknown User"}
  </p>
</td>

<td className="px-3 py-4 text-xs font-semibold text-white">
  KSh{" "}
  {Number(item.amount || 0).toLocaleString(
    "en-KE",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}
</td>

<td className="px-3 py-4">
  <span
    className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${
      item.status === "paid"
        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
        : item.status === "rejected"
        ? "border-red-500/20 bg-red-500/5 text-red-400"
        : "border-amber-500/20 bg-amber-500/5 text-amber-400"
    }`}
  >
    {item.status}
  </span>
</td>

<td className="px-3 py-4">
  <span className="font-mono text-[11px] text-zinc-400">
    {item.mpesa_receipt || "Not recorded"}
  </span>
</td>

<td className="px-3 py-4">
  <p className="text-xs font-semibold text-zinc-200">
    {item.processed_by_username ||
      "Unknown admin"}
  </p>

  <p className="mt-1 font-mono text-[9px] text-zinc-600">
    {item.processed_by || "Unknown ID"}
  </p>
</td>

<td className="px-3 py-4">
  <p className="text-[11px] text-zinc-300">
    {item.processed_at
      ? new Date(
          item.processed_at
        ).toLocaleString("en-KE")
      : "Not processed"}
  </p>
</td>


            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
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

<WithdrawalDrawer
  withdrawal={selectedWithdrawal}
  adminId={adminId}
  onClose={() => setSelectedWithdrawal(null)}
  onSuccess={() => {
    setSelectedWithdrawal(null)
  }}
/>
<WithdrawalHistoryDrawer
  withdrawal={selectedWithdrawalHistory}
  onClose={() => setSelectedWithdrawalHistory(null)}
/>

      </div>
    </main>
  )
}
