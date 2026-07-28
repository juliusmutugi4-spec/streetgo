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

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, compressed, { cacheControl: '3600' })

  if (error) throw new Error(`Image upload failed: ${error.message}`)

  return supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl
}

/**
 * Uploads a video file to Supabase Storage
 */
async function uploadVideoFile(userId: string, video: File): Promise<string> {
  const fileName = generateStoragePath(userId, video.name)

  const { error } = await supabase.storage
    .from('videos')
    .upload(fileName, video, {
      cacheControl: '3600',
      upsert: false,
      contentType: video.type,
    })

  if (error) throw new Error(`Video upload failed: ${error.message}`)

  return supabase.storage.from('videos').getPublicUrl(fileName).data.publicUrl
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
  console.log("➡️ Inserting post...")

  const start = performance.now()

  const query = supabase
    .from("posts")
    .insert({
      user_id: userId,
      content,
      avatar_url: avatarUrl,
      image_urls: imageUrls,
      video_url: videoUrl,
    })
    .select()
    .single()

  const { data, error } = await query

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
    onProgress?.(10, 'Processing media payloads...', 0, totalFiles)

    // Run image and video asset pipelines concurrently
    const [imageUrls, videoUrl] = await Promise.all([
      Promise.all(images.map((img) => uploadSingleImage(userId, img))),
      video ? uploadVideoFile(userId, video) : Promise.resolve(null),
    ])

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

console.timeEnd(timer)
console.log("✅ Database saved")

onProgress?.(100, 'Success', totalFiles, totalFiles)

console.log("✅ Progress 100%")

onSuccess?.(post)

console.log("✅ onSuccess complete")
    
    return post
  } catch (err) {
    const errorInstance = err instanceof Error ? err : new Error(String(err))
    onError?.(errorInstance)
    throw errorInstance
  }
}
