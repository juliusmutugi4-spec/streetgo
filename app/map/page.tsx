'use client'
import { supabase } from '../lib/supabase'
import { useEffect, useState, useRef } from 'react'
import { Bike, CarFront } from 'lucide-react'

import dynamic from 'next/dynamic'
import {
  Marker,
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  ScaleControl
} from 'react-map-gl'

const Map = dynamic(
  () => import('react-map-gl').then(mod => mod.default),
  {
    ssr: false
  }
)


export default function MapPage() {

  const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

const [mapLoaded, setMapLoaded] = useState(false)
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
const acceptedSoundRef = useRef<HTMLAudioElement | null>(null)
const [showDriverPhoto, setShowDriverPhoto] = useState(false)
const [tripStatus, setTripStatus] = useState<
  'accepted' | 'arrived' | 'ongoing' | 'completed' | null
>(null)
const [drivers, setDrivers] = useState<any[]>([])
const [driverInfo, setDriverInfo] = useState<any>(null)
const [driverLat, setDriverLat] = useState(0)
const [driverLng, setDriverLng] = useState(0)
const [driverDistance, setDriverDistance] = useState(0)
const [driverBearing, setDriverBearing] = useState(0)
const mapRef = useRef<any>(null)
const [route, setRoute] = useState<any>(null)
async function loadRoute(
  startLng: number,
  startLat: number,
  endLng: number,
  endLat: number
) {
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  )

  const data = await response.json()

  if (!data.routes?.length) return

  setRoute({
    type: 'Feature',
    geometry: data.routes[0].geometry
  })
}
const [connectionLine, setConnectionLine] = useState<any>({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: []
  }
})
const [viewState, setViewState] = useState({
  
  longitude: 36.817223,
  latitude: -1.286389,
  zoom: 16,
  pitch: 60,
  bearing: -20
})

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
  acceptedSoundRef.current = new Audio('/sounds/driver-accepted.mp3')

  return () => {
    acceptedSoundRef.current?.pause()
    acceptedSoundRef.current = null
  }
}, [])



useEffect(() => {

  async function loadUser() {

const { data, error } = await supabase.auth.getSession()

console.log("SESSION:", data)
console.log("ERROR:", error)

setUser(data.session?.user ?? null)
  }

  loadUser()

}, [])

useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const lng = position.coords.longitude
      const lat = position.coords.latitude

      setLongitude(lng)
      setLatitude(lat)

setViewState((prev) => ({
  ...prev,
  longitude: prev.longitude + (lng - prev.longitude) * 0.12,
  latitude: prev.latitude + (lat - prev.latitude) * 0.12,
  zoom: 16,
  pitch: 60
}))
    },
    (error) => console.log(error),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000
    }
  )

  return () => {
    navigator.geolocation.clearWatch(watchId)
  }
}, [])

useEffect(() => {
  setPickup([longitude, latitude])
}, [longitude, latitude])
function calculateFare() {

  let base = rideType === 'boda' ? 100 : 250

  let distanceMultiplier = 1.2

  let total = Math.round(base * distanceMultiplier)

  setFare(total)

}

async function requestRide() {

  if (!user) return

// Find the nearest online driver
alert(JSON.stringify(drivers))
let nearestDriver: any = null
let shortestDistance = Number.MAX_VALUE

drivers
  .filter(driver => driver.drivers.vehicle_type === rideType)
  .forEach(driver => {
    const distance = Math.sqrt(
      Math.pow(driver.latitude - latitude, 2) +
      Math.pow(driver.longitude - longitude, 2)
    )

    if (distance < shortestDistance) {
      shortestDistance = distance
      nearestDriver = driver
    }
  })

if (!nearestDriver) {
  alert('No nearby drivers available')
  return
}

const { data, error } = await supabase
  .from('ride_requests')
  .insert({
    passenger_id: user.id,
    driver_id: nearestDriver.driver_id,
    pickup_lat: latitude,
    pickup_lng: longitude,
    destination,
    ride_type: rideType,
    status: 'searching'
  })
  .select()
  .single()

if (error) {
  alert(error.message)
  return
}

if (data) {
  setTripId(data.id)
}
  setSearching(true)
  setSelectedDriver(nearestDriver)
}

