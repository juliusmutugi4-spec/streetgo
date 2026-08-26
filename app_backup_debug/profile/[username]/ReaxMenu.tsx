import { useState, useRef, useEffect } from 'react';
import { Sparkles, Coins, ArrowUpRight, BarChart3, ChevronUp } from 'lucide-react';

interface ReaxMenuProps {
  onTopUpReax: () => void
  onWithdrawToWallet: () => void
  onViewProgress: () => void
}

export default function ReaxMenu({
  onTopUpReax,
  onWithdrawToWallet,
  onViewProgress,
}: ReaxMenuProps) {
  const [showReaxMenu, setShowReaxMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowReaxMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative inline-block w-full max-w-[180px] font-sans antialiased">
      {/* Trigger Button */}
      <button
        onClick={() => setShowReaxMenu(!showReaxMenu)}
        aria-haspopup="true"
        aria-expanded={showReaxMenu}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-[#262626] bg-[#0d0d0d] px-2.5 py-1.5 text-left transition-all duration-150 hover:border-[#3a3a3a] hover:bg-[#121212] focus:outline-none focus:ring-1 focus:ring-[#10b981]/40"
      >
        <span className="flex items-center gap-1.5 truncate">
          <Sparkles className="h-3 w-3 text-[#34d399] shrink-0" strokeWidth={2.2} />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#34d399]">
            REAX 
          </span>
        </span>
        <ChevronUp className={`h-3 w-3 text-[#525252] transition-transform duration-200 shrink-0 ${showReaxMenu ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>

      {/* Micro Floating Dropdown Matrix */}
      {showReaxMenu && (
        <div className="absolute bottom-full right-0 z-50 mb-1.5 w-44 origin-bottom-right rounded-lg border border-[#1f1f1f] bg-[#0d0d0d] p-1 shadow-xl shadow-black/50 animate-in fade-in slide-in-from-bottom-1 duration-100">
          
          <button
            onClick={() => {
              setShowReaxMenu(false)
              onTopUpReax()
            }}
            className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[#171717]"
          >
            <div className="flex items-center gap-2 truncate">
              <Coins className="h-3 w-3 text-[#525252] transition-colors group-hover:text-[#a3a3a3]" strokeWidth={2} />
              <span className="text-[10px] font-medium text-[#d4d4d4] group-hover:text-[#f5f5f7]">Top Up REAX</span>
            </div>
            <span className="font-mono text-[7px] font-bold text-[#525252] uppercase tracking-normal opacity-0 group-hover:opacity-100 transition-opacity">Deposit</span>
          </button>
          
          <button
            onClick={() => {
              setShowReaxMenu(false)
              onWithdrawToWallet()
            }}
            className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[#171717]"
          >
            <div className="flex items-center gap-2 truncate">
              <ArrowUpRight className="h-3 w-3 text-[#525252] transition-colors group-hover:text-[#a3a3a3]" strokeWidth={2} />
              <span className="text-[10px] font-medium text-[#d4d4d4] group-hover:text-[#f5f5f7]">Withdraw to Wallet</span>
            </div>
            <span className="font-mono text-[7px] font-bold text-[#525252] uppercase tracking-normal opacity-0 group-hover:opacity-100 transition-opacity">Exit</span>
          </button>
          
          <div className="my-1 border-t border-[#1f1f1f]" />
          
          <button
            onClick={() => {
              setShowReaxMenu(false)
              onViewProgress()
            }}
            className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors duration-150 hover:bg-[#171717]"
          >
            <div className="flex items-center gap-2 truncate">
              <BarChart3 className="h-3 w-3 text-[#525252] transition-colors group-hover:text-[#a3a3a3]" strokeWidth={2} />
              <span className="text-[10px] font-medium text-[#d4d4d4] group-hover:text-[#f5f5f7]">View REAX Progress</span>
            </div>
            <span className="font-mono text-[7px] font-bold text-[#34d399] uppercase tracking-normal bg-[#064e3b]/20 border border-[#065f46]/30 px-1 rounded-sm">Stats</span>
          </button>
          
        </div>
      )}
    </div>
  );
}
