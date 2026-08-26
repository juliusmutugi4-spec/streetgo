'use client'

import Link from 'next/link'

interface DashboardCardsProps {
  stats: {
    users: number
    videos: number
    drivers: number
  }
  loading: boolean
}

export default function DashboardCards({
  stats,
  loading,
}: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      {/* Users */}
      <Link
        href="/admin/users"
        className="group relative block bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all duration-200"
      >
        <p className="text-[10px] uppercase text-zinc-400">
          Total Users
        </p>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-2xl font-semibold">
              {stats.users.toLocaleString()}
            </span>
          )}
        </div>
      </Link>

      {/* Videos */}
      <Link
        href="/admin/videos"
        className="group relative block bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all duration-200"
      >
        <p className="text-[10px] uppercase text-zinc-400">
          Total Videos
        </p>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-2xl font-semibold">
              {stats.videos.toLocaleString()}
            </span>
          )}
        </div>
      </Link>

      {/* Drivers */}
      <Link
        href="/admin/drivers"
        className="group relative block bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-5 transition-all duration-200"
      >
        <p className="text-[10px] uppercase text-zinc-400">
          Pending Drivers
        </p>

        <div className="mt-3">
          {loading ? (
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <span className="text-2xl font-semibold">
              {stats.drivers.toLocaleString()}
            </span>
          )}
        </div>
      </Link>

    </div>
  )
}