'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function CreatePrediction({
  userId,
  username,
  avatarUrl,
  onCreated,
}: any) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

const createPrediction = async () => {
  try {
    console.log("Button clicked")

    if (!title.trim()) {
      alert("Enter a title")
      return
    }

    console.log("About to call Supabase")

console.log("User ID:", userId)
console.log("Username:", username)
console.log("Avatar:", avatarUrl)

const sessionResult = await supabase.auth.getSession()

console.log("Session Result:", sessionResult)

    const result = await supabase
      .from("predictions")
      .insert({


        
        title,
        target_date: date || null,
        user_id: userId,
        username,
        avatar_url: avatarUrl,
      })
      .select()

    console.log("Supabase result:", result)

    if (result.error) {
      alert(result.error.message)
      return
    }

    alert("Prediction created!")

    setTitle("")
    setDate("")

    onCreated()

  } catch (err) {
    console.error("Caught error:", err)
    alert("An unexpected error occurred. Check the console.")
  }
}
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-[#05070b] p-4">
      <h3 className="mb-3 text-cyan-400 font-bold">
        Prediction Engine
      </h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Predict the future..."
        className="w-full mb-3 rounded bg-zinc-900 p-3"
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full mb-3 rounded bg-zinc-900 p-3"
      />

<button
  onClick={createPrediction}
  className="w-full rounded bg-cyan-500 p-3 font-bold"
>
  Create Prediction
</button>
    </div>
  )
}