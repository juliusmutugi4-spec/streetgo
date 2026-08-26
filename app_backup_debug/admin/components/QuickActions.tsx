'use client'

import Link from 'next/link'

export default function QuickActions() {
  return (
    <div className="mt-8">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Upload Video */}
        <Link
          href="/admin/videos"
          className="group flex flex-col justify-between bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-900/80 hover:border-zinc-700/80 transition-all duration-150"
        >
          <div>
            <h3 className="text-xs font-medium">Upload Video</h3>
            <p className="text-[11px] text-zinc-400 mt-2">
              Publish new movies, series, and trailers.
            </p>
          </div>
        </Link>

        {/* Driver Applications */}
        <Link
          href="/admin/drivers"
          className="group flex flex-col justify-between bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-900/80 hover:border-zinc-700/80 transition-all duration-150"
        >
          <div>
            <h3 className="text-xs font-medium">Driver Applications</h3>
            <p className="text-[11px] text-zinc-400 mt-2">
              Approve or reject pending platform drivers.
            </p>
          </div>
        </Link>

        {/* Manage Users */}
        <Link
          href="/admin/users"
          className="group flex flex-col justify-between bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:bg-zinc-900/80 hover:border-zinc-700/80 transition-all duration-150"
        >
          <div>
            <h3 className="text-xs font-medium">Manage Users</h3>
            <p className="text-[11px] text-zinc-400 mt-2">
              View accounts and manage platform users.
            </p>
          </div>
        </Link>

      </div>
    </div>
  )
}