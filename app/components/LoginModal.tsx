'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { registerPushNotifications } from '../lib/pushNotifications'
export default function LoginModal({ onClose, onLogin }: { onClose: () => void, onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const resetPassword = async () => {
    if (!email.trim()) {
      return alert('Enter your email first')
    }

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            window.location.origin +
            '/reset-password',
        }
      )

    if (error) {
      return alert(error.message)
    }

    alert('Password reset link sent to your email')
  }

  
useEffect(() => {
  document.body.style.overflow = 'hidden'

  return () => {
    document.body.style.overflow = 'auto'
  }
}, [])

  const handleAuth = async () => {
    setLoading(true)
    
    if (isSignup) {
const cleanUsername = username
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9_]/g, '')

if (cleanUsername.length < 3) {
  setLoading(false)
  return alert('Username must be at least 3 characters')
}
if (!email.trim()) {
  setLoading(false)
  return alert('Email is required')
}

const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!emailRegex.test(email)) {
  setLoading(false)
  return alert('Enter a valid email')
}

if (password.length < 8) {
  setLoading(false)
  return alert(
    'Password must be at least 8 characters'
  )
}
if (cleanUsername.length > 20) {
  setLoading(false)
  return alert('Username cannot exceed 20 characters')
}
const reserved = [
  'admin',
  'support',
  'owner',
  'official',
  'moderator',
  'system',
  'tunda',
  'tundastreet'
]

if (reserved.includes(cleanUsername)) {
  setLoading(false)
  return alert('Username not available')
}

const { data: existingUser } = await supabase
  .from('profiles')
  .select('id')
  .eq('username', cleanUsername)
  .maybeSingle()

if (existingUser) {
  setLoading(false)
  return alert('Username already taken')
}

      // 1. Create auth user
const { data, error } = await supabase.auth.signUp({
  email,
  password
})
      if (error) {
        setLoading(false)
        return alert(error.message)
      }
      
      // 2. Create profile in profiles table
if (data.user) {
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
username: cleanUsername,
    avatar_url: null,
    created_at: new Date().toISOString()
  })
  if (profileError) {
    console.log('PROFILE INSERT ERROR:', profileError)
  }
}
    } else {
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
})

if (error) {
  setLoading(false)
  return alert(error.message)
}

// Give Supabase a moment to finish creating the session
await new Promise(resolve => setTimeout(resolve, 500))

// Register this device for the logged-in user
await registerPushNotifications()
    }
    
    setLoading(false)
    onLogin()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-96">
        <h2 className="text-2xl font-bold mb-4">{isSignup? 'Sign Up' : 'Login'}</h2>
        
{isSignup && (
  <>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) =>
        setUsername(
          e.target.value
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '')
        )
      }
      maxLength={20}
      className="
        w-full
        bg-slate-700
        border
        border-slate-600
        rounded-xl
        p-3
        mb-2
        text-white
        focus:outline-none
        focus:border-cyan-500
      "
    />

    <p className="text-xs text-slate-400 mb-3">
      {username.length}/20 • only letters, numbers and _
    </p>
  </>
)}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-700 rounded p-3 mb-3 text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-700 rounded p-3 mb-4 text-white"
        />
        
        <button
          onClick={handleAuth}
          disabled={loading}
          className="bg-blue-600 w-full py-3 rounded-lg font-bold disabled:opacity-50"
        >
          {loading? 'Loading...' : isSignup? 'Sign Up' : 'Login'}
        </button>

{!isSignup && (
  <button
    onClick={resetPassword}
    className="mt-3 text-cyan-400 text-sm w-full"
  >
    Forgot Password?
  </button>
)}


        <button 
          onClick={() => setIsSignup(!isSignup)} 
          className="mt-3 text-blue-400 text-sm w-full"
        >
          {isSignup? 'Have account? Login' : "No account? Sign Up"}
        </button>
        
        <button onClick={onClose} className="mt-2 text-gray-400 text-sm w-full">Cancel</button>
      </div>
    </div>
  )
}