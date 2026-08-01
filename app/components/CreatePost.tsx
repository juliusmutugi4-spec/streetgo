'use client'
import { useState, useRef, useEffect } from 'react'
import { uploadPost } from './UploadManager'
import { ImagePlus, Video, Send, Loader2, Image, Sparkles } from 'lucide-react'
import CreateTransmission from './CreateTransmission'
import UploadProgress from './UploadProgress'
import MediaPicker from './MediaPicker'
import TransmitButton from './TransmitButton'
import { supabase } from "../lib/supabase"
interface CreatePostProps {
  userId: string
  profile: {
    username?: string
    avatar_url?: string | null
  } | null
  onPosted: (post: any) => void
}
export default function CreatePost({
  userId,
  profile,
  onPosted,
}: CreatePostProps) {
  const [content, setContent] = useState('')
  const [video, setVideo] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [displayProgress, setDisplayProgress] = useState(0)
const [currentUpload, setCurrentUpload] = useState("")
const [currentFile, setCurrentFile] = useState(0)
const [totalFiles, setTotalFiles] = useState(0)
const [secondsLeft, setSecondsLeft] = useState<number | null>(null)

const fileInputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  if (displayProgress >= uploadProgress) return

  const timer = setInterval(() => {
    setDisplayProgress((prev) => {
      if (prev >= uploadProgress) {
        clearInterval(timer)
        return uploadProgress
      }

      return prev + 1
    })
  }, 20)

  return () => clearInterval(timer)
}, [uploadProgress, displayProgress])


const handlePost = async () => {
  if (!content.trim() && !video && images.length === 0) {
    return
  }

setUploading(true)
setUploadProgress(0)
setDisplayProgress(0)
  setCurrentFile(0)
  setTotalFiles(0)
  setCurrentUpload("📡 Preparing transmission...")

  try {
 const { data } = await supabase.auth.getSession()

alert(
  `SESSION: ${data.session ? "YES" : "NO"}\n\nUSER:\n${data.session?.user?.id ?? "NONE"}`
)

  const post = await uploadPost({
      userId,
      content,
      images,
      video,
      avatar_url: profile?.avatar_url ?? null,

      onProgress: (progress, message, current, total) => {
        setUploadProgress(progress)
        setCurrentUpload(message)
        setCurrentFile(current)
        setTotalFiles(total)
      },

      onSuccess: async (newPost) => {
        setContent("")
        setImages([])
        setVideo(null)

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        setCurrentUpload("✅ Transmission complete")

        await Promise.resolve(onPosted(newPost))
      },

onError: (error: any) => {
  console.error("UPLOAD ERROR:", error)

  alert(
    `
Message: ${error?.message}

Code: ${error?.code ?? "none"}

Details: ${error?.details ?? "none"}

Hint: ${error?.hint ?? "none"}
`
  )
},
    })

    console.log("UPLOAD COMPLETE", post)
  } finally {
setUploading(false)
setUploadProgress(0)
setDisplayProgress(0)
    setCurrentFile(0)
    setTotalFiles(0)
    setSecondsLeft(null)
    setCurrentUpload("")
  }
}
  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-900 bg-[#05070b]/60 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-cyan-500/30">

      {/* Neon Ambient Glow (Teal + Blue + Orange) */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-orange-500/10 blur-[120px]" />

      <div className="relative p-5 z-10">

<CreateTransmission
  content={content}
  setContent={setContent}
  images={images}
  setImages={setImages}
  video={video}
  setVideo={setVideo}
  fileInputRef={fileInputRef}
/>



<UploadProgress
  uploading={uploading}
  uploadProgress={displayProgress}
  currentUpload={currentUpload}
  currentFile={currentFile}
  totalFiles={totalFiles}
  secondsLeft={secondsLeft}
/>
        {/* ACTIONS */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
<MediaPicker
  setImages={setImages}
  setVideo={setVideo}
  fileInputRef={fileInputRef}
/>

<TransmitButton
  uploading={uploading}
  onClick={handlePost}
/>

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