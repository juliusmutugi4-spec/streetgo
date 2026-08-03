'use client'

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
    onLogin()
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 shadow-2xl shadow-black/50 rounded-2xl p-8 backdrop-blur-sm">
      
      {/* Visual Anchor: Locked Keyhole Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/50 mb-4">
        <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight mb-1">
        Welcome back
      </h1>

      <p className="text-sm text-zinc-400 mb-6">
        Please enter your details to sign in to your account.
      </p>

      {/* Wrapping in a proper form element for accessibility and native handling */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-medium text-zinc-400">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none focus:underline"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner"
            required
          />
        </div>

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
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="font-medium text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-4 focus:outline-none"
        >
          Sign up
        </button>
      </div>
    </div>
  )
}
