'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useEffect } from 'react'
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()

useEffect(() => {
  const handleRecovery = async () => {
    const hash = window.location.hash

    if (!hash) return

    const params = new URLSearchParams(hash.substring(1))

    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")

    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })

      if (error) {
        console.error(error)
        alert("Unable to verify reset link.")
      }
    }
  }

  handleRecovery()

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event) => {
    console.log("AUTH EVENT:", event)
  })

  return () => subscription.unsubscribe()
}, [])


  const updatePassword = async () => {
    if (password.length < 8) {
      return alert('Password must be at least 8 characters')
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      return alert(error.message)
    }

    alert('Password updated successfully')

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <h1 className="text-3xl font-black text-white mb-2">
          Reset Password
        </h1>

        <p className="text-zinc-400 mb-6">
          Enter your new password.
        </p>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            w-full
            bg-zinc-800
            border
            border-zinc-700
            rounded-xl
            p-3
            text-white
            mb-4
          "
        />

        <button
          onClick={updatePassword}
          disabled={loading}
          className="
            w-full
            bg-cyan-500
            text-black
            py-3
            rounded-xl
            font-bold
          "
        >
          {loading
            ? 'Updating...'
            : 'Update Password'}
        </button>
      </div>
    </div>
  )
}