'use client'

interface Props {
  users: number
  videos: number
  pendingDrivers: number
}

export default function SystemHealth({
  users,
  videos,
  pendingDrivers,
}: Props) {
  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">
        System Health
      </h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">

        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <span>🟢 Database</span>
          <span className="text-green-400 font-medium">
            Online
          </span>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <span>🟢 Video Library</span>
          <span>
            {videos.toLocaleString()} Videos
          </span>
        </div>

        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <span>👥 Registered Users</span>
          <span>
            {users.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-4">
          <span>🚕 Pending Drivers</span>

          <span
            className={
              pendingDrivers > 0
                ? 'text-yellow-400 font-semibold'
                : 'text-green-400 font-semibold'
            }
          >
            {pendingDrivers}
          </span>
        </div>

      </div>
    </div>
  )
}