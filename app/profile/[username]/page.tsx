'use client'

import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'
import { useParams, useRouter } from 'next/navigation'
export default function ProfilePage() {
  const params = useParams()
  const username = decodeURIComponent(params.username as string)

  const [profile, setProfile] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
const [editing, setEditing] = useState(false)
const [newUsername, setNewUsername] = useState('')
const [newBio, setNewBio] = useState('')
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

const {
  data: { session },
} = await supabase.auth.getSession()

setCurrentUser(session?.user ?? null)

const {
  data: profileData,
  error
} = await supabase
  .from('profiles')
  .select('*')
  .eq('username', username)
  .maybeSingle()

console.log('PROFILE:', profileData)
console.log('ERROR:', error)
    if (profileData) {
      setProfile(profileData)

      setNewUsername(profileData.username || '')
setNewBio(profileData.bio || '')


      const { data: userPosts } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })

      setPosts(userPosts || [])
    }

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
          <p className="text-zinc-500">
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

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      bio: newBio,
    })
    .eq('id', profile.id)

  if (error) {
    alert(error.message)
    return
  }

  await supabase
    .from('posts')
    .update({
      username,
    })
    .eq('user_id', profile.id)

  setEditing(false)

  router.push(`/profile/${username}`)
}



  return (
    <main className="min-h-screen bg-[#060608] text-white">

      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* PROFILE CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-xl">

          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-orange-500/[0.03]" />

          <div className="relative p-8">

            <div className="flex flex-col md:flex-row md:items-center gap-6">

              <img
                src={
                  profile.avatar_url ||
                  `https://i.pravatar.cc/150?u=${profile.id}`
                }
                alt=""
                className="w-32 h-32 rounded-3xl object-cover border border-cyan-500/20 shadow-2xl"
              />

              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-4xl font-black tracking-tight">
                    {profile.username}
                  </h1>

                  {currentUser?.id === profile.id && (
<button
  onClick={() => setEditing(!editing)}
  className="mt-3 px-4 py-2 bg-cyan-500 rounded-lg text-sm font-bold"
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

  </div>
) : (
  <p className="text-zinc-400 mt-2">
    {profile.bio || 'No bio yet'}
  </p>
)}
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
                <div className="flex gap-6 mt-6">

                  <div>
                    <p className="text-2xl font-black">
                      {posts.length}
                    </p>
                    <p className="text-xs uppercase text-zinc-500">
                      Posts
                    </p>
                  </div>

                  <div>
                    <p className="text-2xl font-black">
                      {profile.created_at
                        ? new Date(profile.created_at)
                            .getFullYear()
                        : '2026'}
                    </p>
                    <p className="text-xs uppercase text-zinc-500">
                      Member Since
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

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
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-10 text-center">
              <p className="text-zinc-500">
                No transmissions found.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="
                  rounded-2xl
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
                      src={
                        profile.avatar_url ||
                        `https://i.pravatar.cc/150?u=${profile.id}`
                      }
                      className="w-10 h-10 rounded-xl"
                    />

                    <div>
                      <p className="font-bold">
                        {profile.username}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {new Date(
                          post.created_at
                        ).toLocaleString()}
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

      </div>

    </main>
  )
}