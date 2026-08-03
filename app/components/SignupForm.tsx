'use client'

interface SignupFormProps {
  username: string
  email: string
  password: string
  loading: boolean
  onUsernameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSignup: () => void
  onSwitchToLogin: () => void
}

export default function SignupForm({
  username,
  email,
  password,
  loading,
  onUsernameChange,
  onEmailChange,
  onPasswordChange,
  onSignup,
  onSwitchToLogin,
}: SignupFormProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSignup()
  }

  return (
    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 shadow-2xl shadow-black/50 rounded-2xl p-8 backdrop-blur-sm">
      
      {/* Visual Anchor: Sparkles/User Creation Icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/50 mb-4">
        <svg className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight mb-1">
        Create an account
      </h1>

      <p className="text-sm text-zinc-400 mb-6">
        Get started by setting up your secure login credentials.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-medium text-zinc-400">
              Username
            </label>
            <span className="text-[11px] text-zinc-500">
              {username.length}/20 chars
            </span>
          </div>
          <input
            type="text"
            placeholder="johndoe"
            value={username}
            onChange={(e) =>
              onUsernameChange(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, '')
              )
            }
            maxLength={20}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner"
            required
          />
          <p className="text-[11px] text-zinc-500 mt-1">
            Lowercase letters, numbers, and underscores only.
          </p>
        </div>

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
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all shadow-inner"
            required
          />
          <p className="text-[11px] text-zinc-500 mt-1">Must be at least 8 characters long.</p>
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
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-zinc-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-medium text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-4 focus:outline-none"
        >
          Sign in
        </button>
      </div>
    </div>
  )
}
