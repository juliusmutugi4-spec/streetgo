'use client'

import { memo } from 'react'

export interface Activity {
  username: string
  created_at: string
}

interface ActivityProps {
  activities: Activity[]
  loading?: boolean
}

const ActivityRow = memo(({ username, created_at }: Activity) => (
  <div className="flex justify-between items-center py-2.5 px-3 text-xs hover:bg-zinc-800/30 transition-colors">
    <div>
      <p className="font-medium text-zinc-200">{username}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">New registration</p>
    </div>
    <time dateTime={created_at} className="text-[10px] text-zinc-500 font-mono">
      {new Date(created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })}
    </time>
  </div>
))

ActivityRow.displayName = 'ActivityRow'

export default function RecentActivity({ activities, loading }: ActivityProps) {
  if (loading) {
    return <div className="text-xs text-zinc-500 animate-pulse p-4">Loading activity...</div>
  }

  if (!activities?.length) return null

  return (
    <div className="w-full max-w-xs rounded-lg border border-zinc-800 bg-zinc-900/50 p-1 backdrop-blur-sm">
      <div className="divide-y divide-zinc-800/80">
        {activities.map((activity) => (
          <ActivityRow key={activity.username + activity.created_at} {...activity} />
        ))}
      </div>
    </div>
  )
}
