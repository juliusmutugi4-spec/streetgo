'use client'

import React from 'react'

interface LoginFormProps {
  email: string
  password: string
  loading: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onLogin: () => void
  onForgotPassword: () => void
  onSwitchToSignup: () => void
}

export default function LoginForm({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onForgotPassword,
  onSwitchToSignup,
}: LoginFormProps) {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loading) onLogin()
  }

  return (
    <div className="w-full max-w-md bg-zinc-900/70 border border-zinc-800/60 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.7)] rounded-2xl p-8 backdrop-blur-md transition-all duration-300">
      
      {/* Icon Wrapper */}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800/40 border border-zinc-700/30 mb-6 shadow-sm">
        <svg className="h-5 w-5 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </div>

      {/* Header */}
      <div className="space-y-1.5 mb-6">
        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-400/90 font-normal">
          Enter your details to access your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-zinc-400 tracking-wide select-none">
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            disabled={loading}
            className="w-full bg-zinc-950/60 border border-zinc-800/80 focus:border-zinc-500 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-[1px] focus:ring-zinc-500 transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-medium text-zinc-400 tracking-wide select-none">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors duration-200 focus:outline-none focus:underline"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            disabled={loading}
            className="w-full bg-zinc-950/60 border border-zinc-800/80 focus:border-zinc-500 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-[1px] focus:ring-zinc-500 transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-zinc-50 hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 transition-all duration-200 rounded-xl font-medium text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 focus:ring-offset-zinc-950 mt-2 flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="mt-6 text-center text-xs text-zinc-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-zinc-400 hover:text-zinc-200 transition-colors duration-200 underline underline-offset-4 focus:outline-none"
        >
          Create an account
        </button>
      </div>
    </div>
  ) 
}
