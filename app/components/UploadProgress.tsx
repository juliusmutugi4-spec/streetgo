'use client'

import React from 'react'

interface UploadProgressProps {
  uploading: boolean
  uploadProgress: number
  currentUpload: string
  currentFile: number
  totalFiles: number
  secondsLeft: number | null
}

export default function UploadProgress({
  uploading,
  uploadProgress,
  currentUpload,
  currentFile,
  totalFiles,
  secondsLeft,
}: UploadProgressProps) {
  if (!uploading) return null

  // Clamping progress bounds safely
  const progressPercent = Math.min(Math.max(uploadProgress, 0), 100)

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          
          {/* File Status & Counter */}
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {currentUpload || "Processing files..."}
            </h4>
            <span className="shrink-0 text-xs font-medium text-zinc-400 tabular-nums dark:text-zinc-500">
              {currentFile} / {totalFiles}
            </span>
          </div>

          {/* System Notices */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </span>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Keep StreetGO open
              </p>
            </div>
            
            {secondsLeft !== null && (
              <p className="text-[11px] font-mono font-medium text-zinc-500 tabular-nums dark:text-zinc-400">
                {secondsLeft}s left
              </p>
            )}
          </div>
        </div>

        {/* Circular Metric Display */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 36 36">
            <path
              className="text-zinc-100 dark:text-zinc-900"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-zinc-900 transition-[stroke-dasharray] duration-150 ease-out dark:text-zinc-50"
              strokeWidth="3.5"
              strokeDasharray={`${progressPercent}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[10px] font-mono font-bold text-zinc-900 tabular-nums dark:text-zinc-50">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Hardware-Accelerated Linear Track */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div
          className="h-full w-full bg-zinc-900 transition-transform duration-150 ease-out will-change-transform dark:bg-zinc-50"
          style={{ 
            transform: `translateX(-${100 - progressPercent}%)` 
          }}
        />
      </div>
    </div>
  )
}
