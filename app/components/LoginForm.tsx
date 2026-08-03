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
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        Login
      </h2>

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
        onClick={onLogin}
        disabled={loading}
        className="bg-blue-600 w-full py-3 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'Login'}
      </button>

      <button
        onClick={onForgotPassword}
        className="mt-3 text-cyan-400 text-sm w-full"
      >
        Forgot Password?
      </button>

      <button
        onClick={onSwitchToSignup}
        className="mt-3 text-blue-400 text-sm w-full"
      >
        No account? Sign Up
      </button>
    </>
  )
}