import React from 'react';

// 1. Define explicit types for production stability
interface DetailProps {
  label: string;
  value: string | number | null | undefined;
  allowCopy?: boolean; // New feature: adds a premium UX touch for hashes, IDs, or account numbers
}

// 2. Memoized component to optimize rendering inside large detail panels/lists
export const Detail: React.FC<DetailProps> = React.memo(({ 
  label, 
  value, 
  allowCopy = false 
}) => {
  // Guard clause for empty or missing data values
  const displayValue = value !== null && value !== undefined && value !== '' ? value : '—';

  const handleCopy = async () => {
    if (!allowCopy || !value) return;
    try {
      await navigator.clipboard.writeText(value.toString());
      // Optional: Trigger a global toast notification here if your project uses one
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="group flex flex-col space-y-1.5 py-1">
      {/* Label: Clear tracking, highly readable, and muted */}
      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 transition-colors group-hover:text-zinc-400">
        {label}
      </span>

      {/* Value Container */}
      <div className="flex items-center space-x-2">
        <p 
          onClick={handleCopy}
          className={`text-sm font-medium text-zinc-100 break-words ${
            allowCopy 
              ? 'cursor-pointer select-all hover:text-white underline decoration-zinc-700 decoration-dashed underline-offset-4 transition-colors' 
              : ''
          }`}
        >
          {displayValue}
        </p>

        {/* Subtle copy indicator for data-dense interfaces */}
        {allowCopy && value && (
          <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-[10px] text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50 pointer-events-none">
            Copy
          </span>
        )}
      </div>
    </div>
  );
});

Detail.displayName = 'Detail';
export default Detail;
