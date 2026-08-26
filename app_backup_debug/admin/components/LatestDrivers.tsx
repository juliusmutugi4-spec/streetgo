'use client'

interface Driver {
  full_name: string
  vehicle_type: string
  created_at: string
  status: string
}

interface Props {
  drivers: Driver[]
  loading: boolean
}

export default function LatestDrivers({
  drivers,
  loading,
}: Props) {
  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold mb-4">
        Latest Driver Applications
      </h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
        {loading ? (
          <div className="p-4 text-zinc-500">
            Loading...
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-4 text-zinc-500">
            No driver applications yet.
          </div>
        ) : (
          drivers.map((driver, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4"
            >
              <div>
                <p className="font-medium">
                  🚗 {driver.full_name}
                </p>

                <p className="text-xs text-zinc-500">
                  {driver.vehicle_type}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-yellow-400 uppercase">
                  {driver.status}
                </p>

                <p className="text-xs text-zinc-500">
                  {new Date(driver.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}