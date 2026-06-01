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
      const username = user.user_metadata?.name || user.user_metadata?.username || user.email?.split('@')[0]

      // Insert post with username
      const { error: insertError } = await supabase.from('posts').insert({
        content: content,
        user_id: user.id,
        username: username,
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
    <div className="relative overflow-hidden rounded-3xl border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 font-black text-white">
            C
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Create Post</h3>
            <p className="text-sm text-gray-400">Share with the cWV community</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-cyan-400">
            <Sparkles size={18} />
            <span className="text-xs font-semibold">LIVE</span>
          </div>
        </div>

        {/* Text Area */}
        <div className="rounded-2xl border-white/10 bg-black/20 p-4">
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening today?"
            maxLength={500}
            className="w-full resize-none bg-transparent text-lg text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Video Preview */}
        {video && (
          <div className="mt-4 rounded-2xl border-cyan-500/20 bg-black/30 p-4">
            <div className="flex items-center gap-3">
              <Video size={20} className="text-cyan-400" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm text-white">{video.name}</p>
                <p className="text-xs text-gray-400">{(video.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => {
                  setVideo(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-5 flex-col sm:flex-row gap-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-white/10 bg-white/5 px-5 py-3 transition hover:bg-white/10">
            <ImagePlus size={18} />
            <span>Upload Video</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              hidden
              onChange={(e) => setVideo(e.target.files?.[0] || null)}
            />
          </label>

          <button
            onClick={handlePost}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 py-3 font-bold text-white transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            {uploading? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send size={18} />
                Post to cWV
              </>
            )}
          </button>
        </div>

        {/* Character Count */}
        <div className="mt-3 text-right">
          <span className="text-xs text-gray-500">{content.length}/500</span>
        </div>
      </div>
    </div>
  )
}