'use client'

import React from 'react'

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
  
  const handleRemoveMedia = () => {
    setImages([])
    setVideo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const totalSizeMB = ((images.reduce((acc, file) => acc + file.size, 0) || video?.size || 0) / 1024 / 1024).toFixed(2)

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 focus-within:border-zinc-400 focus-within:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:focus-within:border-zinc-700">
      
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 font-sans font-medium text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50">
            C
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create Transmission
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Broadcast update to your network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-1 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-medium tracking-wider text-emerald-700 dark:text-emerald-400">
            LIVE
          </span>
        </div>
      </div>

      {/* INPUT */}
      <div className="w-full">
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening? Transmit your signal into the network..."
          maxLength={500}
          className="w-full resize-none bg-transparent py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-600"
        />
      </div>

      {/* MEDIA PREVIEW */}
      {(images.length > 0 || video) && (
        <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/30">
          <div className="flex items-center gap-3">
            {images.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="h-16 w-16 shrink-0 snap-center rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                  />
                ))}
              </div>
            ) : video ? (
              <video
                src={URL.createObjectURL(video)}
                className="h-16 w-16 rounded-md border border-zinc-200 object-cover dark:border-zinc-800"
                muted
              />
            ) : null}

            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {images.length > 0 ? `${images.length} photos selected` : video?.name}
              </p>
              <p className="text-[11px] font-mono text-zinc-400 tabular-nums dark:text-zinc-500">
                {totalSizeMB} MB
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemoveMedia}
              className="text-xs font-medium text-zinc-500 hover:text-red-600 transition-colors dark:text-zinc-400 dark:hover:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
