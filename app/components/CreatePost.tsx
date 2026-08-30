'use client'

import {
  useState,
  useRef,
  useEffect,
} from 'react'

import { uploadPost } from './UploadManager'
import CreateTransmission from './CreateTransmission'
import UploadProgress from './UploadProgress'
import MediaPicker from './MediaPicker'
import TransmitButton from './TransmitButton'

import { supabase } from '../lib/supabase'
import { generateVideoThumbnail } from '../lib/generateThumbnail'

interface CreatePostProps {
  userId: string
  profile: {
    username?: string
    avatar_url?: string | null
  } | null
  onPosted: (post: any) => void
}

const MAX_CONTENT_LENGTH = 10000

export default function CreatePost({
  userId,
  profile,
  onPosted,
}: CreatePostProps) {
  const [content, setContent] =
    useState('')

  const [video, setVideo] =
    useState<File | null>(null)

  const [images, setImages] =
    useState<File[]>([])

  // =====================================================
  // VIDEO THUMBNAIL
  // =====================================================

  const [
    videoThumbnail,
    setVideoThumbnail,
  ] = useState<Blob | null>(null)

  const [
    thumbnailPreview,
    setThumbnailPreview,
  ] = useState<string | null>(null)

  const [
    generatingThumbnail,
    setGeneratingThumbnail,
  ] = useState(false)

  // =====================================================
  // UPLOAD STATE
  // =====================================================

  const [
    uploading,
    setUploading,
  ] = useState(false)

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0)

  const [
    displayProgress,
    setDisplayProgress,
  ] = useState(0)

  const [
    currentUpload,
    setCurrentUpload,
  ] = useState('')

  const [
    currentFile,
    setCurrentFile,
  ] = useState(0)

  const [
    totalFiles,
    setTotalFiles,
  ] = useState(0)

  const [
    secondsLeft,
    setSecondsLeft,
  ] = useState<number | null>(null)

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  // =====================================================
  // SMOOTH PROGRESS
  // =====================================================

  useEffect(() => {
    if (
      displayProgress >=
      uploadProgress
    ) {
      return
    }

    const timer =
      setInterval(() => {
        setDisplayProgress(
          (prev) => {
            if (
              prev >=
              uploadProgress
            ) {
              clearInterval(timer)
              return uploadProgress
            }

            return prev + 1
          }
        )
      }, 20)

    return () => {
      clearInterval(timer)
    }
  }, [
    uploadProgress,
    displayProgress,
  ])

  // =====================================================
  // AUTOMATIC VIDEO THUMBNAIL
  // =====================================================

  useEffect(() => {
    if (!video) {
      setVideoThumbnail(null)
      setThumbnailPreview(null)
      setGeneratingThumbnail(false)

      return
    }

    let previewUrl:
      string | null = null

    let cancelled = false

    const createThumbnail =
      async () => {
        try {
          setGeneratingThumbnail(
            true
          )

          const thumbnail =
            await generateVideoThumbnail(
              video
            )

          if (cancelled) {
            return
          }

          setVideoThumbnail(
            thumbnail
          )

          previewUrl =
            URL.createObjectURL(
              thumbnail
            )

          setThumbnailPreview(
            previewUrl
          )
        } catch (error) {
          if (cancelled) {
            return
          }

          console.error(
            '❌ Thumbnail generation failed:',
            error
          )

          setVideoThumbnail(null)
          setThumbnailPreview(null)
        } finally {
          if (!cancelled) {
            setGeneratingThumbnail(
              false
            )
          }
        }
      }

    void createThumbnail()

    return () => {
      cancelled = true

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        )
      }
    }
  }, [video])

  // =====================================================
  // HANDLE POST
  // =====================================================

  const handlePost =
    async () => {
      const trimmedContent =
        content.trim()

      if (
        !trimmedContent &&
        !video &&
        images.length === 0
      ) {
        return
      }

      /*
       * Extra safety check.
       *
       * CreateTransmission should also
       * use maxLength={10000}, but this
       * protects the upload path as well.
       */
      if (
        content.length >
        MAX_CONTENT_LENGTH
      ) {
        window.alert(
          `Your post is too long. Maximum ${MAX_CONTENT_LENGTH.toLocaleString()} characters are allowed.`
        )

        return
      }

      setUploading(true)

      setUploadProgress(0)
      setDisplayProgress(0)

      setCurrentFile(0)
      setTotalFiles(0)

      setCurrentUpload(
        '📡 Preparing transmission...'
      )

      try {
        // =================================================
        // SESSION CHECK
        // =================================================

        const {
          data,
          error: sessionError,
        } =
          await supabase.auth.getSession()

        if (
          sessionError
        ) {
          throw sessionError
        }

        if (!data.session?.user) {
          throw new Error(
            'Your session has expired. Please sign in again.'
          )
        }

        if (
          data.session.user.id !==
          userId
        ) {
          throw new Error(
            'Authenticated user does not match the post author.'
          )
        }

        // =================================================
        // UPLOAD
        // =================================================

        await uploadPost({
          userId,

          /*
           * Send the full 10,000-character
           * content to the upload layer.
           */
          content,

          images,

          video,

          avatar_url:
            profile?.avatar_url ??
            null,

          // Thumbnail generated locally
          videoThumbnail,

          // =================================================
          // PROGRESS
          // =================================================

          onProgress: (
            progress: number,
            message: string,
            current: number,
            total: number
          ) => {
            setUploadProgress(
              progress
            )

            setCurrentUpload(
              message
            )

            setCurrentFile(
              current
            )

            setTotalFiles(
              total
            )
          },

          // =================================================
          // SUCCESS
          // =================================================

          onSuccess: async (
            newPost: any
          ) => {
            setContent('')

            setImages([])

            setVideo(null)

            setVideoThumbnail(
              null
            )

            if (
              thumbnailPreview
            ) {
              URL.revokeObjectURL(
                thumbnailPreview
              )
            }

            setThumbnailPreview(
              null
            )

            if (
              fileInputRef.current
            ) {
              fileInputRef.current.value =
                ''
            }

            setCurrentUpload(
              '✅ Transmission complete'
            )

            await Promise.resolve(
              onPosted(newPost)
            )
          },

          // =================================================
          // ERROR
          // =================================================

          onError: (
            error: any
          ) => {
            console.error(
              'UPLOAD ERROR:',
              error
            )

            window.alert(`
Message: ${
              error?.message ??
              'Unknown error'
            }

Code: ${
              error?.code ??
              'none'
            }

Details: ${
              error?.details ??
              'none'
            }

Hint: ${
              error?.hint ??
              'none'
            }
`)
          },
        } as any)
      } catch (error) {
        console.error(
          'POST CREATION FAILED:',
          error
        )

        window.alert(
          error instanceof Error
            ? error.message
            : 'Unable to create the post.'
        )
      } finally {
        setUploading(false)

        setUploadProgress(0)
        setDisplayProgress(0)

        setCurrentFile(0)
        setTotalFiles(0)

        setSecondsLeft(null)

        setCurrentUpload('')
      }
    }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-zinc-900
        bg-[#05070b]/60
        backdrop-blur-xl
        shadow-2xl
        transition-all
        duration-300
        hover:border-cyan-500/30
      "
    >
      {/* TOP GLOW */}

      <div
        className="
          absolute
          left-0
          right-0
          top-0
          h-[1px]
          bg-gradient-to-r
          from-transparent
          via-cyan-400/40
          to-transparent
        "
      />

      {/* CYAN GLOW */}

      <div
        className="
          absolute
          -left-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-cyan-500/10
          blur-[100px]
        "
      />

      {/* ORANGE GLOW */}

      <div
        className="
          absolute
          -bottom-24
          -right-24
          h-64
          w-64
          rounded-full
          bg-orange-500/10
          blur-[120px]
        "
      />

      <div
        className="
          relative
          z-10
          p-5
        "
      >
        {/* =================================================
            CREATE TRANSMISSION
        ================================================= */}

        <CreateTransmission
          content={content}
          setContent={setContent}
          images={images}
          setImages={setImages}
          video={video}
          setVideo={setVideo}
          fileInputRef={fileInputRef}
        />

        {/* =================================================
            AUTOMATIC VIDEO THUMBNAIL
        ================================================= */}

        {video && (
          <div
            className="
              mt-4
              overflow-hidden
              rounded-xl
              border
              border-zinc-800
              bg-black/40
            "
          >
            {/* GENERATING */}

            {generatingThumbnail && (
              <div
                className="
                  flex
                  aspect-video
                  items-center
                  justify-center
                "
              >
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      mb-3
                      h-8
                      w-8
                      animate-spin
                      rounded-full
                      border-2
                      border-zinc-700
                      border-t-cyan-400
                    "
                  />

                  <p
                    className="
                      font-mono
                      text-[10px]
                      uppercase
                      tracking-widest
                      text-cyan-400
                    "
                  >
                    Extracting thumbnail...
                  </p>
                </div>
              </div>
            )}

            {/* THUMBNAIL */}

            {!generatingThumbnail &&
              thumbnailPreview && (
                <div
                  className="
                    relative
                    aspect-video
                  "
                >
                  <img
                    src={
                      thumbnailPreview
                    }
                    alt="StreetGO generated video thumbnail"
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />

                  {/* DARK OVERLAY */}

                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/70
                      via-transparent
                      to-black/20
                    "
                  />

                  {/* BADGE */}

                  <div
                    className="
                      absolute
                      left-3
                      top-3
                      rounded-full
                      border
                      border-cyan-400/30
                      bg-black/70
                      px-3
                      py-1.5
                      backdrop-blur-md
                    "
                  >
                    <span
                      className="
                        font-mono
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-cyan-300
                      "
                    >
                      ✨ AUTO THUMBNAIL
                    </span>
                  </div>

                  {/* VIDEO NAME */}

                  <div
                    className="
                      absolute
                      bottom-3
                      left-3
                      right-3
                    "
                  >
                    <p
                      className="
                        truncate
                        font-mono
                        text-[10px]
                        text-white/70
                      "
                    >
                      {video.name}
                    </p>
                  </div>
                </div>
              )}

            {/* FAILED */}

            {!generatingThumbnail &&
              !thumbnailPreview && (
                <div
                  className="
                    flex
                    aspect-video
                    items-center
                    justify-center
                  "
                >
                  <p
                    className="
                      font-mono
                      text-[10px]
                      uppercase
                      tracking-widest
                      text-zinc-500
                    "
                  >
                    Thumbnail unavailable
                  </p>
                </div>
              )}
          </div>
        )}

        {/* =================================================
            UPLOAD PROGRESS
        ================================================= */}

        <UploadProgress
          uploading={uploading}
          uploadProgress={
            displayProgress
          }
          currentUpload={
            currentUpload
          }
          currentFile={
            currentFile
          }
          totalFiles={
            totalFiles
          }
          secondsLeft={
            secondsLeft
          }
        />

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >
          <MediaPicker
            setImages={setImages}
            setVideo={setVideo}
            fileInputRef={
              fileInputRef
            }
          />

          <TransmitButton
            uploading={uploading}
            onClick={handlePost}
          />
        </div>

        {/* =================================================
            CHARACTER COUNTER
        ================================================= */}

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
          "
        >
          <span
            className="
              font-mono
              text-[10px]
              text-zinc-500
            "
          >
            Maximum{' '}
            {MAX_CONTENT_LENGTH.toLocaleString()}{' '}
            characters
          </span>

          <span
            className={`
              font-mono
              text-[10px]
              ${
                content.length >
                MAX_CONTENT_LENGTH
                  ? 'text-red-400'
                  : content.length >
                    MAX_CONTENT_LENGTH -
                      500
                  ? 'text-orange-400'
                  : 'text-blue-400/60'
              }
            `}
          >
            {content.length.toLocaleString()}{' '}
            /{' '}
            {MAX_CONTENT_LENGTH.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}