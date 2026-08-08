'use client'

// Strict UI Telemetry Subsystem Definitions
interface DriverRideRequestCardProps {
  visible: boolean
  pickupLocation?: string
  destinationLocation?: string
  vehicleType?: 'Bodaboda' | 'Taxi'
  distanceKm?: number
  estimatedFare?: number
  onAccept?: () => void
  onReject?: () => void
}

export default function DriverRideRequestCard({
  visible,
  pickupLocation = 'Current Location',
  destinationLocation = 'Westlands',
  vehicleType = 'Bodaboda',
  distanceKm = 1.2,
  estimatedFare = 180,
  onAccept,
  onReject,
}: DriverRideRequestCardProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* CARD BODY INFRASTRUCTURE */}
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/90 rounded-2xl p-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden transform translate-y-0 animate-in slide-in-from-bottom-8 duration-300 ease-out">
        
        {/* Dynamic Holographic Radar Pulse Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 shadow-[0_1px_10px_rgba(52,211,153,0.4)] animate-pulse" />

        {/* HEADER AXIS */}
        <div className="text-center pb-4 border-b border-zinc-800/60">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-100 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-ping" />
           incoming Ride Request
          </h2>
          <p className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase mt-1">
            Intercepting local transit telemetry
          </p>
        </div>

        {/* CORE TELEMETRY TELEMETRY ARRAY */}
        <div className="mt-5 space-y-2.5">
          
          {/* LOCATION TELEMETRY BLOCK */}
          <div className="grid grid-cols-1 gap-2 bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-3">
            <div className="flex items-start gap-2.5">
              <span className="text-emerald-400 text-xs mt-0.5">▲</span>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block font-mono">Pickup Origin</span>
                <span className="text-xs font-semibold text-zinc-200 truncate block">{pickupLocation}</span>
              </div>
            </div>
            
            <div className="h-[1px] w-full bg-zinc-800/40 my-1" />

            <div className="flex items-start gap-2.5">
              <span className="text-cyan-400 text-xs mt-0.5">▼</span>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 block font-mono">Destination Axis</span>
                <span className="text-xs font-semibold text-zinc-200 truncate block">{destinationLocation}</span>
              </div>
            </div>
          </div>

          {/* HARDWARE DATA MATRIX */}
          <div className="grid grid-cols-3 gap-2">
            
            <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2.5 text-center">
              <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block font-mono mb-0.5">Configuration</span>
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide truncate block">
                {vehicleType === 'Bodaboda' ? '🏍️ Boda' : '🚗 Taxi'}
              </span>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2.5 text-center">
              <span className="text-[8px] font-black uppercase tracking-wider text-zinc-500 block font-mono mb-0.5">Distance</span>
              <span className="text-xs font-bold text-zinc-300 font-mono tracking-tight block">{distanceKm} KM</span>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2.5 text-center bg-cyan-500/5 border-cyan-500/20">
              <span className="text-[8px] font-black uppercase tracking-wider text-cyan-500/70 block font-mono mb-0.5">Est. Yield</span>
              <span className="text-xs font-black text-cyan-400 font-mono tracking-tight block">KES {estimatedFare}</span>
            </div>

          </div>

        </div>

        {/* DECISION OVERLAY ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mt-6">

          <button 
            onClick={onReject}
            className="w-full py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-[10px] font-black uppercase tracking-widest transition-all duration-200 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 active:scale-95"
          >
            Reject
          </button>

          <button 
            onClick={onAccept}
            className="w-full py-2.5 rounded-lg bg-gradient-to-b from-emerald-400 to-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(52,211,153,0.2)] transition-all duration-200 hover:from-emerald-300 hover:to-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] active:scale-95"
          >
            Accept
          </button>

        </div>

      </div>
    </div>
  )
}
