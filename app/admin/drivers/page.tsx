'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
const [approvedCount, setApprovedCount] = useState(0)
const [rejectedCount, setRejectedCount] = useState(0)
const [pendingCount, setPendingCount] = useState(0)
const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending')
useEffect(() => {

  async function init() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    console.log("ADMIN USER:", user)

    loadDrivers()

  }

  init()

}, [filter])
  async function loadDrivers() {
    setLoading(true)

const { data, error } = await supabase
  .from('drivers')
  .select('*')
  .eq('status', filter)
  .order('created_at', { ascending: false })

console.log("========== DRIVERS ==========")
console.log("Filter:", filter)
console.log("Data:", data)
console.log("Error:", error)
console.log("=============================")

if (!error && data) {

  const driversWithUrls = await Promise.all(

    data.map(async (driver) => {

      const { data: license } = await supabase.storage
        .from('driver-license')
        .createSignedUrl(driver.license_url, 3600)
const { data: front } = await supabase.storage
  .from('driver-id')
  .createSignedUrl(driver.id_front_url, 3600)

  const { data: back } = await supabase.storage
  .from('driver-id')
  .createSignedUrl(driver.id_back_url, 3600)

const { data: vehicle } = await supabase.storage
  .from('driver-vehicle')
  .createSignedUrl(driver.vehicle_photo_url, 3600)


return {
  ...driver,
  license_url: license?.signedUrl || '',
  id_front_url: front?.signedUrl || '',
  id_back_url: back?.signedUrl || '',
  vehicle_photo_url: vehicle?.signedUrl || ''
}
    })

  )

  setDrivers(driversWithUrls)
  setPendingCount(driversWithUrls.length)

}
const { count: approved, error: approvedError } = await supabase
  .from('drivers')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'approved')

console.log("Approved Count:", approved)
console.log("Approved Error:", approvedError)

setApprovedCount(approved || 0)

const { count: rejected } = await supabase
  .from('drivers')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'rejected')


  
setRejectedCount(rejected || 0)

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

<div className="mb-8">

  <h1 className="text-4xl font-black">
    🚖 Driver Management
  </h1>

  <p className="text-zinc-400 mt-2">
    Review, approve and manage driver applications.
  </p>

</div>

        {loading && (
          <div className="text-zinc-400">
            Loading...
          </div>
        )}

<div className="grid grid-cols-3 gap-4 mb-8">

  <div
  onClick={() => setFilter('pending')}
  className={`
    cursor-pointer
    rounded-3xl
    p-5
    text-center
    border
    transition-all
    duration-300

    ${
      filter === 'pending'
        ? 'bg-yellow-500/20 border-yellow-500 scale-[1.02]'
        : 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15'
    }
  `}
>
    <p className="text-4xl">🟡</p>

    <h2 className="text-3xl font-black mt-2">
      {pendingCount}
    </h2>

    <p className="text-zinc-400 text-sm mt-1">
      Pending
    </p>
  </div>

  <div
  onClick={() => setFilter('approved')}
  className={`
    cursor-pointer
    rounded-3xl
    p-5
    text-center
    border
    transition-all
    duration-300

    ${
      filter === 'approved'
        ? 'bg-green-500/20 border-green-500 scale-[1.02]'
        : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/15'
    }
  `}
>
    <p className="text-4xl">✅</p>

    <h2 className="text-3xl font-black mt-2">
      {approvedCount}
    </h2>

    <p className="text-zinc-400 text-sm mt-1">
      Approved
    </p>
  </div>

  <div
  onClick={() => setFilter('rejected')}
  className={`
    cursor-pointer
    rounded-3xl
    p-5
    text-center
    border
    transition-all
    duration-300

    ${
      filter === 'rejected'
        ? 'bg-red-500/20 border-red-500 scale-[1.02]'
        : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/15'
    }
  `}
>
    <p className="text-4xl">❌</p>

    <h2 className="text-3xl font-black mt-2">
      {rejectedCount}
    </h2>

    <p className="text-zinc-400 text-sm mt-1">
      Rejected
    </p>
  </div>

</div>


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

<div className="flex items-center justify-between">

  <div className="flex items-center gap-4">

    <div
      className="
        w-16
        h-16
        rounded-full
        bg-gradient-to-br
        from-cyan-500
        to-blue-600
        flex
        items-center
        justify-center
        text-3xl
        shadow-lg
      "
    >
      👤
    </div>

    <div>

      <h2 className="text-2xl font-black">
        {driver.full_name}
      </h2>

      <p className="text-zinc-400">
        Driver Applicant
      </p>

    </div>

  </div>