useEffect(() => {

  let channel: any

  async function listenForAcceptance() {
if (!user) return

  channel = supabase
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
console.log("Realtime event:", ride)
if (
  ride.passenger_id === user.id &&
  ride.status === 'accepted'
) {

  // 1. get driver info
const { data } = await supabase
  .from('drivers')
  .select(`
    *,
    profiles(*)
  `)
  .eq('id', ride.driver_id)
  .single()

setDriverInfo(data)

  setDriverInfo(data)
acceptedSoundRef.current?.play()
navigator.vibrate?.(300)
  // 2. update UI
  setSearching(false)
  setRideAccepted(true)

  // 3. UPDATE DATABASE TRIP STATUS (IMPORTANT)
console.log('✅ DRIVER ACCEPTED:', ride)

setSearching(false)
setRideAccepted(true)
}

        }
      )

      .subscribe()


  }

  listenForAcceptance()

return () => {
  if (channel) {
    supabase.removeChannel(channel)
  }
}

}, [user])

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
if (mapRef.current) {
  mapRef.current.fitBounds(
    [
      [data.longitude, data.latitude],
      [longitude, latitude]
    ],
    {
      padding: 120,
      duration: 1500
    }
  )
}
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

      async (payload) => {

        const location = payload.new as any

        if (location.driver_id === driverInfo.id) {
const bearing =
  Math.atan2(
    location.longitude - driverLng,
    location.latitude - driverLat
  ) * (180 / Math.PI)

setDriverBearing(bearing)
const startLat = driverLat
const startLng = driverLng

const endLat = location.latitude
const endLng = location.longitude

let progress = 0

const animation = setInterval(() => {
  progress += 0.1

  if (progress >= 1) {
    clearInterval(animation)

    setDriverLat(endLat)
    setDriverLng(endLng)

    return
  }

  setDriverLat(
    startLat + (endLat - startLat) * progress
  )

  setDriverLng(
    startLng + (endLng - startLng) * progress
  )

}, 50)

          await loadRoute(
  location.longitude,
  location.latitude,
  longitude,
  latitude
)
const distance =
  Math.sqrt(
    Math.pow(location.latitude - latitude, 2) +
    Math.pow(location.longitude - longitude, 2)
  ) * 111

setDriverDistance(distance)

if (distance < 0.05 && tripStatus !== 'arrived') {
  await arrivedTrip()
}

if (mapRef.current) {
  mapRef.current.fitBounds(
    [
      [location.longitude, location.latitude],
      [longitude, latitude]
    ],
    {
      padding: 120,
      duration: 1000
    }
  )
}
setConnectionLine({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [location.longitude, location.latitude],
      [longitude, latitude]
    ]
  }
})

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

if (!mounted) {
  return null
}

return (
  <div className="relative w-full h-screen overflow-hidden">



{!mapLoaded && (
  <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-500 to-green-700 z-40 flex items-center justify-center text-white text-3xl font-bold tracking-wider">
    🟢 LOADING MAP...
  </div>
)}

<Map


  ref={mapRef}
  {...viewState}
  
  onMove={(evt) => setViewState(evt.viewState)}
  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
  mapStyle="mapbox://styles/mapbox/navigation-night-v1"
onLoad={(e) => {
  setMapLoaded(true)

  const map = e.target




  map.easeTo({
    pitch: 60,
    bearing: -20,
    zoom: 16,
    duration: 2000
  })

  const layers = map.getStyle().layers

  const labelLayerId = layers.find(
    (layer: any) => layer.type === 'symbol'
  )?.id

  if (!map.getLayer('3d-buildings')) {
    map.addLayer(
      {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#d1d5db',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            16,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            16,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.65
        }
      },
      labelLayerId
    )
  }
}}
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%'
  }}
>
    
