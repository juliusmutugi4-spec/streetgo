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



    
  <div className="min-h-screen bg-black text-white">

    {/* Premium Header */}
<header
  className="
    sticky
    top-0
    z-50
    border-b
    border-white/10
    bg-[#05070b]/95
    backdrop-blur-2xl
  "
>
  <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">

    {/* Back */}
    <button
      onClick={() => history.back()}
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        border
        border-cyan-500/20
        bg-cyan-500/5
        text-cyan-300
        transition-all
        duration-300
        hover:scale-105
        hover:border-cyan-400/50
        hover:bg-cyan-500/10
      "
    >
      ←
    </button>

    {/* Logo */}
    <div className="text-center">

      <h1 className="text-xl font-black tracking-wide">
        Street<span className="text-cyan-400">GO</span>
      </h1>

      <p className="text-[11px] uppercase tracking-[4px] text-zinc-500">
        POST
      </p>

    </div>

    {/* Menu */}
    <button
      className="
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded-full
        border
        border-white/10
        bg-white/[0.03]
        text-zinc-400
        transition-all
        duration-300
        hover:text-white
        hover:bg-white/[0.08]
      "
    >
      ⋮
    </button>

  </div>
</header>
    <main className="max-w-2xl mx-auto p-4">

      <div
  className="
    relative
    overflow-hidden
    rounded-3xl
    border
    border-cyan-500/10
    bg-[#05070b]/90
    backdrop-blur-2xl
    shadow-[0_20px_60px_rgba(0,0,0,0.45)]
  "
>
<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

<div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-[120px]" />

<div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-orange-500/10 blur-[120px]" />
        {/* User */}
<div className="flex items-center justify-between p-5">

  <div className="flex items-center gap-3">

    <img
      src={profile?.avatar_url || post.avatar_url || "/avatar-placeholder.png"}
      alt=""
      className="
        h-14
        w-14
        rounded-2xl
        object-cover
        border
        border-cyan-500/20
      "
    />

    <div>

      <div className="flex items-center gap-2">

        <h2 className="text-lg font-bold text-white">
          {profile?.username || "StreetGO User"}
        </h2>

        <span
          className="
            rounded-full
            bg-cyan-500/15
            px-2
            py-0.5
            text-[10px]
            font-bold
            text-cyan-300
          "
        >
          VERIFIED
        </span>

      </div>

 <p className="text-sm text-zinc-500">
  @{(profile?.username || "streetgo").toLowerCase()}
</p>

<div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">

  <span>
    👥 {followersCount.toLocaleString()} Followers
  </span>

  <span>•</span>

  <span>
    {new Date(post.created_at).toLocaleString()}
  </span>

</div>

    </div>

  </div>

<button
  onClick={toggleFollow}
  disabled={user?.id === post.user_id}
  className={`
    rounded-full
    px-5
    py-2
    text-sm
    font-bold
    transition-all
    duration-300
    ${
      following
        ? "bg-zinc-700 text-white hover:bg-zinc-600"
        : "bg-emerald-500 text-white hover:bg-emerald-400"
    }
    ${
      user?.id === post.user_id
        ? "opacity-50 cursor-not-allowed"
        : ""
    }
  `}
>
  {user?.id === post.user_id
    ? "You"
    : following
    ? "Following"
    : "Follow"}
</button>

</div>

        {/* Text */}

        <div className="px-5 pb-5">
          <p className="text-lg leading-8 whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Image */}

        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            className="w-full"
          />
        )}

        {/* Video */}

        {post.video_url && (
          <video
            src={post.video_url}
            controls
            playsInline
            className="w-full bg-black"
          />
        )}

        {/* Footer */}

        <div className="flex items-center justify-between border-t border-zinc-800 p-5 text-zinc-400">

<button
  onClick={toggleLike}
  className="
    flex
    items-center
    gap-2
    rounded-full
    px-4
    py-2
    transition-all
    duration-300
    hover:bg-red-500/10
  "
>
  <span className="text-2xl">
    {liked ? "❤️" : "🤍"}
  </span>

  <div className="text-left">
    <p
      className={`font-bold ${
        liked ? "text-red-500" : "text-white"
      }`}
    >
      {likesCount}
    </p>

    <p className="text-xs text-zinc-500">
      Likes
    </p>
  </div>
</button>

<button
  onClick={() => setShowComments(!showComments)}
  className="
    flex
    items-center
    gap-2
    rounded-full
    px-4
    py-2
    transition-all
    duration-300
    hover:bg-cyan-500/10
    hover:text-cyan-400
  "
>
  💬

  <div className="text-left">
    <p className="font-bold text-white">
      {comments.length}
    </p>

    <p className="text-xs text-zinc-500">
      Comments
    </p>
  </div>
</button>

          <button className="hover:text-green-400 transition">
            🔄 Share
          </button>

        </div>

      </div>

    </main>
{showComments && (
  <div className="border-t border-zinc-800 p-5">

    <h3 className="mb-4 text-lg font-bold text-white">
      Comments
    </h3><div className="mb-6 flex gap-3">

  <input
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    placeholder="Write a comment..."
    className="
      flex-1
      rounded-2xl
      border
      border-zinc-700
      bg-zinc-900
      px-4
      py-3
      text-white
      outline-none
      focus:border-cyan-400
    "
  />

  <button
    onClick={addComment}
    className="
      rounded-2xl
      bg-cyan-500
      px-5
      py-3
      font-bold
      text-white
      hover:bg-cyan-400
      transition
    "
  >
    Post
  </button>

</div>

    {comments.length === 0 ? (
      <p className="text-zinc-500">
        No comments yet.
      </p>
    ) : (
      <div className="space-y-4">

        {comments.map((c) => (
          <div
            key={c.id}
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900/50
              p-4
            "
          >
            <p className="font-semibold text-white">
              {c.username}
            </p>

            <p className="mt-2 text-zinc-300">
              {c.content}
            </p>
          </div>
        ))}

      </div>
    )}

  </div>
)}

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