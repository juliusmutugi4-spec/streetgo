"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../lib/supabase"

export default function DatingCircle() {
  const router = useRouter()

  const [position, setPosition] = useState({
    x: 20,
    y: 120,
  })

  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)

  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  })

  const isMoved = useRef(false)

  async function openDating() {
    // Don't open after dragging
    if (isMoved.current) {
      isMoved.current = false
      return
    }

    // Prevent double-click / duplicate requests
    if (loading) return

    setLoading(true)

    try {
      // Use the existing browser session.
      // This avoids an unnecessary auth-server getUser() request.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error(
          "Dating auth session error:",
          sessionError
        )

        setLoading(false)
        return
      }

      const user = session?.user

      if (!user) {
        router.push("/login")
        return
      }

      // Check whether the user has completed dating setup
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("dating_active")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error(
          "Dating profile error:",
          profileError
        )

        setLoading(false)
        return
      }

      if (!profile?.dating_active) {
        router.push("/dating/setup")
        return
      }

      // Dating is active
      router.push("/dating")
    } catch (error) {
      console.error(
        "Failed to open Dating:",
        error
      )

      setLoading(false)
    }
  }

  // =========================================================
  // MOUSE EVENTS
  // =========================================================

  function startDrag(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    setDragging(true)

    isMoved.current = false

    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  function moveDrag(
    e: React.MouseEvent<HTMLDivElement>
  ) {
    if (!dragging) return

    isMoved.current = true

    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    })
  }

  // =========================================================
  // TOUCH EVENTS
  // =========================================================

  function startTouch(
    e: React.TouchEvent<HTMLButtonElement>
  ) {
    setDragging(true)

    isMoved.current = false

    const touch = e.touches[0]

    setOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  function moveTouch(
    e: React.TouchEvent<HTMLDivElement>
  ) {
    if (!dragging) return

    isMoved.current = true

    const touch = e.touches[0]

    setPosition({
      x: touch.clientX - offset.x,
      y: touch.clientY - offset.y,
    })
  }

  function stopDrag() {
    setDragging(false)
  }

  return (
    <div
      onMouseMove={moveDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchMove={moveTouch}
      onTouchEnd={stopDrag}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        zIndex: 9999,
        touchAction: "none",
      }}
    >
      <div className="relative flex items-center justify-center">

        {/* =====================================================
            PULSING OUTER RING
        ===================================================== */}

        <span
          className={`
            absolute
            inline-flex
            h-14
            w-14
            rounded-full
            bg-amber-500/20
            transition-all
            duration-500
            ${
              loading
                ? "animate-ping scale-125"
                : "animate-pulse"
            }
          `}
        />

        {/* =====================================================
            LOADING RING
        ===================================================== */}

        {loading && (
          <span
            className="
              absolute
              inline-flex
              h-16
              w-16
              rounded-full
              border
              border-amber-500/30
              border-t-transparent
              animate-spin
              box-border
            "
          />
        )}

        {/* =====================================================
            DATING BUTTON
        ===================================================== */}

        <button
          type="button"
          onMouseDown={startDrag}
          onTouchStart={startTouch}
          onClick={openDating}
          disabled={loading}
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            text-lg
            select-none
            backdrop-blur-md
            transition-all
            duration-300

            bg-gradient-to-br
            from-amber-400
            via-yellow-500
            to-amber-700

            border
            border-amber-300/40

            shadow-[0_0_15px_rgba(245,158,11,0.5)]

            ${
              loading
                ? "cursor-wait animate-spin"
                : "cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.8)] active:scale-95"
            }
          `}
          aria-label="Open Dating Network"
        >
          <span
            className={
              loading
                ? "animate-spin"
                : ""
            }
          >
            ✨
          </span>
        </button>
      </div>
    </div>
  )
}