'use client';

import React, { useMemo } from 'react';
import Detail from './Detail';

export interface TransactionDetailListProps {
  transaction: {
    status?: string;
    amount?: number | string;
    type?: string;
    category?: string;
    payment_method?: string;
    profiles?: {
      username?: string | null;
    } | null;
    reference?: string;
    wallet_id?: string | null;
    user_id?: string | null;
    description?: string | null;
    created_at?: string;
  };
  formattedAmount: () => string;
}

export default function TransactionDetailList({
  transaction,
  formattedAmount,
}: TransactionDetailListProps) {
  // Execute function outer value to cleanly isolate useMemo tracking hooks
  const displayAmount = formattedAmount();

  const details = useMemo(() => {
    // Isolated lookup table for micro-scaled status badges
    const getStatusBadge = (status?: string) => {
      if (!status) return '—';
      const norm = status.toUpperCase();
      if (norm.includes('SUCC') || norm === 'COMPLETED') {
        return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Success</span>;
      }
      if (norm.includes('PEND') || norm === 'PROCESSING') {
        return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">Pending</span>;
      }
      return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">Failed</span>;
    };

    return [
      { label: 'Status', value: getStatusBadge(transaction.status) },
      { label: 'Amount', value: displayAmount },
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
  }, [transaction, displayAmount]);

  return (
    <dl className="flex-1 mt-3.5 pr-0.5 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
      {details.map(({ label, value, allowCopy }) => (
        <Detail
          key={label}
          label={label}
          value={value || '—'}
          allowCopy={allowCopy}
        />
      ))}
    </dl>
  );
}
