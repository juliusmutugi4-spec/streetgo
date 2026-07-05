'use client'

import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import ProfileSchema from '../../components/ProfileSchema'


export default function ProfilePage() {
  const params = useParams()
  const username =
  decodeURIComponent(params.username as string)
    .trim()
    .toLowerCase()
const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followers, setFollowers] = useState<any[]>([])
const [showFollowers, setShowFollowers] = useState(false)
const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)
const [editing, setEditing] = useState(false)
const [newUsername, setNewUsername] = useState('')
const [newBio, setNewBio] = useState('')
const [activeTab, setActiveTab] = useState('')
const [showMenu, setShowMenu] = useState(false)
const router = useRouter()

useEffect(() => {
  let mounted = true

  const init = async () => {
    if (mounted) {
      await loadProfile()
    }
  }

  init()

  return () => {
    mounted = false
  }
}, [username])
const loadProfile = async () => {
  setLoading(true)

  // Get current session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  setCurrentUser(session?.user ?? null)

  const searchUsername = username.trim().toLowerCase()

  // Fetch profile from database
  const { data: profileData, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', searchUsername)
    .maybeSingle()  // Use maybeSingle to avoid breaking if not found

  if (!profileData) {
    setProfile(null)
    setLoading(false)
    return
  }

  // Redirect to correct URL if username differs
  if (profileData.username.toLowerCase() !== searchUsername) {
    router.replace(`/profile/${profileData.username}`)
    return
  }

  // Set profile data in state
  setProfile(profileData)
const { count: followers } = await supabase
  .from('followers')
  .select('*', { count: 'exact', head: true })
  .eq('following_id', profileData.id)

const { count: following } = await supabase
  .from('followers')
  .select('*', { count: 'exact', head: true })
  .eq('follower_id', profileData.id)

setFollowersCount(followers || 0)

const { data: followersList } = await supabase
  .from('followers')
  .select(`
    follower_id,
    profiles!followers_follower_id_fkey (
      id,
      username,
      avatar_url
    )
  `)
  .eq('following_id', profileData.id)

setFollowers(followersList || [])

setFollowingCount(following || 0)


if (session?.user) {
  const { data: followRows } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', session.user.id)
    .eq('following_id', profileData.id)

  setIsFollowing((followRows?.length || 0) > 0)
}


  setNewUsername(profileData.username || '')
  setNewBio(profileData.bio || '')

  // Load posts for this user
  const { data: userPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profileData.id)
    .order('created_at', { ascending: false })

  setPosts(userPosts || [])
  setLoading(false)
}
  if (loading) {



    

    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-mono tracking-wider">
            Loading Profile...
          </p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-3">
            USER NOT FOUND
          </h1>
          <p className="text-xs text-zinc-500">
            This node does not exist on the network.
          </p>
        </div>
      </div>
    )
  }

