import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
const router = useRouter();
  // Close dropdown when clicking outside
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
    <div ref={menuRef} className="relative inline-block w-full max-w-[200px]">
      <button
        onClick={() => setShowReaxMenu(!showReaxMenu)}
        aria-haspopup="true"
        aria-expanded={showReaxMenu}
        className="flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-medium text-zinc-200 transition-all hover:bg-zinc-900 hover:text-zinc-50 active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        <span className="flex items-center gap-2 truncate">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span className="truncate font-semibold tracking-wide text-emerald-400">REAX</span>
        </span>
        <ChevronUp className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${showReaxMenu ? 'rotate-180' : ''}`} />
      </button>

      {showReaxMenu && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-48 origin-bottom-right rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150">
<button
  onClick={() => {
    setShowReaxMenu(false)
    onTopUpReax()
  }}
  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
>
  <Coins className="h-3.5 w-3.5 text-zinc-500" />
  <span>Top Up REAX</span>
</button>
          
<button
  onClick={() => {
    setShowReaxMenu(false)
    onWithdrawToWallet()
  }}
  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
>
  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
  <span>Withdraw to Wallet</span>
</button>
          
          <div className="my-1 border-t border-zinc-800" />
          
<button
  onClick={() => {
    setShowReaxMenu(false)
    onViewProgress()
  }}
  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-zinc-50"
>
  <BarChart3 className="h-3.5 w-3.5 text-zinc-500" />
  <span>View REAX Progress</span>
</button>
        </div>
      )}
    </div>
  );
}
