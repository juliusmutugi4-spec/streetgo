import React from 'react';

// 1. Define strict, reusable TypeScript interfaces
interface CardProps {
  title: string;
  value: string | number;
}

interface SummaryData {
  total_deposits: number | string;
  total_withdrawals: number | string;
  pending_transactions: number;
  total_transactions: number;
}

interface ExtraFinanceData {
  todayRevenue: number;
  activeWallets: number;
  totalWalletBalance: number;
}

interface FinanceCardsProps {
  summary: SummaryData | null | undefined;
  extraFinance: ExtraFinanceData | null | undefined;
}

// 2. Extracted Card component with strict types, memoization, and premium UI styling
const Card: React.FC<CardProps> = React.memo(({ title, value }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40">
      {/* Subtle top glare effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-zinc-800/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 transition-colors group-hover:text-zinc-400">
        {title}
      </p>

      <h2 className="mt-4 font-mono text-3xl font-bold tracking-tight text-zinc-100">
        {value}
      </h2>
    </div>
  );
});

Card.displayName = 'Card';

// 3. Main Dashboard Grid Component
export default function FinanceCards({ summary, extraFinance }: FinanceCardsProps) {
  // Guard clause for production safety
  if (!summary || !extraFinance) {
    return null;
  }

  // Safe helper function to format currency
  const formatCurrency = (amount: number | string): string => {
    const numericValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(numericValue) 
      ? 'KSh 0' 
      : `KSh ${numericValue.toLocaleString('en-KE', { minimumFractionDigits: 0 })}`;
  };

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        title="Total Deposits"
        value={formatCurrency(summary.total_deposits)}
      />

      <Card
        title="Withdrawals"
        value={formatCurrency(summary.total_withdrawals)}
      />

      <Card
        title="Pending"
        value={summary.pending_transactions.toLocaleString()}
      />

      <Card
        title="Transactions"
        value={summary.total_transactions.toLocaleString()}
      />

      <Card
        title="Today's Revenue"
        value={formatCurrency(extraFinance.todayRevenue)}
      />

      <Card
        title="Active Wallets"
        value={extraFinance.activeWallets.toLocaleString()}
      />

      <Card
        title="Money In Wallets"
        value={formatCurrency(extraFinance.totalWalletBalance)}
      />
    </div>
  );
}
