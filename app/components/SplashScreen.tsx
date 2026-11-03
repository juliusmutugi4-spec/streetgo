'use client'

import React from 'react'

export default function SplashScreen(_props: { progress?: number; status?: string }) {
  return (
    <main 
      className="streetgo-splash" 
      aria-busy="true" 
      aria-live="polite" 
      title="Loading Streetgo"
    >
      <div className="splash-content">
        {/* Premium Brand Typography */}
        <h1 className="brand" aria-label="Streetgo">
          <span className="text-street">Street</span>
          <span className="text-go">go</span>
        </h1>
        
        {/* Optimized GPU-Accelerated Loader */}
        <div className="loading-container" aria-hidden="true">
          {Array.from({ length: 15 }).map((_, i) => (
            <span 
              key={i} 
              className="loading-bar" 
              style={{ '--bar-index': i } as React.CSSProperties} 
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        .streetgo-splash {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #050706; /* Deeper, more premium obsidian black */
          color: #ffffff;
          /* Professional geometric sans-serif stack preferred by tech unicorns */
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }

        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        .brand {
          font-size: 48px;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin: 0;
          line-height: 1;
          display: flex;
          align-items: center;
        }

        .text-street {
          color: #ffffff;
          opacity: 0.95;
        }

        .text-go {
          color: #00e694; /* Slightly higher vibrance green for crisp OLED display presence */
          text-shadow: 0 0 30px rgba(0, 230, 148, 0.2); /* High-end subtle ambient glow */
        }

        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          height: 32px;
        }

        .loading-bar {
          width: 3.5px;
          height: 18px;
          border-radius: 99px;
          background-color: #00e694;
          transform-origin: center;
          /* Using transform scales instead of modifying height directly to leverage GPU acceleration */
          animation: fluid-pulse 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: calc(var(--bar-index) * 0.12s);
          will-change: transform, opacity;
        }

        @keyframes fluid-pulse {
          0%, 100% {
            transform: scaleY(0.4) rotate(0deg);
            opacity: 0.25;
          }
          50% {
            transform: scaleY(1.3) rotate(8deg);
            opacity: 1;
          }
        }

        /* Essential fallback for enterprise users with accessibility needs */
        @media (prefers-reduced-motion: reduce) {
          .loading-bar {
            animation: fluid-fade 2s ease-in-out infinite alternate;
            animation-delay: 0s;
            transform: scaleY(1) rotate(0deg);
          }
          
          @keyframes fluid-fade {
            from { opacity: 0.3; }
            to { opacity: 0.9; }
          }
        }
      `}</style>
    </main>
  )
}




