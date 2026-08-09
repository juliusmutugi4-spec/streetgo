'use client'

import ChatHeader from './ChatHeader'
import MessageBubble from './MessageBubble'
import MessageComposer from './MessageComposer'

type ChatWindowProps = {
  selectedChat: any
  user: any
  messages: any[]
  messageText: string
  setMessageText: (value: string) => void
  sendMessage: () => void
  deleteMessage: (id: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  now: number
  onBack: () => void
}

export default function ChatWindow({
  selectedChat,
  user,
  messages,
  messageText,
  setMessageText,
  sendMessage,
  deleteMessage,
  messagesEndRef,
  now,
  onBack,
}: ChatWindowProps) {

  if (!selectedChat) {
    return null
  }

  return (
    <div
      className="
        flex-1
        flex
        flex-col
        bg-[#0b141a]
      "
    >

      <ChatHeader
        username={selectedChat.username}
        avatarUrl={selectedChat.avatar_url}
        isOnline={selectedChat.isOnline}
        lastSeen={selectedChat.lastSeen}
        now={now}
        onBack={onBack}
      />


      {/* Messages */}
      <div
        className="
          flex-1
          overflow-y-auto
          p-8
          space-y-4
          bg-[#050b12]
        "
      >

        {messages.map((m) => {
          const mine = m.sender_id === user?.id

          return (
            <MessageBubble
              key={m.id}
              message={m}
              mine={mine}
              avatarUrl={
                !mine
                  ? selectedChat?.avatar_url
                  : null
              }
              onDelete={deleteMessage}
            />
          )
        })}


        <div ref={messagesEndRef}></div>

      </div>


      <MessageComposer
        messageText={messageText}
        setMessageText={setMessageText}
        onSend={sendMessage}
      />

    </div>
  )
}