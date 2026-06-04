'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileEdit() {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: auth } = await supabase.auth.getUser()

    if (!auth.user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', auth.user.id)
      .single()

    if (data) {
      setUsername(data.username || '')
      setBio(data.bio || '')
      setAvatarUrl(data.avatar_url || '')
    }
  }

  const saveProfile = async () => {
    setLoading(true)

    try {
      const { data: auth } = await supabase.auth.getUser()

      if (!auth.user) return

      let newAvatarUrl = avatarUrl

      if (avatar) {
        const fileExt = avatar.name.split('.').pop()
        const fileName = `${auth.user.id}-${Date.now()}.${fileExt}`

        const { error } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar)

        if (error) throw error

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        newAvatarUrl = data.publicUrl
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio,
          avatar_url: newAvatarUrl,
        })
        .eq('id', auth.user.id)

      if (error) throw error

      alert('Profile updated!')
    }catch (err: any) {
  console.log('PROFILE ERROR:', err)
  alert(JSON.stringify(err))
}
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">

      <h1 className="text-2xl font-bold">
        Edit Profile
      </h1>

      {avatarUrl && (
        <img
          src={avatarUrl}
          alt=""
          className="w-24 h-24 rounded-full object-cover"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatar(e.target.files?.[0] || null)}
        className="w-full"
      />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-3 rounded border"
      />

      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-3 rounded border"
      />

      <button
        onClick={saveProfile}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>

    </div>
  )
}