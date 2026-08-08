'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import LoginModal from "../../components/LoginModal"
export default function PostPage() {
  const params = useParams()
  const id = params.id as string
const [user, setUser] = useState<any>(null)
  const [post, setPost] = useState<any>(null)
const [profile, setProfile] = useState<any>(null)
const [comments, setComments] = useState<any[]>([])
const [comment, setComment] = useState("")
const [showComments, setShowComments] = useState(false)
const [liked, setLiked] = useState(false)
const [likesCount, setLikesCount] = useState(0)
const [showLogin, setShowLogin] = useState(false)
const [following, setFollowing] = useState(false)
const [followersCount, setFollowersCount] = useState(0)
useEffect(() => {
  initialize()
}, [])

async function initialize() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  setUser(user)

  await fetchPost(user)
}
async function fetchPost(currentUser: any) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(error)
    return
  }

  setPost(data)


const { data: profileData } = await supabase
  .from("profiles")
  .select("username, avatar_url")
  .eq("id", data.user_id)
  .single()

setProfile(profileData)
// Count likes
const { count } = await supabase
  .from("likes")
  .select("*", { count: "exact", head: true })
  .eq("post_id", data.id)

setLikesCount(count || 0)

// Count followers
const { count: followers } = await supabase
  .from("followers")
  .select("*", { count: "exact", head: true })
  .eq("following_id", data.user_id)

setFollowersCount(followers || 0)

// Check if current user follows this profile
if (currentUser) {
  const { data: existingFollow } = await supabase
    .from("followers")
    .select("id")
    .eq("follower_id", currentUser.id)
    .eq("following_id", data.user_id)
    .maybeSingle()

  setFollowing(!!existingFollow)
}


// Check if current user liked this post
if (currentUser) {
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", data.id)
    .eq("user_id", currentUser.id)
    .maybeSingle()

  setLiked(!!existingLike)
}
// Load comments
const { data: commentsData } = await supabase
  .from("comments")
  .select("*")
  .eq("post_id", data.id)
  .order("created_at", { ascending: false })

setComments(commentsData || [])
}

async function toggleFollow() {
  if (!user) {
    setShowLogin(true)
    return
  }

  if (user.id === post.user_id) {
    return
  }

  if (following) {
    await supabase
      .from("followers")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", post.user_id)

    setFollowing(false)
    setFollowersCount((count) => count - 1)
  } else {
    await supabase
      .from("followers")
      .insert({
        follower_id: user.id,
        following_id: post.user_id,
      })

    setFollowing(true)
    setFollowersCount((count) => count + 1)
  }
}

async function toggleLike() {


  if (!user) {
  setShowLogin(true)
  return
}

  if (liked) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", user.id)

    setLiked(false)
    setLikesCount((count) => count - 1)
  } else {
    await supabase
      .from("likes")
      .insert({
        post_id: post.id,
        user_id: user.id,
      })

    setLiked(true)
    setLikesCount((count) => count + 1)
  }
}

async function addComment() {
  if (!user) {
  setShowLogin(true)
  return
}

if (!comment.trim()) return

  const { error } = await supabase
    .from("comments")
    .insert({
      user_id: user.id,
      post_id: post.id,
      content: comment.trim(),
      username: profile?.username,
    })

  if (error) {
    console.error(error)
    return
  }

  setComment("")

  await fetchPost(user)
}


