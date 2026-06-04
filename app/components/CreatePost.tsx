'use client'
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ImagePlus, Video, Send, Loader2, Sparkles } from 'lucide-react'

interface CreatePostProps {
  userId: string
  onPosted: () => void
}

export default function CreatePost({ userId, onPosted }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [video, setVideo] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePost = async () => {
    if (!content.trim()) return
    setUploading(true)

    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user
      if (!user) throw new Error('Not logged in')

      let videoUrl = null

      // Upload video if exists
      if (video) {
        const fileExt = video.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
         .from('videos')
         .upload(fileName, video)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('videos').getPublicUrl(fileName)
        videoUrl = data.publicUrl
      }

      // Get username from auth metadata or email
const { data: profile } = await supabase
  .from('profiles')
  .select('username, avatar_url')
  .eq('id', user.id)
  .single()

const avatar_url =
  profile?.avatar_url ||
  `https://i.pravatar.cc/150?u=${user.id}`


const username = profile?.username

      // Insert post with username
const { error: insertError } = await supabase
  .from('posts')
  .insert({
    content: content,
    user_id: user.id,
    username: username,
    avatar_url: avatar_url,
    video_url: videoUrl
  })

      if (insertError) throw insertError

      // Reset form
      setContent('')
      setVideo(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh feed
      onPosted()

    } catch (error) {
      console.error('Error posting:', error)
      alert('Failed to post. Try again.')
    } finally {
      setUploading(false)
    }
  }
  return (
  <div className="group relative overflow-hidden rounded-xl border border-zinc-900 bg-[#05070b]/60 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-cyan-500/30">

    {/* Neon Ambient Glow (Teal + Blue + Orange) */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
    <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
    <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-500/10 blur-[120px]" />

    <div className="relative p-5 z-10">

      {/* HEADER */}
      <div className="mb-5 flex items-center gap-3">
        
        <div className="flex h-11 w-11 items-center justify-center rounded-lg 
          bg-[#0b1220] border border-cyan-500/30 font-mono font-black text-cyan-400
          shadow-[0_0_15px_rgba(34,211,238,0.15)]">
          C
        </div>

        <div>
          <h3 className="font-bold text-cyan-100 text-sm tracking-wide uppercase">
            Create Transmission
          </h3>
          <p className="text-xs text-blue-400/70 font-mono">
            Broadcast to neural grid
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5 
          bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 rounded-full">
          <span className="text-[10px] font-mono font-bold text-orange-400 tracking-widest">
            LIVE STREAM
          </span>
        </div>
      </div>

      {/* INPUT */}
      <div className="rounded-xl border border-cyan-500/20 bg-[#070b14]/60 p-4
        focus-within:border-orange-400/40 transition-all">

        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Transmit your signal into the network..."
          maxLength={500}
          className="w-full resize-none bg-transparent text-sm text-cyan-100
            outline-none placeholder:text-blue-500/40"
        />
      </div>

      {/* VIDEO */}
      {video && (
        <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">

          <div className="flex items-center gap-3">

            <Video size={16} className="text-orange-400" />

            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-mono text-cyan-100">
                {video.name}
              </p>
              <p className="text-[10px] font-mono text-blue-400">
                {(video.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <button
              onClick={() => {
                setVideo(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-xs font-mono text-orange-400 hover:text-orange-300"
            >
              remove
            </button>
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-5 flex flex-col sm:flex-row gap-3">

        {/* FILE */}
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg
          border border-cyan-500/20 bg-[#0b1220] px-5 py-2.5 text-xs font-bold uppercase
          text-cyan-300 hover:text-orange-300 hover:border-orange-400/40 transition">

          <ImagePlus size={14} />
          Attach Signal

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
          />
        </label>

        {/* SEND */}
        <button
          onClick={handlePost}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 rounded-lg
            bg-gradient-to-r from-cyan-500 via-blue-500 to-orange-500
            text-white py-2.5 text-xs font-black uppercase
            shadow-[0_0_25px_rgba(34,211,238,0.15)]
            hover:shadow-[0_0_40px_rgba(249,115,22,0.25)]
            transition-all active:scale-95 disabled:opacity-40"
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Broadcasting...
            </>
          ) : (
            <>
              <Send size={14} />
              Transmit
            </>
          )}
        </button>

      </div>

      {/* COUNTER */}
      <div className="mt-3 text-right">
        <span className="text-[10px] font-mono text-blue-400/60">
          {content.length} / 500
        </span>
      </div>

    </div>
  </div>
)
}