{mapLoaded && (
  <Marker longitude={longitude} latitude={latitude}>
  <div className="relative">

    {/* Glow */}
    <div className="absolute -inset-3 rounded-full bg-[#E11D48]/25 blur-xl" />

    {/* Pulse */}
    <div className="absolute inset-0 rounded-full bg-[#E11D48]/20 animate-ping" />

    {/* Main marker */}
    <div
      className="
      relative
      w-14
      h-14
      rounded-full
      bg-white
      border-[5px]
      border-[#E11D48]
      shadow-[0_10px_30px_rgba(225,29,72,.45)]
      flex
      items-center
      justify-center
      "
    >
      <div className="w-4 h-4 rounded-full bg-[#E11D48]" />
    </div>

  </div>
</Marker>
)}




{drivers.map(driver => (

<Marker
  key={driver.id}
  longitude={driver.longitude}
  latitude={driver.latitude}
>
  <div className="relative">

    {/* Online pulse */}
    <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />

    {/* Marker */}
    <div
      className="
      w-14
      h-14
      rounded-full
      bg-white
      shadow-2xl
      border-4
      border-green-500
      flex
      items-center
      justify-center
      text-sm
      "
    >
{driver.drivers.vehicle_type === 'boda' ? (

  <div className="relative">

    <div className="absolute inset-0 rounded-full bg-green-400 blur-xl opacity-50" />

    <div className="
      relative
      w-10
      h-10
      rounded-full
      bg-white
      border-2
      border-green-500
      shadow-xl
      flex
      items-center
      justify-center
    ">
      🏍️
    </div>

  </div>

) : (

  <div className="relative">

    <div className="absolute inset-0 rounded-full bg-blue-400 blur-xl opacity-50" />

    <div className="
      relative
      w-10
      h-10
      rounded-full
      bg-white
      border-2
      border-blue-500
      shadow-xl
      flex
      items-center
      justify-center
    ">
      🚗
    </div>

  </div>

)}
    </div>

  </div>
</Marker>

))}

{rideAccepted && driverInfo && (

  <Marker
    longitude={driverLng}
    latitude={driverLat}
    anchor="center"
  >

    <div className="relative">

      {/* Expanding pulse */}
      <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />

      {/* Soft glow */}
      <div className="absolute inset-0 rounded-full bg-green-400 blur-xl opacity-60" />

      {/* Vehicle */}
<div
  style={{
    transform: `rotate(${driverBearing}deg)`,
    transition: 'transform 0.3s linear'
  }}
  className="
    relative
    w-16
    h-16
    rounded-full
    bg-white
    border-4
    border-green-500
    shadow-2xl
    flex
    items-center
    justify-center
    text-3xl
  "
>
        {driverInfo.vehicle_type === 'boda'
          ? '🏍️'
          : '🚗'}
      </div>

    </div>

  </Marker>

)}

{rideAccepted && route && (
  <Source
    id="driver-route"
    type="geojson"
    data={route}
  >
    <Layer
      id="driver-route-line"
      type="line"
      layout={{
        'line-cap': 'round',
        'line-join': 'round'
      }}
      paint={{
        'line-color': '#22c55e',
        'line-width': 7,
        'line-opacity': 0.95
      }}
    />
  </Source>
)}
<NavigationControl position="top-right" />

<GeolocateControl
  position="top-right"
  trackUserLocation={true}
  showUserHeading={true}
/>

<FullscreenControl position="top-right" />

<ScaleControl position="bottom-left" />

    </Map>

{/* StreetGO GPS Button */}
<button
  onClick={() => {
    setViewState((prev) => ({
      ...prev,
      longitude,
      latitude,
      zoom: 16,
      pitch: 60
    }))
  }}
  className="
    absolute
    bottom-80
    right-5
    z-40
    w-14
    h-14
    rounded-full
    bg-white
    shadow-2xl
    border
    border-gray-200
    flex
    items-center
    justify-center
    hover:scale-110
    transition
  "
>
  📍
</button>


    {/* Bottom Panel */}

<div
  className="
  absolute
  bottom-0
  left-0
  right-0
  h-[260px]
  overflow-y-auto
  bg-white
  rounded-t-[32px]
  shadow-[0_-10px_40px_rgba(0,0,0,0.18)]
  border-t
  border-gray-200
  p-5
  space-y-2
  z-30
"
>
{/* Drag Handle */}

<div className="flex justify-center mb-4">

  <div className="
    w-14
    h-1.5
    rounded-full
    bg-gray-300
  " />

</div>

{/* Header */}

<div className="flex items-center justify-between mb-6">

  <div className="flex items-center gap-4">

    <div
      className="
      w-14
      h-14
      rounded-2xl
      bg-gradient-to-br
      from-[#E11D48]
      to-red-700
      text-white
      flex
      items-center
      justify-center
      text-base
      font-black
      shadow-lg
      "
    >
      SG
    </div>

    <div>

      <h1 className="text-sm font-black text-gray-900">
        Street<span className="text-[#E11D48]">GO</span>
      </h1>

      <p className="text-sm text-gray-500">
        Request a ride in seconds
      </p>

    </div>

  </div>

  <div
    className="
      px-4
      py-2
      rounded-full
      bg-green-100
      border
      border-green-300
      text-green-700
      text-sm
      font-bold
    "
  >
    ● Online
  </div>

</div>

<div className="space-y-1">

  {/* Pickup */}

  <div className="flex items-center gap-4 bg-gray-100 rounded-2xl p-4 border border-gray-200">

    <div className="
      w-12
      h-12
      rounded-full
      bg-green-500
      text-white
      flex
      items-center
      justify-center
      text-base
      shrink-0
    ">
      📍
    </div>

    <div className="flex-1">

      <p className="text-xs text-gray-500 uppercase tracking-wider">
        Pickup
      </p>

      <input
        value="Current Location"
        readOnly
        className="
          w-full
          bg-transparent
          outline-none
          text-sm
          font-semibold
          text-gray-900
        "
      />

    </div>

  </div>

  {/* Destination */}

  <div className="flex items-center gap-4 bg-gray-100 rounded-2xl p-4 border border-gray-200">

    <div className="
      w-12
      h-12
      rounded-full
      bg-red-500
      text-white
      flex
      items-center
      justify-center
      text-base
      shrink-0
    ">
      🎯
    </div>

    <div className="flex-1">

      <p className="text-xs text-gray-500 uppercase tracking-wider">
        Destination
      </p>

      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Where are you going?"
        className="
          w-full
          bg-transparent
          outline-none
          text-sm
          font-semibold
          text-gray-900
          placeholder:text-gray-400
        "
      />

    </div>

  </div>

</div>

<div className="grid grid-cols-2 gap-4 mt-2">

  <button
    onClick={() => setRideType('boda')}
className={`
      h-36
      rounded-3xl
      transition-all
      duration-300
      border-2
      flex
      flex-col
      items-center
      justify-center
      ${
        rideType === 'boda'
          ? 'bg-cyan-500 border-cyan-500 text-black shadow-xl scale-105'
          : 'bg-[#09111F] border-gray-700 text-white hover:border-cyan-500'
      }
    `}
  >
<div
  className="
    w-16
    h-16
    rounded-3xl
    bg-gradient-to-br
    from-cyan-500/20
    to-blue-500/20
    border
    border-cyan-400/40
    shadow-lg
    flex
    items-center
    justify-center
    mb-4
  "
>
  <Bike
  size={34}
  strokeWidth={2.3}
  className="text-cyan-400"
/>
</div>

    <h3 className="font-bold text-sm">
      Bodaboda
    </h3>

    <p className="text-sm opacity-80 mt-1">
      Fast Ride
    </p>

    <p className="mt-2 text-base font-black">
      KES 100
    </p>

  </button>

  <button
    onClick={() => setRideType('taxi')}
className={`
      h-36
      rounded-3xl
      transition-all
      duration-300
      border-2
      flex
      flex-col
      items-center
      justify-center
      ${
        rideType === 'taxi'
          ? 'bg-cyan-500 border-cyan-500 text-black shadow-xl scale-105'
          : 'bg-[#09111F] border-gray-700 text-white hover:border-cyan-500'
      }
    `}
  >
<div
  className="
    w-16
    h-16
    rounded-3xl
    bg-gradient-to-br
    from-cyan-500/20
    to-blue-500/20
    border
    border-cyan-400/40
    shadow-lg
    flex
    items-center
    justify-center
    mb-4
  "
>
  <CarFront
  size={34}
  strokeWidth={2.3}
  className="text-cyan-400"
/>
</div>

    <h3 className="font-bold text-lg">
      Taxi
    </h3>

    <p className="text-sm opacity-80 mt-1">
      Comfortable
    </p>

    <p className="mt-2 text-base font-black">
      KES 250
    </p>

  </button>

</div>


{!rideAccepted && !searching && (
  <button
    onClick={requestRide}
    className="
      w-full
      mt-2
      bg-cyan-500
      hover:bg-cyan-400
      text-white
      font-bold
      rounded-2xl
      py-4
      transition-all
      shadow-lg
    "
  >
    🚗 Find Nearest Driver
  </button>
)}
{!rideAccepted && (

<div className="
  bg-[#09111F]
  border
  border-cyan-500/20
  rounded-3xl
  w-[340px]
  p-5
  shadow-2xl
">

  <div className="flex items-center gap-4">

<div
  onClick={() => setShowDriverPhoto(true)}
  className="
    w-16
    h-16
    rounded-full
    overflow-hidden
    border-2
    border-cyan-500
    bg-zinc-800
    cursor-pointer
    hover:scale-105
    transition
  "
>

  {driverInfo?.profiles?.avatar_url ? (

    <img
      src={driverInfo.profiles.avatar_url}
      alt="Driver"
      className="w-full h-full object-cover"
    />

  ) : (

    <div className="w-full h-full flex items-center justify-center text-3xl">
      👨🏿
    </div>

  )}

</div>

    <div>
<h2 className="text-base font-bold">
  {selectedDriver?.drivers?.full_name || 'Nearest Driver'}
</h2>

<p className="text-cyan-400">
  🟢 Online
</p>

<p className="text-cyan-400">
{selectedDriver?.drivers?.vehicle_type === 'boda'
  ? '🏍️ Bodaboda'
  : '🚗 Taxi'}
</p>
{tripStatus !== 'arrived' &&
 tripStatus !== 'ongoing' &&
 tripStatus !== 'completed' && (
  <button
    onClick={arrivedTrip}
    className="
      w-full
      mt-2
      bg-yellow-500
      text-black
      p-4
      h-10
rounded-xl
text-xs
font-semibold
      font-bold
    "
  >
    📍 ARRIVED
  </button>
)}


{tripStatus === 'arrived' && (
  <button
    onClick={startTrip}
    className="
      w-full
      mt-3
      bg-green-500
      text-black
      p-4
      h-10
rounded-xl
text-xs
font-semibold
      font-bold
    "
  >
    ▶️ START TRIP
  </button>
)}

<button
onClick={endTrip}
  className="w-full mt-3 bg-red-500 text-white p-4 h-10
rounded-xl
text-xs
font-semibold font-bold"
>
  END TRIP
</button>

    </div>

  </div>

  <div className="mt-2 space-y-1">

    <p>
      Vehicle:
      {' '}
{selectedDriver?.drivers?.vehicle_type === 'boda'
  ? '🏍️ Bodaboda'
  : '🚗 Taxi'}
    </p>

    <p>
  Plate:
{selectedDriver?.drivers?.plate_number || 'Searching...'}
    </p>

  </div>



</div>

)}

{tripStatus === 'completed' && (
  <div className="bg-green-500 text-black p-4 rounded-xl mt-3 font-bold">
    💰 Trip Fare: KES {fare}
  </div>
)}

{searching && (

<div className="fixed inset-0 bg-[#09111F] border border-cyan-500/20/80 z-50 flex items-center justify-center">

  <div className="bg-[#09111F] border border-cyan-500/30
rounded-3xl
p-8 text-center w-80">

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

    <h1 className="text-sm font-bold mt-3 text-white">
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
        h-10
rounded-xl
text-xs
font-semibold
      "
    >
      Cancel
    </button>

  </div>

</div>

)}

{rideAccepted && (
<div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">

  <div className="
  bg-[#09111F]
  border
  border-cyan-500/20
rounded-3xl
  w-[340px]
  p-4
  shadow-2xl
">

<div className="flex items-center justify-between">

  <div>

    <h1 className="text-base font-black text-white">
      Driver Found
    </h1>

    <p className="text-xs text-green-400 mt-1">
      Your driver is on the way
    </p>

  </div>

  <div className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-2 rounded-full">

    LIVE

  </div>

</div>

<div className="flex items-center gap-4 mt-2">

  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500 bg-zinc-800">

    {driverInfo?.profiles?.avatar_url ? (

      <img
        src={driverInfo.profiles.avatar_url}
        alt="Driver"
        className="w-full h-full object-cover"
      />

    ) : (

      <div className="w-full h-full flex items-center justify-center text-3xl">
        👨🏿
      </div>

    )}

  </div>

  <div>

    <h2 className="text-base font-bold text-white">
      {driverInfo?.full_name}
    </h2>

    <p className="text-cyan-400">
      ⭐ {driverInfo?.rating}
    </p>

  </div>

</div>
<div className="flex items-center gap-2 mt-1">

  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
    ⭐ {driverInfo?.rating || "5.0"}
  </span>

  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
    Verified Driver
  </span>

</div>

<p className="text-cyan-400">
  🟢 Online
</p>

<p className="text-cyan-400">
  {driverInfo?.vehicle_type === 'boda'
    ? '🏍️ Bodaboda'
    : '🚗 Taxi'}
</p>

<div className="mt-2 bg-zinc-800 rounded-2xl p-3">

  <div className="flex justify-between">

    <span className="text-zinc-400 text-sm">
      Vehicle
    </span>

    <span className="font-bold text-white">
      {driverInfo?.vehicle_model}
    </span>

  </div>

  <div className="flex justify-between mt-2">

    <span className="text-zinc-400 text-sm">
      Plate
    </span>

    <span className="font-bold text-cyan-400">
      {driverInfo?.plate_number}
    </span>

  </div>

</div>

<div className="mt-3 space-y-1">

  <p className="text-green-400 font-bold text-sm">
    🚗 Driver is coming...
  </p>

<div className="grid grid-cols-2 gap-2 mt-3">

  <div className="bg-zinc-800 rounded-xl p-2.5">

    <p className="text-[9px] uppercase tracking-wider text-zinc-500">
      Distance
    </p>

    <h2 className="text-sm font-black text-cyan-400 mt-1">
      {driverDistance < 1
        ? `${Math.round(driverDistance * 1000)} m`
        : `${driverDistance.toFixed(1)} km`}
    </h2>

  </div>

  <div className="bg-zinc-800 rounded-xl p-2.5">

    <p className="text-[9px] uppercase tracking-wider text-zinc-500">
      ETA
    </p>

    <h2 className="text-sm font-black text-yellow-400 mt-1">
      {Math.max(1, Math.round(driverDistance * 2))} min
    </h2>

  </div>

</div>

  <div className="w-full h-3 bg-zinc-700 rounded-full overflow-hidden">

    <div
      className="h-full bg-green-500 transition-all duration-500"
      style={{
        width: `${Math.max(
          5,
          100 - Math.min(driverDistance * 20, 100)
        )}%`
      }}
    />

  </div>

</div>

<p className="text-zinc-400">
  Live tracking enabled
</p>
<div className="grid grid-cols-2 gap-2 mt-3">

  <button className="h-10 rounded-xl bg-cyan-500 text-white text-xs font-semibold">
    📍 Track
  </button>

  <button className="h-10 rounded-xl bg-green-500 text-white text-xs font-semibold">
    📞 Call
  </button>

  <button className="h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold">
    💬 Chat
  </button>

  <button
    onClick={() => {
      setRideAccepted(false)
      setSelectedDriver(null)
      setSearching(false)
    }}
    className="h-10 rounded-xl bg-red-500 text-white text-xs font-semibold"
  >
    ✕ Cancel
  </button>

</div>

  </div>

</div>
)}
{showDriverPhoto && (
  <div
    onClick={() => setShowDriverPhoto(false)}
    className="
      fixed
      inset-0
      z-[100]
      bg-black/90
      flex
      items-center
      justify-center
      p-6
    "
  >

    <button
      onClick={() => setShowDriverPhoto(false)}
      className="
        absolute
        top-6
        right-6
        w-12
        h-12
        rounded-full
        bg-white/10
        text-white
        text-3xl
      "
    >
      ×
    </button>

    <img
      src={driverInfo?.profiles?.avatar_url}
      alt="Driver"
      className="
        max-w-[95vw]
        max-h-[85vh]
        rounded-3xl
        object-contain
        shadow-2xl
      "
    />

  </div>
)}
  
    </div>

  </div>
)
}