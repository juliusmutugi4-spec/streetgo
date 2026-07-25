'use client'


import TopUpReaxModal from "./TopUpReaxModal"
import { useState } from "react"
import ReaxMenu from "./ReaxMenu"
import WithdrawReaxModal from "./WithdrawReaxModal"
import {
  Calendar,
  MapPin,
  Link2,
  Mail,
  Phone,
  ShieldCheck,
  Wallet,
  Plus,
  Send,
  History,
  Lock,
  CheckCircle2
} from "lucide-react"
interface Props {
  profile: any
  isOwner: boolean
  wallet: any
  refreshWallet: () => Promise<void>
  onTopUp: () => void
  onSend: () => void
}

export default function ProfileInfo({
  profile,
  isOwner,
  wallet,
  refreshWallet,
  onTopUp,
  onSend,
}: Props) {
  const joinDate = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : "Jul 2026"
    
  const rawPhone = profile?.phone || "+254700000000"
  const cleanPhone = rawPhone.replace(/\s+/g, '')
  const websiteUrl = profile?.website || "streetgo.app"
  const formattedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`
  const userEmail = profile?.email || "support@streetgo.app"
const [showTopUpReax, setShowTopUpReax] = useState(false)
const [showWithdrawReax, setShowWithdrawReax] = useState(false)
  return (
    <div className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2.5 font-sans antialiased text-zinc-300 selection:bg-sky-500/20 shadow-md">
      
      {/* ========================================== */}
      {/* MICRO HEADER ACTION RIBBON */}
      {/* ========================================== */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5 mb-2">
        <div className="flex items-center gap-1">
          {/* Compact Trust Badge */}
          <div className="flex items-center gap-0.5 bg-sky-500/5 border border-sky-500/20 rounded px-1.5 py-0.5 text-sky-400">
            <CheckCircle2 size={9} className="fill-sky-400 text-zinc-950 shrink-0" />
            <span className="text-[8px] font-bold uppercase tracking-wider">
              {profile?.role === 'driver' ? 'Verified Pro' : 'Verified'}
            </span>
          </div>

          {/* Secure Ping Indicator */}
          <div className="flex items-center gap-1 bg-emerald-500/5 border border-emerald-500/10 rounded px-1 py-0.5 text-emerald-400 text-[8px] font-semibold uppercase tracking-wider">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-500 text-[7px]">Secure</span>
          </div>
        </div>

        {/* Dense Join Stamp */}
        <div className="flex items-center gap-0.5 text-[9px] text-zinc-500 font-medium">
          <Calendar size={10} className="shrink-0 text-zinc-600" />
          <span>{joinDate}</span>
        </div>
      </div>

      {/* ========================================== */}
      {/* DENSE GRID BODY */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        
        {/* LEFT COLUMN: CONDENSED CONTACT DETAILS */}
        <div className={`${ isOwner ? "md:col-span-7" : "md:col-span-12" } grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-[10px]`}>
          
          {/* Location */}
          <div className="flex items-center gap-1.5 min-w-0 group">
            <MapPin size={11} className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors" />
            <span className="text-zinc-400 truncate">{profile?.location || "Kirinyaga baricho"}</span>
          </div>

          {/* Website */}
          <div className="flex items-center gap-1.5 min-w-0 group">
            <Link2 size={11} className="text-zinc-600 shrink-0 group-hover:text-sky-400 transition-colors" />
            <a href={formattedUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors truncate font-medium underline-offset-2 hover:underline">
              {websiteUrl}
            </a>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-1.5 min-w-0 group">
            <Phone size={11} className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors" />
            <a href={`tel:${cleanPhone}`} className="text-zinc-400 hover:text-sky-400 transition-colors truncate">
              {rawPhone}
            </a>
          </div>

          {/* Email */}
          <div className="flex items-center gap-1.5 min-w-0 group">
            <Mail size={11} className="text-zinc-600 shrink-0 group-hover:text-zinc-400 transition-colors" />
            <a href={`mailto:${userEmail}`} className="text-zinc-400 hover:text-zinc-100 transition-colors truncate">
              {userEmail}
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN: MICRO WALLET MODULE */}
        {isOwner && (
          <div className="md:col-span-5 bg-gradient-to-b from-zinc-900/40 to-zinc-900/10 border border-zinc-900 rounded-lg p-2 shadow-inner">
            
            {/* Top Row: Meta Descriptor */}
            <div className="flex items-center justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <Wallet size={10} className="text-zinc-500" />
                <span className="text-zinc-300 tracking-wide font-semibold lowercase first-letter:uppercase">Wallet</span>
              </div>
              <div className="flex items-center gap-0.5 font-mono text-zinc-500 bg-zinc-950 px-1 py-0.2 rounded border border-zinc-900 text-[8px]">
                <Lock size={7} className="text-zinc-600" />
                <span>SG••4821</span>
              </div>
            </div>

            {/* Micro Financial Status Row */}
            <div className="mt-1.5 space-y-1">
              {/* Cash & Points Balance (Merged layout for size efficiency) */}
              <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-900 p-1.5 rounded">
                <div>
                  <span className="text-[7px] uppercase tracking-wider font-bold text-zinc-500 block leading-none">Available Funds</span>
                  <span className="text-sm font-black text-white tracking-tight">KSh {Number(wallet?.balance ?? 0).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[7px] uppercase tracking-wider font-bold text-zinc-500 block leading-none">REAX bal</span>
                  <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-0.5 justify-end">
                    ✨{Number(wallet?.reax_balance ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Micro-Action Buttons */}
            <div className="grid grid-cols-3 gap-1 mt-1.5 pt-1.5 border-t border-zinc-900/80">
              <button 
                onClick={onTopUp} 
                className="flex items-center justify-center gap-0.5 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.97] text-black rounded py-1 text-[9px] font-bold transition-all shadow-sm"
              >
                <Plus size={10} strokeWidth={3} /> <span className="truncate">Top Up</span>
              </button>
              <button 
                onClick={onSend} 
                className="flex items-center justify-center gap-0.5 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.97] border border-zinc-800 hover:border-zinc-700 text-zinc-200 rounded py-1 text-[9px] font-semibold transition-all"
              >
                <Send size={9} className="text-zinc-500" /> <span className="truncate">Send</span>
              </button>
<ReaxMenu
  onTopUpReax={() => setShowTopUpReax(true)}
 onWithdrawToWallet={() => setShowWithdrawReax(true)}
  onViewProgress={() => window.location.href = "/reax"}
/>     </div>

            {/* Micro Secure Footnote */}
            <div className="flex items-center justify-center gap-0.5 mt-1.5 text-[7px] text-zinc-600 font-medium tracking-wide">
              <ShieldCheck size={8} className="text-emerald-700" />
              <span>PCI-DSS Secured Architecture</span>
            </div>

          </div>
        )}
      </div>

<TopUpReaxModal
  open={showTopUpReax}
  onClose={() => setShowTopUpReax(false)}
  userId={profile.id}
  onSuccess={refreshWallet}
/>
<WithdrawReaxModal
  open={showWithdrawReax}
  onClose={() => setShowWithdrawReax(false)}
  userId={profile.id}
/>


    </div>
  )
}
