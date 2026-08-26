'use client'

import { useEffect, useRef, useState } from 'react'
import Post from './Post'
import {
  getPosts,
  subscribeToPosts,
  type PostType,
} from '../lib/feed'

interface FeedProps {
  user: any
  onOpenDispatch: (post: any) => void
}

export default function Feed({
  user,
  onOpenDispatch,
}: FeedProps) {
  const [posts, setPosts] = useState<PostType[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const loaderRef =
    useRef<HTMLDivElement | null>(null)

  const loadingRef = useRef(false)

  // =========================================================
  // MERGE WITHOUT DUPLICATES
  // =========================================================

  const mergeUnique = (
    oldPosts: PostType[],
    newPosts: PostType[]
  ): PostType[] => {
    const map = new Map<string, PostType>()

    for (const post of oldPosts) {
      map.set(post.id, post)
    }

    for (const post of newPosts) {
      map.set(post.id, post)
    }

    return Array.from(map.values())
  }

  // =========================================================
  // LOAD POSTS
  // =========================================================

  const loadPosts = async (
    reset = false
  ) => {
    if (loadingRef.current) {
      return
    }

    if (!reset && !hasMore) {
      return
    }

    loadingRef.current = true
    setLoading(true)

    try {
      const result = await getPosts(
        reset ? null : cursor
      )

      const {
        data,
        error,
      } = result

      if (error) {
        console.error(
          'FEED LOAD ERROR:',
          error
        )

        return
      }

      if (
        !data ||
        data.length === 0
      ) {
        setHasMore(false)
        return
      }

      setPosts((previous) => {
        if (reset) {
          return data
        }

        return mergeUnique(
          previous,
          data
        )
      })

      // =====================================================
      // UPDATE PAGINATION CURSOR
      // =====================================================

      const lastPost =
        data[data.length - 1]

      if (lastPost?.created_at) {
        setCursor(
          lastPost.created_at
        )
      }

      // =====================================================
      // PAGINATION END
      // =====================================================

      if (data.length < 10) {
        setHasMore(false)
      } else {
        setHasMore(true)
      }
    } catch (error) {
      console.error(
        'FEED LOAD EXCEPTION:',
        error
      )
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadPosts(true)
  }, [])

  // =========================================================
  // REALTIME POSTS
  // =========================================================

  useEffect(() => {
    const unsubscribe =
      subscribeToPosts(
        (newPost: PostType) => {
          setPosts((previous) => {
            // Prevent duplicates
            if (
              previous.some(
                (post) =>
                  post.id ===
                  newPost.id
              )
            ) {
              return previous
            }

            return [
              newPost,
              ...previous,
            ]
          })
        }
      )

    return unsubscribe
  }, [])

  // =========================================================
  // INFINITE SCROLL
  // =========================================================

  useEffect(() => {
    const loader =
      loaderRef.current

    if (!loader) {
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0]

          if (
            entry?.isIntersecting &&
            !loadingRef.current &&
            hasMore
          ) {
            loadPosts()
          }
        },
        {
          rootMargin: '600px',
        }
      )

    observer.observe(loader)

    return () => {
      observer.disconnect()
    }
  }, [
    hasMore,
    cursor,
  ])

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex flex-col gap-4">

      {/* =====================================================
          POSTS
          ===================================================== */}

      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          user={user}
          onOpenDispatch={
            onOpenDispatch
          }
        />
      ))}

      {/* =====================================================
          LOADING SKELETON
          ===================================================== */}

      {loading && (
        <div className="space-y-3">

          <div
            className="
              h-24
              animate-pulse
              rounded-xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
            "
          />

          <div
            className="
              h-24
              animate-pulse
              rounded-xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
            "
          />

          <div
            className="
              h-24
              animate-pulse
              rounded-xl
              border
              border-[var(--border)]
              bg-[var(--surface)]
            "
          />

        </div>
      )}

      {/* =====================================================
          END OF FEED
          ===================================================== */}

      {!loading &&
        !hasMore &&
        posts.length > 0 && (
          <p
            className="
              py-4
              text-center
              text-xs
              text-[var(--muted)]
            "
          >
            No more posts
          </p>
        )}

      {/* =====================================================
          INFINITE SCROLL SENTINEL
          ===================================================== */}

      <div
        ref={loaderRef}
        className="h-10"
        aria-hidden="true"
      />

    </div>
  )
}