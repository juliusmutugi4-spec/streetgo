'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginModal({ onClose, onLogin }: { onClose: () => void, onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    
    if (isSignup) {
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
    username: username.trim(),
    avatar_url: null,
    created_at: new Date().toISOString()
  })
  if (profileError) {
    console.log('PROFILE INSERT ERROR:', profileError)
  }
}
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setLoading(false)
        return alert(error.message)
      }
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
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-700 rounded p-3 mb-3 text-white"
          />
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