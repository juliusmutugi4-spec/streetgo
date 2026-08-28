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
  thumbnail_url: string | null
  created_at: string
}

export interface UploadManagerProps {
  userId: string
  content: string
  images: File[]
  video: File | null
  videoThumbnail?: Blob | null
  avatar_url?: string | null
  onProgress?: (
    progress: number,
    message: string,
    current: number,
    total: number
  ) => void
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
const generateStoragePath = (
  userId: string,
  originalName: string
): string => {
  const ext = originalName.split('.').pop() ?? ''

  return `${userId}-${Date.now()}-${crypto.randomUUID()}.${ext}`
}

/**
 * Uploads a single image to R2
 */
async function uploadSingleImage(
  userId: string,
  file: File
): Promise<string> {
  const compressed = await imageCompression(
    file,
    COMPRESSION_CONFIG
  )

  const fileName = generateStoragePath(
    userId,
    file.name
  )

  const formData = new FormData()

  formData.append('file', compressed)
  formData.append('bucket', 'images')
  formData.append('fileName', fileName)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Image upload failed')
  }

  const data = await response.json()

  if (!data?.url) {
    throw new Error('Image upload returned no URL')
  }

  return data.url
}

/**
 * Uploads a generated video thumbnail to R2
 */
async function uploadVideoThumbnail(
  userId: string,
  thumbnail: Blob
): Promise<string> {
  const fileName = generateStoragePath(
    userId,
    'video-thumbnail.jpg'
  )

  const thumbnailFile = new File(
    [thumbnail],
    'video-thumbnail.jpg',
    {
      type: 'image/jpeg',
    }
  )

  const formData = new FormData()

  formData.append(
    'file',
    thumbnailFile
  )

  formData.append(
    'bucket',
    'images'
  )

  formData.append(
    'fileName',
    fileName
  )

  const response = await fetch(
    '/api/upload',
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error(
      'Video thumbnail upload failed'
    )
  }

  const data = await response.json()

  if (!data?.url) {
    throw new Error(
      'Video thumbnail returned no URL'
    )
  }

  return data.url
}

/**
 * Uploads a video file to Cloudflare R2
 */
async function uploadVideoFile(
  userId: string,
  video: File
): Promise<string> {
  const fileName = generateStoragePath(
    userId,
    video.name
  )

  const response = await fetch(
    '/api/upload-url',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        fileType: video.type,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(
      'Failed to generate upload URL'
    )
  }

  const { uploadUrl } =
    await response.json()

  const upload = await fetch(
    uploadUrl,
    {
      method: 'PUT',
      headers: {
        'Content-Type': video.type,
      },
      body: video,
    }
  )

  if (!upload.ok) {
    throw new Error(
      'Video upload failed'
    )
  }

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileName}`
}

/**
 * Persists post metadata into Supabase
 */
async function savePostToDatabase(
  userId: string,
  content: string,
  avatarUrl: string | null | undefined,
  imageUrls: string[],
  videoUrl: string | null,
  thumbnailUrl: string | null
): Promise<Post> {
  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content,
      avatar_url: avatarUrl,
      image_urls: imageUrls,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
    })

  if (error) {
    throw error
  }

  const {
    data,
    error: fetchError,
  } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .single()

  if (fetchError) {
    throw fetchError
  }

  return data as Post
}

/**
 * Executes post creation pipeline
 */
export async function uploadPost({
  userId,
  content,
  images,
  video,
  videoThumbnail,
  avatar_url,
  onProgress,
  onSuccess,
  onError,
}: UploadManagerProps): Promise<Post> {
  const totalFiles =
    images.length +
    (video ? 1 : 0)

  try {
    // =====================================================
    // PHASE 1
    // =====================================================

    for (
      let i = 1;
      i <= 10;
      i++
    ) {
      onProgress?.(
        i,
        'Processing media payloads...',
        0,
        totalFiles
      )

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            30
          )
      )
    }

    // =====================================================
    // PROGRESS ANIMATION
    // =====================================================

    let fakeProgress = 10

    let animationId: number

    const animateProgress = () => {
      if (
        fakeProgress < 89
      ) {
        const speed =
          (89 -
            fakeProgress) *
          0.03

        fakeProgress +=
          Math.max(
            speed,
            0.05
          )

        onProgress?.(
          Math.round(
            fakeProgress
          ),
          'Uploading media...',
          0,
          totalFiles
        )

        animationId =
          requestAnimationFrame(
            animateProgress
          )
      }
    }

    animationId =
      requestAnimationFrame(
        animateProgress
      )

    // =====================================================
    // UPLOAD MEDIA
    // =====================================================

    console.time(
      'MEDIA_UPLOAD'
    )

    const [
      imageUrls,
      videoUrl,
      thumbnailUrl,
    ] = await Promise.all([
      Promise.all(
        images.map(
          img =>
            uploadSingleImage(
              userId,
              img
            )
        )
      ),

      video
        ? uploadVideoFile(
            userId,
            video
          )
        : Promise.resolve(
            null
          ),

      videoThumbnail
        ? uploadVideoThumbnail(
            userId,
            videoThumbnail
          )
        : Promise.resolve(
            null
          ),
    ])

    console.timeEnd(
      'MEDIA_UPLOAD'
    )

    cancelAnimationFrame(
      animationId
    )

    // =====================================================
    // DATABASE
    // =====================================================

    onProgress?.(
      90,
      'Finalizing publication...',
      totalFiles,
      totalFiles
    )

    const post =
      await savePostToDatabase(
        userId,
        content,
        avatar_url,
        imageUrls,
        videoUrl,
        thumbnailUrl
      )

    onProgress?.(
      100,
      'Success',
      totalFiles,
      totalFiles
    )

    onSuccess?.(post)

    return post
  } catch (err) {
    const errorInstance =
      err instanceof Error
        ? err
        : new Error(
            String(err)
          )

    onError?.(
      errorInstance
    )

    throw errorInstance
  }
}