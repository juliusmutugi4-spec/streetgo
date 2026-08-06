'use client';

import React from 'react';
import { Search, SlidersHorizontal, ArrowUpRight, ArrowDownLeft, Wallet, Inbox, ArrowRight } from 'lucide-react';

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
  
  // High-performance badge system
  const getStatusConfig = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'completed' || normalized === 'success') {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
    if (normalized === 'pending' || normalized === 'processing') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    }
    return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
  };

  // Safe regional currency localization
  const formatCurrency = (amount: number | string): string => {
    const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numericValue) 
      ? 'KSh 0' 
      : `KSh ${numericValue.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="mt-8 flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 shadow-2xl shadow-black/40 backdrop-blur-md">
      
      {/* Professional Title & Control Header */}
      <div className="flex flex-col gap-5 border-b border-zinc-800/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700/60">
              <Wallet className="h-4 w-4 text-zinc-400" />
            </div>
            <h2 className="text-base font-semibold tracking-tight text-zinc-100">
              Transaction History
            </h2>
          </div>
          <p className="text-xs text-zinc-400 pl-9.5">
            Monitor and audit real-time client account operations
          </p>
        </div>
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center lg:max-w-xl lg:justify-end">
          {/* Enhanced Search Input */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search user or statement..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-zinc-700 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            />
          </div>

          {/* Enhanced Filter Dropdown */}
          <div className="relative w-full sm:w-48">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full cursor-pointer appearance-none rounded-xl border border-zinc-800 bg-zinc-950/60 pl-10 pr-8 py-2 text-sm text-zinc-300 transition-all focus:border-zinc-700 focus:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            >
              <option value="all">All Operations</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="pending">Pending Status</option>
              <option value="completed">Completed Status</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px]">▼</div>
          </div>
        </div>
      </div>

      {/* Main Table Layout Container */}
      <div className="w-full overflow-x-auto">
        {/* Scrollable Layout Context wrapper */}
        <div className="max-h-[440px] min-w-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <table className="w-full border-collapse text-sm text-left">
            {/* Sticky Table Header prevents header disappearing during scroll */}
            <thead className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="p-4 font-medium backdrop-blur-sm bg-zinc-950/90">User Profile</th>
                <th className="p-4 font-medium backdrop-blur-sm bg-zinc-950/90">Type</th>
                <th className="p-4 font-medium text-right backdrop-blur-sm bg-zinc-950/90">Amount</th>
                <th className="p-4 font-medium text-center backdrop-blur-sm bg-zinc-950/90">Status</th>
                <th className="p-4 w-12 backdrop-blur-sm bg-zinc-950/90"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/40">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => onSelect(tx)}
                    className="group cursor-pointer bg-transparent transition-colors hover:bg-zinc-800/20"
                  >
                    {/* User Metadata */}
                    <td className="p-4 font-medium text-zinc-200 transition-colors group-hover:text-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800/50 border border-zinc-700/30 text-xs font-semibold uppercase text-zinc-400">
                          {(tx.profiles?.username || 'U').substring(0, 2)}
                        </div>
                        <span>{tx.profiles?.username || 'Unknown Account'}</span>
                      </div>
                    </td>

                    {/* Operational Type Direction Marker */}
                    <td className="p-4 text-zinc-400 capitalize">
                      <div className="flex items-center gap-2">
                        {tx.type.toLowerCase() === 'deposit' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" />
                        )}
                        <span>{tx.type}</span>
                      </div>
                    </td>

                    {/* Monospaced Numeric Data */}
                    <td className="p-4 text-right font-mono font-medium tracking-tight text-zinc-100">
                      <span className={tx.type.toLowerCase() === 'deposit' ? 'text-emerald-400' : 'text-zinc-100'}>
                        {tx.type.toLowerCase() === 'deposit' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Transaction Status Pill */}
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide capitalize ${getStatusConfig(tx.status)}`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>

                    {/* Interactive Action Indicator */}
                    <td className="p-4 text-right">
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-1 text-zinc-400 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                    </td>
                  </tr>
                ))
              ) : (
                /* Premium Empty State Frame */
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 border border-zinc-850 text-zinc-500 shadow-inner mb-4">
                        <Inbox className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-zinc-300">No ledger entities found</p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                        No transactions match your filter criteria. Try adjusting keywords or selecting another operation type.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
