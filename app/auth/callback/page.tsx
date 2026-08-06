'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseBrowser } from '@/app/lib/supabase-browser'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseBrowser()

    async function handleAuth() {
      await supabase.auth.getSession()
      router.replace('/')
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-3">
          Verifying your account...
        </h1>
        <p className="text-zinc-400">
          Please wait while we securely sign you in.
        </p>
      </div>
    </div>
  )
}