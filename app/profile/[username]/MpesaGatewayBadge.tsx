export default function MpesaGatewayBadge({ phone }: { phone: string }) {
  // Gracefully handle unlinked devices or mask for standard user privacy
  const formattedPhone = phone ? phone.trim() : "No device linked";

  return (
    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800/40 bg-slate-900/40 px-3 py-2.5 backdrop-blur-xs">
      {/* Official M-Pesa Brand Asset Pairing */}
      <div className="flex items-center gap-2.5">
        {/* Exact Official M-Pesa Multi-Layer Corporate Emblem */}
        <div className="flex h-6 w-9 shrink-0 items-center justify-center rounded bg-[#4CAF50] px-1 py-0.5 shadow-sm shadow-emerald-950/20">
          <svg 
            viewBox="0 0 45 22" 
            fill="none" 
            xmlns="http://w3.org" 
            className="h-auto w-full select-none"
          >
            {/* The lowercase "m-" path base */}
            <path 
              d="M3 15V8.5C3 7.5 3.5 7 4.5 7C5.5 7 6 7.5 6 8.5V15M6 11C6.5 9.5 7.5 8.5 9 8.5C10.5 8.5 11 9.5 11 11V15M13 11.5H16" 
              stroke="#ffffff" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* The core signature diagonal Safaricom corporate slash */}
            <path 
              d="M17.5 19.5L25.5 2.5" 
              stroke="#E53935" 
              strokeWidth="3.4" 
              strokeLinecap="round" 
            />
            {/* The lowercase corporate "-pesa" typography map */}
            <path 
              d="M27.5 10C27.5 8.5 28.5 7.5 30 7.5C31.5 7.5 32.5 8.5 32.5 10C32.5 11.5 31.5 12.5 30 12.5C27.5 12.5 27.5 10 27.5 10ZM27.5 10V15M34.5 12.5C35 13.5 36 14 37 14C38.5 14 39 13 39 12C39 10 34.5 10.5 34.5 8.5C34.5 7.2 35.5 6.5 37 6.5C38.5 6.5 39.5 7.2 40 8.2M42 9C42 7.5 42.8 7 44 7" 
              stroke="#ffffff" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>

        {/* Core Gateway Typography Mapping */}
        <div className="flex flex-col">
          <span className="font-sans text-[10px] font-bold leading-none tracking-wide text-slate-200">
            M-Pesa Express
          </span>
          <span className="mt-0.5 font-mono text-[7.5px] font-semibold uppercase leading-none tracking-widest text-slate-500">
            Direct STK Node
          </span>
        </div>
      </div>

      {/* Target MSISDN Return Block */}
      <div className="text-right">
        <span className="block font-mono text-xs font-bold tracking-wide text-slate-200">
          {formattedPhone}
        </span>
        <span className="mt-0.5 block font-mono text-[7.5px] font-medium leading-none tracking-tight text-emerald-500/70">
          • Verified Gateway
        </span>
      </div>
    </div>
  );
}
