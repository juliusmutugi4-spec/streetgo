'use client'
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function DatingCircle() {
  const router = useRouter()
  const [position, setPosition] = useState({ x: 20, y: 120 })
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  
  // Track if a real drag occurred to prevent accidental clicks
  const isMoved = useRef(false)

  async function openDating() {
    // If the user dragged the item, do not trigger the page navigation
    if (isMoved.current) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("dating_active")
      .eq("id", user.id)
      .single()

    if (!profile?.dating_active) {
      router.push("/dating/setup")
      return
    }

    router.push("/dating")
  }

  function startDrag(e: React.MouseEvent) {
    setDragging(true)
    isMoved.current = false
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  function moveDrag(e: React.MouseEvent) {
    if (!dragging) return
    isMoved.current = true
    setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  function stopDrag() {
    setDragging(false)
  }

  return (
    <div
      onMouseMove={moveDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        touchAction: "none"
      }}
    >
      <button
        onMouseDown={startDrag}
        onClick={openDating}
        className="
          w-10 h-10 rounded-full 
          bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 
          border border-amber-200/50 
          shadow-[0_0_15px_rgba(245,158,11,0.5)] 
          hover:shadow-[0_0_25px_rgba(245,158,11,0.8)]
          hover:scale-105 active:scale-95
          transition-all duration-200 ease-out
          flex items-center justify-center 
          text-lg cursor-grab active:cursor-grabbing
          backdrop-blur-sm select-none
        "
        aria-label="Open Dating Network"
      >
        ✨
      </button>
    </div>
  )
}
