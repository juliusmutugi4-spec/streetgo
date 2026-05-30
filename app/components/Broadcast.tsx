"use client"
import { useState,useEffect  } from "react"
import { createClient } from "@supabase/supabase-js"
import { X, Trophy, Link, Plus, Trash2, Shield, Calendar, DollarSign, Activity, Percent, Target, TrendingUp, CheckCircle2, Key } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Match = { home: string; away: string; tip: string; odds: string }
type BettingCompany = "SportPesa" | "Betika" | "Odibets" | "Betway Kenya" | "1XBet Kenya" | "MozzartBet" | "22Bet" | "BangBet" | "MeridianBet" | "Lucky2U" | "BetLion" | "PremierBet" | "Other"
type RiskLevel = "Safe / Banker" | "Moderate Risk" | "High Risk / Longshot"

export default function Broadcast({ onClose }: { onClose?: () => void }) {
  const [company, setCompany] = useState<BettingCompany>("SportPesa")
  const [league, setLeague] = useState("")
  const [price, setPrice] = useState("")
  const [link, setLink] = useState("")
  const [bookingCode, setBookingCode] = useState("")
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("Moderate Risk")
  const [tips, setTips] = useState<any[]>([])

  const [loading, setLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: "" })
  const [matches, setMatches] = useState<Match[]>([{ home: "", away: "", tip: "", odds: "1.85" }])
const [expiryHours, setExpiryHours] = useState(6) // default to 6h
  const totalOdds = matches.reduce((acc, m) => {
    const numericOdds = parseFloat(m.odds)
    return acc * (isNaN(numericOdds) || numericOdds <= 0? 1 : numericOdds)
  }, 1).toFixed(2)

  const addMatch = () => setMatches([...matches, { home: "", away: "", tip: "", odds: "1.85" }])
  const removeMatch = (i: number) => setMatches(matches.filter((_, idx) => idx!== i))
  const updateMatch = (i: number, field: keyof Match, val: string) => {
    const newMatches = [...matches]
    newMatches[i][field] = val
    setMatches(newMatches)
  }

