'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface PostProps {
  post: any
}

export default function Post({ post }: PostProps) {
  const [user, setUser] = useState<any>(null)
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    getUser()
    loadLikes()
    loadComments()
  }, [post?.id])

  const getUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
  }

  const loadLikes = async () => {
    try {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id)
      setLikes(count || 0)

      const { data: auth } = await supabase.auth.getUser()
      if (auth.user) {
        const { data } = await supabase
          .from('likes')
          .select('*')
          .eq('post_id', post.id)
          .eq('user_id', auth.user.id)
          .maybeSingle()
        setLiked(!!data)
      }
    } catch (error) {
      console.error('Like load error:', error)
    }
  }

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, profiles ( username, avatar_url )`)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Load comments error:', JSON.stringify(error, null, 2))
        return
      }
      setComments(data || [])
    } catch (error) {
      console.error('Comment load error:', error)
    }
  }

  const toggleLike = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      alert('Login first')
      return
    }
    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', data.user.id)
        setLiked(false)
        setLikes(prev => Math.max(0, prev - 1))
      } else {
        await supabase.from('likes').insert({
          post_id: post.id,
          user_id: data.user.id,
        })
        setLiked(true)
        setLikes(prev => prev + 1)
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  const addComment = async () => {
    if (!commentText.trim()) return
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      alert('Login first')
      return
    }
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: auth.user.id,
          content: commentText,
        })
        .select(`*`)
        .single()
      if (error) {
        console.error('Add comment error:', JSON.stringify(error, null, 2))
        return
      }
      if (data) {
        setComments(prev => [data, ...prev])
        setCommentText('')
      }
    } catch (error) {
      console.error('Comment error:', error)
    }
  }

  if (!post) return null

  return (
    <div className="bg-slate-800 rounded-xl p-4 mb-4 border border-slate-700">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <img
          src={post.avatar_url || 'https://i.pravatar.cc/100'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-white">
            {post.username || 'Anonymous'}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-white mb-4 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Video */}
      {post.video_url && (
        <video
          src={post.video_url}
          controls
          className="w-full rounded-xl mb-4 max-h-[500px]"
        />
      )}

      {/* Like Button */}
      <button
        onClick={toggleLike}
        className={`px-4 py-2 rounded-lg transition ${
          liked
            ? 'bg-red-500/20 text-red-400'
            : 'bg-slate-700 text-white hover:bg-slate-600'
        }`}
      >
        {liked ? '❤️' : '🤍'} {likes}
      </button>

      {/* Comment Input */}
      {user && (
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none"
          />
          <button
            onClick={addComment}
            className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg text-white text-sm"
          >
            Post
          </button>
        </div>
      )}

      {/* Comments */}
      <div className="space-y-3 mt-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2">
            <img
              src={
                comment.profiles?.avatar_url || 'https://i.pravatar.cc/100'
              }
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-slate-700 rounded-lg px-3 py-2 flex-1">
              <p className="font-semibold text-sm text-white">
                {comment.profiles?.username || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-200">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}