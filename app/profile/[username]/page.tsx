'use client'

import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import ProfileSchema from '../../components/ProfileSchema'
import ProfileHero from './ProfileHero'
import { getCachedProfile, setCachedProfile } from '../../lib/profileCache'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
 

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

const [newWebsite, setNewWebsite] = useState('')
const [newLocation, setNewLocation] = useState('')

const [activeTab, setActiveTab] = useState('')
const [showMenu, setShowMenu] = useState(false)
const searchParams = useSearchParams()

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
  const cached = getCachedProfile(username)

  if (cached) {
    setProfile((prev: any) => ({
      ...prev,
      ...cached,
    }))

    setLoading(false)
  } else {
    setLoading(true)
  }

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

setCachedProfile(profileData.username.toLowerCase(), {
  username: profileData.username,
  avatar_url: profileData.avatar_url,
  reputation: profileData.reputation,
  predictions_correct: profileData.predictions_correct,
  predictions_wrong: profileData.predictions_wrong,
})

setLoading(false)


const [
  followersResult,
  followingResult,
  followersListResult,
] = await Promise.all([
  supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileData.id),

  supabase
    .from('followers')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profileData.id),

  supabase
    .from('followers')
    .select(`
      follower_id,
      profiles!followers_follower_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq('following_id', profileData.id),


])

setFollowersCount(followersResult.count || 0)
setFollowingCount(followingResult.count || 0)
setFollowers(followersListResult.data || [])


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
 setNewWebsite(profileData.website || '')
setNewLocation(profileData.location || '') 
}
  if (loading && !profile) {



    

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
  website: newWebsite,
  location: newLocation,
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
  website: newWebsite,
  location: newLocation,
  avatar_url,
})

  setEditing(false)

  router.replace(`/profile/${username}`)
}


const loadPosts = async () => {
  if (!profile) return

  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  setPosts(data || [])
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

  <div className="w-full max-w-7xl mx-auto sm:px-6 lg:px-8">

    <ProfileHero
  profile={profile}
  postsCount={posts.length}
  followersCount={followersCount}
  followingCount={followingCount}

  currentUser={currentUser}

  editing={editing}
  setEditing={setEditing}

  newUsername={newUsername}
  setNewUsername={setNewUsername}

  newBio={newBio}
  setNewBio={setNewBio}

newWebsite={newWebsite}
setNewWebsite={setNewWebsite}

newLocation={newLocation}
setNewLocation={setNewLocation}

activeTab={activeTab}
setActiveTab={setActiveTab}

  avatarFile={avatarFile}
  setAvatarFile={setAvatarFile}

  saveProfile={saveProfile}

  isFollowing={isFollowing}
  onFollow={toggleFollow}

  onMessage={() =>
    router.push(`/messages?user=${profile.id}`)
  }

onBack={() => router.back()}

  onBecomeDriver={() =>
    router.push('/driver/register')
  }

  reputation={profile.reputation ?? 0}

  onPostsClick={async () => {
    if (activeTab === 'posts') {
      setActiveTab('')
      return
    }

    setActiveTab('posts')

    if (posts.length === 0) {
      await loadPosts()
    }
  }}

  onFollowersClick={() => setShowFollowers(true)}
/>
    {/* Background Glow */}
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/5 blur-[150px] pointer-events-none" />
<div className="w-full">


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