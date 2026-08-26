'use client'

import FinanceCard from "./FinanceCard"

type MessageBubbleProps = {
  message: {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
    is_read: boolean
    message_type?: string
    metadata?: any
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


  // FINANCE SYSTEM MESSAGE
  if (message.message_type === "finance") {
    return (
      <div
        className="
          flex
          justify-start
          w-full
          mb-4
          px-2
        "
      >
        <FinanceCard
          data={message.metadata}
        />
      </div>
    )
  }



  return (
    <div
      className={`
        flex
        items-end
        gap-2
        mb-3
        w-full
        group
        ${mine ? "justify-end" : "justify-start"}
      `}
    >


      {/* Avatar */}

      {!mine && (
        avatarUrl ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="
              w-7
              h-7
              rounded-full
              object-cover
              flex-shrink-0
            "
          />
        ) : (
          <div
            className="
              w-7
              h-7
              rounded-full
              bg-zinc-700
              flex
              items-center
              justify-center
              text-xs
              text-white
            "
          >
            U
          </div>
        )
      )}



      {/* Message Wrapper */}

      <div
        className="
          relative
          max-w-[75%]
          min-w-0
          flex
          items-end
          gap-2
        "
      >


        {/* Delete */}

        {mine && (
          <button
            onClick={() => onDelete(message.id)}
            className="
              opacity-0
              group-hover:opacity-100
              transition
              text-red-400
              text-xs
            "
          >
            🗑
          </button>
        )}



        {/* Bubble */}

        <div
          className={`
            px-4
            py-3
            shadow-sm
            overflow-hidden

            ${
              mine
                ? `
                  bg-emerald-600
                  text-white
                  rounded-[18px]
                  rounded-br-[5px]
                `
                : `
                  bg-[#1e2730]
                  text-zinc-100
                  rounded-[18px]
                  rounded-bl-[5px]
                  border
                  border-white/[0.05]
                `
            }
          `}
        >


          <p
            className="
              text-[14px]
              leading-relaxed
              whitespace-pre-wrap
              break-words
            "
          >
            {message.content}
          </p>



          {/* Time + Read */}

          <div
            className={`
              flex
              justify-end
              items-center
              gap-1
              mt-1
              text-[10px]

              ${
                mine
                ? "text-emerald-200"
                : "text-zinc-400"
              }
            `}
          >

            <span>
              {new Date(message.created_at)
                .toLocaleTimeString([], {
                  hour:"2-digit",
                  minute:"2-digit"
                })
              }
            </span>


            {mine && (
              <span>
                {message.is_read ? "✓✓" : "✓"}
              </span>
            )}

          </div>


        </div>

      </div>


    </div>
  )
}