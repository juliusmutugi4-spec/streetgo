'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
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
          setErrorMsg("The reset link is invalid or has expired.")
        }
      }
    }

    handleRecovery()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("AUTH EVENT:", event)
    })

    return () => subscription.unsubscribe()
  }, [])

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 8) {
      return setErrorMsg('Password must be at least 8 characters long.')
    }

    if (password !== confirmPassword) {
      return setErrorMsg('Passwords do not match.')
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      return setErrorMsg(error.message)
    }

    setSuccess(true)
    setPassword('')
    setConfirmPassword('')
  }

  // Success State View
  if (success) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 antialiased">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 shadow-2xl shadow-black/50 rounded-2xl p-8 text-center backdrop-blur-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-5">
            <svg className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">
            Password updated
          </h1>

          <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
            Your security credentials have been successfully updated. You can now sign in using your new password.
          </p>

          <button
            onClick={() => router.push('/')}
            className="w-full mt-6 bg-zinc-50 hover:bg-zinc-200 text-zinc-900 transition-colors py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Proceed to Sign In
          </button>
        </div>
      </div>
    )
  }

  // Active Reset Password View
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 shadow-2xl shadow-black/50 rounded-2xl p-8 backdrop-blur-sm">
        
        {/* Shield Icon to increase user trust */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/50 mb-4">
          <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight mb-1">
          Create new password
        </h1>

        <p className="text-sm text-zinc-400 mb-6">
          Please enter a secure password that you don't use elsewhere.
        </p>

        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner"
              required
            />
            <p className="text-[11px] text-zinc-500 mt-1">Must be at least 8 characters long.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner"
              required
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl">
              <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-50 hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-zinc-50 text-zinc-900 transition-all py-2.5 px-4 rounded-xl font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-900 mt-2 flex justify-center items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-zinc-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? 'Updating password...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  )
}
