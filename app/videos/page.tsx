'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'


export default function VideosPage() {

const [videos, setVideos] = useState<any[]>([])
const [loading, setLoading] = useState(true)


useEffect(() => {
  fetchVideos()
}, [])

const fetchVideos = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', {
      ascending: false,
    })

if (error) {
  console.log('SUPABASE ERROR:', error)
  alert(JSON.stringify(error))
  return
}

  setVideos(data || [])
  setLoading(false)
}


  return (
    <main className="min-h-screen bg-[#060608] text-white p-6">

      <h1 className="text-4xl font-bold mb-8">
        Videos
      </h1>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

  {videos.map((video) => (
    <div
      key={video.id}
      className="bg-zinc-900 rounded-2xl overflow-hidden"
    >

      <img
        src={video.thumbnail_url}
        alt={video.title}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">

        <h2 className="font-semibold">
          {video.title}
        </h2>

        <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
          {video.description}
        </p>

      </div>

    </div>
  ))}

</div>

    </main>
  )
}