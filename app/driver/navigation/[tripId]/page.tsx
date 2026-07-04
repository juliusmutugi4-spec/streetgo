'use client'

import { use, useEffect, useState, useRef } from 'react'

import { supabase } from '../../../lib/supabase'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
const Map = dynamic(
  () => import('react-map-gl').then(mod => mod.default),
  { ssr: false }
)

import {
  Marker,
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  ScaleControl,
  Source,
  Layer
} from 'react-map-gl'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
type Props = {
  params: Promise<{
    tripId: string
  }>
}

export default function DriverNavigationPage({ params }: Props) {
  const { tripId } = use(params)
const router = useRouter()
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
const [mapLoaded, setMapLoaded] = useState(false)
const mapRef = useRef<any>(null)
const [driverLat, setDriverLat] = useState(-1.286389)
const [driverLng, setDriverLng] = useState(36.817223)
const [driverHeading, setDriverHeading] = useState(0)
const [passenger, setPassenger] = useState<any>(null)
const [route, setRoute] = useState<any>(null)
const [distance, setDistance] = useState(0)
const [duration, setDuration] = useState(0)
const [navigationMode, setNavigationMode] = useState<'pickup' | 'trip'>('pickup')
async function loadRoute(
  startLng: number,
  startLat: number,
  endLng: number,
  endLat: number
) {

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  )

if (!response.ok) {
  console.error("Directions request failed", response.status)
  return
}

const data = await response.json()

console.log("Directions Response:", data)

if (!data.routes || data.routes.length === 0) {
  console.log("No route returned")
  return
}

console.log(data.routes[0].geometry)

setRoute({
  type: 'Feature',
  geometry: data.routes[0].geometry
})
setDistance(data.routes[0].distance)
setDuration(data.routes[0].duration)
console.log("Route saved")

}
const [viewState, setViewState] = useState({
    
    
  longitude: 36.817223,
  latitude: -1.286389,
  zoom: 15,
  pitch: 60,
  bearing: 0
})



useEffect(() => {

  if (navigationMode !== 'pickup') return

  if (!trip || !mapRef.current) return

  const bounds = new mapboxgl.LngLatBounds()

  // Driver
  bounds.extend([driverLng, driverLat])

  // Passenger
  bounds.extend([trip.pickup_lng, trip.pickup_lat])

  mapRef.current.fitBounds(bounds, {
    padding: 120,
    duration: 1000
  })

}, [driverLat, driverLng, trip, navigationMode])
  useEffect(() => {
    async function loadTrip() {
      const { data, error } = await supabase
        .from('ride_requests')
        .select('*')
        .eq('id', tripId)
        .single()

      if (error) {
        console.log('SUPABASE ERROR:', JSON.stringify(error, null, 2))
console.log('TRIP ID:', tripId)
      } else {
        setTrip(data)

const { data: passengerData } = await supabase
  .from('profiles')
  .select('username, avatar_url')
  .eq('id', data.passenger_id)
  .single()

setPassenger(passengerData)

setViewState({
  longitude: data.pickup_lng,
  latitude: data.pickup_lat,
  zoom: 15,
  pitch: 60,
  bearing: 0
})
      }

      setLoading(false)
    }

    loadTrip()
  }, [tripId])


