'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import Detail from "./Detail";
import TransactionTimeline from "./TransactionTimeline";
export interface TransactionProfile {
  username?: string | null;
}

export interface TransactionData {
  id: string;
  amount: number | string;
  type: string;
  category: string;
  payment_method: string;
  reference: string;
  status: string;
  description?: string | null;
  created_at?: string;
  wallet_id?: string | null;
  user_id?: string | null;
  profiles?: TransactionProfile | null;
}

interface TransactionDrawerProps {
  transaction: TransactionData | null | undefined;
  onClose: () => void;
  onCopy: (reference: string) => void;
  onViewWallet: (walletId: string) => void;
  onFreezeWallet: (walletId: string) => void;
}

export default function TransactionDrawer({
  transaction,
  onClose,
  onCopy,
  onViewWallet,
  onFreezeWallet,
}: TransactionDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape & Lock Body Scroll
  useEffect(() => {
    if (!transaction) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [transaction, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Performance-optimized layout & values calculation
  const formattedAmount = useMemo(() => {
    if (!transaction) return 'KSh 0';
    const num = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
    return isNaN(num) ? 'KSh 0' : `KSh ${num.toLocaleString('en-KE')}`;
  }, [transaction]);

  const statusBadge = useMemo(() => {
    if (!transaction) return null;
    const norm = transaction.status.toUpperCase();
    
    if (norm.includes('SUCC') || norm === 'COMPLETED') {
      return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Success</span>;
    }
    if (norm.includes('PEND') || norm === 'PROCESSING') {
      return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">Pending</span>;
    }
    return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">Failed</span>;
  }, [transaction]);

  const detailsList = useMemo(() => {
    if (!transaction) return [];
    return [
      { label: 'Status', value: statusBadge },
      { label: 'Amount', value: formattedAmount },
      { label: 'Transaction Type', value: transaction.type },
      { label: 'Category', value: transaction.category },
      { label: 'Payment Method', value: transaction.payment_method },
      { label: 'Username', value: transaction.profiles?.username },
      { label: 'Reference', value: transaction.reference, allowCopy: true },
      { label: 'Wallet ID', value: transaction.wallet_id, allowCopy: true },
      { label: 'User ID', value: transaction.user_id, allowCopy: true },
      { label: 'Description', value: transaction.description },
      {
        label: 'Created At',
        value: transaction.created_at
          ? new Date(transaction.created_at).toLocaleString('en-KE', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : null,
      },
    ];
  }, [transaction, formattedAmount, statusBadge]);

  if (!transaction) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-[1px] transition-all duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Sliding Sheet Panel */}
      <div
        ref={drawerRef}
        className="flex h-full w-full max-w-sm flex-col border-l border-zinc-900 bg-zinc-950 p-4 shadow-2xl transition-transform duration-200"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div>
            <h2 id="drawer-title" className="text-xs font-semibold tracking-tight text-zinc-100 uppercase opacity-90">
              Transaction Details
            </h2>
            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 tracking-wide">{transaction.id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-800"
            aria-label="Close drawer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dynamic Scrollable Body */}
        <div className="flex-1 mt-3.5 pr-0.5 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
          {detailsList.map(({ label, value, allowCopy }) => (
            <Detail
              key={label}
              label={label}
              value={value || '—'}
              allowCopy={allowCopy}
            />


            
          ))}
        </div>

<TransactionTimeline
  transaction={transaction}
/>


        {/* Action Panel Footer */}
        <div className="mt-4 space-y-1.5 border-t border-zinc-900 pt-3.5">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => onCopy(transaction.reference)}
              className="flex items-center justify-center space-x-1.5 rounded-md border border-zinc-900 bg-zinc-900/40 py-2 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-200"
            >
              <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Ref</span>
            </button>

            <button
              onClick={() => transaction.wallet_id && onViewWallet(transaction.wallet_id)}
              disabled={!transaction.wallet_id}
              className="flex items-center justify-center space-x-1.5 rounded-md bg-zinc-100 py-2 text-[11px] font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-30"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>View Wallet</span>
            </button>
          </div>

          {transaction.wallet_id && (
            <button
              onClick={() => onFreezeWallet(transaction.wallet_id!)}
              className="flex w-full items-center justify-center space-x-1.5 rounded-md border border-red-500/10 bg-red-500/5 py-2 text-[11px] font-medium text-red-400 transition-all hover:bg-red-500/10 active:bg-red-500/15"
            >
              <svg className="h-3.5 w-3.5 text-red-400/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Freeze Wallet Account</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
