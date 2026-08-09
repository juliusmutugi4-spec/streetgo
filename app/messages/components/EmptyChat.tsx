'use client'

export default function EmptyChat() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 bg-[#0c131a] select-none">
      <div className="text-center max-w-sm">
        
        {/* Modern Vector Art Frame */}
        <div
          className="
            w-16
            h-16
            mx-auto
            rounded-2xl
            bg-white/[0.02]
            border
            border-white/[0.06]
            flex
            items-center
            justify-center
            mb-5
            text-zinc-400
            shadow-sm
          "
        >
          <svg 
            xmlns="http://w3.org" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-7 h-7 text-zinc-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641l-.318 1.235c-.149.58.419 1.13 1 1l1.523-.343a1.66 1.66 0 011.196.257c1.02.516 2.146.817 3.34.817z" />
          </svg>
        </div>

        {/* Branding Typography */}
        <h1 className="text-xl font-bold tracking-tight text-zinc-100">
          StreetGO Messages
        </h1>

        {/* Dynamic Instructional Subtitle */}
        <p className="text-[13.5px] text-zinc-500 mt-2 leading-relaxed font-medium">
          Select a conversation from your chat dashboard list to begin messaging your contact network securely.
        </p>

      </div>
    </div>
  )
}
