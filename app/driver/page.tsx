'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function DriverPage() {

  const [online, setOnline] = useState(false)

  const [driverId, setDriverId] = useState('')
const [driverStatus, setDriverStatus] = useState('')

  
const [requests, setRequests] = useState<any[]>([])
const [currentRide, setCurrentRide] = useState<any>(null)
const [incomingRide, setIncomingRide] = useState<any>(null)
const [countdown, setCountdown] = useState(20)
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

const { error } = await supabase
  .from('ride_requests')
  .update({
    status: 'accepted',
    driver_id: driverId
  })
  .eq('id', request.id)

if (error) {
  alert(JSON.stringify(error))
  console.log(error)
  return
}

  if (!error) {
    setCurrentRide(request)

    ringtoneRef.current?.pause()
ringtoneRef.current!.currentTime = 0
navigator.vibrate?.(0)
    setIncomingRide(null)

    setRequests(prev =>
      prev.filter(r => r.id !== request.id)
    )
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
    await supabase
      .from('driver_locations')
      .insert({
        driver_id: data.id,
        latitude: 0,
        longitude: 0,
        online: false
      })

    setOnline(false)
  } else {
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
          longitude: position.coords.longitude
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

const vibrationInterval = setInterval(() => {
  navigator.vibrate?.([700, 300])
}, 1000)

useEffect(() => {
  if (!incomingRide) return

  setCountdown(20)

  const interval = setInterval(() => {
    setCountdown(prev => {
      if (prev <= 1) {
        ringtoneRef.current?.pause()
ringtoneRef.current!.currentTime = 0
navigator.vibrate?.(0)
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

      <h1 className="text-4xl font-black">
        🚗 Driver Dashboard
      </h1>

      {/* STATUS CARD */}
      <div className="mt-8 bg-zinc-900 rounded-3xl p-6">

        <div className="flex justify-between">

          {/* LEFT SIDE */}
          <div>
            <p className="text-zinc-400">
              Status
            </p>

            <h2
              className={`text-2xl font-bold ${
                online ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {online ? 'Online' : 'Offline'}
            </h2>
          </div>

          {/* BUTTON */}
          <button
            onClick={toggleOnline}
            className={`
              px-6
              py-3
              rounded-xl
              font-bold
              ${
                online
                  ? 'bg-red-500 text-white'
                  : 'bg-green-500 text-black'
              }
            `}
          >
            {online ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>




        </div>

      </div>

      {incomingRide && (

<div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">

  <div className="bg-zinc-900 rounded-3xl p-8 w-[90%] max-w-md">

    <h1 className="text-3xl font-black text-center text-red-500">
      🚨 NEW RIDE REQUEST
    </h1>

<div className="mt-6 flex items-center gap-4">

  <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-3xl">
    👤
  </div>

  <div>

    <h2 className="text-2xl font-bold text-white">
      {passengerInfo?.username || 'Passenger'}
    </h2>

    <p className="text-zinc-400">
      ⭐ 4.9
    </p>

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
  ringtoneRef.current!.currentTime = 0
navigator.vibrate?.(0)
  

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
            <button
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