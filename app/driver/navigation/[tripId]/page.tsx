'use client'

import { use, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Props = {
  params: Promise<{
    tripId: string
  }>
}

export default function DriverNavigationPage({ params }: Props) {
  const { tripId } = use(params)

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrip() {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) {
        console.error(error)
      } else {
        setTrip(data)
      }

      setLoading(false)
    }

    loadTrip()
  }, [tripId])

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading trip...
      </main>
    )
  }

  if (!trip) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-red-500">
        Trip not found
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <h1 className="text-3xl font-bold mb-8">
        Driver Navigation
      </h1>

      <div className="rounded-3xl bg-zinc-900 p-6 space-y-4">

        <div>
          <p className="text-zinc-400 text-sm">Trip ID</p>
          <p>{trip.id}</p>
        </div>

        <div>
          <p className="text-zinc-400 text-sm">Passenger</p>
          <p>{trip.passenger_id}</p>
        </div>

        <div>
          <p className="text-zinc-400 text-sm">Destination</p>
          <p>{trip.destination}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="rounded-xl bg-zinc-800 p-4">
            <p className="text-zinc-400 text-sm">Pickup Latitude</p>
            <p>{trip.pickup_lat}</p>
          </div>

          <div className="rounded-xl bg-zinc-800 p-4">
            <p className="text-zinc-400 text-sm">Pickup Longitude</p>
            <p>{trip.pickup_lng}</p>
          </div>

        </div>

        <div className="rounded-xl bg-cyan-600 p-4 font-semibold">
          Status: {trip.status}
        </div>

      </div>

    </main>
  )
}