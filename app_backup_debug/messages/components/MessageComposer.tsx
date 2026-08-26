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
      w-full
      px-3
      py-3
      bg-[#08131d]
      border-t
      border-white/10
      flex
      items-end
      gap-2
    "
  >

    {/* Input */}
    <div
      className="
        flex-1
        relative
        flex
        items-center
        bg-[#151f2a]
        rounded-2xl
        border
        border-white/5
        focus-within:border-emerald-500/40
        transition
      "
    >

      <textarea
        rows={1}
        value={messageText}
        onChange={(e)=>{
          setMessageText(e.target.value)

          e.target.style.height="auto"
          e.target.style.height=
          `${e.target.scrollHeight}px`
        }}

        onKeyDown={(e)=>{
          if(e.key==="Enter" && !e.shiftKey){
            e.preventDefault()

            if(messageText.trim()){
              onSend()
            }
          }
        }}

        placeholder="Type a message..."

        className="
          w-full
          bg-transparent
          text-sm
          text-white
          placeholder:text-zinc-500
          px-4
          py-3
          pr-12
          outline-none
          resize-none
          min-h-[44px]
          max-h-[120px]
        "
      />


      {/* Emoji */}
      <button
        className="
          absolute
          right-3
          text-zinc-400
          hover:text-white
        "
      >
        😊
      </button>


    </div>


    {/* Send */}
    <button
      onClick={()=>{
        if(messageText.trim()){
          onSend()
        }
      }}

      disabled={!messageText.trim()}

      className="
        w-11
        h-11
        rounded-full
        flex
        items-center
        justify-center
        bg-emerald-500
        text-black
        font-bold
        disabled:opacity-40
        active:scale-95
        transition
      "
    >

      ➤

    </button>


  </div>
)
}