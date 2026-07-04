'use client'

type Props = {
  visible: boolean
}

export default function DriverRideRequestCard({
  visible,
}: Props) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl">

        <h2 className="text-2xl font-bold text-center">
          🚕 New Ride Request
        </h2>

        <div className="mt-6 space-y-3">

          <p>📍 Pickup: Current Location</p>

          <p>🎯 Destination: Westlands</p>

          <p>🛵 Ride: Bodaboda</p>

          <p>📏 Distance: 1.2 km</p>

          <p>💰 Estimated Fare: KES 180</p>

        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">

          <button className="bg-red-500 text-white py-3 rounded-xl font-bold">
            Reject
          </button>

          <button className="bg-green-600 text-white py-3 rounded-xl font-bold">
            Accept
          </button>

        </div>

      </div>
    </div>
  )
}