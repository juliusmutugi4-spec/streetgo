'use client'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'


import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export default function MapPage() {

  const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])
    const [user, setUser] = useState<any>(null)
  const [longitude, setLongitude] = useState(36.817223)
  const [latitude, setLatitude] = useState(-1.286389)
const [pickup, setPickup] = useState([longitude, latitude])
const [destination, setDestination] = useState('')
const [rideType, setRideType] = useState<'boda' | 'taxi'>('boda')
const [tripId, setTripId] = useState('')
const [selectedDriver, setSelectedDriver] = useState<any>(null)
const [searching, setSearching] = useState(false)
const [rideAccepted, setRideAccepted] = useState(false)
const [tripStatus, setTripStatus] = useState<
  'accepted' | 'arrived' | 'ongoing' | 'completed' | null
>(null)
const [drivers, setDrivers] = useState<any[]>([])
const [driverInfo, setDriverInfo] = useState<any>(null)
const [driverLat, setDriverLat] = useState(0)
const [driverLng, setDriverLng] = useState(0)
const [fare, setFare] = useState(0)
useEffect(() => {
  loadDrivers()
}, [])

async function loadDrivers() {

  const { data } = await supabase
    .from('driver_locations')
    .select(`
      *,
      drivers(*)
    `)
    .eq('online', true)

  if (data) {
    setDrivers(data)
  }

}


useEffect(() => {

  async function loadUser() {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    setUser(user)
  }

  loadUser()

}, [])

useEffect(() => {

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLongitude(position.coords.longitude)
      setLatitude(position.coords.latitude)
    },
    (error) => console.log(error)
  )

}, [])


function calculateFare() {

  let base = rideType === 'boda' ? 100 : 250

  let distanceMultiplier = 1.2

  let total = Math.round(base * distanceMultiplier)

  setFare(total)

}

async function requestRide() {

  const { data: userData } =
    await supabase.auth.getUser()

  if (!userData.user || !selectedDriver) return

  const { data } = await supabase
    .from('trips')
    .insert({
      passenger_id: userData.user.id,
      driver_id: selectedDriver.driver_id,
      pickup_lat: latitude,
      pickup_lng: longitude,
      destination,
      ride_type: rideType,
      status: 'searching'
    })
    .select()
    .single()
if (data) {
  setTripId(data.id)
}
  setSearching(true)
}

useEffect(() => {

  async function listenForAcceptance() {

if (!user) return

  const channel = supabase
  .channel(`ride-status-${crypto.randomUUID()}`)

      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ride_requests'
        },

        async (payload) => {

          const ride = payload.new as any

if (
  ride.passenger_id === user.id &&
  ride.status === 'accepted'
) {

  // 1. get driver info
  const { data } = await supabase
    .from('drivers')
    .select('*')
    .eq('id', ride.driver_id)
    .single()

  setDriverInfo(data)

  // 2. update UI
  setSearching(false)
  setRideAccepted(true)

  // 3. UPDATE DATABASE TRIP STATUS (IMPORTANT)
  await supabase
    .from('trips')
    .update({
      status: 'accepted'
    })
    .eq('id', ride.id)
}

        }
      )

      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }

  listenForAcceptance()

}, [])

useEffect(() => {

  if (!driverInfo) return

async function loadInitialDriverLocation() {

  const { data } = await supabase
    .from('driver_locations')
    .select('latitude, longitude')
    .eq('driver_id', driverInfo.id)
    .single()

  if (data) {
    setDriverLat(data.latitude)
    setDriverLng(data.longitude)
  }

}

loadInitialDriverLocation()

  const channel = supabase

    .channel('driver-tracking')

    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'driver_locations'
      },

      (payload) => {

        const location = payload.new as any

        if (location.driver_id === driverInfo.id) {

          setDriverLat(location.latitude)

          setDriverLng(location.longitude)

        }

      }

    )

    .subscribe()

  return () => {

    supabase.removeChannel(channel)

  }

}, [driverInfo])

async function arrivedTrip() {

  setTripStatus('arrived')

  await supabase
    .from('trips')
    .update({
      status: 'arrived'
    })
    .eq('id', tripId)

}

async function startTrip() {

  setTripStatus('ongoing')

  await supabase
    .from('trips')
    .update({
      status: 'ongoing'
    })
    .eq('id', tripId)

}

