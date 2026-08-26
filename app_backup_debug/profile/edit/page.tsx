'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
export default function EditProfile() {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)

  // STEP 1: LOAD CURRENT PROFILE
  useEffect(() => {
    const loadProfile = async () => {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single()

      if (data) {
        setUsername(data.username || '')
        setBio(data.bio || '')
        setAvatar(data.avatar_url || '')
      }
    }

    loadProfile()
  }, [])

  // STEP 2: SAVE PROFILE
  const saveProfile = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      alert('Not logged in')
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
        avatar_url: avatar,
      })
      .eq('id', userData.user.id)

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Profile updated successfully!')
  }

  return (
    <div className="max-w-md mx-auto p-4 text-white space-y-3">

      <h1 className="text-xl font-bold">Edit Profile</h1>

      {/* Username */}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full p-2 bg-zinc-900 rounded"
      />

      {/* Bio */}
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        className="w-full p-2 bg-zinc-900 rounded"
      />

      {/* Avatar URL */}
      <input
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        placeholder="Avatar URL"
        className="w-full p-2 bg-zinc-900 rounded"
      />

      {/* Save button */}
      <button
        onClick={saveProfile}
        disabled={loading}
        className="bg-cyan-500 px-4 py-2 rounded text-black font-bold"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  )
}