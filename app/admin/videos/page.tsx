'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function VideosPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const uploadVideo = async () => {
    setErrorMsg('')
    setSuccessMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('You must be logged in to upload videos.')
      return
    }

    if (!title.trim() || !video || !thumbnail) {
      setErrorMsg('Please fill in all fields and select both files.')
      return
    }

    try {
      setUploading(true)

      // 1. Upload Thumbnail Image
      const thumbnailName = `${Date.now()}-${thumbnail.name.replace(/\s+/g, '_')}`
      const { error: thumbnailError } = await supabase.storage
        .from('video-thumbnails')
        .upload(thumbnailName, thumbnail)

      if (thumbnailError) throw thumbnailError

      const thumbnailUrl = supabase.storage
        .from('video-thumbnails')
        .getPublicUrl(thumbnailName).data.publicUrl

      // 2. Upload Video File
      const videoName = `${Date.now()}-${video.name.replace(/\s+/g, '_')}`
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoName, video)

      if (videoError) throw videoError

      const videoUrl = supabase.storage
        .from('videos')
        .getPublicUrl(videoName).data.publicUrl

      // 3. Insert Row into Database
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title: title.trim(),
          description: description.trim(),
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
        })

      if (dbError) throw dbError

      setSuccessMsg('Video published successfully!')
      setTitle('')
      setDescription('')
      setThumbnail(null)
      setVideo(null)

    } catch (err: any) {
      console.error('UPLOAD ERROR:', err)
      setErrorMsg(err?.message || 'An error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-50 antialiased p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-5xl">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Video Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Upload and manage movies, series, and trailers available on StreetGO.
          </p>
        </div>

        {/* Upload Card Workspace */}
        <div className="bg-zinc-900 border border-zinc-800/80 shadow-2xl rounded-2xl p-6 md:p-8">
          <div className="border-b border-zinc-800 pb-5 mb-6">
            <h2 className="text-xl font-medium text-zinc-100">Upload New Video</h2>
            <p className="text-xs text-zinc-400 mt-1">Add a movie, series, or trailer to the StreetGO library.</p>
          </div>

          <div className="space-y-6">
            {/* Title input */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Video Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner"
              />
            </div>

            {/* Description textarea */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Video Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description"
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner resize-none"
              />
            </div>

            {/* File Dropzone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Thumbnail Upload area */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Cover Thumbnail
                </label>
                <div className="relative group flex flex-col items-center justify-center w-full h-36 bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl cursor-pointer p-4 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <svg className="h-6 w-6 text-zinc-500 group-hover:text-zinc-400 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 1.5a2.25 2.25 0 0 0-2.25 2.25v16.5A2.25 2.25 0 0 0 2.25 22.5h19.5a2.25 2.25 0 0 0 2.25-2.25V3.75A2.25 2.25 0 0 0 21.25 1.5H2.25zM13.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zM3.75 19.5l6-6 6 6H3.75z" />
                  </svg>
                  <span className="text-xs text-zinc-400 font-medium truncate max-w-full px-2">
                    {thumbnail ? thumbnail.name : 'Choose artwork image'}
                  </span>
                </div>
              </div>

              {/* Video Upload area */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Video File
                </label>
                <div className="relative group flex flex-col items-center justify-center w-full h-36 bg-zinc-950 border-2 border-dashed border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl cursor-pointer p-4 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <svg className="h-6 w-6 text-zinc-500 group-hover:text-zinc-400 mb-2 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l-4.5 3v-6l4.5 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a9.75 9.75 0 1119.5 0 9.75 9.75 0 01-19.5 0z" />
                  </svg>
                  <span className="text-xs text-zinc-400 font-medium truncate max-w-full px-2">
                    {video ? video.name : 'Choose source video file'}
                  </span>
                </div>
              </div>

            </div>

            {/* Notification system */}
            <div className="space-y-3">
              {errorMsg && (
                <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
                  <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                  <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
              )}
            </div>

            {/* Action button */}
            <div className="flex justify-end pt-4 border-t border-zinc-800">
              <button
                onClick={uploadVideo}
                disabled={uploading}
                className="w-full md:w-auto bg-zinc-50 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-50 text-zinc-900 transition-all py-2.5 px-6 rounded-xl font-medium text-sm shadow-sm focus:outline-none flex justify-center items-center gap-2"
              >
                {uploading && (
                  <svg className="animate-spin h-4 w-4 text-zinc-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {uploading ? 'Publishing video...' : 'Publish Video'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
