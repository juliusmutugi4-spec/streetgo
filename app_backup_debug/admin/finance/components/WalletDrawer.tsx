'use client';

import { useEffect } from "react";
import Detail from "./Detail";

// 1. Strict TypeScript Interfaces
export interface WalletData {
  full_name: string;
  phone: string;
  balance: number | string;
  reax_balance: number | string;
  is_verified: boolean;
  money_wallet_active: boolean;
}

interface WalletDrawerProps {
  wallet: WalletData | null;
  onClose: () => void;
  onFreeze: () => void;
}

export default function WalletDrawer({
  wallet,
  onClose,
  onFreeze,
}: WalletDrawerProps) {
  
  // 2. Accessibility: Close drawer on Escape key press
  useEffect(() => {
    if (!wallet) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wallet, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (wallet) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [wallet]);

  if (!wallet) return null;

  return (
    // 3. Semantic Backdrop with Backdrop Click Closer
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Drawer Panel (Stop Propagation to prevent backdrop click trigger) */}
      <div
        className="w-full max-w-md border-l border-zinc-800 bg-zinc-900 p-6 shadow-2xl transition-transform duration-300 ease-out animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h2 id="drawer-title" className="text-xl font-bold text-zinc-100">
            Wallet Details
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-6 space-y-4">
          <Detail label="Full Name" value={wallet.full_name || "N/A"} />
          <Detail label="Phone" value={wallet.phone || "N/A"} />
          
          <Detail
            label="Balance"
            value={`KSh ${Number(wallet.balance || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
          
          <Detail
            label="REAX Balance"
            value={Number(wallet.reax_balance || 0).toLocaleString()}
          />
          
          <Detail label="Verified" value={wallet.is_verified ? "Yes" : "No"} />
          
          <Detail
            label="Wallet Status"
            value={wallet.money_wallet_active ? "🟢 Active" : "🔴 Frozen"}
          />

          {/* Conditional Alerts and Call to Actions */}
          {!wallet.money_wallet_active ? (
            <div
              className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
              role="alert"
            >
              ⚠️ This wallet is frozen. Deposits and withdrawals should be blocked.
            </div>
          ) : (
            <button
              onClick={onFreeze}
              className="w-full mt-6 rounded-xl border border-red-500/20 bg-red-600/20 py-3 font-medium text-red-400 transition-colors hover:bg-red-600/30 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              🔒 Freeze Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
