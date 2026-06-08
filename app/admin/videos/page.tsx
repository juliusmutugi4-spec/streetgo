'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'


export default function AdminPage() {
const [title, setTitle] = useState('')
const [description, setDescription] = useState('')

const [thumbnail, setThumbnail] = useState<File | null>(null)
const [video, setVideo] = useState<File | null>(null)

const [uploading, setUploading] = useState(false)

const uploadVideo = async () => {
  if (!title || !video || !thumbnail) {
    alert('Please fill all fields')
    return
  }

  try {
    setUploading(true)
const thumbnailName = `${Date.now()}-${thumbnail.name}`

const { data: thumbnailData, error: thumbnailError } =
  await supabase.storage
    .from('video-thumbnails')
    .upload(thumbnailName, thumbnail)

if (thumbnailError) {
  throw thumbnailError
}

const thumbnailUrl =
  supabase.storage
    .from('video-thumbnails')
    .getPublicUrl(thumbnailName)
    .data.publicUrl

console.log('Thumbnail URL:', thumbnailUrl)

const videoName = `${Date.now()}-${video.name}`

const { data: videoData, error: videoError } =
  await supabase.storage
    .from('videos')
    .upload(videoName, video)

if (videoError) {
  throw videoError
}

const videoUrl =
  supabase.storage
    .from('videos')
    .getPublicUrl(videoName)
    .data.publicUrl

console.log('Video URL:', videoUrl)
const { error: dbError } = await supabase
  .from('videos')
  .insert({
    title,
    description,
    thumbnail_url: thumbnailUrl,
    video_url: videoUrl,
  })

if (dbError) {
  throw dbError
}

alert('Video uploaded successfully!')

setTitle('')
setDescription('')
setThumbnail(null)
setVideo(null)

} catch (err: any) {
  console.error('UPLOAD ERROR:', err)

  alert(
    err?.message ||
    JSON.stringify(err, null, 2)
  )
} finally {
    setUploading(false)
  }
}
return (
  <main className="min-h-screen bg-[#060608] text-white p-8">

    <div className="max-w-7xl mx-auto">

      <h1 className="text-4xl font-bold mb-8">
        Tunda Admin
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Total Videos
          </p>

          <h2 className="text-4xl font-bold mt-2">
            0
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Total Views
          </p>

          <h2 className="text-4xl font-bold mt-2">
            0
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Total Users
          </p>

          <h2 className="text-4xl font-bold mt-2">
            0
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-zinc-400 text-sm">
            Revenue
          </p>

          <h2 className="text-4xl font-bold mt-2">
            KES 0
          </h2>
        </div>

      </div>

      <div className="mt-10">
<div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

  <h2 className="text-2xl font-bold mb-6">
    Upload Video
  </h2>

  <div className="space-y-4">

<input
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="Video Title"
  className="
    w-full
    bg-zinc-950
    border
    border-zinc-800
    rounded-xl
    px-4
    py-3
    outline-none
  "
/>

<textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Video Description"
  rows={4}
  className="
    w-full
    bg-zinc-950
    border
    border-zinc-800
    rounded-xl
    px-4
    py-3
    outline-none
  "
/>

<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setThumbnail(e.target.files?.[0] || null)
  }
  className="block"
/>
<p className="text-sm text-emerald-400">
  {thumbnail?.name}
</p>


<input
  type="file"
  accept="video/*"
  onChange={(e) =>
    setVideo(e.target.files?.[0] || null)
  }
  className="block"
/>
<p className="text-sm text-cyan-400">
  {video?.name}
</p>
<button
  onClick={uploadVideo}
  disabled={uploading}
  className="
    px-6
    py-3
    rounded-xl
    bg-emerald-500
    text-black
    font-bold
  "
>
  {uploading ? 'Uploading...' : 'Publish Video'}
</button>
  </div>

</div>
      </div>

    </div>

  </main>
)
}