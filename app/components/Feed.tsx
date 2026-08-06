'use client'

import { useEffect, useRef, useState } from 'react'
import Post from './Post'
import { getPosts, subscribeToPosts } from '../lib/feed'

export default function Feed({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)

  const loaderRef = useRef<HTMLDivElement | null>(null)

  // Merge posts without duplicates
  const mergeUnique = (oldPosts: any[], newPosts: any[]) => {
    const map = new Map()

    ;[...oldPosts, ...newPosts].forEach((post) => {
      map.set(post.id, post)
    })

    return Array.from(map.values())
  }

  // Load posts
  const loadPosts = async (reset = false) => {
    if (loading) return

    setLoading(true)

    const { data, error } = await getPosts(reset ? null : cursor)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      setHasMore(false)
      setLoading(false)
      return
    }

    setPosts((prev) =>
      reset ? data : mergeUnique(prev, data)
    )

    // Save cursor using the last post
    setCursor(data[data.length - 1].created_at)

    setLoading(false)
  }

  // Initial load
  useEffect(() => {
    loadPosts(true)
  }, [])

  // Realtime
  useEffect(() => {
    const unsubscribe = subscribeToPosts((newPost) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === newPost.id)) {
          return prev
        }

        return [newPost, ...prev]
      })
    })

    return unsubscribe
  }, [])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          hasMore
        ) {
          loadPosts()
        }
      },
{
    rootMargin: "600px"
}
    )

    const loader = loaderRef.current

    if (loader) {
      observer.observe(loader)
    }

    return () => observer.disconnect()
  }, [loading, hasMore, cursor])

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          user={user}
        />
      ))}

      {loading && (
        <div className="space-y-3">
          <div className="h-24 rounded-xl bg-zinc-900/50 animate-pulse" />
          <div className="h-24 rounded-xl bg-zinc-900/50 animate-pulse" />
          <div className="h-24 rounded-xl bg-zinc-900/50 animate-pulse" />
        </div>
      )}

      {!hasMore && (
        <p className="py-4 text-center text-xs text-zinc-500">
          No more posts
        </p>
      )}

      <div ref={loaderRef} className="h-10" />
    </div>
  )
}