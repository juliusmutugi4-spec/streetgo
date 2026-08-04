'use client'

import DriverDocuments from "./DriverDocuments"
import type { Driver } from "../types"



interface DriverCardProps {
  driver: Driver
  onApprove: (driver: Driver) => void
  onReject: (driver: Driver) => void
}

export default function DriverCard({
  driver,
  onApprove,
  onReject
}: DriverCardProps) {
  
  // Status style dictionary
  const statusStyles = {
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs tracking-wider',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs tracking-wider',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs tracking-wider'
  }

  return (
    <article className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-zinc-700/60 shadow-xl shadow-black/10">
      
      {/* Top Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center shadow-inner group">
            <span className="text-xl text-zinc-400 transition-transform duration-300 group-hover:scale-110" role="img" aria-label="user">👤</span>
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              {driver.full_name}
            </h2>
            <p className="text-zinc-500 text-xs font-medium uppercase mt-0.5 tracking-wider">
              Driver Applicant
            </p>
          </div>
        </div>

        {/* Dynamic Badge */}
        <div className={`self-start sm:self-center px-3 py-1.5 rounded-lg font-bold border uppercase font-mono ${statusStyles[driver.status] || statusStyles.pending}`}>
          {driver.status}
        </div>
      </div>

      {/* Meta Specifications Grid */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Phone', value: driver.phone, icon: '📞' },
          { label: 'National ID', value: driver.national_id, icon: '🪪' },
          { label: 'Vehicle Type', value: driver.vehicle_type, icon: '🏍' },
          { label: 'Plate Number', value: driver.plate_number, icon: '🚘' },
          { label: 'Vehicle Model', value: driver.vehicle_model, icon: '📋' },
          { label: 'Vehicle Color', value: driver.vehicle_color, icon: '🎨' },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/80 border border-zinc-800/60 rounded-xl p-3.5 transition-colors hover:border-zinc-800">
            <p className="text-zinc-500 text-xs font-medium flex items-center gap-1.5">
              <span>{item.icon}</span> {item.label}
            </p>
            <p className="font-semibold text-zinc-200 text-sm mt-1 truncate">
              {item.value || '—'}
            </p>
          </div>
        ))}
      </div>

      {/* Document Section Wrapper */}
      <div className="mt-6 pt-6 border-t border-zinc-800/60">
        <DriverDocuments driver={driver} />
      </div>

      {/* Control Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        {driver.status !== 'approved' && (
          <button
            onClick={() => onApprove(driver)}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 active:scale-[0.99] shadow-sm"
          >
            Approve Application
          </button>
        )}

        {driver.status !== 'rejected' && (
          <button
            onClick={() => onReject(driver)}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 border border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 active:scale-[0.99]"
          >
            Reject Applicant
          </button>
        )}
      </div>

    </article>
  )
}
