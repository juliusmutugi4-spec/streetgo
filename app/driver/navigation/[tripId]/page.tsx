'use client'

import { use, useEffect, useState, useRef } from 'react'

import { supabase } from '../../../lib/supabase'
import dynamic from 'next/dynamic'

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

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
const [mapLoaded, setMapLoaded] = useState(false)

const mapRef = useRef<any>(null)

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

    </Map>

  </div>
)
}