'use client';

import React, { useEffect, useRef } from 'react';
import Detail from "./Detail";

// 1. Define explicit types for data structures and event callbacks
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
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | string;
  wallet_id?: string | null;
  profiles?: TransactionProfile | null;
}

interface TransactionDrawerProps {
  transaction: TransactionData | null | undefined;
  onClose: () => void;
  onCopy: (reference: string) => void; // Enhanced: passes reference directly to callback
  onViewWallet: (walletId: string) => void; // Enhanced: passes wallet ID directly
  onFreezeWallet: (walletId: string) => void; // Enhanced: passes wallet ID directly
}

export default function TransactionDrawer({
  transaction,
  onClose,
  onCopy,
  onViewWallet,
  onFreezeWallet,
}: TransactionDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // 2. Production UX: Handle closing drawer via Escape key
  useEffect(() => {
    if (!transaction) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling while the drawer is active
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [transaction, onClose]);

  // 3. Production UX: Close drawer when clicking outside the container
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!transaction) return null;

  // Safe currency conversion utility
  const formattedAmount = (): string => {
    const numericAmount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
    return isNaN(numericAmount) 
      ? 'KSh 0' 
      : `KSh ${numericAmount.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
  };

  // Status badge style lookup engine
  const getStatusStyles = (status: string) => {
    const normalized = status.toUpperCase();
    if (normalized.includes('SUCC') || normalized === 'COMPLETED') return 'text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit text-xs tracking-wider';
    if (normalized.includes('PEND') || normalized === 'PROCESSING') return 'text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 w-fit text-xs tracking-wider';
    return 'text-red-400 font-semibold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 w-fit text-xs tracking-wider';
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all duration-300 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Sliding Sheet Panel */}
      <div
        ref={drawerRef}
        className="flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-2xl transition-transform duration-300 ease-out animate-slide-in"
      >
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
          <h2 id="drawer-title" className="text-lg font-bold tracking-tight text-zinc-100">
            Transaction Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Close drawer"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Scrollable Data Body */}
        <div className="mt-6 flex-1 space-y-5 overflow-y-auto pr-1">
          <Detail
            label="User"
            value={transaction.profiles?.username || "Unknown"}
          />

          <Detail
            label="Amount"
            value={formattedAmount()}
          />

          <div className="grid grid-cols-2 gap-4">
            <Detail label="Type" value={transaction.type} />
            <Detail label="Category" value={transaction.category} />
          </div>

          <Detail
            label="Payment Method"
            value={transaction.payment_method}
          />

          {/* Uses copy feature built into refactored Detail code */}
          <Detail
            label="Reference"
            value={transaction.reference}
            allowCopy
          />

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </span>
            <div className="mt-1.5">
              <span className={getStatusStyles(transaction.status)}>
                {transaction.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="mt-6 space-y-3 border-t border-zinc-800/60 pt-4">
          <button
            onClick={() => onCopy(transaction.reference)}
            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:bg-zinc-800 active:bg-zinc-850"
          >
            <span>📋</span>
            <span>Copy Reference</span>
          </button>

          <button
            onClick={() => transaction.wallet_id && onViewWallet(transaction.wallet_id)}
            disabled={!transaction.wallet_id}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-zinc-100 py-3 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50"
          >
            <span>👛</span>
            <span>View Wallet</span>
          </button>

          {transaction.wallet_id && (
            <button
              onClick={() => onFreezeWallet(transaction.wallet_id!)}
              className="flex w-full items-center justify-center space-x-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 active:bg-red-500/30"
            >
              <span>🔒</span>
              <span>Freeze Wallet</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
