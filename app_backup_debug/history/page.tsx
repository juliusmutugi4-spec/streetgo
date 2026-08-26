'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function HistoryPage() {

  const [trips, setTrips] = useState<any[]>([])

  useEffect(() => {
    loadTrips()
  }, [])

  async function loadTrips() {

    const { data: userData } =
      await supabase.auth.getUser()

    if (!userData.user) return

    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('passenger_id', userData.user.id)
      .eq('status', 'completed')
      .order('created_at', {
        ascending: false
      })

    if (data) {
      setTrips(data)
    }
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white p-6">

      <h1 className="text-4xl font-black mb-8">
        📜 Trip History
      </h1>

      <div className="space-y-4">

        {trips.map((trip) => (

          <div
            key={trip.id}
            className="
            bg-zinc-900
            rounded-3xl
            p-5
            border border-zinc-800
            "
          >

            <p>
              Destination:
              {trip.destination}
            </p>

            <p>
              Ride:
              {trip.ride_type}
            </p>

            <p className="text-green-400">
              Fare:
              KES {trip.fare}
            </p>

          </div>

        ))}

      </div>

    </main>
  )
}