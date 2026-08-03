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
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        Create Account
      </h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          onUsernameChange(
            e.target.value
              .toLowerCase()
              .replace(/[^a-z0-9_]/g, '')
          )
        }
        maxLength={20}
        className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3 mb-2 text-white"
      />

      <p className="text-xs text-slate-400 mb-3">
        {username.length}/20 • only letters, numbers and _
      </p>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) =>
          onEmailChange(e.target.value)
        }
        className="w-full bg-slate-700 rounded p-3 mb-3 text-white"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          onPasswordChange(e.target.value)
        }
        className="w-full bg-slate-700 rounded p-3 mb-4 text-white"
      />

      <button
        onClick={onSignup}
        disabled={loading}
        className="bg-blue-600 w-full py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Create Account'}
      </button>

      <button
        onClick={onSwitchToLogin}
        className="mt-3 text-blue-400 text-sm w-full"
      >
        Already have an account? Login
      </button>
    </>
  )
}