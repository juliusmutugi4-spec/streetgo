'use client'
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ImagePlus, Video, Send, Loader2, Image, Sparkles } from 'lucide-react'
import imageCompression from 'browser-image-compression'
interface CreatePostProps {
  userId: string
  profile: {
    username?: string
    avatar_url?: string | null
  } | null
  onPosted: () => void
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
const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
const fileInputRef = useRef<HTMLInputElement>(null)



  const handlePost = async () => {
if (
  !content.trim() &&
  !video &&
  images.length === 0
)
  return
    setUploading(true)
console.log("STEP 1")
    try {
      if (!userId) throw new Error('Not logged in')

      let videoUrl = null
      let imageUrls: string[] = []

      // Upload video if exists
if (video) {
  console.log("Starting video upload")

  console.log(video.name)
  console.log(video.type)
  console.log(video.size)

  const fileExt = video.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`

console.time("VIDEO UPLOAD")

const { data, error } = await supabase.storage
  .from('videos')
  .upload(fileName, video, {
    cacheControl: '3600',
    upsert: false,
    contentType: video.type,
  })

console.timeEnd("VIDEO UPLOAD")

console.log("VIDEO DATA:", data)
console.log("VIDEO ERROR:", error)

if (error) throw error

videoUrl = supabase.storage
  .from('videos')
  .getPublicUrl(fileName).data.publicUrl

console.log("Video upload finished")
}

imageUrls = uploadedImageUrls
      // Get username from auth metadata or emai
const avatar_url = profile?.avatar_url ?? null

const { data: insertedPost, error: insertError } = await supabase
  .from('posts')
  .insert({
    content: content,
    user_id: userId,
    avatar_url,
    video_url: videoUrl,
    image_urls: imageUrls
  })
  .select()

console.log("INSERTED POST:", insertedPost)
console.log("INSERT ERROR:", insertError)

if (insertError) {
  throw insertError
}


      // Reset form
setContent('')
setVideo(null)
setImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh feed
console.log("BEFORE onPosted")

await Promise.resolve(onPosted())

console.log("AFTER onPosted")


    } 
    
catch (error: any) {
  console.error('FULL ERROR:', error)

  alert(
    JSON.stringify(error, null, 2)
  )
}


    finally {
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

{(images.length > 0 || video) && (
  <div className="mt-4 rounded-xl border border-cyan-500/20 bg-[#0b1220]/60 p-4">

    <div className="flex items-center gap-3">
{images.length > 0 ? (
  <div className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth">
    {images.map((img, index) => (
      <img
        key={index}
        src={URL.createObjectURL(img)}
        alt=""
        className="w-32 h-32 rounded-xl object-cover shrink-0 border border-cyan-500/20"
      />
    ))}
  </div>
) : video ? (
  <video
    src={URL.createObjectURL(video)}
    className="w-32 h-32 rounded-xl object-cover border border-orange-500/20"
    muted
  />
) : null}

      <div className="flex-1 overflow-hidden">

        <p className="truncate text-xs font-mono text-cyan-100">
          {images.length > 0
  ? `${images.length} Photos Selected`
  : video?.name}
        </p>

 <p className="text-[10px] font-mono text-blue-400">
  {(
    (images.reduce((t, f) => t + f.size, 0) ||
      video?.size ||
      0) /
    1024 /
    1024
  ).toFixed(2)}{" "}
  MB
</p>

      </div>

      <button
        onClick={() => {
          setImages([])
          setVideo(null)

          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }}
        className="text-xs font-bold text-red-400 hover:text-red-300"
      >
        Remove
      </button>

    </div>

  </div>
)}




{uploading && (
  <div className="mb-4 rounded-xl border border-cyan-500/20 bg-[#0b1220]/70 p-4">

    <div className="flex items-center gap-3">

      <Loader2
        size={18}
        className="animate-spin text-cyan-400"
      />

      <div>
        <p className="text-sm font-bold text-cyan-300">
          Uploading...
        </p>

        <p className="text-xs text-zinc-400">
          Please don't close the app.
        </p>
      </div>

    </div>

  </div>
)}
        {/* ACTIONS */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">

<label
  className="
    flex
    cursor-pointer
    items-center
    justify-center
    gap-2
    rounded-lg
    border
    border-cyan-500/20
    bg-[#0b1220]
    px-5
    py-2.5
    text-xs
    font-bold
    uppercase
    text-cyan-300
    hover:text-orange-300
    hover:border-orange-400/40
    transition
  "
>
  <ImagePlus size={15} />

  Media

<input
  ref={fileInputRef}
  type="file"
  accept="image/*,video/*"
  multiple
    hidden
    onChange={async (e) => {
      const file = e.target.files?.[0]

      if (!file) return

if (file.type.startsWith('image/')) {
  const files = Array.from(e.target.files || [])
    .filter(file => file.type.startsWith('image/'))
    .slice(0, 10)

  setImages(files)
  setVideo(null)

  // Background upload starts immediately
  const urls = await Promise.all(
    files.map(async (img) => {
      const compressedImage = await imageCompression(img, {
        maxSizeMB: 0.4,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      })

      const fileExt = img.name.split('.').pop()

      const fileName =
        `${userId}-${Date.now()}-${crypto.randomUUID()}.${fileExt}`

      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, compressedImage)

      if (error) throw error

      return supabase.storage
        .from('images')
        .getPublicUrl(fileName).data.publicUrl
    })
  )

  setUploadedImageUrls(urls)
}
else if (file.type.startsWith('video/')) {
  setVideo(file)
  setImages([])
}
    }}
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
    Uploading...
  </>
) : (
  <>
    <Send size={14} />
    Transmit
  </>
)}      </button>

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