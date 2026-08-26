'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function WatchVideo() {
  const params = useParams()
  const [video, setVideo] = useState<any>(null)

  useEffect(() => {
    loadVideo()
  }, [])

  const loadVideo = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) return

    const newViews = (data.views || 0) + 1

    await supabase
      .from('videos')
      .update({
        views: newViews,
      })
      .eq('id', data.id)

    setVideo({
      ...data,
      views: newViews,
    })
  }

  if (!video) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">

      <video
        src={video.video_url}
        controls
        autoPlay
        className="w-full max-h-[80vh] bg-black"
      />

      <div className="max-w-5xl mx-auto p-6">

        <h1 className="text-3xl md:text-5xl font-black">
          {video.title}
        </h1>

        <p className="text-zinc-500 mt-2">
          👁 {video.views || 0} views
        </p>

        <p className="text-zinc-400 mt-4 text-lg">
          {video.description}
        </p>

      </div>

    </main>
  )
}