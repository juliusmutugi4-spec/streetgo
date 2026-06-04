'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import Post from './Post'

export default function Feed({ user }: { user: any }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loaderRef = useRef<HTMLDivElement | null>(null)

  const LIMIT = 10

  // REMOVE DUPLICATES
  const mergeUnique = (oldPosts: any[], newPosts: any[]) => {
    const map = new Map()
    ;[...newPosts, ...oldPosts].forEach((p) => {
      map.set(p.id, p)
    })
    return Array.from(map.values())
  }

  // LOAD POSTS
  const loadPosts = async (reset = false) => {
    if (loading) return

    setLoading(true)

    const from = reset ? 0 : page * LIMIT
    const to = from + LIMIT - 1

    const { data, error } = await supabase
.from('posts')
.select(`
  *,
  profiles (
    username
  )
`)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.log('LOAD POSTS ERROR:', error)
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

    setLoading(false)
  }

  // INITIAL LOAD
  useEffect(() => {
    loadPosts(true)
  }, [])

  // REALTIME POSTS (PREVENT DUPLICATES)
  useEffect(() => {
    const channel = supabase
      .channel('posts-live-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          setPosts((prev) => {
            const exists = prev.find((p) => p.id === payload.new.id)
            if (exists) return prev
            return [payload.new, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // INFINITE SCROLL
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        setPage((p) => p + 1)
      }
    })

    const el = loaderRef.current
    if (el) observer.observe(el)

    return () => observer.disconnect()
  }, [loading, hasMore])

  // LOAD MORE WHEN PAGE CHANGES
  useEffect(() => {
    if (page === 0) return
    loadPosts()
  }, [page])

  return (
    <div className="flex flex-col gap-4">

      {posts.map((post) => (
        <Post key={post.id} post={post} user={user} />
      ))}

      {loading && (
        <div className="space-y-3">
          <div className="h-24 bg-zinc-900/50 animate-pulse rounded-xl" />
          <div className="h-24 bg-zinc-900/50 animate-pulse rounded-xl" />
          <div className="h-24 bg-zinc-900/50 animate-pulse rounded-xl" />
        </div>
      )}

      {!hasMore && (
        <p className="text-center text-xs text-zinc-500 py-4">
          No more posts
        </p>
      )}

      <div ref={loaderRef} className="h-10" />
    </div>
  )
}