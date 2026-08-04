'use client';

import React from 'react';

// 1. Strict structural interfaces replacing 'any' definitions
export interface TransactionRowProfile {
  username?: string | null;
}

export interface TransactionListItem {
  id: string | number;
  amount: number | string;
  type: string;
  status: 'completed' | 'pending' | 'failed' | string;
  profiles?: TransactionRowProfile | null;
}

interface TransactionsTableProps {
  transactions: TransactionListItem[];
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  onSelect: (transaction: TransactionListItem) => void;
}

export default function TransactionsTable({
  transactions,
  search,
  setSearch,
  filter,
  setFilter,
  onSelect,
}: TransactionsTableProps) {
  
  // Dynamic status-badge design engine 
  const getStatusBadgeClass = (status: string): string => {
    const normalized = status.toLowerCase();
    if (normalized === 'completed' || normalized === 'success') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    if (normalized === 'pending' || normalized === 'processing') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  // Safe formatting engine for currency data rows
  const formatCurrency = (amount: number | string): string => {
    const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numericValue) 
      ? 'KSh 0' 
      : `KSh ${numericValue.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
      {/* Control Header: Dynamic input layout controls */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 p-5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold tracking-tight text-zinc-100">
          Recent Transactions
        </h2>
        
        <div className="flex flex-1 flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search reference or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-300 transition-colors focus:border-zinc-700 focus:outline-none sm:w-44"
          >
            <option value="all">All Operations</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="pending">Pending Status</option>
            <option value="completed">Completed Status</option>
          </select>
        </div>
      </div>

      {/* Structured Content Context */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-left">
          <thead className="border-b border-zinc-800 bg-zinc-950/40 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Type</th>
              <th className="p-4 font-semibold text-right">Amount</th>
              <th className="p-4 font-semibold text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/60">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => onSelect(tx)}
                  className="group cursor-pointer bg-transparent transition-colors hover:bg-zinc-800/30"
                >
                  <td className="p-4 font-medium text-zinc-200 transition-colors group-hover:text-white">
                    {tx.profiles?.username || 'Unknown'}
                  </td>
                  <td className="p-4 text-zinc-400 capitalize">
                    {tx.type}
                  </td>
                  <td className="p-4 text-right font-mono font-semibold text-zinc-100">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <span className={`rounded-md px-2.5 py-0.5 text-xs font-medium tracking-wide capitalize ${getStatusBadgeClass(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              /* Premium Empty Data Frame State */
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <span className="text-2xl">🔍</span>
                    <p className="text-sm font-medium text-zinc-400">No transactions found</p>
                    <p className="text-xs text-zinc-500">Try adjusting your filters or search keywords</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
