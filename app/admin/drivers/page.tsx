'use client'

import { useState } from 'react'
import useDrivers from "./hooks/useDrivers"
import DriverCard from "./components/DriverCard"
import { approveDriver, rejectDriver } from "./actions/driverActions"
import type { Driver } from "./types"
type FilterType = 'pending' | 'approved' | 'rejected'

export default function AdminDriversPage() {
  const [filter, setFilter] = useState<FilterType>('pending')
  const {
    drivers,
    setDrivers,
    loading,
    loadDrivers,
    pendingCount,
    approvedCount,
    rejectedCount
  } = useDrivers(filter)

  // Unified action handler for optimistic state updates
  async function handleDriverAction(
  driver: Driver,
  action: 'approve' | 'reject'
) {
    // Optimistic UI update: Remove from list immediately
    setDrivers((prev: Driver[]) =>
  prev.filter((d) => d.id !== driver.id)
)

    try {
      const success = action === 'approve' 
        ? await approveDriver(driver) 
        : await rejectDriver(driver.id)

      if (!success) {
        // Revert back or re-sync if the server action failed
        await loadDrivers()
      }
    } catch (error) {
      console.error(`Failed to ${action} driver:`, error)
      await loadDrivers()
    }
  }

  // Stat card style definitions for cleaner JSX
  const statConfig = {
    pending: { label: 'Pending', count: pendingCount, color: 'border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 active:border-amber-500' },
    approved: { label: 'Approved', count: approvedCount, color: 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 active:border-emerald-500' },
    rejected: { label: 'Rejected', count: rejectedCount, color: 'border-rose-500/30 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 active:border-rose-500' }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 antialiased selection:bg-zinc-800 selection:text-white">
      <div className="max-w-5xl mx-auto px-4 py-12 md:px-8">
        
        {/* Header Section */}
<header className="mb-10 border-b border-zinc-800/50 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
  
  {/* Branding & Scope Titles */}
  <div>
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
        <span className="text-base text-zinc-400" role="img" aria-label="taxi">🚖</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
        Driver Management
      </h1>
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800 font-mono">
        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
        Live Operations
      </span>
    </div>
    <p className="text-zinc-400 text-xs font-medium mt-2 max-w-xl leading-relaxed">
      Verify corporate credentials, manage commercial fleet regulations, and supervise real-time driver compliance verification matrix logs.
    </p>
  </div>

  {/* Control System Actions */}
  <div className="flex items-center gap-3 self-start md:self-center">
    <button 
      onClick={() => window.location.reload()}
      className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-700"
      title="Refresh Registry"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </button>
    <button 
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-zinc-700"
    >
      Export CSV Log
    </button>
  </div>

</header>


        {/* Status Filter Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" aria-label="Filter applications">
          {(Object.keys(statConfig) as FilterType[]).map((type) => {
            const isActive = filter === type
            const cfg = statConfig[type]
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 text-left backdrop-blur-sm group focus:outline-none focus:ring-2 focus:ring-zinc-700
                  ${isActive 
                    ? `${cfg.color.split(' ')[0].replace('/30', '')} bg-zinc-900 shadow-lg shadow-black/40 scale-[1.01]` 
                    : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200'
                  }`}
              >
                <div>
                  <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500 group-hover:text-zinc-400 transition-colors">
                    {cfg.label}
                  </p>
                  <h2 className={`text-3xl font-bold mt-1 tracking-tight ${isActive ? '' : 'text-zinc-200'}`}>
                    {cfg.count}
                  </h2>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-125
                  ${type === 'pending' ? 'bg-amber-500' : type === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                />
              </button>
            )
          })}
        </section>

        {/* Main Content Area */}
        <section className="relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-[#09090b]/60 backdrop-blur-xs flex items-center justify-center z-10 transition-opacity">
              <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
                <svg className="animate-spin h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating registry...
              </div>
            </div>
          )}

          {drivers.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <p className="text-zinc-500 text-sm font-medium">No {filter} driver applications found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drivers.map((driver) => (
                <DriverCard
                  key={driver.id}
                  driver={driver}
                  onApprove={(d) => handleDriverAction(d, 'approve')}
                  onReject={(d) => handleDriverAction(d, 'reject')}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