async function endTrip() {

  calculateFare()

  setTripStatus('completed')

  await supabase
    .from('trips')
    .update({
      status: 'completed',
      fare: fare
    })
    .eq('id', tripId)

  if (driverInfo) {

    await supabase.rpc(
      'increase_driver_earnings',
      {
        driver_id_input: driverInfo.id,
        amount_input: fare
      }
    )

await supabase.rpc(
  'add_driver_wallet',
  {
    driver_id_input: driverInfo.id,
    amount_input: fare
  }
)


  }

  setRideAccepted(false)
setSelectedDriver(null)
setSearching(false)

}

if (!mounted) return null

return (
  <div className="relative w-full h-screen overflow-hidden">


<p className="absolute top-0 left-0 z-50 bg-red-500 text-white p-2">
  {process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
</p>

<Map
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  initialViewState={{
    longitude,
    latitude,
    zoom: 15
  }}
  mapStyle="mapbox://styles/mapbox/light-v11"
  style={{
    width: '100vw',
    height: '100vh'
  }}
>
    
      {/* User */}
      <Marker longitude={longitude} latitude={latitude}>
        <div className="text-4xl">📍</div>
      </Marker>




{drivers.map(driver => (

  <Marker
    key={driver.id}
    longitude={driver.longitude}
    latitude={driver.latitude}
  >

    <div className="text-5xl">

      {driver.drivers.vehicle_type === 'boda'
        ? '🏍️'
        : '🚗'}

    </div>

  </Marker>

))}

{rideAccepted && driverInfo && (

  <Marker
    longitude={driverLng}
    latitude={driverLat}
  >

    <div className="text-6xl animate-bounce">

      {driverInfo.vehicle_type === 'boda'
        ? '🏍️'
        : '🚗'}

    </div>

  </Marker>

)}

    </Map>

    {/* Bottom Panel */}
<div className="
absolute
bottom-0
left-0
right-0
bg-transparent
rounded-t-[40px]
p-6
space-y-3
">

<div className="flex items-center gap-2 mb-5">
  <div className="
  w-10 h-10
  rounded-3xl
  bg-[#E11D48]
  text-white
  flex items-center
  justify-center
  font-bold
  ">
    SG
  </div>

  <h1 className="text-3xl font-black text-white">
    Street<span className="text-[#E11D48]">GO</span>
  </h1>
</div>

<div className="space-y-3">

  {/* Pickup */}
  <div className="bg-black/70
backdrop-blur-md
border border-cyan-500/20 rounded-3xl p-4">
    <p className="text-xs text-cyan-400">
      PICKUP
    </p>

<input
className="
w-full
bg-transparent
outline-none
text-white
"
      value="Current location"
      readOnly
    />
  </div>

  {/* Destination */}
<div className="
bg-black/70
backdrop-blur-md
border border-cyan-500/20
rounded-3xl
p-4
">

<p className="text-xs text-cyan-400">
  DESTINATION
</p>

<input
  value={destination}
  onChange={(e) => setDestination(e.target.value)}
  placeholder="Where are you going?"
  className="
  w-full
  bg-transparent
  outline-none
  text-white
  placeholder-gray-500
  "
/>

</div>

</div>

<div className="space-y-3">

  <button
    onClick={() => setRideType('boda')}
    className={`w-full p-4 rounded-3xl flex justify-between transition ${
      rideType === 'boda'
        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
        : 'bg-black/70 border border-cyan-500/20 text-white'
    }`}
  >
    <span>🏍️ Bodaboda</span>
    <span>KES 100</span>
  </button>

  <button
    onClick={() => setRideType('taxi')}
    className={`w-full p-4 rounded-3xl flex justify-between transition ${
      rideType === 'taxi'
        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
        : 'bg-black/70 border border-cyan-500/20 text-white'
    }`}
  >
    <span>🚗 Taxi</span>
    <span>KES 250</span>
  </button>

</div>


<div className="mt-5">

  <h2 className="font-bold text-lg mb-3">
    Nearby Drivers
  </h2>

  <div className="space-y-3">

{drivers
  .filter(driver => driver.drivers.vehicle_type === rideType)
  .map(driver => (

<div
  key={driver.id}
  onClick={() => setSelectedDriver(driver)}
className="
bg-black/70
backdrop-blur-md
border border-cyan-500/20
rounded-3xl
p-4
flex
justify-between
cursor-pointer
text-white
hover:border-cyan-400
transition
"
>

          <div>
            <h3 className="font-bold">
              {driver.drivers.full_name}
            </h3>

            <p className="text-sm bg-cyan-500 text-black">
              🟢 Online
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              {driver.drivers.vehicle_type === 'boda'
 ? '🏍️ Bodaboda'
 : '🚗 Taxi'}
            </p>

            <p className="text-sm bg-cyan-500 text-black">
              away
            </p>
          </div>

        </div>

      ))}

  </div>

</div>
{selectedDriver && (

<div className="mt-5 bg-[#09111F] border border-cyan-500/20 text-white rounded-3xl p-5">

  <div className="flex items-center gap-4">

    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-3xl">
      👨🏿
    </div>

    <div>
<h2 className="text-xl font-bold">
  {selectedDriver.drivers.full_name}
</h2>

<p className="text-cyan-400">
  🟢 Online
</p>

<p className="text-cyan-400">
  {selectedDriver.drivers.vehicle_type === 'boda'
    ? '🏍️ Bodaboda'
    : '🚗 Taxi'}
</p>
<button
onClick={arrivedTrip}
  className="w-full mt-4 bg-yellow-500 text-black p-4 rounded-3xl font-bold"
>
  ARRIVED
</button>


<button
onClick={startTrip}
  className="w-full mt-3 bg-green-500 text-black p-4 rounded-3xl font-bold"
>
  START TRIP
</button>

<button
onClick={endTrip}
  className="w-full mt-3 bg-red-500 text-white p-4 rounded-3xl font-bold"
>
  END TRIP
</button>

    </div>

  </div>

  <div className="mt-4 space-y-1">

    <p>
      Vehicle:
      {' '}
{selectedDriver.drivers.vehicle_type === 'boda'
 ? '🏍️ Bodaboda'
 : '🚗 Taxi'}
    </p>

    <p>
  Plate:
{selectedDriver.drivers.plate_number}
    </p>

  </div>

<button
onClick={requestRide}
  className="
    w-full
    mt-5
    bg-cyan-500 text-gray-500 font-bold shadow-lg shadow-cyan-500/40
    rounded-3xl
    p-4
    font-bold
  "
>
  Request Ride
</button>

</div>

)}

{tripStatus === 'completed' && (
  <div className="bg-green-500 text-black p-4 rounded-xl mt-3 font-bold">
    💰 Trip Fare: KES {fare}
  </div>
)}

{searching && (

<div className="fixed inset-0 bg-[#09111F] border border-cyan-500/20/80 z-50 flex items-center justify-center">

  <div className="bg-[#09111F] border border-cyan-500/30 rounded-3xl p-8 text-center w-80">

    <div
      className="
      w-24
      h-24
      border-4
      border-gray-200
      border-t-green-500
      rounded-full
      animate-spin
      mx-auto
    "
    />

    <h1 className="text-2xl font-bold mt-6 text-white">
      Searching...
    </h1>

    <p className="text-cyan-400 mt-2">
      Looking for nearby drivers
    </p>

    <button
      onClick={() => setSearching(false)}
      className="
        mt-8
        bg-red-500
        text-white
        px-8
        py-3
        rounded-3xl
      "
    >
      Cancel
    </button>

  </div>

</div>

)}

{rideAccepted && (
<div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">

  <div className="bg-[#09111F] border border-cyan-500/30 p-8 rounded-3xl w-80">

    <h1 className="text-2xl font-bold text-white">
      Driver Found
    </h1>

<p className="mt-4 text-gray-500">
  👨🏿 {driverInfo?.full_name}
</p>

<p className="text-cyan-400">
  🟢 Online
</p>

<p className="text-cyan-400">
  {driverInfo?.vehicle_type === 'boda'
    ? '🏍️ Bodaboda'
    : '🚗 Taxi'}
</p>

<p className="text-cyan-400">
  Plate {driverInfo?.plate_number}
</p>

<p className="text-green-400 font-bold">
  🚗 Driver is coming...
</p>

<p className="text-zinc-400">
  Live tracking enabled
</p>
<button className="w-full mt-6 p-4 rounded-3xl bg-cyan-500 text-gray-500 font-bold shadow-lg shadow-cyan-500/40 text-white">
  Track Driver
</button>

<button className="w-full mt-3 p-4 rounded-3xl bg-[#09111F] border border-cyan-500/20 text-white">
  Call Driver
</button>

<button
  onClick={() => {
  setRideAccepted(false)
  setSelectedDriver(null)
  setSearching(false)
}}
  className="w-full mt-3 p-4 rounded-3xl bg-red-500 text-white"
>
  Cancel Ride
</button>

  </div>

</div>
)}

  
    </div>

  </div>
)
}