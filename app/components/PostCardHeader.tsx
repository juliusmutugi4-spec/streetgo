'use client'

import { useRouter } from 'next/navigation'
import PostCardAvatar from './PostCardAvatar'
import PostCardMenu from './PostCardMenu'
import { formatRelativeTime } from '../lib/time'

interface PostCardHeaderProps {
  post: {
    id: string
    user_id: string
    created_at: string
    avatar_url?: string | null
  }

  username: string
  user: any

  showAIBubble: boolean
  viewerCount: number

  goToProfile: () => void
}

export default function PostCardHeader({
  post,
  username,
  user,
  showAIBubble,
  viewerCount,
  goToProfile,
}: PostCardHeaderProps) {
  const router = useRouter()

  const profilePath =
    `/profile/${username}`

  return (
    <header
      className="
        flex
        w-full
        items-center
        justify-between
        bg-[var(--surface)]
        px-3
        pt-2
        pb-1
        select-none
      "
    >
      {/* =====================================================
          LEFT — PROFILE
          ===================================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-2
        "
      >
        {/* =================================================
            AVATAR
            ================================================= */}

        <button
          type="button"
          onMouseEnter={() =>
            router.prefetch(
              profilePath
            )
          }
          onTouchStart={() =>
            router.prefetch(
              profilePath
            )
          }
          onClick={goToProfile}
          aria-label={`Open ${username}'s profile`}
          className="
            relative
            shrink-0
            rounded-full
            focus:outline-none
            focus-visible:ring-1
            focus-visible:ring-[var(--accent)]
            focus-visible:ring-offset-1
            focus-visible:ring-offset-[var(--surface)]
          "
        >
          <PostCardAvatar
            avatarUrl={
              post.avatar_url
            }
            username={username}
            showAIBubble={
              showAIBubble
            }
            viewerCount={
              viewerCount
            }
          />
        </button>

        {/* =================================================
            USER INFO
            ================================================= */}

        <div
          className="
            min-w-0
            flex
            flex-col
            justify-center
          "
        >
          {/* USERNAME */}

          <button
            type="button"
            onMouseEnter={() =>
              router.prefetch(
                profilePath
              )
            }
            onTouchStart={() =>
              router.prefetch(
                profilePath
              )
            }
            onClick={goToProfile}
            className="
              block
              max-w-[220px]
              truncate
              p-0
              text-left
              font-['Courier_New']
              text-[11px]
              font-bold
              leading-[14px]
              tracking-tight
              text-[var(--foreground)]
              transition-opacity
              duration-150
              hover:opacity-70
              focus:outline-none
              focus-visible:underline
            "
          >
            {username}
          </button>

          {/* TIME + PUBLIC */}

          <div
            className="
              mt-0.5
              flex
              items-center
              gap-1
              font-['Courier_New']
              text-[8px]
              font-medium
              leading-[10px]
              tracking-tight
              text-[var(--muted)]
            "
          >
            <time
              dateTime={
                post.created_at
              }
              className="
                whitespace-nowrap
              "
            >
              {formatRelativeTime(
                post.created_at
              )}
            </time>

            <span
              aria-hidden="true"
              className="
                opacity-60
                select-none
              "
            >
              ·
            </span>

            {/* PUBLIC */}

            <span
              aria-label="Public"
              title="Public"
              className="
                inline-flex
                h-2.5
                w-2.5
                shrink-0
                items-center
                justify-center
                opacity-80
              "
            >
              <svg
                viewBox="0 0 16 16"
                className="
                  h-2.5
                  w-2.5
                  fill-current
                "
                aria-hidden="true"
              >
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM1.156 8a6.76 6.76 0 0 1 .184-1.5h1.94a12.35 12.35 0 0 0 .216 3H1.34A6.76 6.76 0 0 1 1.156 8Zm2.14-3H1.724a6.837 6.837 0 0 1 2.222-2.13A13.88 13.88 0 0 0 3.297 5ZM8 1.156c.552.88 1.05 2.196 1.294 3.844H6.706C6.95 3.352 7.448 2.037 8 1.156Zm1.433 3.844A15.42 15.42 0 0 1 10.5 8a15.42 15.42 0 0 1-1.067 3H5.567A15.42 15.42 0 0 1 4.5 8c0-1.054.4-2.073.933-3h3.867ZM4.724 1.724c.94.7 1.7 1.785 2.222 3.276H4.246a13.88 13.88 0 0 0-.693-2.13 6.837 6.837 0 0 0 1.17-.146Zm4.552.146c.453.642.84 1.365 1.144 2.13H8.384a12.56 12.56 0 0 0 1.94-2.13 6.837 6.837 0 0 0 .952-.146Zm5.568 6.13c0 .52-.06 1.026-.184 1.5h-1.94a12.35 12.35 0 0 0-.216-3h1.956c.124.474.184.98.184 1.5Zm-2.14-3h1.572a6.837 6.837 0 0 0-2.222-2.13 13.88 13.88 0 0 1 .65 2.13Zm-1.442 6c-.244 1.648-.742 2.964-1.294 3.844-.552-.88-1.05-2.196-1.294-3.844h2.588Zm-3.878 3.276c-.94-.7-1.7-1.785-2.222-3.276h2.67a13.88 13.88 0 0 1-.448 3.276Zm4.552-.146c-.453-.642-.84-1.365-1.144-2.13h2.052a12.56 12.56 0 0 1-1.94 2.13 6.837 6.837 0 0 0 1.032.146Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT — MENU
          ===================================================== */}

      <div
        className="
          ml-2
          shrink-0
        "
      >
        <PostCardMenu
          postId={post.id}
          postUserId={
            post.user_id
          }
          user={user}
        />
      </div>
    </header>
  )
}