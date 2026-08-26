'use client';

import React, { ReactNode, useCallback, useRef } from 'react';
import { Copy, Search } from 'lucide-react';

interface DetailProps {
  label: string;
  value: ReactNode;
  allowCopy?: boolean;
}

export const Detail: React.FC<DetailProps> = React.memo(({ 
  label, 
  value, 
  allowCopy = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isStringOrNumber = typeof value === 'string' || typeof value === 'number';
  const displayValue = value === null || value === undefined || value === '' ? '—' : value;

  // Real-time container-wide mouse tracking formula for reactive spotlight glare
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    container.style.setProperty('--mouse-x', `${x}px`);
    container.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCopy = useCallback(async () => {
    if (!allowCopy || !value || !isStringOrNumber) return;
    try {
      await navigator.clipboard.writeText(String(value));
    } catch (err) {
      console.error('Failed to execute text copy sequence:', err);
    }
  }, [allowCopy, value, isStringOrNumber]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col space-y-0.5 py-1 px-1.5 -mx-1.5 rounded-md transition-colors hover:bg-zinc-900/30" 
      role="row"
    >
      {/* Dynamic Proximity Spotlight Backlight across the entire row column */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 rounded-md"
        style={{
          background: `radial-gradient(52px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.025), transparent)`,
        }}
      />

      {/* Label Heading Element */}
      <dt className="relative z-10 text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-colors group-hover:text-zinc-400 select-none">
        {label}
      </dt>

      {/* Structured Content Container */}
      <dd className="relative z-10 flex items-center justify-between space-x-2 min-w-0">
        <span className="text-[11px] font-medium text-zinc-200 tracking-wide font-mono break-all line-clamp-2 min-w-0">
          {displayValue}
        </span>

        {/* Dynamic Contextual Action Layer */}
        {isStringOrNumber && value && (
          <div className="flex items-center shrink-0">
            {allowCopy ? (
              /* High-Density Copy Engine with Proximity Clarity */
              <button
                onClick={handleCopy}
                type="button"
                className="inline-flex items-center p-1 rounded border border-zinc-800/80 bg-zinc-900/40 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:text-zinc-200 hover:border-zinc-700/50 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                title={`Copy ${label}`}
                aria-label={`Copy ${label}`}
              >
                <Copy className="h-3 w-3 transition-transform active:scale-90 pointer-events-none stroke-[2.5]" />
              </button>
            ) : (
              /* Micro-Magnifier Data Inspection Asset */
              <div 
                className="p-1 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none"
                aria-hidden="true"
              >
                <Search className="h-3 w-3 stroke-[2.5]" />
              </div>
            )}
          </div>
        )}
      </dd>
    </div>
  );
});

Detail.displayName = 'Detail';
export default Detail;
