'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
export default function DriverPage() {
const router = useRouter()
  const [online, setOnline] = useState(false)

  const [driverId, setDriverId] = useState('')
const [driverStatus, setDriverStatus] = useState('')

  
const [requests, setRequests] = useState<any[]>([])
const [currentRide, setCurrentRide] = useState<any>(null)
const [incomingRide, setIncomingRide] = useState<any>(null)
const [countdown, setCountdown] = useState(40)
const [passengerInfo, setPassengerInfo] = useState<any>(null)
const ringtoneRef = useRef<HTMLAudioElement | null>(null)


async function loadRequests() {
  const { data } = await supabase
    .from('ride_requests')
    .select('*')
    .eq('status', 'searching')

  if (data) {
    setRequests(data)
  }
}

async function acceptRide(request: any) {
  if (!driverId) return

const { data, error } = await supabase
  .from("ride_requests")
  .update({
    status: "accepted",
    driver_id: driverId,
  })
  .eq("id", request.id)
  .eq("status", "searching")
  .select()

if (!data || data.length === 0) {
  alert("Another driver already accepted this ride.")

  ringtoneRef.current?.pause()

  if (ringtoneRef.current) {
    ringtoneRef.current.currentTime = 0
  }

  navigator.vibrate?.(0)

  setIncomingRide(null)

  return
}


if (error) {
  alert(JSON.stringify(error))
  console.log(error)
  return
}

if (!error) {
setCurrentRide(request)

ringtoneRef.current?.pause()

if (ringtoneRef.current) {
  ringtoneRef.current.currentTime = 0
}

navigator.vibrate?.(0)

setRequests(prev =>
  prev.filter(r => r.id !== request.id)
)

setIncomingRide(null)

router.push(`/driver/navigation/${request.id}`)
}

}

useEffect(() => {
  ringtoneRef.current = new Audio('/sounds/ride-request.mp3')
  ringtoneRef.current.loop = true

  return () => {
    ringtoneRef.current?.pause()
    ringtoneRef.current = null
  }
}, [])



useEffect(() => {
  loadDriver()
  loadRequests()
}, [])

async function loadDriver() {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return

  const { data } = await supabase
    .from('drivers')
    .select('id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('USER ID:', user.id)
  console.log('DRIVER DATA:', data)

  if (!data) return

  setDriverId(data.id)
  setDriverStatus(data.status)

  if (data.status !== 'approved') return

  const { data: existing } = await supabase
    .from('driver_locations')
    .select('*')
    .eq('driver_id', data.id)
    .maybeSingle()


if (!existing) {

  console.log("Creating driver_locations row...")

  const { error: insertError } = await supabase
    .from('driver_locations')
    .insert({
      driver_id: data.id,
      latitude: 0,
      longitude: 0,
      online: false
    })

  console.log("INSERT ERROR:", insertError)

  setOnline(false)
}



  else {
    setOnline(existing.online)
  }
}

async function toggleOnline() {
  if (!driverId) return

  const newStatus = !online

  setOnline(newStatus)

  const { error } = await supabase
    .from('driver_locations')
    .update({
      online: newStatus
    })
    .eq('driver_id', driverId)

await supabase
  .from('drivers')
  .update({
    available: newStatus
  })
  .eq('id', driverId)


  if (error) {
    console.log(error)
    alert(error.message)
  }
}

useEffect(() => {
  const channel = supabase
    .channel('driver-status')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'drivers'
      },
      (payload) => {
        const driver = payload.new as any

        if (driver.id === driverId) {
          setDriverStatus(driver.status)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [driverId])

useEffect(() => {
  if (!online || !driverId) return

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
await supabase
  .from('driver_locations')
  .update({
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    online: true
  })
  .eq('driver_id', driverId)
    },
    (error) => console.log(error),
    {
      enableHighAccuracy: true
    }
  )

  return () => navigator.geolocation.clearWatch(watchId)
}, [online, driverId])

useEffect(() => {
  const channel = supabase
    .channel('ride-requests')

.on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "ride_requests",
  },
  (payload) => {

    const ride = payload.new as any

    if (!incomingRide) return

    if (ride.id !== incomingRide.id) return

    if (ride.status === "accepted") {

      ringtoneRef.current?.pause()

      if (ringtoneRef.current) {
        ringtoneRef.current.currentTime = 0
      }

      navigator.vibrate?.(0)

      setIncomingRide(null)

      setRequests(prev =>
        prev.filter(r => r.id !== ride.id)
      )
    }

  }
)

    .on(

      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ride_requests'
      },
      async (payload) => {
        const ride = payload.new as any
if (ride.driver_id !== driverId) return
        // Ignore rides that are not searching
        if (ride.status !== 'searching') return

        // Ignore when driver is offline
        if (!online) return

ringtoneRef.current?.play()

navigator.vibrate?.([1000, 500, 1000, 500, 1000])

setIncomingRide({
  ...ride
})

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', ride.passenger_id)
          .single()

        setPassengerInfo(data)

        setRequests(prev => [
          ride,
          ...prev
        ])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [online, driverId])



useEffect(() => {
  if (!incomingRide) return

  setCountdown(40)

  const vibrationInterval = setInterval(() => {
  navigator.vibrate?.([700, 300])
}, 1000)
  const interval = setInterval(() => {
    setCountdown(prev => {
if (prev <= 1) {
  ringtoneRef.current?.pause()
  ringtoneRef.current!.currentTime = 0
  navigator.vibrate?.(0)

  setRequests(prevRequests =>
    prevRequests.filter(r => r.id !== incomingRide.id)
  )

  setIncomingRide(null)

  clearInterval(interval)

  return 0
}

      return prev - 1
    })
  }, 1000)

  return () => {
  clearInterval(interval)
  clearInterval(vibrationInterval)
  navigator.vibrate?.(0)
}
}, [incomingRide])

if (driverStatus === 'pending') {
  return (
    <main className="min-h-screen bg-[#060608] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 rounded-3xl p-8 text-center">

        <div className="text-6xl mb-5">⏳</div>

        <h1 className="text-3xl font-black text-white">
          Application Under Review
        </h1>

        <p className="text-zinc-400 mt-4">
          Your driver application has been received.
        </p>

        <p className="text-zinc-400 mt-2">
          We'll notify you once your documents have been reviewed.
        </p>

      </div>
    </main>
  )
}

if (driverStatus === 'rejected') {
  return (
    <main className="min-h-screen bg-[#060608] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 rounded-3xl p-8 text-center">

        <div className="text-6xl mb-5">❌</div>

        <h1 className="text-3xl font-black text-white">
          Application Rejected
        </h1>

        <p className="text-zinc-400 mt-4">
          Please contact support or submit a new application.
        </p>

      </div>
    </main>
  )
}



return (
  <main className="min-h-screen bg-[#060608] text-white p-6">

    <div className="max-w-xl mx-auto">

<div className="mb-5">
<div className="mb-5 flex items-center">

  <button
    onClick={() => router.back()}
    className="
      w-12
      h-12
      flex
      items-center
      justify-center
      rounded-full
      hover:bg-zinc-800
      transition-all
      duration-200
      active:scale-95
    "
  >
    <ArrowLeft size={34} className="text-white" />
  </button>

</div>
  <p className="text-[11px] tracking-[4px] font-bold text-green-500 uppercase">
    STREETGO DRIVER
  </p>

  <div className="mt-1 flex items-center justify-between">

    <div>
      <h1 className="text-2xl font-extrabold text-white leading-none">
        Good Afternoon 👋
      </h1>

      <p className="text-xs text-zinc-400 mt-1">
        Ready for new ride requests
      </p>
    </div>

    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-2 rounded-full border border-zinc-800">

      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

      <span className="text-xs font-semibold text-white">
        ONLINE
      </span>

    </div>

  </div>

</div>

<div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

  {/* Green top line */}
  <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-green-400" />

  <div className="flex items-center justify-between px-4 py-3">

    {/* Left */}
    <div>

      <p className="text-[10px] uppercase tracking-[3px] text-zinc-500 font-semibold">
        DRIVER STATUS
      </p>

      <div className="flex items-center gap-2 mt-1">

        <div
          className={`
            w-2.5
            h-2.5
            rounded-full
            ${
              online
                ? 'bg-green-500 animate-pulse'
                : 'bg-red-500'
            }
          `}
        />

        <span
          className={`
            text-sm
            font-black
            ${
              online
                ? 'text-green-400'
                : 'text-red-400'
            }
          `}
        >
          {online ? 'ONLINE' : 'OFFLINE'}
        </span>

      </div>

    </div>

    {/* Right Button */}
    <button
      onClick={toggleOnline}
      className={`
        px-3
        py-2
        rounded-full
        text-[11px]
        font-bold
        transition-all
        duration-300
        ${
          online
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-green-500 hover:bg-green-600 text-black'
        }
      `}
    >
      {online ? 'GO OFFLINE' : 'GO ONLINE'}
    </button>

  </div>

</div>

<div className="grid grid-cols-3 gap-3 mt-4">

  {/* Earnings */}
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">

    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
      Earnings
    </p>

    <h2 className="mt-2 text-lg font-black text-green-400">
      KES 0
    </h2>

    <p className="text-[11px] text-zinc-500 mt-1">
      Today
    </p>

  </div>

  {/* Trips */}
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">

    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
      Trips
    </p>

    <h2 className="mt-2 text-lg font-black text-white">
      0
    </h2>

    <p className="text-[11px] text-zinc-500 mt-1">
      Today
    </p>

  </div>

  {/* Rating */}
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3">

    <p className="text-[10px] uppercase tracking-widest text-zinc-500">
      Rating
    </p>

    <h2 className="mt-2 text-lg font-black text-yellow-400">
      ★ 5.0
    </h2>

    <p className="text-[11px] text-zinc-500 mt-1">
      Excellent
    </p>

  </div>

</div>



{online && !incomingRide && (

  <div className="mt-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

    <div className="flex flex-col items-center">

      {/* Animated Car */}
      <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center animate-pulse">

        <span className="text-5xl">
          🚗
        </span>

      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        Waiting for Ride Requests
      </h2>

      <p className="mt-2 text-sm text-zinc-400 text-center max-w-xs">
        Stay online. New passenger requests will appear automatically.
      </p>

      {/* Status */}
      <div className="mt-6 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2">

        <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>

        <span className="text-xs font-semibold text-green-400">
          LIVE • Listening for nearby rides
        </span>

      </div>

    </div>

  </div>

)}



      {incomingRide && (

<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">

  <div className="bg-zinc-900 rounded-3xl p-8 w-[90%] max-w-md">

<div className="text-center">

  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 animate-pulse">

    <span className="text-5xl">
      🚖
    </span>

  </div>

  <p className="mt-5 text-[11px] uppercase tracking-[5px] text-red-400 font-bold">
    STREETGO
  </p>

  <h1 className="mt-2 text-3xl font-black text-white">
    New Ride Request
  </h1>

  <p className="text-sm text-zinc-400 mt-2">
    A passenger is requesting a ride.
  </p>

</div>

<div className="mt-6 flex items-center gap-4">

  <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-3xl">
    👤
  </div>

  <div>

    <h2 className="text-2xl font-bold text-white">
      {passengerInfo?.username || 'Passenger'}
    </h2>

<div className="mt-6 flex items-center">

  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-2xl font-black">

    {passengerInfo?.username?.charAt(0)?.toUpperCase() || "P"}

  </div>

  <div className="ml-4">

    <h2 className="text-xl font-bold text-white">
      {passengerInfo?.username || "Passenger"}
    </h2>

    <div className="flex items-center gap-2 mt-1">

      ⭐⭐⭐⭐⭐

      <span className="text-xs text-zinc-400">
        4.9 Rating
      </span>

    </div>

  </div>

</div>

  </div>

</div>


<p className="text-center text-yellow-400 mt-4 text-2xl font-bold">
  ⏱️ {countdown}s
</p>
    <div className="mt-8 space-y-3">

      <p className="text-xl text-white">
        Destination:
        {' '}
        {incomingRide.destination}
      </p>

<p className="text-xl text-green-400">
  Estimated Fare: KES 250
</p>

<p className="text-xl text-cyan-400">
  Distance: 2.3 km
</p>


      <p className="text-xl text-white">
        Type:
        {' '}
        {incomingRide.ride_type}
      </p>

    </div>

    <button
      onClick={() => acceptRide(incomingRide)}
      className="
      w-full
      mt-8
      bg-green-500
      text-black
      p-5
      rounded-3xl
      font-black
      text-2xl
      "
    >
      ACCEPT
    </button>

  <button
  onClick={() => {

    ringtoneRef.current?.pause()

    if (ringtoneRef.current) {
      ringtoneRef.current.currentTime = 0
    }

    navigator.vibrate?.(0)

    if (incomingRide) {
      setRequests(prev =>
        prev.filter(r => r.id !== incomingRide.id)
      )
    }

    setIncomingRide(null)

  }}
  className="
    w-full
    mt-3
    bg-red-500
    text-white
    p-5
    rounded-3xl
    font-black
    text-2xl
  "
>
  REJECT
</button>

  </div>

</div>

)}

      {/* REQUESTS LIST */}
      <div className="mt-8 space-y-4">

        {requests.map((req) => (

          <div
            key={req.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
          >

            <h2 className="text-xl font-bold">
              🚨 New Ride Request
            </h2>

            <p className="text-zinc-300 mt-2">
              Destination: {req.destination}
            </p>

            <p className="text-zinc-300">
              Type: {req.ride_type}
            </p>

            {/* ACCEPT */}
            <button
              onClick={() => acceptRide(req)}
              className="
                mt-4
                bg-green-500
                text-black
                px-5
                py-3
                rounded-xl
                font-bold
              "
            >
              Accept Ride
            </button>

            {/* REJECT */}
   {/* REJECT */}
<button
  onClick={() => {
    setRequests(prev =>
      prev.filter(r => r.id !== req.id)
    )
  }}
  className="
    mt-3
    w-full
    bg-red-500
    text-white
    px-5
    py-3
    rounded-xl
    font-bold
  "
>
  Reject
</button>

          </div>

        ))}

      </div>

    </div>

  </main>
)
}