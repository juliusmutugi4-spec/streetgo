'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface PostProps {
  post: any
  user: any
}

export default function Post({ post, user }: PostProps) {
  const [likes, setLikes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
const router = useRouter()
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


  useEffect(() => {
    setCommentText('')
  }, [post.id, user])

  const loadPostData = async () => {
    try {
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
    } catch (error) {
      console.error(error)
    }
  }

const followUser = async (targetUserId: string) => {
  const { data: user } = await supabase.auth.getUser()

  await supabase.from('follows').insert({
    follower_id: user.user?.id,
    following_id: targetUserId,
  })
}

  const toggleLike = async () => {
    if (!user) {
      alert('Login first')
      return
    }

    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id)

        setLiked(false)
        setLikes((prev) => Math.max(0, prev - 1))
      } else {
        await supabase
          .from('likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          })

        setLiked(true)
        setLikes((prev) => prev + 1)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const addComment = async () => {
    if (!commentText.trim()) return

    if (!user) {
      alert('Login first')
      return
    }

    try {
const username =
  user.user_metadata?.username ||
  user.user_metadata?.name ||
  user.email?.split('@')[0] ||
  'Anonymous'

const { data, error } = await supabase
  .from('comments')
  .insert({
    post_id: post.id,
    user_id: user.id,
    content: commentText,
    username
  })
  .select()
  .single()

 if (error) {
  console.log('COMMENT ERROR:', error)
  console.log('MESSAGE:', error.message)
  console.log('DETAILS:', error.details)
  console.log('HINT:', error.hint)

  alert(error.message)
  return
}

 if (data) {
  setCommentText('')
  loadPostData()
}
    }
    
catch (error: any) {
  console.log('CATCH ERROR:', error)
  alert(error?.message || 'Unknown error')
}
  }
  return (
  <div className="group relative bg-[#09090b]/60 border border-zinc-900/80 overflow-hidden rounded-xl p-4 transition-all duration-300 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-black/60">

    {/* Ambient Glow Layer */}
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
    <div className="absolute -top-20 -left-20 h-64 w-64 bg-cyan-500/10 blur-[110px] pointer-events-none" />
    <div className="absolute -bottom-20 -right-20 h-64 w-64 bg-orange-500/10 blur-[120px] pointer-events-none" />

    {/* HEADER */}
    <div className="flex items-center gap-3 mb-4 relative z-10">

      {/* Avatar */}
      <div className="relative">
        <img
          src={`https://i.pravatar.cc/150?u=${post.user_id}`}
          alt="avatar"
          className="w-10 h-10 rounded-lg object-cover ring-1 ring-zinc-800 group-hover:ring-cyan-500/40 transition"
        />
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full animate-pulse border border-black" />
      </div>

      {/* User */}
      <div>
        <button
          onClick={() => router.push(`/profile/${post.username}`)}
          className="font-bold text-sm text-zinc-100 hover:text-cyan-400 transition"
        >
          {post.username || 'ANONYMOUS_NODE'}
        </button>

        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
          {new Date(post.created_at).toLocaleString()}
        </p>
      </div>
    </div>

    {/* CONTENT */}
    {post.content && (
      <p className="text-sm leading-relaxed text-zinc-300 mb-4 whitespace-pre-wrap">
        {post.content}
      </p>
    )}

    {/* VIDEO */}
    {post.video_url && (
      <div className="mb-4 rounded-xl overflow-hidden border border-zinc-900 bg-black/40">
        <video
          src={post.video_url}
          controls
          className="w-full object-cover opacity-90 hover:opacity-100 transition"
        />
      </div>
    )}

    {/* ACTIONS */}
    <div className="flex items-center gap-3 border-t border-zinc-900/60 pt-3 mb-3">

      <button
        onClick={toggleLike}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition border ${
          liked
            ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
            : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30"
        }`}
      >
        <span className={`transition-transform ${liked ? "scale-110" : "group-hover:rotate-12"}`}>
          {liked ? "🔥" : "🤍"}
        </span>
        {likes} REACTIONS
      </button>

    </div>

    {/* COMMENT INPUT */}
    {user && (
      <div className="flex gap-2 mb-3">

        <input
          type="text"
          placeholder="Write comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 bg-zinc-950/60 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 outline-none"
        />

        <button
          onClick={addComment}
          className="px-4 rounded-lg text-xs font-black uppercase bg-gradient-to-r from-cyan-500 to-orange-500 text-white hover:opacity-90 transition"
        >
          Send
        </button>

      </div>
    )}

    {/* COMMENTS */}
    {comments.length > 0 && (
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 border-t border-zinc-900/40 pt-2">

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex gap-2 p-2 rounded-lg bg-zinc-950/30 border border-zinc-900/30 hover:border-cyan-500/20 transition"
          >
            <div className="w-1 h-full bg-cyan-500/40 rounded" />

            <div>
              <p className="text-xs font-bold text-zinc-200">
                {comment.username || "anonymous"}
              </p>
              <p className="text-xs text-zinc-400">
                {comment.content}
              </p>
            </div>
          </div>
        ))}

      </div>
    )}

  </div>
)
}