'use client'

type MessageComposerProps = {
  messageText: string
  setMessageText: (value: string) => void
  onSend: () => void
}

export default function MessageComposer({
  messageText,
  setMessageText,
  onSend,
}: MessageComposerProps) {
  return (
    <div
      className="
        border-t
        border-white/[0.06]
        px-4
        py-3
        bg-[#0c131a]/95
        backdrop-blur-md
        w-full
      "
    >
      <div className="flex items-end gap-2.5 max-w-full">
        {/* Attachment Options Trigger */}
        <button
          className="
            w-9
            h-9
            rounded-full
            flex
            items-center
            justify-center
            text-zinc-400
            hover:text-zinc-200
            hover:bg-white/5
            transition-colors
            mb-0.5
            flex-shrink-0
          "
          aria-label="Attach file"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[21px] h-[21px]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94a3 3 0 114.243 4.243L8.567 17.822a1.5 1.5 0 01-2.122-2.122l8.485-8.485m2.914-2.914L16.48 4.74" />
          </svg>
        </button>

        {/* Input Text Area Frame */}
        <div className="flex-1 relative flex items-center bg-[#151f2a] rounded-2xl border border-white/[0.04] focus-within:border-white/[0.1] focus-within:bg-[#1a2633] transition-all">
          <textarea
            rows={1}
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (messageText.trim()) onSend()
              }
            }}
            placeholder="Type a message..."
            className="
              w-full
              bg-transparent
              text-[14px]
              text-zinc-100
              placeholder:text-zinc-500
              pl-4
              pr-12
              py-2.5
              outline-none
              resize-none
              overflow-y-auto
              min-h-[40px]
              max-h-[160px]
              leading-normal
            "
          />

          {/* Inline Emoji Trigger Button */}
          <button
            className="
              absolute
              right-3
              bottom-2
              text-zinc-500
              hover:text-zinc-300
              transition-colors
              p-0.5
            "
            aria-label="Select emoji"
          >
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Premium Core Action Send Trigger */}
        <button
          onClick={() => {
            if (messageText.trim()) onSend()
          }}
          disabled={!messageText.trim()}
          className="
            w-[40px]
            h-[40px]
            rounded-xl
            flex
            items-center
            justify-center
            bg-emerald-600
            text-white
            hover:bg-emerald-500
            active:scale-95
            disabled:opacity-40
            disabled:hover:bg-emerald-600
            disabled:active:scale-100
            transition-all
            duration-150
            mb-0.5
            flex-shrink-0
            shadow-sm
          "
          aria-label="Send message"
        >
          <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px] transform rotate-45 -translate-x-0.5 translate-y-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
