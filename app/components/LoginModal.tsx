'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { registerPushNotifications } from '../lib/pushNotifications'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

interface LoginModalProps {
  onClose: () => void
  onLogin: () => void
}

export default function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  
  // Custom states for elegant notifications instead of raw browser alerts
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Prevent background scrolling while the auth modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  // Clear messages when user switches between Login and Signup modes
  const handleToggleMode = (signUpState: boolean) => {
    setErrorMsg('')
    setSuccessMsg('')
    setIsSignup(signUpState)
  }

  const resetPassword = async () => {
    setErrorMsg('')
    setSuccessMsg('')

    if (!email.trim()) {
      return setErrorMsg('Please enter your email address above first.')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://streetgo.app/reset-password",
    })

    if (error) {
      return setErrorMsg(error.message)
    }

    setSuccessMsg('A password reset link has been dispatched to your email.')
  }

  const handleAuth = async () => {
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    if (isSignup) {
      const cleanUsername = username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')

      if (cleanUsername.length < 3) {
        setLoading(false)
        return setErrorMsg('Username must be at least 3 characters long.')
      }
      if (!email.trim()) {
        setLoading(false)
        return setErrorMsg('Email field cannot be empty.')
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setLoading(false)
        return setErrorMsg('Please provide a valid email format.')
      }

      if (password.length < 8) {
        setLoading(false)
        return setErrorMsg('Password must be at least 8 characters long.')
      }
      if (cleanUsername.length > 20) {
        setLoading(false)
        return setErrorMsg('Username cannot exceed 20 characters.')
      }

      const reserved = [
        'admin', 'support', 'owner', 'official', 
        'moderator', 'system', 'tunda', 'tundastreet'
      ]

      if (reserved.includes(cleanUsername)) {
        setLoading(false)
        return setErrorMsg('This username is reserved and unavailable.')
      }

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle()

      if (existingUser) {
        setLoading(false)
        return setErrorMsg('This username is already claimed.')
      }

      // 1. Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        setLoading(false)
        return setErrorMsg(error.message)
      }
      
      // 2. Create profile in database
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: cleanUsername,
            avatar_url: null,
            created_at: new Date().toISOString()
          })

        if (profileError) {
          console.error("PROFILE INSERT ERROR:", profileError)
          setLoading(false)
          return setErrorMsg(profileError.message)
        }

        // Automatically create REAX wallet
        const { error: walletError } = await supabase
          .from("wallets")
          .insert({
            user_id: data.user.id,
            balance: 0,
            reax_balance: 0
          })

        if (walletError) {
          console.error("WALLET INSERT ERROR:", walletError)
          setLoading(false)
          return setErrorMsg(walletError.message)
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setLoading(false)
        return setErrorMsg(error.message)
      }

      // Give Supabase session space to resolve before registration
      await new Promise(resolve => setTimeout(resolve, 500))
      await registerPushNotifications()
    }
    
    setLoading(false)
    onLogin()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
      {/* Modal Card wrapper to match previous subcomponent constraints */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 shadow-2xl shadow-black/80 rounded-2xl relative p-1">
        
        {/* Dynamic Inner Layout Switcher */}
        {isSignup ? (
          <SignupForm
            username={username}
            email={email}
            password={password}
            loading={loading}
            onUsernameChange={setUsername}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSignup={handleAuth}
            onSwitchToLogin={() => handleToggleMode(false)}
          />
        ) : (
          <LoginForm
            email={email}
            password={password}
            loading={loading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onLogin={handleAuth}
            onForgotPassword={resetPassword}
            onSwitchToSignup={() => handleToggleMode(true)}
          />
        )}

        {/* Global Feedback Container rendered smoothly inside the card wrapper padding */}
        <div className="px-8 pb-3 space-y-3">
          {errorMsg && (
            <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl animate-in fade-in zoom-in-95 duration-150">
              <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl animate-in fade-in zoom-in-95 duration-150">
              <svg className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Minimal Cancel trigger aligned beautifully below subforms */}
          <button 
            type="button"
            onClick={onClose} 
            className="w-full text-center text-xs text-zinc-500 hover:text-zinc-400 py-2 transition-colors focus:outline-none focus:underline"
          >
            Cancel and go back
          </button>
        </div>

      </div>
    </div>
  )
}