const saveProfile = async () => {
  const username = newUsername.trim().toLowerCase()

  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', profile.id)
    .maybeSingle()

  if (existing) {
    alert('Username already taken')
    return
  }

  let avatar_url = profile.avatar_url

  if (avatarFile) {
    const fileExt = avatarFile.name.split('.').pop()

    const fileName =
      `${profile.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } =
      await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile)

    if (uploadError) {
      alert(uploadError.message)
      return
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    avatar_url = data.publicUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      bio: newBio,
      avatar_url,
    })
    .eq('id', profile.id)

  if (error) {
    alert(error.message)
    return
  }

  setProfile({
    ...profile,
    username,
    bio: newBio,
    avatar_url,
  })

  setEditing(false)

  router.replace(`/profile/${username}`)
}

const toggleFollow = async () => {
  if (!currentUser || !profile) return

  if (isFollowing) {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)

    if (error) {
      alert(error.message)
      return
    }

    setIsFollowing(false)
    setFollowersCount((prev) => Math.max(0, prev - 1))
  } else {
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: currentUser.id,
        following_id: profile.id,
      })

if (!error) {
  const { error: notificationError } = await supabase
    .from('notifications')
    .insert({
      user_id: profile.id,
      actor_id: currentUser.id,
      type: 'follow',
      message: `${currentUser.email || 'Someone'} followed you`,
    })

  console.log('NOTIFICATION ERROR:', notificationError)
}


    if (error) {
      alert(error.message)
      return
    }

    setIsFollowing(true)
    setFollowersCount((prev) => prev + 1)
  }
}

  return (

  <main className="min-h-screen bg-[#060608] text-white">

    <ProfileSchema
      username={profile.username}
      bio={profile.bio}
      avatar={profile.avatar_url}
    />

    {/* Background Glow */}
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/5 blur-[150px] pointer-events-none" />
<div className="w-full">

  {/* COVER */}
<div className="relative z-0 h-32 md:h-40 w-full overflow-hidden">

  <img
    src="/cover.jpg"
    alt="Cover"
    className="w-full h-full object-cover"
  />

  <div className="absolute inset-0 bg-black/40" />

  <button
    onClick={() => router.back()}
className="
  absolute
  top-3
  left-3
  z-50
  flex
  items-center
  justify-center
  text-white
  text-xl
"
  >
    ←
  </button>
<button
  onClick={() => setShowMenu(!showMenu)}
  className="
    absolute
    top-3
    right-3
    z-50
    text-white
    text-2xl
  "
>
  ⋮
</button>
{currentUser?.id === profile.id && (
  <>
    <button
      onClick={() => setShowMenu(!showMenu)}
      className="
        absolute
        top-3
        right-3
        z-50
        text-white
        text-2xl
      "
    >
      ⋮
    </button>

    {showMenu && (
      <div
        className="
          absolute
          top-12
          right-3
          z-50
          w-48
          rounded-xl
          bg-zinc-900
          border
          border-zinc-800
          overflow-hidden
        "
      >
        <button
          onClick={() => {
            setEditing(true)
            setShowMenu(false)
          }}
          className="w-full px-4 py-3 text-left hover:bg-zinc-800"
        >
          ✏️ Edit Profile
        </button>

        <button
          onClick={() => {
            router.push('/wallet')
            setShowMenu(false)
          }}
          className="w-full px-4 py-3 text-left hover:bg-zinc-800"
        >
          💰 Wallet
        </button>

        <button
          onClick={() => {
            router.push('/driver/register')
            setShowMenu(false)
          }}
          className="w-full px-4 py-3 text-left hover:bg-zinc-800"
        >
          🚗 Become Driver
        </button>
      </div>
    )}
  </>
)}


</div>

  {/* PROFILE CARD */}
  <div
    className="
      relative
      overflow-visible

      bg-zinc-950/70
      
      backdrop-blur-xl
    "
  >

          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-orange-500/[0.03]" />

          <div className="relative pt-8 px-8 pb-8">


            
<div className="absolute -top-8 left-5 z-[999]">
  <img
    src={profile.avatar_url || '/avatar-placeholder.png'}
    alt="Profile"
    className="
      w-20
      h-20
      rounded-full
      object-cover
      border-4
      border-[#09090b]
      shadow-xl
    "
  />
</div>
            <div className="flex flex-col md:flex-row md:items-center gap-6">


              <div className="flex-1 mt-4">

                <div className="flex flex-wrap items-center gap-3">

    <div>
  <div className="flex items-center gap-2">
    <h1 className="text-lg font-bold">
      {profile.username}
    </h1>

    <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center text-[8px] font-bold">
      ✓
    </div>
  </div>

  <p className="text-xs text-zinc-500">
    @{profile.username}
  </p>
</div>


{currentUser?.id !== profile.id && (
  <button
onClick={toggleFollow}
    className="
      mt-3
      px-4
      py-2
      rounded-lg
      border
      border-cyan-500/20
      bg-cyan-500/5
      text-cyan-400
      text-sm
      font-semibold
      hover:bg-cyan-500/10
      transition
    "
  >
    {isFollowing ? 'Following' : 'Follow'}
  </button>
)}



{currentUser?.id !== profile.id && (
  <button
    onClick={() =>
  router.push(`/messages?user=${profile.id}`)
}
    className="mt-3 px-3 py-1 text-xs bg-emerald-500 rounded-lg text-sm font-bold"
  >
    Message
  </button>
)}


                  {currentUser?.id === profile.id && (
<button
  onClick={() => setEditing(!editing)}
  className="mt-3 px-3 py-1 text-xs bg-cyan-500 rounded-lg text-sm font-bold"
>
  {editing ? 'Cancel' : 'Edit Profile'}
</button>
                  )}






                </div>

{editing ? (
  <div className="mt-4 space-y-3">

    <input
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
      placeholder="Username"
      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3"
    />

    <textarea
      value={newBio}
      onChange={(e) => setNewBio(e.target.value)}
      placeholder="Bio"
      rows={4}
      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3"
    />

    <input
      type="file"
      accept="image/*"
      onChange={(e) =>
        setAvatarFile(e.target.files?.[0] || null)
      }
      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3"
    />

  </div>
) : (
  <p className="text-sm text-zinc-400 mt-1">
    {profile.bio || 'No bio yet'}
  </p>
)}
<div className="flex flex-wrap gap-4 mt-4 text-sm text-zinc-500">
  <span>📍 Nairobi, Kenya</span>
  <span>📅 Joined 2026</span>
</div>

{editing && (
  <button
    onClick={saveProfile}
    className="
      mt-4
      bg-emerald-500
      hover:bg-emerald-400
      px-4
      py-2
      rounded-lg
      font-bold
      transition
    "
  >
    Save Changes
  </button>
)}


{currentUser?.id === profile.id && (
<button
  onClick={() => router.push('/driver/register')}
  className="
    mt-3
    px-4
    py-2
    rounded-lg
    bg-orange-500
    hover:bg-orange-400
    text-white
    text-sm
    font-bold
    transition
  "
>
  🚗 Become Driver
</button>
)}

<div className="flex items-center gap-5 mt-4 text-sm overflow-x-auto">

 <button
  onClick={() =>
    setActiveTab(
      activeTab === 'posts'
        ? ''
        : 'posts'
    )
  }
  className="whitespace-nowrap"
>
  <span className="font-bold text-white">
    {posts.length}
  </span>
  <span className="text-zinc-500 ml-1">
    Posts
  </span>
</button>
  <button
    onClick={() => setShowFollowers(true)}
    className="whitespace-nowrap"
  >
    <span className="font-bold text-white">
      {followersCount}
    </span>
    <span className="text-zinc-500 ml-1">
      Followers
    </span>
  </button>

  <button className="whitespace-nowrap">
    <span className="font-bold text-white">
      {followingCount}
    </span>
    <span className="text-zinc-500 ml-1">
      Following
    </span>
  </button>

  <button className="whitespace-nowrap">
    <span className="font-bold text-white">
      {profile?.reputation || 0}
    </span>
    <span className="text-zinc-500 ml-1">
      Rep
    </span>
  </button>

</div>

              </div>

            </div>

          </div>

        </div>
{activeTab === 'posts' && (
  <>
    {/* POSTS SECTION */}
    <div className="mt-8 flex items-center justify-between">
      <h2 className="font-black tracking-widest text-zinc-400 text-sm">
        DATAFEED // USER POSTS
      </h2>

      <div className="text-xs text-cyan-400 font-mono">
        {posts.length} TRANSMISSIONS
      </div>
    </div>

    <div className="mt-4 space-y-4">
      {posts.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-10 text-center">
          <p className="text-xs text-zinc-500">
            No transmissions found.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="
              rounded-xl
              border
              border-zinc-800
              bg-zinc-950/60
              backdrop-blur-xl
              overflow-hidden
            "
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={profile.avatar_url || '/avatar-placeholder.png'}
                  className="w-10 h-10 rounded-xl object-cover"
                />

                <div>
                  <p className="font-bold">
                    {profile.username}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <p className="text-zinc-200 whitespace-pre-wrap">
                {post.content}
              </p>

              {post.video_url && (
                <video
                  src={post.video_url}
                  controls
                  className="
                    mt-4
                    rounded-xl
                    w-full
                    border
                    border-zinc-800
                  "
                />
              )}
            </div>
          </div>
        ))
      )}
    </div>
   
  </>
)}
</div>

{showFollowers && (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
    <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6">

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-xl">
          Followers
        </h2>

        <button
          onClick={() => setShowFollowers(false)}
          className="text-zinc-500 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">

        {followers.map((follower: any, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900"
          >
            <img
              src={
                follower.profiles?.avatar_url ||
                '/avatar-placeholder.png'
              }
              className="w-10 h-10 rounded-xl object-cover"
            />

<button
  onClick={() => {
    setShowFollowers(false)
    router.push(
      `/profile/${follower.profiles?.username}`
    )
  }}
  className="font-semibold hover:text-cyan-400 transition"
>
  {follower.profiles?.username}
</button>
          </div>
        ))}

      </div>
    </div>
  </div>
)}


    </main>

    
  )
}