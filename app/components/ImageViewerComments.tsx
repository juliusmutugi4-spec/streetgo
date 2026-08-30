'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Send } from 'lucide-react'

interface ImageComment {
  id: string
  username: string
  avatar_url: string | null
  content: string
  created_at: string
}

interface ImageViewerCommentsProps {
  showImageComments: boolean
  setShowImageComments: (show: boolean) => void

  imageComments: ImageComment[]

  imageCommentText: string
  setImageCommentText: (text: string) => void

  addImageComment: () => void
}

export default function ImageViewerComments({
  showImageComments,
  setShowImageComments,
  imageComments,
  imageCommentText,
  setImageCommentText,
  addImageComment,
}: ImageViewerCommentsProps) {
  const commentsRef =
    useRef<HTMLDivElement | null>(null)

  /*
   * =========================================================
   * LOCK BACKGROUND SCROLL
   * =========================================================
   */

  useEffect(() => {
    if (!showImageComments) return

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow =
        previousOverflow
    }
  }, [showImageComments])

  /*
   * =========================================================
   * SCROLL TO NEWEST COMMENT
   * =========================================================
   */

  useEffect(() => {
    if (!showImageComments) return

    const container =
      commentsRef.current

    if (!container) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    })
  }, [
    imageComments.length,
    showImageComments,
  ])

  /*
   * =========================================================
   * HIDDEN
   * =========================================================
   */

  if (!showImageComments) {
    return null
  }

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const text =
      imageCommentText.trim()

    if (!text) return

    addImageComment()
  }

  /*
   * =========================================================
   * CLOSE
   * =========================================================
   */

  const handleClose = () => {
    setShowImageComments(false)
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <>
      {/* =====================================================
          BACKDROP
          ===================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[100000]
          bg-black/40
          backdrop-blur-[2px]
        "
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* =====================================================
          FACEBOOK-STYLE COMMENTS SHEET
          ===================================================== */}

      <aside
        onClick={(event) =>
          event.stopPropagation()
        }
        className="
          fixed
          inset-x-0
          bottom-0
          z-[100001]
          flex
          h-[78vh]
          flex-col
          overflow-hidden
          rounded-t-2xl
          bg-white
          shadow-2xl
          dark:bg-zinc-950
          sm:left-1/2
          sm:right-auto
          sm:w-[520px]
          sm:-translate-x-1/2
          sm:rounded-t-2xl
        "
        aria-label="Comments"
      >

        {/* ===================================================
            HEADER
            =================================================== */}

        <header
          className="
            relative
            flex
            h-14
            shrink-0
            items-center
            justify-center
            border-b
            border-zinc-200
            bg-white
            px-4
            dark:border-white/10
            dark:bg-zinc-950
          "
        >

          {/* Drag Handle */}

          <div
            className="
              absolute
              left-1/2
              top-2
              h-1
              w-10
              -translate-x-1/2
              rounded-full
              bg-zinc-300
              dark:bg-zinc-700
              sm:hidden
            "
          />

          {/* Title */}

          <div className="text-center">

            <h2
              className="
                text-[15px]
                font-semibold
                text-zinc-900
                dark:text-white
              "
            >
              Comments
            </h2>

            <span
              className="
                text-[11px]
                text-zinc-500
                dark:text-zinc-400
              "
            >
              {imageComments.length}
            </span>

          </div>

          {/* Close */}

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close comments"
            className="
              absolute
              right-3
              top-1/2
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-zinc-100
              text-zinc-700
              transition
              hover:bg-zinc-200
              active:scale-95
              dark:bg-white/10
              dark:text-zinc-200
              dark:hover:bg-white/15
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-cyan-500
            "
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>

        </header>

        {/* ===================================================
            COMMENTS LIST
            =================================================== */}

        <div
          ref={commentsRef}
          className="
            flex-1
            min-h-0
            overflow-y-auto
            overscroll-contain
            px-4
            py-4
            scrollbar-thin
          "
        >

          {imageComments.length === 0 ? (

            <div
              className="
                flex
                h-full
                flex-col
                items-center
                justify-center
                px-6
                text-center
              "
            >
              <div
                className="
                  mb-3
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-full
                  bg-zinc-100
                  text-zinc-500
                  dark:bg-white/10
                "
              >
                💬
              </div>

              <p
                className="
                  text-sm
                  font-semibold
                  text-zinc-800
                  dark:text-zinc-200
                "
              >
                No comments yet
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-zinc-500
                  dark:text-zinc-500
                "
              >
                Be the first to comment.
              </p>
            </div>

          ) : (

            <div className="space-y-5">

              {imageComments.map(
                (comment) => (

                  <article
                    key={comment.id}
                    className="
                      flex
                      gap-3
                    "
                  >

                    {/* Avatar */}

                    <div
                      className="
                        relative
                        h-9
                        w-9
                        shrink-0
                        overflow-hidden
                        rounded-full
                        bg-zinc-200
                        dark:bg-zinc-800
                      "
                    >
                      <Image
                        src={
                          comment.avatar_url ||
                          '/avatar-placeholder.png'
                        }
                        alt={
                          `${comment.username}'s avatar`
                        }
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>

                    {/* Comment */}

                    <div className="min-w-0 flex-1">

                      <div
                        className="
                          inline-block
                          max-w-full
                          rounded-2xl
                          bg-zinc-100
                          px-3.5
                          py-2.5
                          dark:bg-white/[0.08]
                        "
                      >

                        <div
                          className="
                            mb-0.5
                            text-[13px]
                            font-semibold
                            text-zinc-900
                            dark:text-zinc-100
                          "
                        >
                          {comment.username}
                        </div>

                        <p
                          className="
                            whitespace-pre-wrap
                            break-words
                            text-[14px]
                            leading-5
                            text-zinc-800
                            dark:text-zinc-200
                          "
                        >
                          {comment.content}
                        </p>

                      </div>

                      {/* Comment Meta */}

                      <div
                        className="
                          mt-1
                          ml-2
                          flex
                          items-center
                          gap-3
                          text-[11px]
                          font-medium
                          text-zinc-500
                        "
                      >

                        <span>
                          {new Date(
                            comment.created_at
                          ).toLocaleDateString(
                            undefined,
                            {
                              month: 'short',
                              day: 'numeric',
                            }
                          )}
                        </span>

                        <button
                          type="button"
                          className="
                            hover:text-zinc-900
                            dark:hover:text-white
                          "
                        >
                          Like
                        </button>

                        <button
                          type="button"
                          className="
                            hover:text-zinc-900
                            dark:hover:text-white
                          "
                        >
                          Reply
                        </button>

                      </div>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>

        {/* ===================================================
            COMMENT INPUT
            =================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            shrink-0
            border-t
            border-zinc-200
            bg-white
            p-3
            pb-[max(12px,env(safe-area-inset-bottom))]
            dark:border-white/10
            dark:bg-zinc-950
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-zinc-300
              bg-zinc-100
              px-2
              py-1.5
              dark:border-white/10
              dark:bg-white/[0.06]
            "
          >

            <input
              value={imageCommentText}
              onChange={(event) =>
                setImageCommentText(
                  event.target.value
                )
              }
              placeholder="Write a comment..."
              maxLength={500}
              className="
                min-w-0
                flex-1
                bg-transparent
                px-3
                py-2
                text-sm
                text-zinc-900
                outline-none
                placeholder:text-zinc-500
                dark:text-white
              "
            />

            <button
              type="submit"
              disabled={
                !imageCommentText.trim()
              }
              aria-label="Post comment"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-cyan-500
                text-white
                transition-all
                hover:bg-cyan-400
                active:scale-90
                disabled:cursor-not-allowed
                disabled:opacity-30
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-cyan-500
              "
            >
              <Send
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

          </div>

        </form>

      </aside>
    </>
  )
}