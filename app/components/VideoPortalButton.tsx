'use client'

import { useState, useEffect, useRef, MouseEvent } from 'react'
import SimilarVideosMenu from './SimilarVideosMenu'

interface VideoPortalButtonProps {
  showVideoPortal: boolean
  portalVideos: any[]
  loadPortalVideos: () => Promise<void>
  showSimilarVideos: boolean
  setShowSimilarVideos: React.Dispatch<React.SetStateAction<boolean>>
  onSelect: (video: any) => void
}

export default function VideoPortalButton({
  showVideoPortal,
  portalVideos,
  loadPortalVideos,
  showSimilarVideos,
  setShowSimilarVideos,
  onSelect,
}: VideoPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [systemError, setSystemError] = useState(false)
  
  // Proximity & Magnet Effect State
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [proximityScore, setProximityScore] = useState(0) // 0 to 1 based on mouse closeness

  // Track cursor proximity for dynamic intelligence glow
  useEffect(() => {
    if (!showVideoPortal) return

    const handleGlobalMouseMove = (e: globalThis.MouseEvent) => {
      if (!buttonRef.current) return
      
      const rect = buttonRef.current.getBoundingClientRect()
      const btnX = rect.left + rect.width / 2
      const btnY = rect.top + rect.height / 2
      
      const distance = Math.hypot(e.clientX - btnX, e.clientY - btnY)
      const maxRange = 250 // Active activation zone in pixels
      
      if (distance < maxRange) {
        const score = (maxRange - distance) / maxRange
        setProximityScore(parseFloat(score.toFixed(2)))
      } else {
        setProximityScore(0)
      }
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove)
  }, [showVideoPortal])

  if (!showVideoPortal) return null

  // Interactive Magnetic Hover Matrix
  const handleInterfaceMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) * 0.35 // Dampened magnet intensity
    const y = (e.clientY - rect.top - rect.height / 2) * 0.35
    setCoords({ x, y })
  }

  const handleInterfaceMouseLeave = () => {
    setCoords({ x: 0, y: 0 })
  }

  const handleToggleMenu = async () => {
    // If menu is already open, close it.
    if (showSimilarVideos) {
      setShowSimilarVideos(false)
      return
    }

    // Load videos only once.
    if (portalVideos.length === 0) {
      setIsLoading(true)
      setSystemError(false)

      try {
        await loadPortalVideos()
      } catch (error) {
        console.error(error)
        setSystemError(true)
        return
      } finally {
        setIsLoading(false)
      }
    }

    // Open menu AFTER videos are ready.
    setShowSimilarVideos(true)
  }

  return (
    /* Changed top-8 right-8 to top-0 right-0 to maximize corner reach */
    <div className="absolute top-0 right-0 z-50 flex flex-col items-end gap-3 font-mono select-none antialiased">
      
      {/* Sci-Fi Floating Telemetry HUD Label */}
      <div 
        className="text-[9px] uppercase tracking-[0.25em] transition-all duration-300 flex items-center gap-1.5 mt-6 mr-6"
        style={{ 
          color: systemError ? '#ef4444' : isLoading ? '#a21caf' : showSimilarVideos ? '#22d3ee' : '#64748b',
          opacity: proximityScore > 0.1 || showSimilarVideos ? 1 : 0,
          transform: `translateY(${proximityScore > 0.1 ? '0px' : '4px'})`
        }}
      >
        <span className={`h-1 w-1 rounded-full ${isLoading ? 'animate-ping bg-fuchsia-500' : systemError ? 'bg-red-500' : 'bg-cyan-400'}`} />
        {systemError ? 'SYS_ERR_01' : isLoading ? 'SYNCING_MATRIX' : showSimilarVideos ? 'PORTAL_ACTIVE' : 'READY_TO_SCAN'}
      </div>

      {/* Cybernetic Intelligence Core Button */}
<button
  ref={buttonRef}
  onClick={handleToggleMenu}
  onMouseMove={handleInterfaceMouseMove}
  onMouseLeave={handleInterfaceMouseLeave}
  disabled={isLoading && !systemError}
  aria-label="Initialize Quantum Interface Portal"
  style={{
    transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
    boxShadow: systemError
      ? `0 0 ${6 + proximityScore * 12}px rgba(239, 68, 68, ${0.3 + proximityScore * 0.5})`
      : showSimilarVideos
      ? `0 0 14px rgba(34, 211, 238, 0.6), inset 0 0 6px rgba(34, 211, 238, 0.4)`
      : `0 0 ${2 + proximityScore * 14}px rgba(34, 211, 238, ${proximityScore * 0.5})`,
    borderColor: systemError 
      ? '#ef4444' 
      : showSimilarVideos 
      ? '#22d3ee' 
      : `rgba(34, 211, 238, ${0.1 + proximityScore * 0.7})`
  }}
  className="
    group
    relative
    flex
    h-6
    w-6
    items-center
    justify-center
    rounded-full
    border
    bg-slate-950/90
    backdrop-blur-md
    transition-all
    duration-150
    ease-out
    disabled:cursor-not-allowed
    mr-6
  "
>
  {/* Sub-Atomic Quantum Aura */}
  <div 
    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-cyan-400/30 via-transparent to-fuchsia-500/30 transition-opacity duration-250 mix-blend-screen"
    style={{ opacity: proximityScore }}
  />

  {/* High-Density Nanotech Vector Reticle */}
  <svg 
    className="absolute inset-0 h-full w-full -rotate-90 transition-transform duration-500 group-hover:rotate-45" 
    viewBox="0 0 24 24" 
    fill="none"
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="0.5" 
      className="text-slate-800/60 transition-colors duration-200 group-hover:text-cyan-500/40"
      strokeDasharray="2 3" 
    />
    <circle 
      cx="12" 
      cy="12" 
      r="8" 
      stroke="currentColor" 
      strokeWidth="0.75" 
      style={{ strokeDashoffset: isLoading ? 0 : 50 - (proximityScore * 50) }}
      className={`transition-all duration-200 ${systemError ? 'text-red-400/50' : 'text-cyan-300/50'} ${isLoading ? 'animate-[spin_2s_linear_infinite]' : ''}`}
      strokeDasharray="15 50" 
    />
  </svg>

  {/* Micro-Laser Peripheral Locks */}
  <div className="absolute inset-1.5 border-[0.5px] border-cyan-400/0 opacity-0 transition-all duration-300 group-hover:inset-1 group-hover:border-cyan-400/30 group-hover:opacity-100 rounded-full" />
  
  {/* Singularity Interface Core Node */}
  <span
    className={`
      h-1.5
      w-1.5
      rounded-full
      transition-all
      duration-200
      ${isLoading ? 'bg-fuchsia-400 shadow-[0_0_6px_#d946ef] scale-75 animate-pulse' : ''}
      ${systemError ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : ''}
      ${!isLoading && !systemError && showSimilarVideos ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] scale-110' : ''}
      ${!isLoading && !systemError && !showSimilarVideos ? 'bg-slate-600 group-hover:bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.3)]' : ''}
    `}
    style={{
      transform: !isLoading && !systemError ? `scale(${1 + proximityScore * 0.4})` : undefined
    }}
  />

  {/* High-Frequency Tachyon Waves */}
  {!showSimilarVideos && !isLoading && !systemError && proximityScore > 0.6 && (
    <span 
      className="absolute h-full w-full rounded-full border border-cyan-400/60 animate-[ping_1.2s_infinite]" 
      style={{ animationDuration: `${1.8 - proximityScore * 1.2}s` }} 
    />
  )}
</button>


      {/* Quantum Display Matrix Dropdown Container */}
      {showSimilarVideos && (
        <div className="relative w-full min-h-[1px] pr-6 animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)] origin-top-right">
          <SimilarVideosMenu
            videos={portalVideos}
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  )
}
