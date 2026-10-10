"use client"

import { useEffect, useRef, useState } from "react"

type Particle = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  size: number
}

export default function DarkSpacePage() {
  const [reax, setReax] = useState(0)
  const [orbY, setOrbY] = useState(0)
  const [combo, setCombo] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [impact, setImpact] = useState(false)

  const animationRef = useRef<number | null>(null)
  const orbRef = useRef(0)
  const lastTimeRef = useRef(0)

  const TARGET_Y = 50
  const BASE_SPEED = 0.045

  // Keep the orb moving smoothly
  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time
      }

      const delta = Math.min(time - lastTimeRef.current, 32)
      lastTimeRef.current = time

      orbRef.current += BASE_SPEED * delta

      if (orbRef.current > 100) {
        orbRef.current = 0
      }

      setOrbY(orbRef.current)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Particle animation
  useEffect(() => {
    if (particles.length === 0) return

    const timer = window.setTimeout(() => {
      setParticles((current) =>
        current
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 0.035,
            size: particle.size * 0.985,
          }))
          .filter((particle) => particle.life > 0)
      )
    }, 16)

    return () => window.clearTimeout(timer)
  }, [particles])

  // Create a subtle geometric impact
  const createImpact = () => {
    const centerX = 50
    const centerY = orbY

    const newParticles: Particle[] = []

    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 0.8 + 0.25

      newParticles.push({
        id: Math.random() + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 2.5 + 1,
      })
    }

    setParticles((current) => [...current, ...newParticles])

    setImpact(true)

    window.setTimeout(() => {
      setImpact(false)
    }, 180)
  }

  // Clicking anywhere inside the space creates a precision event.
  const handleSpaceClick = () => {
    const distance = Math.abs(orbY - TARGET_Y)

    if (distance < 4) {
      const nextCombo = combo + 1

      setCombo(nextCombo)

      const reward = Math.max(1, nextCombo)

      setReax((current) => current + reward)

      createImpact()
    } else if (distance < 12) {
      setCombo((current) => Math.max(0, current - 1))
      setReax((current) => current + 1)

      createImpact()
    } else {
      setCombo(0)
    }
  }

  return (
    <main
      onClick={handleSpaceClick}
      className="relative h-screen w-screen overflow-hidden bg-black select-none cursor-crosshair"
    >
      {/* REAX */}
      <div className="absolute right-6 top-5 z-50 font-mono text-sm tracking-[0.25em] text-white/70">
        ⚡ {reax.toLocaleString()} REAX
      </div>

      {/* Very thin background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.075]"
        style={{
          backgroundImage: `
            linear-gradient(
              to right,
              rgba(255,255,255,0.12) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255,255,255,0.12) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Large mathematical geometry */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
      >
        {/* Horizontal construction lines */}
        <line
          x1="0"
          y1="150"
          x2="1600"
          y2="150"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="0.5"
        />

        <line
          x1="0"
          y1="450"
          x2="1600"
          y2="450"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.6"
        />

        <line
          x1="0"
          y1="750"
          x2="1600"
          y2="750"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="0.5"
        />

        {/* Diagonal construction lines */}
        <line
          x1="0"
          y1="900"
          x2="800"
          y2="0"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="0.5"
        />

        <line
          x1="800"
          y1="900"
          x2="1600"
          y2="0"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="0.5"
        />

        {/* Large circle */}
        <circle
          cx="800"
          cy="450"
          r="310"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="0.6"
        />

        {/* Inner circle */}
        <circle
          cx="800"
          cy="450"
          r="155"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />

        {/* Dashed orbit */}
        <circle
          cx="800"
          cy="450"
          r="235"
          fill="none"
          stroke="rgba(255,255,255,0.11)"
          strokeWidth="0.5"
          strokeDasharray="3 9"
        />

        {/* Triangle */}
        <polygon
          points="800,115 1125,680 475,680"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.6"
        />

        {/* Vertical axis */}
        <line
          x1="800"
          y1="0"
          x2="800"
          y2="900"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="0.5"
        />

        {/* Center crosshair */}
        <line
          x1="770"
          y1="450"
          x2="830"
          y2="450"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.6"
        />

        <line
          x1="800"
          y1="420"
          x2="800"
          y2="480"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.6"
        />

        {/* Target ring */}
        <circle
          cx="800"
          cy="450"
          r="32"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="0.7"
        />

        <circle
          cx="800"
          cy="450"
          r="6"
          fill="rgba(255,255,255,0.7)"
        />
      </svg>

      {/* Moving mathematical vector field */}
      <div
        className="pointer-events-none absolute left-0 right-0"
        style={{
          top: `${orbY}%`,
          transform: "translateY(-50%)",
        }}
      >
        {/* Infinite vector line */}
        <div
          className={`absolute left-0 right-0 h-px transition-opacity ${
            impact ? "opacity-100" : "opacity-30"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.25) 65%, transparent 100%)",
          }}
        />

        {/* Orb */}
        <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`rounded-full transition-all duration-100 ${
              impact ? "scale-[2.8]" : "scale-100"
            }`}
            style={{
              width: "9px",
              height: "9px",
              background: "white",
              boxShadow:
                "0 0 8px rgba(255,255,255,0.9), 0 0 25px rgba(255,255,255,0.45)",
            }}
          />

          {/* Orb crosshair */}
          <div className="absolute left-1/2 top-1/2 h-10 w-px -translate-x-1/2 -translate-y-1/2 bg-white/20" />

          <div className="absolute left-1/2 top-1/2 h-px w-10 -translate-x-1/2 -translate-y-1/2 bg-white/20" />
        </div>
      </div>

      {/* Precision target */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className={`relative h-20 w-20 rounded-full border transition-all duration-150 ${
            impact
              ? "scale-125 border-white/70"
              : "border-white/20"
          }`}
        >
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />

          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/10" />

          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60" />
        </div>
      </div>

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.life,
              boxShadow: "0 0 8px rgba(255,255,255,0.8)",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      {/* Very subtle central atmosphere */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 68%)",
        }}
      />

      {/* Combo visual — no words */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.4em] text-white/20 transition-opacity duration-300"
        style={{
          opacity: combo > 0 ? Math.min(0.6, combo * 0.08) : 0,
        }}
      >
        ×{combo}
      </div>
    </main>
  )
}