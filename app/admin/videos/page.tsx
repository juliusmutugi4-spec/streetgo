'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { User } from '@supabase/supabase-js'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('Juliusmutugi4@gmail.com')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Check login status on load
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert('Login failed: ' + error.message)
      return
    }
    window.location.reload()
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const uploadVideo = async () => {
    if (!title ||!video ||!thumbnail) {
      alert('Please fill all fields')
      return
    }
    if (!user) {
      alert('You must be logged in')
      return
    }

    try {
      setUploading(true)

      // 1. Upload thumbnail
      const thumbnailName = `${Date.now()}-${thumbnail.name}`
      const { error: thumbnailError } = await supabase.storage
       .from('video-thumbnails')
       .upload(thumbnailName, thumbnail)
      if (thumbnailError) throw thumbnailError

      const thumbnailUrl = supabase.storage
       .from('video-thumbnails')
       .getPublicUrl(thumbnailName)
       .data.publicUrl

      // 2. Upload video
      const videoName = `${Date.now()}-${video.name}`
      const { error: videoError } = await supabase.storage
       .from('videos')
       .upload(videoName, video)
      if (videoError) throw videoError

      const videoUrl = supabase.storage
       .from('videos')
       .getPublicUrl(videoName)
       .data.publicUrl

      // 3. Insert to DB - user.id fixes RLS
      const { error: dbError } = await supabase
       .from('videos')
       .insert({
          title,
          description,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          user_id: user.id,
        })
      if (dbError) throw dbError

      alert('Video uploaded successfully!')
      setTitle('')
      setDescription('')
      setThumbnail(null)
      setVideo(null)

    } catch (err: any) {
      console.error('UPLOAD ERROR:', err)
      alert(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Show login form if not logged in
  if (!user) {
    return (
      <main className="min-h-screen bg-[#060608] text-white flex items-center justify-center p-8">
        <div className="bg-zinc-900 border-zinc-800 rounded-2xl p-8 w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-sm text-zinc-400">Use {email}</p>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full bg-zinc-950 border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-950 border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />
          <button
            onClick={signIn}
            className="w-full px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold"
          >
            Login
          </button>
        </div>
      </main>
    )
  }

  // Show upload form if logged in
  return (
    <main className="min-h-screen bg-[#060608] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Tunda Admin</h1>
          <button
            onClick={signOut}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Logout {user.email}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm">Total Videos</p>
            <h2 className="text-4xl font-bold mt-2">0</h2>
          </div>
          <div className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm">Total Views</p>
            <h2 className="text-4xl font-bold mt-2">0</h2>
          </div>
          <div className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm">Total Users</p>
            <h2 className="text-4xl font-bold mt-2">0</h2>
          </div>
          <div className="bg-zinc-900 border-zinc-800 rounded-2xl p-6">
            <p className="text-zinc-400 text-sm">Revenue</p>
            <h2 className="text-4xl font-bold mt-2">KES 0</h2>
          </div>
        </div>

        <div className="mt-10 bg-zinc-900 border-zinc-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Upload Video</h2>
          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video Title"
              className="w-full bg-zinc-950 border-zinc-800 rounded-xl px-4 py-3 outline-none"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video Description"
              rows={4}
              className="w-full bg-zinc-950 border-zinc-800 rounded-xl px-4 py-3 outline-none"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
              className="block"
            />
            <p className="text-sm text-emerald-400">{thumbnail?.name}</p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
              className="block"
            />
            <p className="text-sm text-cyan-400">{video?.name}</p>
            <button
              onClick={uploadVideo}
              disabled={uploading}
              className="px-6 py-3 rounded-xl bg-emerald-500 text-black font-bold disabled:opacity-50"
            >
              {uploading? 'Uploading...' : 'Publish Video'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}