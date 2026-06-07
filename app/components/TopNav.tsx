'use client'

import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

type TopNavProps = {
  user: any
  onLogin: () => void
  onLogout: () => void
}

export default function TopNav({
  user,
  onLogin,
  onLogout,
}: TopNavProps) {
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#060608]/95 backdrop-blur-xl border-b border-zinc-800">
      <div className="max-w-5xl mx-auto h-16 px-6 flex items-center justify-between">

        {/* LOGO */}
        <h1
          onClick={() => router.push('/')}
          className="text-2xl font-black cursor-pointer select-none tracking-wide"
        >
          <span className="text-red-500">C</span>
          <span className="text-emerald-400">W</span>
          <span className="text-red-500">V</span>
        </h1>

        {/* NAVIGATION */}
        <div className="flex items-center gap-6">

          <button
            onClick={() => router.push('/videos')}
            className="
              text-sm
              font-semibold
              text-zinc-300
              hover:text-white
              transition
            "
          >
            Videos
          </button>

          {user ? (
            <>
              <button
                onClick={() =>
                  router.push('/notifications')
                }
                className="
                  text-zinc-300
                  hover:text-white
                  transition
                "
              >
                <Bell size={22} />
              </button>

              <button
                onClick={onLogout}
                className="
                  px-3
                  py-1.5
                  text-xs
                  font-bold
                  text-red-400
                  border
                  border-zinc-700
                  rounded-lg
                  hover:bg-red-900/20
                  transition
                "
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={onLogin}
              className="
                px-4
                py-2
                text-sm
                font-bold
                text-white
                rounded-lg
                bg-gradient-to-r
                from-red-600
                to-red-700
                hover:from-red-500
                hover:to-red-600
                transition
              "
            >
              Login
            </button>
          )}

        </div>
      </div>
    </header>
  )
}