<div
  className={`
    px-4
    py-2
    rounded-full
    font-bold
    text-sm
    border

    ${
      driver.status === 'approved'
        ? 'bg-green-500/20 text-green-400 border-green-500/30'
        : driver.status === 'rejected'
        ? 'bg-red-500/20 text-red-400 border-red-500/30'
        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  `}
>
  {driver.status === 'approved'
    ? '🟢 APPROVED'
    : driver.status === 'rejected'
    ? '🔴 REJECTED'
    : '🟡 PENDING'}
</div>

</div>
<div className="mt-6 grid grid-cols-2 gap-4 text-sm">

  <div className="bg-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500">📞 Phone</p>
    <p className="font-bold text-white mt-1">
      {driver.phone}
    </p>
  </div>

  <div className="bg-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500">🪪 National ID</p>
    <p className="font-bold text-white mt-1">
      {driver.national_id}
    </p>
  </div>

  <div className="bg-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500">🏍 Vehicle Type</p>
    <p className="font-bold text-white mt-1">
      {driver.vehicle_type}
    </p>
  </div>

  <div className="bg-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500">🚘 Plate Number</p>
    <p className="font-bold text-white mt-1">
      {driver.plate_number}
    </p>
  </div>

  <div className="bg-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500">🚘 Vehicle Model</p>
    <p className="font-bold text-white mt-1">
      {driver.vehicle_model}
    </p>
  </div>

  <div className="bg-zinc-800 rounded-2xl p-4">
    <p className="text-zinc-500">🎨 Vehicle Color</p>
    <p className="font-bold text-white mt-1">
      {driver.vehicle_color}
    </p>
  </div>

<div className="mt-8">

  <h3 className="text-lg font-bold mb-4">
    📂 Verification Documents
  </h3>

  <div className="grid grid-cols-2 gap-4">

<a
  href={driver.license_url}
  target="_blank"
  className="
    block
    bg-zinc-800
    border
    border-zinc-700
    rounded-2xl
    overflow-hidden
    hover:border-cyan-500
    transition-all
    duration-300
    hover:scale-[1.02]
  "
>

  <img
    src={driver.license_url}
    alt="Driving License"
    className="
      w-full
      h-40
      object-cover
    "
  />

  <div className="p-4">

    <p className="font-bold">
      🪪 Driving License
    </p>

    <p className="text-cyan-400 text-sm mt-1">
      Click to view full image
    </p>

  </div>

</a>

{/* ID Front */}

<a
  href={driver.id_front_url}
  target="_blank"
  className="
    block
    bg-zinc-800
    border
    border-zinc-700
    rounded-2xl
    overflow-hidden
    hover:border-cyan-500
    transition-all
  "
>

  <img
    src={driver.id_front_url}
    className="w-full h-40 object-cover"
    alt="ID Front"
  />

  <div className="p-4">

    <p className="font-bold">
      🆔 ID Front
    </p>

  </div>

</a>

{/* ID Back */}

<a
  href={driver.id_back_url}
  target="_blank"
  className="
    block
    bg-zinc-800
    border
    border-zinc-700
    rounded-2xl
    overflow-hidden
    hover:border-cyan-500
    transition-all
  "
>

  <img
    src={driver.id_back_url}
    className="w-full h-40 object-cover"
    alt="ID Back"
  />

  <div className="p-4">

    <p className="font-bold">
      🆔 ID Back
    </p>

  </div>

</a>

{/* Vehicle */}

<a
  href={driver.vehicle_photo_url}
  target="_blank"
  className="
    block
    bg-zinc-800
    border
    border-zinc-700
    rounded-2xl
    overflow-hidden
    hover:border-cyan-500
    transition-all
  "
>

  <img
    src={driver.vehicle_photo_url}
    className="w-full h-40 object-cover"
    alt="Vehicle"
  />

  <div className="p-4">

    <p className="font-bold">
      🏍️ Vehicle Photo
    </p>

  </div>

</a>

  </div>

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
  disabled={driver.status === 'approved'}
  onClick={() => approveDriver(driver)}
  className={`
    flex-1
    py-4
    rounded-2xl
    font-black
    transition

    ${
      driver.status === 'approved'
        ? 'bg-emerald-800 text-green-300 cursor-default'
        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-[1.02] text-white'
    }
  `}
>
  {driver.status === 'approved'
    ? '✔ Approved'
    : '✅ Approve'}
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
py-4
rounded-2xl
bg-gradient-to-r
from-red-500
to-rose-600
hover:scale-[1.02]
transition-all
duration-300
font-black
text-lg
text-white
shadow-lg
shadow-red-500/20
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