if (!post) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      Loading...
    </div>
  )
}
return (
  <div className="min-h-screen bg-black text-zinc-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
    {/* Premium Header */}
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05070b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        {/* Back Button */}
        <button
          onClick={() => history.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 transition-all duration-200 hover:border-cyan-400/50 hover:bg-cyan-500/10 active:scale-95"
          aria-label="Go back"
        >
          ←
        </button>

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-xl font-black tracking-wide text-white">
            Street<span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">GO</span>
          </h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-500">
            POST
          </p>
        </div>

        {/* Menu Button */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] text-zinc-400 transition-all duration-200 hover:bg-white/[0.08] hover:text-white active:scale-95"
          aria-label="More options"
        >
          ⋮
        </button>
      </div>
    </header>

    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* Main Content Card Panel */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#05070b]/60 backdrop-blur-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)]">
        {/* Decorative Top Accent Glows */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <div className="absolute -top-24 -left-24 -z-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 -z-10 h-64 w-64 rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

        {/* User Profile Header section */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.03]">
          <div className="flex items-center gap-3.5">
            <img
              src={profile?.avatar_url || post?.avatar_url || "/avatar-placeholder.png"}
              alt=""
              className="h-12 w-12 rounded-2xl border border-white/10 bg-zinc-900 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  {profile?.username || "StreetGO User"}
                </h2>
                <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-cyan-400 border border-cyan-500/20">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                @{(profile?.username || "streetgo").toLowerCase()}
              </p>
              <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium text-zinc-500">
                <span>👥 {Number(followersCount || 0).toLocaleString()} Followers</span>
                <span>•</span>
                <span>{post?.created_at ? new Date(post.created_at).toLocaleString() : "Just now"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleFollow}
            disabled={user?.id === post?.user_id}
            className={`rounded-xl px-4 py-2 text-xs font-bold tracking-wide shadow-sm transition-all duration-200 active:scale-95 ${
              following
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-white/5"
                : "bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-950/20"
            } ${user?.id === post?.user_id ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {user?.id === post?.user_id ? "You" : following ? "Following" : "Follow"}
          </button>
        </div>

        {/* Post Text Body */}
        <div className="px-5 pt-5 pb-4">
          <p className="text-[17px] font-normal leading-relaxed text-zinc-200 whitespace-pre-wrap tracking-wide">
            {post?.content}
          </p>
        </div>

        {/* Embedded Post Image Asset */}
        {post?.image_url && (
          <div className="px-5 pb-4">
            <img
              src={post.image_url}
              alt="Uploaded content"
              className="w-full rounded-2xl object-cover border border-white/5 max-h-[450px]"
            />
          </div>
        )}

        {/* Embedded Post Video Asset */}
        {post?.video_url && (
          <div className="px-5 pb-4">
            <video
              src={post.video_url}
              controls
              playsInline
              className="w-full rounded-2xl border border-white/5 bg-black max-h-[450px]"
            />
          </div>
        )}

        {/* Footer Metrics Panel */}
        <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3 text-zinc-400 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            {/* Like Interactive Metric */}
            <button
              onClick={toggleLike}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 active:scale-95"
            >
              <span className={`text-xl transition-transform duration-200 ${liked ? "scale-110" : ""}`}>
                {liked ? "❤️" : "🤍"}
              </span>
              <div className="text-left leading-none">
                <p className={`text-sm font-bold ${liked ? "text-red-500" : "text-white"}`}>
                  {likesCount}
                </p>
                <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Likes</p>
              </div>
            </button>

            {/* Comments Open Trigger */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95 ${
                showComments 
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10" 
                  : "hover:bg-cyan-500/5 hover:text-cyan-400 border border-transparent"
              }`}
            >
              <span className="text-lg">💬</span>
              <div className="text-left leading-none">
                <p className={`text-sm font-bold ${showComments ? "text-cyan-400" : "text-white"}`}>
                  {comments?.length || 0}
                </p>
                <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Comments</p>
              </div>
            </button>
          </div>

          {/* Quick Share Integration */}
          <button className="flex items-center gap-2 text-xs font-semibold hover:text-emerald-400 transition-colors duration-200 px-3 py-2 rounded-xl hover:bg-emerald-500/5 active:scale-95">
            <span>🔄</span> Share
          </button>
        </div>

        {/* Dynamic Nested Comments Shell */}
        {showComments && (
          <div className="border-t border-white/[0.04] bg-[#020306]/40 p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">
              Discussion
            </h3>
            
            {/* Input Action Form Block */}
            <div className="mb-5 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a community dispatch comment..."
                className="flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
              />
              <button
                onClick={addComment}
                className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-cyan-400 transition-colors duration-200 shadow-lg shadow-cyan-950/20 active:scale-95"
              >
                Post
              </button>
            </div>

            {/* List Array Render */}
            {!comments || comments.length === 0 ? (
              <div className="py-6 text-center rounded-2xl border border-dashed border-white/5 bg-zinc-950/20">
                <p className="text-sm text-zinc-600">No telemetry comments yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-white/[0.03] bg-white/[0.01] p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-cyan-400">
                        @{c.username || "anonymous"}
                      </p>
                    </div>
                    <p className="mt-1.5 text-sm text-zinc-300 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>

    {/* Global Modal Layer Layouts */}
    {showLogin && (
      <LoginModal
        onClose={() => setShowLogin(false)}
        onLogin={() => {
          setShowLogin(false)
          initialize()
        }}
      />
    )}
  </div>
)
}