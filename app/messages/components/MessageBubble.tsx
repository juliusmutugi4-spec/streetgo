'use client'

type MessageBubbleProps = {
  message: {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
    is_read: boolean
  }
  mine: boolean
  avatarUrl?: string | null
  onDelete: (messageId: string) => void
}

export default function MessageBubble({
  message,
  mine,
  avatarUrl,
  onDelete,
}: MessageBubbleProps) {
  return (
    <div
      className={`
        flex
        items-end
        gap-2
        mb-2
        w-full
        group
        ${mine ? 'justify-end' : 'justify-start'}
      `}
    >
      {/* Sender Avatar */}
      {!mine && (
        <div className="w-7 h-7 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-white/10">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase">
              U
            </div>
          )}
        </div>
      )}

      {/* Message Core Container */}
      <div className="relative max-w-[72%] flex items-center gap-2">
        
        {/* Dynamic Contextual Action Trigger - Hidden until hover/focus */}
        {mine && (
          <button
            onClick={() => onDelete(message.id)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-full bg-zinc-900/60 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all duration-200 order-first h-7 w-7 flex items-center justify-center border border-white/5"
            aria-label="Delete message"
          >
            <svg xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.34 6.14m-4.08 0L10 9m4.71-3.5211a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}

        {/* Message Bubble Base Frame */}
        <div
          className={`
            px-3.5
            py-2
            shadow-sm
            ${
              mine
                ? `
                  bg-emerald-600/90
                  text-white
                  rounded-[18px]
                  rounded-br-[4px]
                `
                : `
                  bg-[#1e2730]
                  text-zinc-100
                  rounded-[18px]
                  rounded-bl-[4px]
                  border
                  border-white/[0.04]
                `
            }
          `}
        >
          {/* Main Content Layout Block */}
          <p className="text-[13.5px] leading-[1.4] whitespace-pre-wrap break-words tracking-normal">
            {message.content}
          </p>

          {/* Metadata Flags and Timestamps Area */}
          <div
            className={`
              flex
              justify-end
              items-center
              gap-1
              mt-1
              text-[9.5px]
              select-none
              ${mine ? 'text-emerald-200/80' : 'text-zinc-400'}
            `}
          >
            <span>
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            {mine && (
              <span className="flex items-center">
                {message.is_read ? (
                  /* Double Checkmark (Read) Icon Vector */
                  <svg xmlns="http://w3.org" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-cyan-200">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" className="hidden" />
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.43a1 1 0 001.17-1.408l-7-14z" className="hidden" />
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  /* Single Checkmark (Sent) Icon Vector */
                  <svg xmlns="http://w3.org" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-emerald-200/60">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