useEffect(() => {

  const watchId = navigator.geolocation.watchPosition(

(position) => {

  const lat = position.coords.latitude
  const lng = position.coords.longitude

console.log("GPS UPDATED", lat, lng)

setDriverLat(lat)
setDriverLng(lng)
setDriverHeading(position.coords.heading || 0)
setViewState(prev => ({
  ...prev,
  longitude: lng,
  latitude: lat,
  bearing: position.coords.heading ?? prev.bearing,
  pitch: 60,
  zoom: 17
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

  if (!trip) return

  loadRoute(
    driverLng,
    driverLat,
    trip.pickup_lng,
    trip.pickup_lat
  )

}, [driverLat, driverLng, trip])



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
  <div className="relative w-full h-screen overflow-hidden">

    {!mapLoaded && (
      <div className="absolute inset-0 bg-green-600 z-50 flex items-center justify-center text-white text-3xl font-bold">
        LOADING MAP...
      </div>
    )}

<button
  onClick={() => router.back()}
  className="
    absolute
    top-5
    left-5
    z-50
    w-12
    h-12
    rounded-full
    bg-white/95
backdrop-blur-xl
    shadow-xl
    border
    border-gray-200
    flex
    items-center
    justify-center
    hover:scale-105
    transition
  "
>
  <ArrowLeft size={22} className="text-gray-800" />
</button>

    <Map
      ref={mapRef}
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/navigation-night-v1"
      onLoad={() => setMapLoaded(true)}
      style={{
        width: '100%',
        height: '100%'
      }}
    >

      <NavigationControl position="top-right" />

      <GeolocateControl
        position="top-right"
        trackUserLocation={true}
        showUserHeading={true}
      />

      <FullscreenControl position="top-right" />

      <ScaleControl position="bottom-left" />

      <Marker
        longitude={trip.pickup_lng}
        latitude={trip.pickup_lat}
      >
        <div className="text-4xl">
          <div className="relative">

  <div
    className="
      w-6
      h-6
      rounded-full
      bg-green-600
      border-4
      border-white
      shadow-xl
    "
  />

</div>
        </div>
      </Marker>
<Marker
  longitude={driverLng}
  latitude={driverLat}
>
  <div className="relative">

    {/* Pulse */}
    <div className="absolute inset-0 rounded-full bg-blue-500/30 animate-ping" />

    {/* Driver marker */}
<div
  className="
    relative
    w-12
    h-12
    rounded-full
    bg-white
    border-4
    border-blue-600
    shadow-2xl
    flex
    items-center
    justify-center
    transition-transform
    duration-300
  "
  style={{
    transform: `rotate(${driverHeading}deg)`
  }}
>
  <div
  className="
    w-6
    h-6
    rounded-full
    bg-blue-600
    border-2
    border-white
  "
/>
</div>

  </div>
</Marker>
{route && (
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
        'line-width': 9,
        'line-opacity': 1
      }}
    />
  </Source>
)}

    </Map>
<div
  className="
    absolute
    bottom-0
    left-0
    right-0
    z-40
    bg-white
    rounded-t-[32px]
    shadow-[0_-10px_40px_rgba(0,0,0,0.18)]
    border-t
    border-gray-200
    p-5
  "
>

  {/* Passenger */}
  <div className="flex items-center gap-3">

    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
      {passenger?.avatar_url ? (
  <img
    src={passenger.avatar_url}
    alt="Passenger"
    className="w-full h-full rounded-full object-cover"
  />
) : (
  <span className="text-2xl">👤</span>
)}
    </div>

    <div className="flex-1">

      <h2 className="font-bold text-lg text-gray-900">
        {passenger?.username || 'Passenger'}
      </h2>

      <p className="text-gray-500 text-sm">
        Going to pickup
      </p>

    </div>

  </div>

  {/* Info */}
<div className="grid grid-cols-2 gap-3 mt-5">

  <div className="rounded-2xl bg-gray-100 p-3">
    <p className="text-xs text-gray-500">Distance</p>
    <p className="font-bold text-gray-900">
      {(distance / 1000).toFixed(1)} km
    </p>
  </div>

  <div className="rounded-2xl bg-gray-100 p-3">
    <p className="text-xs text-gray-500">ETA</p>
    <p className="font-bold text-gray-900">
      {Math.ceil(duration / 60)} min
    </p>
  </div>

  <div className="rounded-2xl bg-gray-100 p-3">
    <p className="text-xs text-gray-500">Status</p>
    <p className="font-bold text-green-600">
      {trip.status}
    </p>
  </div>

  <div className="rounded-2xl bg-gray-100 p-3">
    <p className="text-xs text-gray-500">Destination</p>
    <p className="font-bold text-gray-900 truncate">
      {trip.destination}
    </p>
  </div>

</div>

  {/* Buttons */}
  <div className="grid grid-cols-3 gap-3 mt-5">

    <button
      className="
        h-12
        rounded-xl
        bg-green-600
        text-white
        font-semibold
      "
    >
      📞 Call
    </button>

    <button
      className="
        h-12
        rounded-xl
        bg-blue-600
        text-white
        font-semibold
      "
    >
      💬 Chat
    </button>

<button
  onClick={async () => {
    const { error } = await supabase
      .from('ride_requests')
      .update({
        status: 'arrived'
      })
      .eq('id', trip.id)

    if (error) {
      alert(error.message)
      return
    }

    alert('Passenger has been notified that you arrived.')
  }}
  className="
    h-12
    rounded-xl
    bg-black
    text-white
    font-semibold
  "
>
  ✅ Arrived
</button>

  </div>

</div>
  </div>
)
}