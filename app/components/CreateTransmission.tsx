'use client'

import React, { useEffect, useMemo } from 'react'

interface CreateTransmissionProps {
  content: string
  setContent: React.Dispatch<React.SetStateAction<string>>
  images: File[]
  setImages: React.Dispatch<React.SetStateAction<File[]>>
  video: File | null
  setVideo: React.Dispatch<React.SetStateAction<File | null>>
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export default function CreateTransmission({
  content,
  setContent,
  images,
  setImages,
  video,
  setVideo,
  fileInputRef,
}: CreateTransmissionProps) {
  
  // Clean up object URLs to prevent memory leaks when components unmount or files change
  useEffect(() => {
    const urls: string[] = []
    
    if (images.length > 0) {
      images.forEach((img) => urls.push(URL.createObjectURL(img)))
    } else if (video) {
      urls.push(URL.createObjectURL(video))
    }

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images, video])

  const handleGoLive = () => {
    window.location.href = '/live?broadcast=1'
  }

  const handleRemoveMedia = () => {
    setImages([])
    setVideo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Memoize byte size calculations to protect render performance
  const totalSizeMB = useMemo(() => {
    const totalBytes = images.reduce((acc, file) => acc + file.size, 0) || video?.size || 0
    return (totalBytes / 1024 / 1024).toFixed(2)
  }, [images, video])

  return (
    <div className="w-full rounded-2xl border border-zinc-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 focus-within:border-zinc-400 focus-within:shadow-md dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:focus-within:border-zinc-600">
      
      {/* Header Section */}
      <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 font-sans text-sm font-semibold text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
            C
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create Transmission
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Broadcast update to your network
            </p>
          </div>
        </div>

        {/* Action / Status Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 dark:border-emerald-500/30">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
              LIVE
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoLive}
            className="rounded-lg bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Go Live
          </button>
        </div>
      </div>

      {/* Content Input */}
      <div className="w-full">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening? Transmit your signal into the network..."
          maxLength={500}
          className="w-full resize-none bg-transparent py-1 text-sm leading-relaxed text-zinc-900 outline-none placeholder:text-zinc-400/80 dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
      </div>

      {/* Media Preview Drawer */}
      {(images.length > 0 || video) && (
        <div className="mt-4 rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-3.5 dark:border-zinc-800/50 dark:bg-zinc-900/30">
          <div className="flex items-center gap-4">
            
            {/* Image Array Preview */}
            {images.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="h-14 w-14 shrink-0 snap-center rounded-lg border border-zinc-200/80 object-cover shadow-sm dark:border-zinc-800"
                  />
                ))}
              </div>
            ) : video ? (
              /* Video Block Preview */
              <video
                src={URL.createObjectURL(video)}
                className="h-14 w-14 rounded-lg border border-zinc-200/80 object-cover shadow-sm dark:border-zinc-800"
                muted
                playsInline
              />
            ) : null}

            {/* Media Metadata */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {images.length > 0 ? `${images.length} photos selected` : video?.name}
              </p>
              <p className="mt-0.5 font-mono text-[10px] tracking-wide text-zinc-400 dark:text-zinc-500">
                {totalSizeMB} MB
              </p>
            </div>

            {/* Destruction Control */}
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="text-xs font-semibold text-zinc-400 transition-colors hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
