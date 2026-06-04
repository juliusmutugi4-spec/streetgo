'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Post({ post, user }: any) {
  const router = useRouter()

  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')

  const [author, setAuthor] = useState<any>(null)

  // ✅ LOAD AUTHOR PROFILE (THIS FIXES "ANONYMOUS")
  useEffect(() => {
    const loadAuthor = async () => {
      if (!post.user_id) return

      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', post.user_id)
        .maybeSingle()

      setAuthor(data)
    }

    loadAuthor()
  }, [post.user_id])

  // LIVE COMMENTS
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${post.id}`,
        },
        (payload) => {
          setComments((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [post.id])

  // LOAD POST DATA
  const loadPostData = async () => {
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)

    setLikes(count || 0)

    if (user) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle()

      setLiked(!!data)
    }

    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })

    setComments(commentsData || [])
  }

  useEffect(() => {
    loadPostData()
  }, [post.id, user])

  // LIKE
  const toggleLike = async () => {
    if (!user) return alert('Login first')

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)

      setLiked(false)
      setLikes((p) => Math.max(0, p - 1))
    } else {
      await supabase.from('likes').insert({
        post_id: post.id,
        user_id: user.id,
      })

      setLiked(true)
      setLikes((p) => p + 1)
    }
  }

  // COMMENT (FIXED: USE PROFILE NAME NOT AUTH)
  const addComment = async () => {
    if (!commentText.trim()) return
    if (!user) return alert('Login first')

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()

    const username = profile?.username || 'Anonymous'

    await supabase.from('comments').insert({
      post_id: post.id,
      user_id: user.id,
      content: commentText,
      username,
    })

    setCommentText('')
    loadPostData()
  }

  // PROFILE NAV FIXED
  const goToProfile = () => {
    const username = author?.username?.trim()?.toLowerCase()
    if (!username) return
    router.push(`/profile/${username}`)
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={
            author?.avatar_url ||
            `https://i.pravatar.cc/150?u=${post.user_id}`
          }
          className="w-10 h-10 rounded-lg"
        />

        <div>
          <button
            onClick={goToProfile}
            className="font-bold text-sm text-white hover:text-cyan-400"
          >
            {author?.username || 'Loading...'}
          </button>

          <p className="text-xs text-zinc-500">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <p className="text-sm text-zinc-300 mb-3">
        {post.content}
      </p>

      {/* LIKE */}
      <button onClick={toggleLike} className="text-xs text-zinc-400">
        {liked ? '🔥' : '🤍'} {likes}
      </button>

      {/* COMMENT INPUT */}
      {user && (
        <div className="flex gap-2 mt-3">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-zinc-900 p-2 text-xs rounded"
            placeholder="Comment..."
          />
          <button
            onClick={addComment}
            className="bg-cyan-500 px-3 text-xs rounded"
          >
            Send
          </button>
        </div>
      )}

      {/* COMMENTS */}
      <div className="mt-3 space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="text-xs text-zinc-400">
            <b>{c.username}</b>: {c.content}
          </div>
        ))}
      </div>
    </div>
  )
}