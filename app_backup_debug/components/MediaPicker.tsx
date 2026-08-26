'use client'

import React from 'react'
import { ImagePlus } from 'lucide-react'

interface MediaPickerProps {
  setImages: React.Dispatch<React.SetStateAction<File[]>>
  setVideo: React.Dispatch<React.SetStateAction<File | null>>
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export default function MediaPicker({
  setImages,
  setVideo,
  fileInputRef,
}: MediaPickerProps) {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files
    if (!filesList || filesList.length === 0) return

    const firstFile = filesList[0]

    if (firstFile.type.startsWith('image/')) {
      const selectedImages = Array.from(filesList)
        .filter(file => file.type.startsWith('image/'))
        .slice(0, 10)
      
      setImages(selectedImages)
      setVideo(null)
    } else if (firstFile.type.startsWith('video/')) {
      setVideo(firstFile)
      setImages([])
    }
  }

  return (
    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all duration-200 hover:bg-zinc-50 hover:text-zinc-900 focus-within:ring-2 focus-within:ring-zinc-950 focus-within:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 dark:focus-within:ring-zinc-300">
      <ImagePlus size={14} className="text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400" />
      <span>Add media</span>
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*,video/*" 
        multiple 
        className="sr-only" 
        onChange={handleFileChange}
      />
    </label>
  )
}
