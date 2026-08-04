'use client';

import React, { useMemo } from 'react';

interface TransactionTimelineProps {
  transaction: {
    created_at?: string;
    payment_method?: string;
    reference?: string;
    status?: string;
  };
}

export default function TransactionTimeline({
  transaction,
}: TransactionTimelineProps) {
  // Memoize events array calculation to isolate data streams and optimize component updates
  const timelineEvents = useMemo(() => {
    const createdTime = transaction.created_at
      ? new Date(transaction.created_at).toLocaleString('en-KE', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '—';

    const normalizedStatus = transaction.status?.toUpperCase() || '';
    
    // Evaluate operational metrics to assign real-time server color patterns
    let statusRingColor = 'bg-zinc-800 ring-zinc-800/50';
    let statusTextColor = 'text-zinc-400';
    
    if (normalizedStatus.includes('SUCC') || normalizedStatus === 'COMPLETED') {
      statusRingColor = 'bg-emerald-500 ring-emerald-500/20';
      statusTextColor = 'text-emerald-400';
    } else if (normalizedStatus.includes('PEND') || normalizedStatus === 'PROCESSING') {
      statusRingColor = 'bg-amber-500 ring-amber-500/20';
      statusTextColor = 'text-amber-400';
    } else if (normalizedStatus) {
      statusRingColor = 'bg-red-500 ring-red-500/20';
      statusTextColor = 'text-red-400';
    }

    return [
      {
        id: 'created',
        title: 'Transaction Initialized',
        nodeColor: 'bg-blue-500 ring-blue-500/20',
        content: <span className="text-[11px] text-zinc-500 font-mono tracking-wide">{createdTime}</span>,
      },
      {
        id: 'payment',
        title: 'Channel Route Verified',
        nodeColor: 'bg-indigo-500 ring-indigo-500/20',
        content: (
          <div className="flex flex-col space-y-0.5 mt-0.5">
            <span className="text-[11px] text-zinc-300 font-medium tracking-wide">
              {transaction.payment_method || '—'}
            </span>
            {transaction.reference && (
              <span className="text-[10px] text-zinc-500 font-mono break-all tracking-normal">
                Ref: {transaction.reference}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        title: 'Settlement Outcome',
        nodeColor: statusRingColor,
        content: (
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${statusTextColor}`}>
            {transaction.status || 'Unknown'}
          </span>
        ),
      },
    ];
  }, [transaction]);

  return (
    <div className="mt-6 border-t border-zinc-900 pt-5">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-4 select-none">
        Operational Log
      </h3>

      {/* Semantic accessible context tracking timeline blocks */}
      <ol className="relative space-y-4 pl-3.5 before:absolute before:left-[5px] before:top-1 before:bottom-1 before:w-[1px] before:bg-zinc-900">
        {timelineEvents.map(({ id, title, nodeColor, content }) => (
          <li key={id} className="relative flex items-start space-x-3.5 group" role="status">
            {/* Micro Node Visual Ring Indicator */}
            <div 
              className={`absolute -left-[13.5px] mt-1 h-2 w-2 rounded-full ring-4 transition-all duration-300 group-hover:scale-110 ${nodeColor}`} 
              aria-hidden="true"
            />
            
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-zinc-200 tracking-tight transition-colors group-hover:text-white select-none">
                {title}
              </span>
              <div className="mt-0.5 min-w-0">
                {content}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