// Fetch tips when page loads
useEffect(() => {
  const getTips = async () => {
    const { data, error } = await supabase
      .from('betting_tips')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) console.log('Error:', error)
    else setTips(data || [])
    setLoading(false)
  }
  
  getTips()
}, [])
  


  const uploadTip = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage({ type: null, text: "" })

    if (matches.some(m =>!m.home.trim() ||!m.away.trim() ||!m.tip.trim())) {
      setStatusMessage({ type: 'error', text: "Complete all match fields" })
      return
    }
    if (!price || parseFloat(price) <= 0) {
      setStatusMessage({ type: 'error', text: "Price must be > KSh 0" })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.from("betting_tips").insert({
        seller_name: "Verified Tipster",
        league: league.trim() || "Global Leagues",
        match_name: matches.map(m => `${m.home} vs ${m.away}`).join(" | "),
        tip_text: matches.map(m => m.tip).join(", "),
        odds: Number(totalOdds),
        price: Number(price),
        duration_hours: expiryHours,
        company,
        slip_link: link.trim() || null,
        booking_code: bookingCode.trim().toUpperCase() || null,
        risk_classification: riskLevel,
        slip_details: matches,
        is_verified: true,
        created_at: new Date().toISOString()
      })
      if (error) throw error
      setStatusMessage({ type: 'success', text: `✓ Broadcast Live! ${matches.length} games` })
      setTimeout(() => {
        setMatches([{ home: "", away: "", tip: "", odds: "1.85" }])
        setLeague(""); setPrice(""); setLink(""); setBookingCode("")
        onClose?.()
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || "Broadcast failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      {/* KEY FIX: max-h-[90vh] + flex-col so it never stretches past screen */}
      <div className="w-full max-w-2xl h-full max-h-[90vh] flex flex-col bg-gray-950 border-gray-800 rounded-2xl overflow-hidden">

        {/* Header - fixed, never scrolls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-white">Broadcast Premium Slip</h2>
              <p className="text-xs text-gray-400">KSh Market</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage.text && (
          <div className={`px-6 py-3 text-xs font-medium flex items-center gap-2 shrink-0 ${
            statusMessage.type === 'error'? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <Activity className="w-4 h-4" />
            {statusMessage.text}
          </div>
        )}

        {/* Form - this scrolls, but button stays visible */}
        <form onSubmit={uploadTip} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Bookmaker + League */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Target Bookmaker</label>
              <div className="relative">
                <Trophy className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select value={company} onChange={e => setCompany(e.target.value as BettingCompany)}
                  className="w-full bg-gray-900 border-gray-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                  {["SportPesa","Betika","Odibets","Betway Kenya","1XBet Kenya","MozzartBet","22Bet","BangBet","MeridianBet","Lucky2U","BetLion","PremierBet","Other"].map(c =>
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Competitions / Leagues</label>
              <div className="relative">
                <Target className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="EPL, Champions League" value={league} onChange={e => setLeague(e.target.value)}
                  className="w-full bg-gray-900 border-gray-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Matches - SCROLLABLE INSIDE FORM */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-semibold text-gray-400">Matches ({matches.length})</label>
              <button type="button" onClick={addMatch}
                className="group text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3.5 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/5 transition-all duration-200 active:scale-95">
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200 ease-out" /> 
                <span>Add Game</span>
              </button>

            </div>

            {/* KEY FIX: max-h-[200px] so matches scroll before form scrolls */}
            

<div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-emerald-500/40 scrollbar-track-gray-900/50 rounded-xl border-gray-800/50">

              {matches.map((m, i) => (
                <div key={i} className="bg-gray-900 border-gray-800 rounded-xl p-4 space-y-3 mr-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase">Event {i + 1}</span>
                    {matches.length > 1 && (
                      <button type="button" onClick={() => removeMatch(i)} className="text-gray-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Home Team" value={m.home} onChange={e => updateMatch(i, 'home', e.target.value)}
                      className="bg-gray-950 border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 outline-none" required />
                    <input placeholder="Away Team" value={m.away} onChange={e => updateMatch(i, 'away', e.target.value)}
                      className="bg-gray-950 border-gray-800 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 outline-none" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <TrendingUp className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input placeholder="Market Pick" value={m.tip} onChange={e => updateMatch(i, 'tip', e.target.value)}
                        className="w-full bg-gray-950 border-gray-800 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:border-emerald-500 outline-none" required />
                    </div>
                    <div className="relative">
                      <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input type="number" step="0.01" min="1.01" max="40" placeholder="1.85" value={m.odds} onChange={e => updateMatch(i, 'odds', e.target.value)}
                        className="w-full bg-gray-950 border-gray-800 rounded-lg pl-10 pr-3 py-2 text-sm text-emerald-400 font-mono font-bold focus:border-emerald-500 outline-none" required />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verification Assets
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Booking Code</label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="text" placeholder="BX7WR" value={bookingCode} onChange={e => setBookingCode(e.target.value)}
                    className="w-full bg-gray-900 border-gray-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white uppercase font-mono focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Slip Link</label>
                <div className="relative">
                  <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="url" placeholder="https://sportpesa.com..." value={link} onChange={e => setLink(e.target.value)}
                    className="w-full bg-gray-900 border-gray-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Risk + Price + Expiry */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2">Risk</label>
              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full bg-gray-900 border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none">
                <option>Safe / Banker</option>
                <option>Moderate Risk</option>
                <option>High Risk / Longshot</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Price KSh</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="number" min="1" placeholder="250" value={price} onChange={e => setPrice(e.target.value)}
                  className="w-full bg-gray-900 border-gray-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-emerald-500 outline-none" required />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2">Expiry</label>
<div className="relative">
  <select 
    value={expiryHours} 
    onChange={e => setExpiryHours(Number(e.target.value))}
    className="w-full bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl px-4 py-3 text-slate-100 text-sm font-medium focus:outline-none focus:border-slate-500 transition-colors appearance-none cursor-pointer"
  >
    <option value={2} className="bg-[#1c1c1e] text-slate-100">2 Hours</option>
    <option value={4} className="bg-[#1c1c1e] text-slate-100">4 Hours</option>
    <option value={6} className="bg-[#1c1c1e] text-slate-100">6 Hours</option>
    <option value={12} className="bg-[#1c1c1e] text-slate-100">12 Hours</option>
    <option value={24} className="bg-[#1c1c1e] text-slate-100">24 Hours</option>
    <option value={40} className="bg-[#1c1c1e] text-slate-100">40 Hours</option>
    <option value={48} className="bg-[#1c1c1e] text-slate-100">48 Hours</option>
  </select>
  
  {/* Custom Dropdown Arrow */}
  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center pr-1 text-slate-400">
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>
            </div>
          </div>





          {/* Submit - always visible because form scrolls */}
          <div className="sticky bottom-0 pt-4 border-t border-gray-800 bg-gray-950 -mx-6 px-6 pb-6">
            <div className="flex justify-between items-center mb-4 p-3 bg-gray-900 rounded-lg">
              <div>
                <p className="text-xs text-gray-400">Total Odds</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">{totalOdds}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Price</p>
                <p className="text-lg font-bold text-white">KSh {price || '0'}</p>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-wide ${
                loading? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}>
              {loading? "Broadcasting..." : "Publish Premium Slip"}
            </button>
          </div>
        </form>
      </div>




    </div>
  )
}