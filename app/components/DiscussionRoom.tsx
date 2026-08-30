'use client'

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  FormEvent,
  KeyboardEvent,
} from 'react'

import CommentCard from './CommentCard'

export interface Comment {
  id: string | number
  username: string
  avatar_url?: string
  created_at: string | Date
  content: string
  sentiment?: 'positive' | 'neutral'
}

interface DiscussionRoomProps {
  openRoom: boolean
  setOpenRoom: (open: boolean) => void

  post: {
    username?: string
    content?: string
    avatar_url?: string | null

    /*
     * ORIGINAL POST MEDIA
     */
    image_urls?: string[] | null
    video_url?: string | null
    thumbnail_url?: string | null

    /*
     * Optional LIVE information
     */
    is_live?: boolean
    live_id?: string | null
  } | null

  currentUser: {
    username?: string
    avatar_url?: string | null
  } | null

  comments: Comment[]

  onSendMessage?: (
    msg: string
  ) => Promise<void> | void
}

type TabType = 'chat' | 'ai'

export default function DiscussionRoom({
  openRoom,
  setOpenRoom,
  comments = [],
  onSendMessage,
  post,
  currentUser,
}: DiscussionRoomProps) {
  const [newComment, setNewComment] =
    useState('')

  const [activeTab, setActiveTab] =
    useState<TabType>('chat')

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const scrollContainerRef =
    useRef<HTMLDivElement>(null)

  /*
   * =====================================================
   * NORMALIZED ORIGINAL POST MEDIA
   * =====================================================
   */

  const postImages = useMemo(() => {
    if (
      !post?.image_urls ||
      !Array.isArray(post.image_urls)
    ) {
      return []
    }

    return post.image_urls.filter(
      (url): url is string =>
        typeof url === 'string' &&
        url.trim().length > 0
    )
  }, [post])

  const postVideo =
    typeof post?.video_url === 'string' &&
    post.video_url.trim().length > 0
      ? post.video_url.trim()
      : null

  /*
   * =====================================================
   * AUTO SCROLL
   * =====================================================
   */

  useEffect(() => {
    if (
      !openRoom ||
      activeTab !== 'chat' ||
      !scrollContainerRef.current
    ) {
      return
    }

    const container =
      scrollContainerRef.current

    requestAnimationFrame(() => {
      container.scrollTop =
        container.scrollHeight
    })
  }, [
    comments,
    openRoom,
    activeTab,
  ])

  /*
   * =====================================================
   * SENTIMENT
   * =====================================================
   */

  const positivePercentage =
    useMemo(() => {
      if (!comments.length) {
        return 0
      }

      const positiveCount =
        comments.filter(
          (comment) =>
            comment.sentiment ===
            'positive'
        ).length

      return Math.round(
        (positiveCount /
          comments.length) *
          100
      )
    }, [comments])

  /*
   * =====================================================
   * CLOSE
   * =====================================================
   */

  const closeRoom = () => {
    setOpenRoom(false)
  }

  /*
   * =====================================================
   * SEND COMMENT
   * =====================================================
   */

  const handleSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault()

    const cleanComment =
      newComment
        .replace(/[ \t]+/g, ' ')
        .trim()

    if (
      !cleanComment ||
      isSubmitting
    ) {
      return
    }

    try {
      setIsSubmitting(true)

      await onSendMessage?.(
        cleanComment
      )

      setNewComment('')
    } catch (error) {
      console.error(
        'Failed to submit comment:',
        error
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  /*
   * =====================================================
   * ENTER TO SEND
   * =====================================================
   */

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()

      void handleSubmit(event)
    }
  }

  /*
   * =====================================================
   * USER DATA
   * =====================================================
   */

  const postUsername =
    post?.username?.trim() ||
    'Anonymous'

  const currentUsername =
    currentUser?.username?.trim() ||
    'You'

  /*
   * =====================================================
   * CLOSED
   * =====================================================
   */

  if (!openRoom) {
    return null
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        bg-black/45
        p-0
        backdrop-blur-[2px]
        sm:p-5
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="discussion-title"
      onClick={closeRoom}
    >
      <section
        className="
          relative
          flex
          h-full
          w-full
          flex-col
          overflow-hidden
          bg-[var(--surface)]
          text-[var(--foreground)]
          font-['Courier_New']
          shadow-2xl

          sm:h-[min(760px,calc(100vh-40px))]
          sm:max-w-[680px]
          sm:rounded-xl
          sm:border
          sm:border-[var(--border)]
        "
        onClick={(event) => {
          event.stopPropagation()
        }}
      >

        {/* =================================================
            HEADER
            ================================================= */}

        <header
          className="
            flex
            min-h-[60px]
            shrink-0
            items-center
            justify-between
            bg-[var(--surface)]
            px-4
            py-2.5
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
            "
          >
            <div className="min-w-0">
              <h2
                id="discussion-title"
                className="
                  truncate
                  font-['Courier_New']
                  text-[15px]
                  font-bold
                  leading-5
                  tracking-tight
                  text-[var(--foreground)]
                "
              >
                Comments
              </h2>

              <p
                className="
                  mt-0.5
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                  leading-4
                  tracking-wide
                  text-[var(--muted)]
                "
              >
                {comments.length.toLocaleString()}
                {' '}
                {comments.length === 1
                  ? 'COMMENT'
                  : 'COMMENTS'}
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            {/* DESKTOP TABS */}

            <div
              className="
                hidden
                items-center
                rounded-lg
                bg-[var(--surface-hover)]
                p-0.5
                sm:flex
              "
              role="tablist"
            >
              <button
                type="button"
                role="tab"
                aria-selected={
                  activeTab === 'chat'
                }
                onClick={() =>
                  setActiveTab('chat')
                }
                className={`
                  rounded-md
                  px-3
                  py-1.5
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                  tracking-wide
                  transition-all
                  duration-150

                  ${
                    activeTab === 'chat'
                      ? `
                        bg-[var(--accent)]
                        text-white
                        shadow-sm
                      `
                      : `
                        text-[var(--muted)]
                        hover:text-[var(--foreground)]
                      `
                  }
                `}
              >
                ALL
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={
                  activeTab === 'ai'
                }
                onClick={() =>
                  setActiveTab('ai')
                }
                className={`
                  rounded-md
                  px-3
                  py-1.5
                  font-['Courier_New']
                  text-[10px]
                  font-bold
                  tracking-wide
                  transition-all
                  duration-150

                  ${
                    activeTab === 'ai'
                      ? `
                        bg-[var(--accent)]
                        text-white
                        shadow-sm
                      `
                      : `
                        text-[var(--muted)]
                        hover:text-[var(--foreground)]
                      `
                  }
                `}
              >
                INSIGHTS
              </button>
            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeRoom}
              aria-label="Close comments"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-[var(--surface-hover)]
                text-[var(--muted)]
                transition-all
                duration-150
                hover:text-[var(--foreground)]
                active:scale-95
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--accent)]/40
              "
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M6 6L18 18" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
        </header>

        {/* =================================================
            MOBILE TABS
            ================================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1
            bg-[var(--surface)]
            px-3
            pb-2
            sm:hidden
          "
        >
          <button
            type="button"
            onClick={() =>
              setActiveTab('chat')
            }
            className={`
              flex-1
              rounded-lg
              px-3
              py-2
              font-['Courier_New']
              text-[10px]
              font-bold
              tracking-wide
              transition-all

              ${
                activeTab === 'chat'
                  ? `
                    bg-[var(--accent)]
                    text-white
                  `
                  : `
                    bg-[var(--surface-hover)]
                    text-[var(--muted)]
                  `
              }
            `}
          >
            ALL COMMENTS
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('ai')
            }
            className={`
              flex-1
              rounded-lg
              px-3
              py-2
              font-['Courier_New']
              text-[10px]
              font-bold
              tracking-wide
              transition-all

              ${
                activeTab === 'ai'
                  ? `
                    bg-[var(--accent)]
                    text-white
                  `
                  : `
                    bg-[var(--surface-hover)]
                    text-[var(--muted)]
                  `
              }
            `}
          >
            INSIGHTS
          </button>
        </div>

        {/* =================================================
            CONTENT
            ================================================= */}

        <div
          ref={scrollContainerRef}
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            bg-[var(--surface)]
            px-3
            py-3
            sm:px-4
          "
          style={{
            scrollbarWidth: 'thin',
          }}
          aria-live="polite"
        >

          {/* =================================================
              INSIGHTS
              ================================================= */}

          {activeTab === 'ai' ? (
            <div
              className="
                flex
                min-h-full
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <div
                className="
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--surface-hover)]
                  ring-1
                  ring-[var(--border)]
                "
              >
                <span
                  className="
                    font-['Courier_New']
                    text-[22px]
                    font-bold
                    text-[var(--accent)]
                  "
                >
                  {positivePercentage}%
                </span>
              </div>

              <h3
                className="
                  mt-4
                  font-['Courier_New']
                  text-[13px]
                  font-bold
                  tracking-wide
                  text-[var(--foreground)]
                "
              >
                POSITIVE SENTIMENT
              </h3>

              <p
                className="
                  mt-1
                  max-w-[290px]
                  font-['Courier_New']
                  text-[10px]
                  leading-5
                  text-[var(--muted)]
                "
              >
                Based on the available
                comments on this post.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  ORIGINAL POST
                  ================================================= */}

              {post && (
                <article
                  className="
                    mb-4
                    overflow-hidden
                    rounded-xl
                    bg-[var(--surface-hover)]
                  "
                >
                  {/* POST HEADER */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2.5
                      p-3
                    "
                  >
                    <div
                      className="
                        h-9
                        w-9
                        shrink-0
                        overflow-hidden
                        rounded-full
                        bg-[var(--surface)]
                      "
                    >
                      <img
                        src={
                          post.avatar_url ||
                          '/avatar-placeholder.png'
                        }
                        alt=""
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                        loading="lazy"
                        draggable={false}
                      />
                    </div>

                    <div className="min-w-0">
                      <div
                        className="
                          truncate
                          font-['Courier_New']
                          text-[11px]
                          font-bold
                          text-[var(--foreground)]
                        "
                      >
                        {postUsername}
                      </div>

                      <div
                        className="
                          mt-0.5
                          font-['Courier_New']
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-wide
                          text-[var(--muted)]
                        "
                      >
                        Original post
                      </div>
                    </div>
                  </div>

                  {/* POST TEXT */}

                  {post.content?.trim() && (
                    <p
                      className="
                        px-3
                        pb-3
                        break-words
                        whitespace-pre-wrap
                        font-['Courier_New']
                        text-[11px]
                        leading-5
                        text-[var(--foreground)]
                      "
                    >
                      {post.content.trim()}
                    </p>
                  )}

                  {/* =================================================
                      ORIGINAL POST IMAGES
                      ================================================= */}

                  {postImages.length > 0 && (
                    <div
                      className="
                        w-full
                        overflow-hidden
                        bg-[var(--surface)]
                      "
                    >
                      {/* ONE IMAGE */}

                      {postImages.length === 1 && (
                        <img
                          src={postImages[0]}
                          alt="Original post"
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="
                            block
                            max-h-[480px]
                            w-full
                            object-contain
                            bg-black
                          "
                        />
                      )}

                      {/* TWO IMAGES */}

                      {postImages.length === 2 && (
                        <div
                          className="
                            grid
                            grid-cols-2
                            gap-1
                            bg-[var(--surface)]
                          "
                        >
                          {postImages.map(
                            (url, index) => (
                              <img
                                key={`${url}-${index}`}
                                src={url}
                                alt={`Original post image ${
                                  index + 1
                                }`}
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="
                                  block
                                  aspect-square
                                  h-full
                                  w-full
                                  object-cover
                                  bg-black
                                "
                              />
                            )
                          )}
                        </div>
                      )}

                      {/* THREE IMAGES */}

                      {postImages.length === 3 && (
                        <div
                          className="
                            grid
                            grid-cols-3
                            gap-1
                            bg-[var(--surface)]
                          "
                        >
                          <img
                            src={postImages[0]}
                            alt="Original post image 1"
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className="
                              col-span-2
                              block
                              h-full
                              min-h-[260px]
                              w-full
                              object-cover
                              bg-black
                            "
                          />

                          <div
                            className="
                              grid
                              grid-rows-2
                              gap-1
                            "
                          >
                            {postImages
                              .slice(1, 3)
                              .map(
                                (
                                  url,
                                  index
                                ) => (
                                  <img
                                    key={`${url}-${index + 1}`}
                                    src={url}
                                    alt={`Original post image ${
                                      index +
                                      2
                                    }`}
                                    loading="lazy"
                                    decoding="async"
                                    draggable={false}
                                    className="
                                      block
                                      h-full
                                      min-h-0
                                      w-full
                                      object-cover
                                      bg-black
                                    "
                                  />
                                )
                              )}
                          </div>
                        </div>
                      )}

                      {/* FOUR OR MORE */}

                      {postImages.length >= 4 && (
                        <div
                          className="
                            grid
                            grid-cols-2
                            gap-1
                            bg-[var(--surface)]
                          "
                        >
                          {postImages
                            .slice(0, 4)
                            .map(
                              (
                                url,
                                index
                              ) => (
                                <img
                                  key={`${url}-${index}`}
                                  src={url}
                                  alt={`Original post image ${
                                    index + 1
                                  }`}
                                  loading="lazy"
                                  decoding="async"
                                  draggable={false}
                                  className="
                                    block
                                    aspect-square
                                    h-full
                                    w-full
                                    object-cover
                                    bg-black
                                  "
                                />
                              )
                            )}
                        </div>
                      )}

                      {/* IMAGE COUNT */}

                      {postImages.length >
                        4 && (
                        <div
                          className="
                            bg-[var(--surface-hover)]
                            px-3
                            py-2
                            font-['Courier_New']
                            text-[9px]
                            font-bold
                            tracking-wide
                            text-[var(--muted)]
                          "
                        >
                          +{postImages.length - 4}
                          {' '}
                          MORE IMAGES
                        </div>
                      )}
                    </div>
                  )}

                  {/* =================================================
                      ORIGINAL POST VIDEO
                      ================================================= */}

                  {postVideo && (
                    <div
                      className="
                        w-full
                        overflow-hidden
                        bg-black
                      "
                    >
                      <video
                        src={postVideo}
                        poster={
                          post.thumbnail_url ||
                          undefined
                        }
                        controls
                        playsInline
                        preload="metadata"
                        className="
                          block
                          h-auto
                          max-h-[480px]
                          w-full
                          object-contain
                          bg-black
                        "
                      />
                    </div>
                  )}

                  {/* =================================================
                      LIVE INDICATOR
                      ================================================= */}

                  {post.is_live &&
                    post.live_id && (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        px-3
                        py-2
                        font-['Courier_New']
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-[var(--foreground)]
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          animate-pulse
                          rounded-full
                          bg-red-500
                        "
                      />

                      LIVE
                    </div>
                  )}
                </article>
              )}

              {/* =================================================
                  COMMENTS
                  ================================================= */}

              {comments.length === 0 ? (
                <div
                  className="
                    flex
                    min-h-[280px]
                    flex-col
                    items-center
                    justify-center
                    text-center
                  "
                >
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-[var(--surface-hover)]
                      text-[var(--muted)]
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 3v-5.5A7.5 7.5 0 1 1 20 11.5Z" />
                    </svg>
                  </div>

                  <p
                    className="
                      mt-3
                      font-['Courier_New']
                      text-[12px]
                      font-bold
                      text-[var(--foreground)]
                    "
                  >
                    NO COMMENTS YET
                  </p>

                  <p
                    className="
                      mt-1
                      font-['Courier_New']
                      text-[10px]
                      text-[var(--muted)]
                    "
                  >
                    Be the first to comment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map(
                    (comment) => (
                      <div
                        key={comment.id}
                        className="w-full"
                      >
                        <CommentCard
                          comment={comment}
                        />
                      </div>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* =================================================
            COMMENT COMPOSER
            ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            shrink-0
            bg-[var(--surface)]
            px-3
            py-3
            sm:px-4
          "
        >
          <div
            className="
              flex
              w-full
              items-end
              gap-2
            "
          >
            {/* CURRENT USER AVATAR */}

            <div
              className="
                h-9
                w-9
                shrink-0
                overflow-hidden
                rounded-full
                bg-[var(--surface-hover)]
              "
            >
              <img
                src={
                  currentUser?.avatar_url ||
                  '/avatar-placeholder.png'
                }
                alt={currentUsername}
                className="
                  h-full
                  w-full
                  object-cover
                "
                loading="lazy"
                draggable={false}
              />
            </div>

            {/* INPUT */}

            <div
              className="
                flex
                min-w-0
                flex-1
                items-end
                rounded-2xl
                bg-[var(--surface-hover)]
                px-3.5
                py-2
                transition-all
                duration-150
                focus-within:ring-1
                focus-within:ring-[var(--accent)]/50
              "
            >
              <textarea
                value={newComment}
                onChange={(event) =>
                  setNewComment(
                    event.target.value
                  )
                }
                onKeyDown={
                  handleKeyDown
                }
                disabled={isSubmitting}
                placeholder="Write a comment..."
                rows={1}
                maxLength={1000}
                className="
                  min-h-[22px]
                  max-h-32
                  min-w-0
                  flex-1
                  resize-none
                  bg-transparent
                  p-0
                  font-['Courier_New']
                  text-[11px]
                  leading-5
                  text-[var(--foreground)]
                  placeholder:text-[var(--muted)]
                  outline-none
                "
              />
            </div>

            {/* SEND */}

            <button
              type="submit"
              disabled={
                !newComment.trim() ||
                isSubmitting
              }
              aria-label="Send comment"
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[var(--accent)]
                text-white
                transition-all
                duration-150
                hover:opacity-90
                active:scale-95
                disabled:cursor-not-allowed
                disabled:opacity-35
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--accent)]/40
              "
            >
              {isSubmitting ? (
                <svg
                  className="
                    h-4
                    w-4
                    animate-spin
                  "
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="28 20"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="
                    h-4
                    w-4
                    translate-x-[1px]
                  "
                  fill="currentColor"
                >
                  <path d="M3.4 3.1 21 11.2c.8.4.8 1.2 0 1.6L3.4 20.9c-.8.4-1.6.1-1.3-1.1l2-6.1c.1-.3.3-.5.7-.6l7.5-1.1-7.5-1.1c-.3 0-.6-.3-.7-.6l-2-6.1c-.3-.9.5-1.6 1.3-1.1Z" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}