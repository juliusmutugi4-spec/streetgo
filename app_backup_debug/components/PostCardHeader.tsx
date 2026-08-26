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

  return (
    <div
      className="
        relative
        -mt-2
        mb-1
        flex
        items-center
        justify-between
        px-2
      "
    >

      {/* LEFT SIDE */}
      <div className="flex items-center gap-2">

        {/* AVATAR */}
        <PostCardAvatar
          avatarUrl={post.avatar_url}
          username={username}
          showAIBubble={showAIBubble}
          viewerCount={viewerCount}
        />

        {/* USER INFORMATION */}
        <div className="min-w-0">

          <button
            onMouseEnter={() =>
              router.prefetch(`/profile/${username}`)
            }
            onTouchStart={() =>
              router.prefetch(`/profile/${username}`)
            }
            onClick={goToProfile}
            className="
              flex
              items-center
              gap-1.5
              text-sm
              font-bold
              leading-tight
              text-[var(--foreground)]
              hover:text-[var(--accent)]
              transition
            "
          >
            {username}
          </button>

          <div className="flex items-center gap-1.5 leading-none">

            <span className="text-[10px] text-[var(--muted)]">
              @{username.toLowerCase()}
            </span>

            <span className="text-[10px] text-zinc-700">
              •
            </span>

            <span className="text-[10px] text-[var(--muted-foreground)]">
              {formatRelativeTime(post.created_at)}
            </span>

          </div>

        </div>
      </div>

      {/* MENU */}
      <PostCardMenu
        postId={post.id}
        postUserId={post.user_id}
        user={user}
      />

    </div>
  )
}