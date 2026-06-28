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
const [viewState, setViewState] = useState({
    
    
  longitude: 36.817223,
  latitude: -1.286389,
  zoom: 15,
  pitch: 60,
  bearing: 0
})


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

  setDriverLat(lat)
  setDriverLng(lng)

  if (trip) {
    loadRoute(
      lng,
      lat,
      trip.pickup_lng,
      trip.pickup_lat
    )
  }

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
    bg-white
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
          📍
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
      "
    >
      🚗
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
        'line-width': 7,
        'line-opacity': 0.95
      }}
    />
  </Source>
)}

    </Map>

  </div>
)
}