'use client'

import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'

export interface Post {
  id: string
  user_id: string
  content: string
  avatar_url: string | null
  image_urls: string[]
  video_url: string | null
  created_at: string
}

export interface UploadManagerProps {
  userId: string
  content: string
  images: File[]
  video: File | null
  avatar_url?: string | null
  onProgress?: (progress: number, message: string, current: number, total: number) => void
  onSuccess?: (post: Post) => void
  onError?: (error: Error) => void
}

const COMPRESSION_CONFIG = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
} as const

/**
 * Generates a unique, secure file path
 */
const generateStoragePath = (userId: string, originalName: string): string => {
  const ext = originalName.split('.').pop() ?? ''
  return `${userId}-${Date.now()}-${crypto.randomUUID()}.${ext}`
}

/**
 * Compresses and uploads a single image to Supabase Storage
 */
async function uploadSingleImage(userId: string, file: File): Promise<string> {
  const compressed = await imageCompression(file, COMPRESSION_CONFIG)

  const fileName = generateStoragePath(userId, file.name)

  const formData = new FormData()

  formData.append("file", compressed)
  formData.append("bucket", "images")
  formData.append("fileName", fileName)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Image upload failed")
  }

  const data = await response.json()

  return data.url
}

/**
 * Uploads a video file to Supabase Storage
 */
async function uploadVideoFile(userId: string, video: File): Promise<string> {
  const fileName = generateStoragePath(userId, video.name)

  const formData = new FormData()

  formData.append("file", video)
  formData.append("bucket", "videos")
  formData.append("fileName", fileName)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Video upload failed")
  }

  const data = await response.json()

  return data.url
}

/**
 * Persists the post metadata into the database
 */
async function savePostToDatabase(
  userId: string,
  content: string,
  avatarUrl: string | null | undefined,
  imageUrls: string[],
  videoUrl: string | null
): Promise<Post> {
  
  const start = performance.now()

const { data: authData } = await supabase.auth.getUser()


const { error } = await supabase
  .from("posts")
  .insert({
    user_id: userId,
    content,
    avatar_url: avatarUrl,
    image_urls: imageUrls,
    video_url: videoUrl,
  })

if (error) throw error


const { data, error: fetchError } = await supabase
  .from("posts")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false })
  .limit(1)
  .single()

if (fetchError) throw fetchError

  console.log(
    `Database took ${(performance.now() - start).toFixed(0)} ms`
  )

  console.log("DATA:", data)
  console.log("ERROR:", error)

  if (error) throw error

  return data as Post
}
/**
 * Executes a high-performance concurrent post creation pipeline
 */
export async function uploadPost({
  userId,
  content,
  images,
  video,
  avatar_url,
  onProgress,
  onSuccess,
  onError,
}: UploadManagerProps): Promise<Post> {
  const totalFiles = images.length + (video ? 1 : 0)
  
  try {
    // Phase 1: Uploading Media
    for (let i = 1; i <= 10; i++) {
  onProgress?.(i, 'Processing media payloads...', 0, totalFiles)
  await new Promise(resolve => setTimeout(resolve, 30))
}

    // Run image and video asset pipelines concurrently
let fakeProgress = 10
let animationId: number

const animateProgress = () => {
  if (fakeProgress < 89) {
    const speed = (89 - fakeProgress) * 0.03

    fakeProgress += Math.max(speed, 0.05)

    onProgress?.(
      Math.round(fakeProgress),
      'Uploading media...',
      0,
      totalFiles
    )

    animationId = requestAnimationFrame(animateProgress)
  }
}

animationId = requestAnimationFrame(animateProgress)

console.log("🔥 Starting upload")
const [imageUrls, videoUrl] = await Promise.all([

  Promise.all(images.map((img) => uploadSingleImage(userId, img))),
  video ? uploadVideoFile(userId, video) : Promise.resolve(null),
])
console.log("🔥 Upload finished")
cancelAnimationFrame(animationId)

 console.log("✅ Media upload complete")

onProgress?.(90, 'Finalizing publication...', totalFiles, totalFiles)

const timer = `Database Save ${Date.now()}`

console.time(timer)

const post = await savePostToDatabase(

  userId,
  content,
  avatar_url,
  imageUrls,
  videoUrl
)

onProgress?.(100, 'Success', totalFiles, totalFiles)



onSuccess?.(post)


    
    return post
  } catch (err) {
    const errorInstance = err instanceof Error ? err : new Error(String(err))
    onError?.(errorInstance)
    throw errorInstance
  }
}
