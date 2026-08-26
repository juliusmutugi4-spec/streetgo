'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function useMessages() {

  const [conversations, setConversations] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])


  const fetchConversations = async () => {

  }


  const fetchMessages = async () => {

  }


  const sendMessage = async (
    messageText: string,
    user: any,
    selectedChat: any,
    setMessageText: (value: string) => void
  ) => {

    if (!messageText.trim() || !user || !selectedChat) return


    const text = messageText.trim()


    setMessageText('')


    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedChat.userId,
        content: text,
      })
      .select()
      .single()


    if (error) {
      alert(JSON.stringify(error, null, 2))
      console.error("SEND ERROR:", error)
      return
    }


    setMessages((prev) => {

      const exists = prev.some(
        (m) => m.id === data.id
      )


      if (exists) return prev


      return [...prev, data]
    })
  }



  const deleteMessage = async () => {

  }



  return {
    conversations,
    messages,
    setMessages,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteMessage,
  }
}