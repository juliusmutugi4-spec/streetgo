'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function DriversPage() {

  const [driver, setDriver] = useState<any>(null)
  const [totalTrips, setTotalTrips] = useState(0)
  const [todayEarnings, setTodayEarnings] = useState(0)

  useEffect(() => {
    loadDriver()
  }, [])

  async function loadDriver() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!data) return

    setDriver(data)

    // Total trips
    const { count } = await supabase
      .from('trips')
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('driver_id', data.id)
      .eq('status', 'completed')

    setTotalTrips(count || 0)

    // Today's earnings
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: trips } = await supabase
      .from('trips')
      .select('fare')
      .eq('driver_id', data.id)
      .eq('status', 'completed')
      .gte('created_at', today.toISOString())

    let total = 0

    trips?.forEach((trip) => {
      total += trip.fare || 0
    })

    setTodayEarnings(total)
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white p-6">

      <div className="max-w-xl mx-auto">

        <h1 className="text-4xl font-black mb-8">
          💰 Driver Wallet
        </h1>

        <div className="space-y-5">

          {/* Total Earnings */}
          <div className="bg-zinc-900 rounded-3xl p-6">
            <p className="text-zinc-400">
              Total Earnings
            </p>

            <h2 className="text-4xl font-black text-green-500">
              KES {driver?.earnings || 0}
            </h2>
          </div>

          {/* Wallet */}
          <div className="bg-zinc-900 rounded-3xl p-6">
            <p className="text-zinc-400">
              Wallet Balance
            </p>

            <h2 className="text-4xl font-black text-cyan-400">
              KES {driver?.wallet_balance || 0}
            </h2>
          </div>

          {/* Total Trips */}
          <div className="bg-zinc-900 rounded-3xl p-6">
            <p className="text-zinc-400">
              Total Trips
            </p>

            <h2 className="text-4xl font-black text-yellow-400">
              {totalTrips}
            </h2>
          </div>

          {/* Today's Earnings */}
          <div className="bg-zinc-900 rounded-3xl p-6">
            <p className="text-zinc-400">
              Today's Earnings
            </p>

            <h2 className="text-4xl font-black text-orange-400">
              KES {todayEarnings}
            </h2>
          </div>

          {/* Rating */}
          <div className="bg-zinc-900 rounded-3xl p-6">
            <p className="text-zinc-400">
              Driver Rating
            </p>

            <h2 className="text-4xl font-black text-yellow-500">
              ⭐ {driver?.rating || 5.0}
            </h2>
          </div>

          {/* Withdraw */}
          <button
            className="
            w-full
            bg-green-500
            text-black
            p-5
            rounded-3xl
            font-black
            text-xl
            "
          >
            💸 Withdraw Money
          </button>

        </div>

      </div>

    </main>
  )
}