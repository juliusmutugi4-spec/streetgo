'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDrivers()
  }, [])

  async function loadDrivers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDrivers(data)
    }

    setLoading(false)
  }

async function approveDriver(driver: any) {

  // Approve driver
  const { error } = await supabase
    .from('drivers')
    .update({
      status: 'approved'
    })
    .eq('id', driver.id)

  if (error) return

  // Create location row
  await supabase
    .from('driver_locations')
    .insert({
      driver_id: driver.id,
      latitude: 0,
      longitude: 0,
      online: false
    })

  loadDrivers()
}


  
  return (
    <main className="min-h-screen bg-[#060608] text-white p-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-black mb-8">
          🚗 Driver Applications
        </h1>

        {loading && (
          <div className="text-zinc-400">
            Loading...
          </div>
        )}

        <div className="space-y-5">

          {drivers.map((driver) => (

            <div
              key={driver.id}
              className="
              bg-zinc-900
              border border-zinc-800
              rounded-3xl
              p-6
              "
            >

              <h2 className="text-2xl font-bold">
                {driver.full_name}
              </h2>
<div className="mt-4 space-y-2 text-zinc-300">

  <p>
    📞 {driver.phone}
  </p>

  <p>
    🪪 ID: {driver.id_number}
  </p>

  <p>
    🚘 Plate: {driver.plate_number}
  </p>

  <p>
    🏍️ Vehicle Type: {driver.vehicle_type}
  </p>

  <p>
    🚘 Model: {driver.vehicle_model}
  </p>

  <p>
    🎨 Color: {driver.vehicle_color}
  </p>

  <div className="pt-4 space-y-2">

    <a
      href={driver.license_url}
      target="_blank"
      className="block text-cyan-400"
    >
      🪪 View Driving License
    </a>

    <a
      href={driver.id_front_url}
      target="_blank"
      className="block text-cyan-400"
    >
      🆔 View ID Front
    </a>

    <a
      href={driver.id_back_url}
      target="_blank"
      className="block text-cyan-400"
    >
      🆔 View ID Back
    </a>

    <a
      href={driver.vehicle_photo_url}
      target="_blank"
      className="block text-cyan-400"
    >
      🏍️ View Vehicle Photo
    </a>

  </div>

  <p>
    Status:
    <span className="text-yellow-400 ml-2">
      {driver.status}
    </span>
  </p>

</div>

<div className="mt-6 flex gap-4">

  <button
    onClick={() => approveDriver(driver)}
    className="
    flex-1
    px-6
    py-3
    rounded-2xl
    bg-green-500
    text-black
    font-black
    "
  >
    ✅ Approve
  </button>

  <button
    onClick={async () => {

      await supabase
        .from('drivers')
        .update({
          status: 'rejected'
        })
        .eq('id', driver.id)

      loadDrivers()

    }}
    className="
    flex-1
    px-6
    py-3
    rounded-2xl
    bg-red-500
    text-white
    font-black
    "
  >
    ❌ Reject
  </button>

</div>

            </div>

          ))}

        </div>

      </div>

    </main>
  )
}