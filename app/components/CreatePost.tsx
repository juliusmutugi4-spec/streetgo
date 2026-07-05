'use client'
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { ImagePlus, Video, Send, Loader2, Image, Sparkles } from 'lucide-react'

interface CreatePostProps {
  userId: string
  onPosted: () => void
}

export default function CreatePost({ userId, onPosted }: CreatePostProps) {
  const [content, setContent] = useState('')
  const [video, setVideo] = useState<File | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
 const [uploadProgress, setUploadProgress] = useState(0)
const [uploadedBytes, setUploadedBytes] = useState(0)
const [totalBytes, setTotalBytes] = useState(0)
const [uploadSpeed, setUploadSpeed] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
const [timeRemaining, setTimeRemaining] = useState(0)
const [uploadComplete, setUploadComplete] = useState(false)

const uploadWithProgress = (
  bucket: string,
  file: File,
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {

    const xhr = new XMLHttpRequest()

    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    formData.append('fileName', fileName)

const startTime = Date.now()

xhr.upload.onprogress = (event) => {
  if (!event.lengthComputable) return

  const percent = Math.round(
    (event.loaded / event.total) * 100
  )

  const elapsed = (Date.now() - startTime) / 1000

  const speed = elapsed > 0
    ? event.loaded / elapsed
    : 0

  const remaining =
    speed > 0
      ? (event.total - event.loaded) / speed
      : 0

  setUploadProgress(percent)
  setUploadedBytes(event.loaded)
  setTotalBytes(event.total)
  setUploadSpeed(speed)
  setTimeRemaining(Math.ceil(remaining))
}

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.responseText)
      } else {
        reject(xhr.responseText)
      }
    }

    xhr.onerror = () => reject('Upload failed')

    xhr.open('POST', '/api/upload')

    xhr.send(formData)

  })
}



  const handlePost = async () => {
    if (
  !content.trim() &&
  !video &&
  !image
)
  return
    setUploading(true)

    try {
      if (!userId) throw new Error('Not logged in')

      let videoUrl = null
      let imageUrl = null

      // Upload video if exists
if (video) {
  const fileExt = video.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`

  const response = await uploadWithProgress(
    'videos',
    video,
    fileName
  )

  const result = JSON.parse(response)

  if (!result.success) {
    throw new Error(result.error)
  }

  videoUrl = result.url
}

if (image) {
  const fileExt = image.name.split('.').pop()

  const fileName =
    `${userId}-${Date.now()}-image.${fileExt}`

  const response = await uploadWithProgress(
    'images',
    image,
    fileName
  )

  const result = JSON.parse(response)

  if (!result.success) {
    throw new Error(result.error)
  }

  imageUrl = result.url
}

      // Get username from auth metadata or email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .maybeSingle()

      console.log('PROFILE:', profile)
      console.log('PROFILE ERROR:', profileError)

      const avatar_url =
        profile?.avatar_url || null


      const username = profile?.username

      // Insert post with username
      const { data: insertedPost, error: insertError } = await supabase
        .from('posts')
        .insert({
          content: content,
          user_id: userId,
          avatar_url: avatar_url,
          video_url: videoUrl,
          image_url: imageUrl
        })
        .select()

      console.log('INSERTED POST:', insertedPost)
      console.log('INSERT ERROR:', insertError)
      if (insertError) {
        console.log(insertError)
        throw insertError
      }

      // Reset form
setContent('')
setVideo(null)
setImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh feed
      setUploadComplete(true)

setTimeout(() => {
  onPosted()
}, 1000)

setUploadProgress(0)
setUploadedBytes(0)
setTotalBytes(0)


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

{(image || video) && (
  <div className="mt-4 rounded-xl border border-cyan-500/20 bg-[#0b1220]/60 p-4">

    <div className="flex items-center gap-3">

      {image ? (
        <img
          src={URL.createObjectURL(image)}
          alt="preview"
          className="w-16 h-16 rounded-lg object-cover border border-cyan-500/20"
        />
      ) : (
        <video
          src={URL.createObjectURL(video!)}
          className="w-16 h-16 rounded-lg object-cover border border-orange-500/20"
          muted
        />
      )}

      <div className="flex-1 overflow-hidden">

        <p className="truncate text-xs font-mono text-cyan-100">
          {image?.name || video?.name}
        </p>

        <p className="text-[10px] font-mono text-blue-400">
          {(
            ((image?.size || video?.size || 0) / 1024 / 1024)
          ).toFixed(2)} MB
        </p>

      </div>

      <button
        onClick={() => {
          setImage(null)
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





        {/* ACTIONS */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
{(uploading || uploadComplete) && (
  <div className="mt-5 mb-4 rounded-xl border border-cyan-500/20 bg-[#0b1220]/70 p-4">

    <div className="flex justify-between items-center mb-2">

      <span className="text-xs font-bold text-cyan-300">
        {uploadComplete
  ? 'Upload Complete'
  : 'Uploading Media...'}
      </span>

      <span className="text-xs font-mono text-cyan-300">
        {uploadComplete ? '✔' : `${uploadProgress}%`}
      </span>

    </div>

<div className="relative mt-1 h-3 overflow-hidden rounded-full bg-zinc-800 border border-cyan-500/20">

  {/* Animated background */}
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 animate-pulse" />

  {/* Progress */}
  <div
    className="
      relative
      h-full
      rounded-full
      bg-gradient-to-r
      from-cyan-400
      via-blue-500
      to-cyan-300
      transition-all
      duration-300
      shadow-[0_0_18px_rgba(34,211,238,.7)]
    "
    style={{
      width: `${uploadProgress}%`
    }}
  />

  {/* Moving glow */}
  <div
    className="absolute top-0 h-full w-8 bg-white/30 blur-sm"
    style={{
      left: `calc(${uploadProgress}% - 16px)`
    }}
  />

</div>

    <div className="mt-2 flex justify-between text-[10px] text-zinc-400">

      <span>
        {(uploadedBytes / 1024 / 1024).toFixed(2)} MB
      </span>

      <span>
        {(totalBytes / 1024 / 1024).toFixed(2)} MB
      </span>

    </div>
<div className="mt-1 flex justify-between text-[10px] text-cyan-400">

  <span>
    {(uploadSpeed / 1024 / 1024).toFixed(2)} MB/s
  </span>

  <span>
    {timeRemaining}s left
  </span>

</div>


  </div>
)}

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
    hidden
    onChange={(e) => {
      const file = e.target.files?.[0]

      if (!file) return

      if (file.type.startsWith('image/')) {
        setImage(file)
        setVideo(null)
      } else if (file.type.startsWith('video/')) {
        setVideo(file)
        setImage(null)
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
  uploadProgress < 100 ? (
    <>
      <Loader2 size={14} className="animate-spin" />
      Uploading... {uploadProgress}%
    </>
  ) : (
    <>
      ✅ Finalizing...
    </>
  )
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