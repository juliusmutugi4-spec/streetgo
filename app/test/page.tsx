'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
export default function TestPage() {
  const [userId, setUserId] = useState('')

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)
      }
    }

    loadUser()
  }, [])

  async function send() {
    if (!userId) {
      alert('User not logged in')
      return
    }

    const res = await fetch('/api/send-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        title: 'StreetGO',
        body: 'Hello World',
      }),
    })

    console.log(await res.json())
  }

  return (
    <button
      onClick={send}
      className="p-4 bg-green-600 text-white rounded-lg"
    >
      Test Push API
    </button>
  )
}